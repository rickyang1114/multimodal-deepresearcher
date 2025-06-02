'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

interface HTMLRendererProps {
  htmlFile: string
  height?: string | number
  className?: string
  minHeight?: string | number
  basePath?: string
}

const HTMLRenderer = ({
  htmlFile,
  height = 'auto',
  className = '',
  minHeight = 250,
  basePath,
}: HTMLRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [chartHeight, setChartHeight] = useState<number | null>(null)

  const pathname = usePathname()
  const [htmlPath, setHtmlPath] = useState<string>('')

  // 为每个图表生成唯一ID
  const chartId = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`).current

  // 构建HTML路径
  useEffect(() => {
    if (!pathname) return

    if (basePath) {
      setHtmlPath(`${basePath}/${htmlFile}`)
      return
    }

    const parts = pathname.split('/').filter(Boolean)
    const basename = parts.length > 0 ? parts[parts.length - 1] : ''
    const fullPath = `/html_charts/${basename}/${htmlFile}`
    setHtmlPath(fullPath)
  }, [pathname, htmlFile, basePath])

  // 组件挂载
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 主要逻辑：使用iframe来隔离和执行HTML内容
  useEffect(() => {
    if (!isMounted || !containerRef.current || !htmlPath) return

    const loadHtmlContent = async () => {
      if (!containerRef.current) return

      try {
        // 清空容器
        containerRef.current.innerHTML = ''

        // 创建一个iframe来完全隔离HTML内容
        const iframe = document.createElement('iframe')
        iframe.style.width = '100%'
        iframe.style.height = typeof height === 'number' ? `${height}px` : height
        iframe.style.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : `${minHeight}px`
        iframe.style.border = 'none'
        iframe.style.overflow = 'hidden'
        iframe.id = `${chartId}-iframe`
        iframe.title = 'D3 Chart'
        iframe.setAttribute('aria-hidden', 'true')

        // 将iframe添加到容器
        containerRef.current.appendChild(iframe)
        iframeRef.current = iframe

        // 获取HTML内容
        const response = await fetch(htmlPath)

        if (!response.ok) {
          throw new Error(`Failed to load chart: ${response.status} ${response.statusText}`)
        }

        const htmlContent = await response.text()

        // 等待iframe加载完成
        await new Promise<void>((resolve) => {
          iframe.onload = () => resolve()

          const iframeDoc = iframe.contentDocument
          if (!iframeDoc) {
            throw new Error('Could not access iframe document')
          }

          // 准备HTML内容
          let modifiedHtml = htmlContent

          // 获取文档的头部和身体部分
          const headMatch = /<head>([\s\S]*?)<\/head>/i.exec(modifiedHtml)
          const hasHead = !!headMatch

          // 添加基本样式
          const styleContent = `
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: auto !important;
              overflow: hidden !important;
            }
            [style*="position: fixed"] {
              position: relative !important;
            }
            [style*="height: 100vh"] {
              height: auto !important;
            }
            svg {
              overflow: hidden !important;
            }
            text {
              overflow: hidden !important;
            }
          `

          const styleTag = `<style>${styleContent}</style>`

          // 添加样式标签
          if (hasHead) {
            modifiedHtml = modifiedHtml.replace('</head>', `${styleTag}</head>`)
          } else if (modifiedHtml.includes('<html>')) {
            modifiedHtml = modifiedHtml.replace('<html>', `<html><head>${styleTag}</head>`)
          } else {
            modifiedHtml = `<!DOCTYPE html><html><head>${styleTag}</head><body>${modifiedHtml}</body></html>`
          }

          // 添加对尺寸变化的检测脚本
          const resizeScript = `
            <script>
              // 初始化尺寸上报
              function reportSize() {
                if (window.parent) {
                  const width = document.body.scrollWidth || document.documentElement.scrollWidth;
                  const height = document.body.scrollHeight || document.documentElement.scrollHeight;
                  
                  window.parent.postMessage({ 
                    type: 'chartSize', 
                    chartId: '${chartId}',
                    width: width,
                    height: height
                  }, '*');
                }
              }
              
              // 当DOM加载完成并执行所有脚本后上报尺寸
              window.addEventListener('load', function() {
                // 等待所有内容渲染
                setTimeout(reportSize, 300);
                
                // 之后定期检查尺寸变化
                // setInterval(reportSize, 500);
              });
              
              // DOM内容加载完成时也尝试上报尺寸
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(reportSize, 100);
              });
              
              // 监听尺寸变化
              window.addEventListener('resize', reportSize);
              
              // 创建一个MutationObserver来监视DOM变化
              if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver(function(mutations) {
                  reportSize();
                });
                
                // 开始观察body的变化
                document.addEventListener('DOMContentLoaded', function() {
                  observer.observe(document.body, { 
                    childList: true, 
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class', 'width', 'height'] 
                  });
                });
              }
            </script>
          `

          // 添加尺寸上报脚本
          if (hasHead) {
            modifiedHtml = modifiedHtml.replace('</head>', `${resizeScript}</head>`)
          } else {
            modifiedHtml = modifiedHtml.replace('</body>', `${resizeScript}</body>`)
          }

          // 将修改后的HTML内容写入iframe
          iframeDoc.open()
          iframeDoc.write(modifiedHtml)
          iframeDoc.close()
        })

        // 监听iframe中的消息
        const messageHandler = (event: MessageEvent) => {
          if (!event.data || !event.data.chartId || event.data.chartId !== chartId) return

          if (event.data.type === 'chartSize') {
            const contentHeight = event.data.height || 0
            const contentWidth = event.data.width || 0

            if (iframe && contentHeight > 0 && contentWidth > 0) {
              // 设置iframe高度
              iframe.style.height = `${contentHeight}px`
              setChartHeight(contentHeight)

              // 确保最小高度
              const minHeightValue =
                typeof minHeight === 'number' ? minHeight : parseInt(String(minHeight), 10)
              if ((chartHeight || 0) < minHeightValue) {
                iframe.style.height = `${minHeightValue}px`
                setChartHeight(minHeightValue)
              }

              setIsLoaded(true)
            }
          }
        }

        window.addEventListener('message', messageHandler)

        // 设置超时，以防iframe中的内容没有正确报告其尺寸
        const timeout = setTimeout(() => {
          if (!isLoaded) {
            setIsLoaded(true)
            // 设置一个合理的默认高度
            if (iframe) {
              iframe.style.height =
                typeof minHeight === 'number' ? `${minHeight}px` : `${minHeight}px`
            }
          }
        }, 3000)

        return () => {
          window.removeEventListener('message', messageHandler)
          clearTimeout(timeout)
        }
      } catch (err) {
        console.error('Error loading chart:', err)
        setError(err instanceof Error ? err.message : 'Failed to load chart')
        setIsLoaded(true)
      }
    }

    const cleanup = loadHtmlContent()

    return () => {
      // 执行清理
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then((cleanupFn) => {
          if (cleanupFn && typeof cleanupFn === 'function') {
            cleanupFn()
          }
        })
      }

      // 移除iframe
      if (iframeRef.current && iframeRef.current.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current)
      }
    }
  }, [htmlPath, isMounted, chartId, height, minHeight, isLoaded, chartHeight])

  if (!isMounted) {
    return (
      <div
        className={`d3-chart-placeholder ${className}`}
        style={{ height, minHeight, marginTop: '1.5rem', marginBottom: '1.5rem' }}
      ></div>
    )
  }

  if (error) {
    return (
      <div
        className={`d3-chart-error ${className}`}
        style={{ padding: '1rem', color: 'red', marginTop: '1.5rem', marginBottom: '1.5rem' }}
      >
        <p>Error loading chart: {error}</p>
      </div>
    )
  }

  return (
    <div
      className={`d3-chart-container ${className}`}
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'visible',
        margin: '2rem 0',
        minHeight,
        padding: '0.75rem 0',
      }}
    >
      {!isLoaded && (
        <div
          className="d3-chart-loading"
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#666',
          }}
        >
          Loading chart...
        </div>
      )}
      <div
        ref={containerRef}
        className="d3-chart-content"
        style={{
          width: '100%',
          position: 'relative',
          overflow: 'visible',
        }}
      />
    </div>
  )
}

export default HTMLRenderer
