import os
from dotenv import load_dotenv

load_dotenv(override=True)
from pathlib import Path
import re
import asyncio

import logging
import time
import json
import requests
import tiktoken
from typing import List, Union, Dict
from bs4 import BeautifulSoup
import aiohttp
from functools import wraps
import schema
from langchain.text_splitter import RecursiveCharacterTextSplitter


def format_prompt(template: str, **kwargs) -> str:
    """Implementation of Anthropic from `https://github.com/anthropics/anthropic-cookbook/blob/main/patterns/agents/util.py`.
    Format a prompt template with variables.
    Example: "Hi, my name is {name}".format(name=Alice) -> "Hi, my name is Alice"
    """
    try:
        return template.format(**kwargs)
    except KeyError as e:
        raise ValueError(f"Missing required prompt variable: {e}")


def extract_xml(text: str, tag: str) -> str:
    """
    Implementation of Anthropic from `https://github.com/anthropics/anthropic-cookbook/blob/main/patterns/agents/util.py`.
    Extracts the content of the specified XML tag from the given text. Used for parsing structured responses

    Args:
        text (str): The text containing the XML.
        tag (str): The XML tag to extract content from.

    Returns:
        str: The content of the specified XML tag, or an empty string if the tag is not found.
    """
    match = re.search(f"<{tag}>(.*?)</{tag}>", text, re.DOTALL)
    return match.group(1) if match else ""


def extract_xml_num(text: str, tag: str, num: int) -> str:
    """
    Args:
        text (str): The text containing the XML.
        tag (str): The XML tag to extract content from.
        num (int): The order of tag to extract.

    Returns:
        str: The content of the specified XML tag, or an empty string if the tag is not found.
    """
    result = ""
    match = re.findall(f"<{tag}>(.*?)</{tag}>", text, re.DOTALL)
    if num >= len(match):
        return result
    try:
        result = match[num].strip()
    except Exception as e:
        raise ValueError(f"Error: {e} Incorrect tag index in xml")
    return result


def extract_code(resp: str, language: str = "python") -> str:
    """Extract Python code snippet from the response."""
    try:
        code = resp.split(f"```{language}")[1].split("```")[0].strip()
    except Exception as e:
        raise ValueError(f"Error while extracting {language} code: {e}")
    return code


def configure_logger(log_file: str | Path) -> logging.Logger:
    no_propagate_libs = [
        "openai",
        "httpx",
        "httpcore",
        "urllib3",
        "requests",
        "streamlit",
        "watchdog",
        "inotify",
        "PIL",
        "opencv",
        "imageio",
        "streamlit_bokeh",
        "selenium",
    ]
    for lib in no_propagate_libs:
        logging.getLogger(lib).propagate = False
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    file_handler = logging.FileHandler(log_file, mode="w", encoding="utf-8")
    file_handler.setFormatter(formatter)
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(file_handler)
    return root_logger


def log(class_variables: List[str] | None = None):
    def decorator(func):
        # 检查函数是否是异步函数
        is_async = asyncio.iscoroutinefunction(func)

        @wraps(func)
        async def async_wrapper(self, *args, **kwargs):
            logger = logging.getLogger(__name__)
            start_time = time.perf_counter()

            # 获取需要记录的变量
            def get_class_vars():
                if not class_variables:
                    return None
                vars = {var: getattr(self, var, "<未找到>") for var in class_variables}
                json_str = json.dumps(vars, indent=4, ensure_ascii=False)
                return json_str

            try:
                # 对于异步函数，需要 await 执行结果
                result = await func(self, *args, **kwargs)
                duration = time.perf_counter() - start_time

                # 记录成功信息
                logger.debug(
                    f"✅ 方法 {self.__class__.__name__}.{func.__name__} 成功 | "
                    f"耗时: {duration:.2f}s | "
                    f"return: {result} | "
                    f"类变量: {get_class_vars()}"
                )
                return result

            except Exception as e:
                duration = time.perf_counter() - start_time
                logger.error(
                    f"❌ 方法 {self.__class__.__name__}.{func.__name__} 失败 | "
                    f"耗时: {duration:.2f}s | "
                    f"错误: {str(e)}"
                )
                raise

        @wraps(func)
        def sync_wrapper(self, *args, **kwargs):
            logger = logging.getLogger(__name__)
            start_time = time.perf_counter()

            # 获取需要记录的变量
            def get_class_vars():
                if not class_variables:
                    return None
                vars = {var: getattr(self, var, "<未找到>") for var in class_variables}
                json_str = json.dumps(vars, indent=4, ensure_ascii=False)
                return json_str

            try:
                result = func(self, *args, **kwargs)
                duration = time.perf_counter() - start_time

                # 记录成功信息
                logger.debug(
                    f"✅ 方法 {self.__class__.__name__}.{func.__name__} 成功 | "
                    f"耗时: {duration:.2f}s | "
                    f"return: {result} | "
                    f"类变量: {get_class_vars()}"
                )
                return result

            except Exception as e:
                duration = time.perf_counter() - start_time
                logger.error(
                    f"❌ 方法 {self.__class__.__name__}.{func.__name__} 失败 | "
                    f"耗时: {duration:.2f}s | "
                    f"错误: {str(e)}"
                )
                raise

        # 根据函数类型返回相应的包装器
        return async_wrapper if is_async else sync_wrapper

    return decorator


