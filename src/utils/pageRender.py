import numpy as np
from PIL import Image

# Target of this module: rendering the page with chrome and taking a screenshot

import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import http.server
import socketserver
import threading
from argparse import ArgumentParser
import functools


def remove_any_color_border(image):
    # Convert image to numpy array
    img_array = np.array(image)

    # Get dimensions
    height, width = img_array.shape[:2]

    # Get the color of the top-left corner (assumed to be the border color)
    if len(img_array.shape) == 3:  # Color image
        border_color = img_array[0, 0, :]
    else:  # Grayscale image
        border_color = img_array[0, 0]

    # Find the bounding box
    # Find first non-border-color pixel from each edge
    # Top
    top = 0
    while (
        top < height
        and np.all(
            img_array[top, :] == border_color,
            axis=1 if len(img_array.shape) == 3 else 0,
        ).all()
    ):
        top += 1

    # Bottom
    bottom = height - 1
    while (
        bottom >= 0
        and np.all(
            img_array[bottom, :] == border_color,
            axis=1 if len(img_array.shape) == 3 else 0,
        ).all()
    ):
        bottom -= 1

    # Left
    left = 0
    while (
        left < width
        and np.all(
            img_array[:, left] == border_color,
            axis=1 if len(img_array.shape) == 3 else 0,
        ).all()
    ):
        left += 1

    # Right
    right = width - 1
    while (
        right >= 0
        and np.all(
            img_array[:, right] == border_color,
            axis=1 if len(img_array.shape) == 3 else 0,
        ).all()
    ):
        right -= 1

    # Check if we found a valid bounding box
    if top <= bottom and left <= right:
        cropped_image = image.crop((left, top, right + 1, bottom + 1))
        cropped_width = right - left + 1
        cropped_height = bottom - top + 1
        return cropped_image, cropped_width, cropped_height
    else:
        # No border to remove, or the entire image is the border color
        return image, width, height


def add_white_border(image, border_percentage=5):
    width, height = image.size
    new_width = width * (1 + border_percentage / 100.0)
    new_height = height * (1 + border_percentage / 100.0)
    result = Image.new(image.mode, (int(new_width), int(new_height)), "white")
    position = ((result.width - width) // 2, (result.height - height) // 2)
    result.paste(image, position)
    return result


def crop_white_margins(
    input_image_path: str, output_image_path: str, border_percentage=5
):
    image = Image.open(input_image_path)
    r_image, width, height = remove_any_color_border(image)
    a_image = add_white_border(r_image, border_percentage)
    a_image.save(output_image_path)
    width = width * (1 + border_percentage / 100.0)
    height = height * (1 + border_percentage / 100.0)
    return width, height


# Custom handler that serves from a specific directory without changing cwd
class DirectoryHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, directory, *args, **kwargs):
        self.directory = directory
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self):
        if self.path == "/favicon.ico":
            # Return 204 No Content for favicon.ico requests
            self.send_response(204)
            self.end_headers()
            return
        return super().do_GET()

    def log_message(self, format, *args):
        pass


# get a free port
def get_free_port():
    with socketserver.TCPServer(("", 0), None) as s:
        free_port = s.server_address[1]
    return free_port


# start a local server
def start_server(folder_path, port):
    # Create handler with specific directory using functools.partial
    handler = functools.partial(DirectoryHandler, folder_path)

    # Create server with custom handler
    httpd = socketserver.TCPServer(("", port), handler)

    # Start server in a thread
    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.daemon = True
    server_thread.start()
    return httpd


# take a screenshot of the page
def take_screenshot(
    driver, screenshot_path: str, implicitly_wait_time: int = 1
) -> tuple:
    driver.implicitly_wait(implicitly_wait_time)  # Wait for DOM elements
    time_limit = 30
    try:
        # 等待页面加载完成
        start_time = time.time()
        anything_rendered = False
        any_browser_error_found = False
        while time.time() - start_time < time_limit:
            # 1. Check if anything is rendered
            try:
                WebDriverWait(driver, 0.1).until(
                    EC.visibility_of_element_located(
                        (By.CSS_SELECTOR, "body > *:not(script)")
                    )
                )
                anything_rendered = True
            except Exception:
                pass
            browser_logs = driver.get_log("browser")
            error_logs = [
                log for log in browser_logs if log["level"] in ["SEVERE", "ERROR"]
            ]

            if len(error_logs) > 0:
                any_browser_error_found = True

            if any_browser_error_found:
                break
            if anything_rendered:
                break

        # 这个脚本会遍历所有可见元素，找出实际内容的边界
        driver.set_window_size(2000, 2000)
        element = driver.find_element(By.TAG_NAME, "body")
        driver.set_window_size(
            element.size["width"] + 100, element.size["height"] + 400
        )

        # 截取完整页面
        driver.save_screenshot(screenshot_path)
        content_width, content_height = crop_white_margins(
            screenshot_path, screenshot_path
        )
        # 返回实际内容区域的尺寸（不包括添加的边距）
        return content_width, content_height, error_logs

    except Exception as e:
        print(f"Error taking screenshot: {str(e)}")
        raise