def get_elapsed_time(start_time) -> str:
    duration = time.perf_counter() - start_time
    minutes = int(duration // 60)
    seconds = duration % 60
    if minutes > 0:
        if minutes == 1:
            time_str = f"{minutes} minute and {seconds:.2f} seconds"
        else:
            time_str = f"{minutes} minutes and {seconds:.2f} seconds"
    else:
        time_str = f"{seconds:.2f} seconds"
    return time_str


def is_url_accessible(url: str):
    proxy_addr = os.environ.get("PROXY_ADDR")
    if proxy_addr:
        proxies = {"http": proxy_addr, "https": proxy_addr}
    else:
        proxies = None
    try:
        response = requests.get(url, proxies=proxies, timeout=6)
        if response.status_code < 400:
            return True
        else:
            return False

    except requests.exceptions.RequestException as e:
        return False


def process_html_str(html_str):
    font_awesome_pattern = r'<script\s+src="https://kit\.fontawesome\.com/a076d05399\.js"(?:\s+crossorigin(?:=["\'](.*?)["\'])?)?(?:\s+[^>]*)?></script>'
    replacement = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">'
    html_str = re.sub(font_awesome_pattern, replacement, html_str)
    return html_str


def remove_anchor_links(narrative: str) -> str:
    return re.sub(r"\[(.*?)\]\(#\)", r"\1", narrative)


def trim(
    content: str, context_size: int = int(os.environ.get("CONTEXT_SIZE", "128000"))
) -> str:
    if not content:
        return ""

    MIN_CHUNK_SIZE = 140  # 设置最小块大小

    # 使用tiktoken计算tokens数量
    encoder = tiktoken.get_encoding("cl100k_base")  # 或选择其他编码器
    tokens = encoder.encode(content)
    length = len(tokens)

    if length <= context_size:
        return content

    overflow_tokens = length - context_size
    # 大约每个token对应3个字符，用这个比例估算需要裁剪的字符数
    chunk_size = len(content) - overflow_tokens * 3

    if chunk_size < MIN_CHUNK_SIZE:
        return content[:MIN_CHUNK_SIZE]

    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=0)

    chunks = splitter.split_text(content)
    trimmed_prompt = chunks[0] if chunks else ""

    # 最后检查，有可能裁剪后的prompt长度与原始prompt相同
    # 这是由于tokens的分割方式和splitter的内部工作原理导致的
    # 处理这种情况，直接进行硬切割
    if len(trimmed_prompt) == len(content):
        return trim(content[:chunk_size], context_size)

    # 递归裁剪直到prompt在上下文大小范围内
    return trim(trimmed_prompt, context_size)


def deduplicate_by_url(references: List[schema.Reference]) -> List[schema.Reference]:
    unique_dict = {}
    for reference in references:
        unique_dict[reference.url] = reference
    return list(unique_dict.values())