def render_page(
    folder_path: str,
    page_file_name: str,
    screenshot_folder: str,
):
    error_message = ""
    screenshot_path = None
    content_width, content_height = None, None

    if not os.path.isdir(folder_path):
        raise ValueError(f"{folder_path} is not a directory")
    file_list = os.listdir(folder_path)
    # make sure the page_file_name is in the folder
    if page_file_name not in file_list:
        raise ValueError(f"{page_file_name} not found in {folder_path}")

    # Start local server
    port = get_free_port()
    httpd = start_server(folder_path, port)

    # Set up headless Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # 添加隐藏滚动条的设置
    chrome_options.add_argument("--hide-scrollbars")
    original_env = {}
    proxy_vars = ["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"]
    for var in proxy_vars:
        if var in os.environ:
            original_env[var] = os.environ[var]
            del os.environ[var]

    # 添加下载路径设置
    prefs = {
        "download.prompt_for_download": False,  # disable the download prompt
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True,
        "profile.default_content_settings.popups": 0,
        # 允许所有文件下载，不需要询问
        "safebrowsing.enabled": False,
        # 禁用"未知文件类型"的警告
        "download.directory_upgrade": True,
        # 设置默认下载行为，不询问保存位置
        "download.prompt_for_download": False,
        # 禁用下载栏
        "download.show_download_bar": False,
    }
    chrome_options.add_experimental_option("prefs", prefs)

    try:
        # Initialize driver with specific ChromeDriver version
        # service = Service(ChromeDriverManager().install())
        service = Service()
        try:
            driver = webdriver.Chrome(service=service, options=chrome_options)
        except Exception as chrome_error:
            print(f"Chrome initialization error: {str(chrome_error)}")
            # 尝试打印更详细的错误信息
            import traceback

            print(f"Detailed error:\n{traceback.format_exc()}")
            raise  # 重新抛出异常

        # Add page load timeout
        driver.set_page_load_timeout(60)

        # Use localhost URL instead of file://
        url = f"http://localhost:{port}/{page_file_name}"
        # print(f"Accessing URL: {url}")
        driver.get(url)

        # Take screenshot
        os.makedirs(screenshot_folder, exist_ok=True)
        screenshot_name = page_file_name.replace(".html", "_screenshot.png")
        screenshot_path = os.path.join(screenshot_folder, screenshot_name)
        content_width, content_height, error_logs = take_screenshot(
            driver, screenshot_path
        )
        error_message = "\n".join([log["message"] for log in error_logs])

    except Exception as e:
        error_message = f"Error processing {folder_path}: {str(e)}"
        screenshot_path = None
        content_width, content_height = None, None

    finally:
        for var, value in original_env.items():
            os.environ[var] = value
        # Clean up resources regardless of success or failure
        if "driver" in locals() and driver is not None:
            try:
                driver.quit()
            except Exception as quit_error:
                print(f"Warning: Error while quitting driver: {str(quit_error)}")
            driver = None

        if "httpd" in locals():
            try:
                httpd.shutdown()
                httpd.server_close()
            except Exception as server_error:
                print(f"Warning: Error while closing server: {str(server_error)}")

    return screenshot_path, error_message, content_width, content_height


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--folder_path", type=str, default=".")
    parser.add_argument(
        "--input_html_file_name",
        type=str,
        default="html_0.html",
        help="The name of the html file",
    )
    parser.add_argument("--screenshot_folder", type=str, default=".")
    args = parser.parse_args()
    folder_path = args.folder_path
    input_html_file_name = args.input_html_file_name
    screenshot_folder = args.screenshot_folder
    screenshot_path, error_message, content_width, content_height = render_page(
        folder_path, input_html_file_name, screenshot_folder
    )
    if error_message:
        print(f"error_message: {error_message}")
    else:
        print("No error.")
    print(f"screenshot_path: {screenshot_path}")
    print(f"Content dimensions: {content_width}x{content_height}")