def process_response_text(response_text):
    # Parse HTML using BeautifulSoup
    soup = BeautifulSoup(response_text, "html.parser")

    # Get title
    title = soup.title.string.strip() if soup.title else ""

    # Get meta description as snippet
    meta_desc = soup.find("meta", attrs={"name": "description"})
    if meta_desc and meta_desc.get("content"):
        snippet = meta_desc.get("content").strip()
    else:
        # If no meta description, extract body content as snippet
        # Remove script, style and other non-content tags
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.extract()

        # Get text and clean it
        text = soup.get_text(separator=" ", strip=True)
        # Clean excess whitespace
        text = re.sub(r"\s+", " ", text).strip()
        # Take first 1000 characters as snippet
        snippet = text[:1000] + "..." if len(text) > 1000 else text

    res = {"title": title, "description": snippet}

    return res


async def get_url_info(url) -> Dict:
    """
    Asynchronously access the URL and extract the webpage title and content snippet.
    If the direct request fails and PROXY_ADDR environment variable is set,
    retry the request using the proxy.

    Parameters:
    url (str): The URL to access

    Returns:
    dict: A dictionary containing title and snippet
    """
    # Ensure URL format is correct
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        # First attempt: Send request without proxy
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                response.raise_for_status()
                response_text = await response.text()
                res = process_response_text(response_text)
                res["url"] = url
                if not res["title"]:
                    res["title"] = url

    except (aiohttp.ClientError, asyncio.TimeoutError) as e:
        # Check if PROXY_ADDR environment variable is set
        proxy_addr = os.environ.get("PROXY_ADDR")
        if proxy_addr:
            try:
                # Retry with proxy
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        url,
                        headers=headers,
                        proxy=proxy_addr,
                        timeout=aiohttp.ClientTimeout(total=10),
                    ) as response:
                        response.raise_for_status()
                        response_text = await response.text()
                        res = process_response_text(response_text)
                        res["url"] = url
                        if not res["title"]:
                            res["title"] = url

            except (aiohttp.ClientError, asyncio.TimeoutError) as proxy_error:
                res = {"error": f"Proxy request error: {str(proxy_error)}", "url": url}
        else:
            res = {"error": f"Request error: {str(e)}", "url": url}
    except Exception as e:
        res = {"error": f"Error occurred: {str(e)}", "url": url}
    finally:
        return res


async def supplement_references(url_list: List[str]) -> List[schema.Reference]:
    if not url_list:
        return []
    tasks = [get_url_info(url) for url in url_list]
    url_res_list = await asyncio.gather(*tasks)

    # Filter out any None results or errors
    references = [
        schema.Reference(**url_res)
        for url_res in url_res_list
        if url_res and "error" not in url_res
    ]
    return references


def replace_styles(match):
    style_block = match.group(1)

    # 替换padding值为0
    style_block = re.sub(r"padding\s*:\s*[^;]+;", "padding: 0;", style_block)

    # 替换background-color为white
    style_block = re.sub(
        r"background-color\s*:\s*[^;]+;", "background-color: white;", style_block
    )

    return style_block


def clean_body_styles(html_content):
    # 清除 body 标签上的 class 属性
    cleaned_html = re.sub(r'<body\s+class=["\'][^"\']*["\']', "<body", html_content)

    # 清除 body 标签上的 style 属性
    cleaned_html = re.sub(r'<body\s+style=["\'][^"\']*["\']', "<body", cleaned_html)

    # 处理同时有多个属性的情况
    cleaned_html = re.sub(
        r'<body([^>]*)\s+class=["\'][^"\']*["\']', r"<body\1", cleaned_html
    )
    cleaned_html = re.sub(
        r'<body([^>]*)\s+style=["\'][^"\']*["\']', r"<body\1", cleaned_html
    )
    selectors = [
        r"(body\s*\{[^}]*\})",
        r"(\.container\s*\{[^}]*\})",
        r"(\.visualization-container\s*\{[^}]*\})",
    ]
    for pattern in selectors:
        cleaned_html = re.sub(pattern, replace_styles, cleaned_html, flags=re.DOTALL)
    return cleaned_html


def get_saved_topic(topic: str) -> str:
    saved_topic = (
        topic.replace("—", "--")
        .replace(" ", "-")
        .replace(":", "-")
        .replace("’", "-")
        .replace("'", "-")
        .replace("?", "")
        .strip()
    )
    return saved_topic
