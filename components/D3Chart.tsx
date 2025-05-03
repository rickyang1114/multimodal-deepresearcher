'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { usePathname } from 'next/navigation'

interface D3ChartProps {
  htmlFile: string // 改为只接收文件名部分
  height?: string | number
  className?: string
  maxWidth?: string | number
  minHeight?: string | number
  // 可选的自定义基础路径
  basePath?: string
}

const D3Chart = ({ 
  htmlFile, 
  height = 'auto', 
  className = '',
  maxWidth,
  minHeight = 250,
  basePath,
}: D3ChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [documentWidth, setDocumentWidth] = useState<number | null>(null)
  const [chartHeight, setChartHeight] = useState<number | null>(null)
  
  // 使用 Next.js 的 usePathname 钩子获取当前路径
  const pathname = usePathname()
  
  // 构建完整的 HTML 路径
  const [htmlPath, setHtmlPath] = useState<string>('')
  
  const chartId = useRef(`chart-${hashString(htmlFile)}-${Math.random().toString(36).substr(2, 5)}`).current
  
  function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 6);
  }
  
  // 在组件挂载后构建完整路径
  useEffect(() => {
    if (!pathname) return;
    
    // 如果提供了自定义基础路径，就直接使用
    if (basePath) {
      setHtmlPath(`${basePath}/${htmlFile}`);
      return;
    }
    
    // 从当前路径中提取 basename
    // 格式可能是 /folder/page 或 /folder
    const parts = pathname.split('/').filter(Boolean);
    
    // 获取最后一个非空部分作为 basename
    // 如果路径是 /folder/page，取 page
    // 如果路径是 /folder，取 folder
    const basename = parts.length > 0 ? parts[parts.length - 1] : '';
    
    // 构建完整路径: /html_charts/basename/htmlFile
    const fullPath = `/html_charts/${basename}/${htmlFile}`;
    setHtmlPath(fullPath);
  }, [pathname, htmlFile, basePath]);
  
  // 检测文档文本内容的最大宽度
  useEffect(() => {
    if (typeof window === 'undefined' || maxWidth !== undefined) return;
    
    const detectTextContentWidth = () => {
      // 常见的内容容器类名或ID
      const contentSelectors = [
        'main', 'article', '.article', '.content', '.post-content', 
        '.main-content', '#content', '#main-content', '.container',
        '.post', '.entry-content', '.page-content'
      ];
      
      // 尝试找到内容容器
      let contentContainer: Element | null = null;
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element && (element as HTMLElement).clientWidth > 0) {
          // 确认元素是否包含文本内容
          if (element.textContent && element.textContent.trim().length > 0) {
            contentContainer = element;
            break;
          }
        }
      }
      
      // 如果找不到内容容器，则使用可能的父容器
      if (!contentContainer && containerRef.current) {
        let parent = containerRef.current.parentElement;
        while (parent) {
          // 跳过不可见或宽度为0的元素
          if (parent.clientWidth > 0) {
            contentContainer = parent;
            break;
          }
          parent = parent.parentElement;
        }
      }
      
      // 如果仍然找不到，使用body的内部宽度减去默认边距
      if (!contentContainer) {
        // 通常文档边距在20-40px之间，取30px作为估计值
        return document.body.clientWidth - 60;
      }
      
      // 获取实际内容区域宽度
      let contentWidth = (contentContainer as HTMLElement).clientWidth;
      
      // 防止不合理的宽度值，设置最小宽度
      if (contentWidth < 300) contentWidth = Math.min(document.body.clientWidth - 60, 800);
      
      return contentWidth;
    };
    
    // 检测和设置宽度
    const width = detectTextContentWidth();
    setDocumentWidth(width);
    
    // 当窗口大小改变时重新检测
    const handleWindowResize = () => {
      const newWidth = detectTextContentWidth();
      setDocumentWidth(newWidth);
    };
    
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [maxWidth]);
  
  useEffect(() => {
    setIsMounted(true)
    
    // 在客户端确保d3可全局访问
    if (typeof window !== 'undefined') {
      window.d3 = d3
    }
  }, [])

  useEffect(() => {
    if (!isMounted || !containerRef.current || !htmlPath) return

    const loadHtmlContent = async () => {
      try {
        const response = await fetch(htmlPath)
        
        if (!response.ok) {
          throw new Error(`Failed to load chart: ${response.status} ${response.statusText}`)
        }
        
        let htmlContent = await response.text()
        
        // 创建一个沙盒环境解析HTML
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlContent, 'text/html')
        
        // 处理Font Awesome引用
        const fontAwesomeLinks: Element[] = [];
        doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.includes('font-awesome')) {
            fontAwesomeLinks.push(link);
          }
        });
        
        // 检查页面上是否已经有Font Awesome，如果没有则添加
        const existingFontAwesome = document.querySelector(`link[href*="font-awesome"]`);
        if (fontAwesomeLinks.length > 0 && !existingFontAwesome) {
          // 仅添加第一个Font Awesome链接到全局文档以避免重复
          const fontAwesomeLink = document.createElement('link');
          fontAwesomeLink.rel = 'stylesheet';
          fontAwesomeLink.href = fontAwesomeLinks[0].getAttribute('href') || '';
          fontAwesomeLink.setAttribute('data-chart-id', chartId);
          document.head.appendChild(fontAwesomeLink);
        }
        
        // 提取所有样式并添加作用域
        const styles: string[] = []
        doc.querySelectorAll('style').forEach(style => {
          if (style.textContent) {
            // 修改样式添加作用域前缀
            let styleContent = style.textContent
              .replace(/position\s*:\s*fixed/gi, 'position: relative')
              .replace(/height\s*:\s*100vh/gi, 'height: auto')
              .replace(/overflow\s*:\s*hidden/gi, 'overflow: visible')
            
            // 作用域化所有样式，通过给选择器添加前缀
            styleContent = scopeCSS(styleContent, `.${chartId}-wrapper`);
            
            // 特别处理body样式，应用到容器上
            styleContent = styleContent.replace(/\.${chartId}-wrapper\s+body\s*{([^}]*)}/gi, (match, bodyProps) => {
              return `.${chartId}-wrapper {${bodyProps} height: auto !important; margin: 0 !important; padding: 0 !important;}`;
            });
            
            styles.push(styleContent);
          }
        });
        
        // 提取可视化容器
        const vizContainer = doc.querySelector('.visualization-container');
        if (!vizContainer) {
          throw new Error('Could not find visualization container in HTML');
        }
        
        // 提取所有脚本并处理DOMContentLoaded事件
        const domReadyFunctions: string[] = [];
        const scripts: string[] = [];
        
        doc.querySelectorAll('script').forEach(script => {
          if (!script.src && script.textContent) {
            let scriptContent = script.textContent;
            
            // 提取DOMContentLoaded事件处理器中的函数体
            const domReadyRegex = /document\.addEventListener\(['"]DOMContentLoaded['"], *(?:function\s*\(\s*\)\s*|\(\s*\)\s*=>\s*){([\s\S]*?)}\s*\)/g;
            let match;
            while ((match = domReadyRegex.exec(scriptContent)) !== null) {
              if (match[1]) {
                domReadyFunctions.push(match[1]);
                scriptContent = scriptContent.replace(match[0], '// DOMContentLoaded handler extracted');
              }
            }
            
            // 替换脚本中的所有D3选择器，确保它们选择有正确ID的元素
            scriptContent = scriptContent
              .replace(/d3\.select\(['"]([^'"#.]+)['"]\)/g, `d3.select("#${chartId}-$1")`)
              .replace(/d3\.select\(['"]#([^'"]+)['"]\)/g, `d3.select("#${chartId}-$1")`)
              .replace(/d3\.select\(['"]\.visualization-container['"]\)/g, `d3.select("#${chartId}-container")`)
              .replace(/d3\.selectAll\(['"]([^'"#.]+)['"]\)/g, `d3.selectAll(".${chartId}-wrapper $1")`)
              .replace(/document\.getElementById\(['"]([^'"]+)['"]\)/g, `document.getElementById("${chartId}-$1")`)
              .replace(/document\.querySelector\(['"]([^'"#.][^'"]*)['"]\)/g, `document.querySelector(".${chartId}-wrapper $1")`)
              .replace(/document\.querySelector\(['"]#([^'"]+)['"]\)/g, `document.querySelector("#${chartId}-$1")`)
              .replace(/document\.querySelectorAll\(['"]([^'"]+)['"]\)/g, `document.querySelectorAll(".${chartId}-wrapper $1")`);
              
            scripts.push(scriptContent);
          }
        });
        
        // 确定使用的最大宽度
        const effectiveMaxWidth = maxWidth !== undefined 
          ? maxWidth 
          : (documentWidth ? `${documentWidth}px` : '100%');
        
        // 清空容器
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          
          // 添加样式
          const styleElement = document.createElement('style');
          
          // 添加缩放逻辑的CSS
          const scaleCSS = `
            .${chartId}-scale-container {
              max-width: ${typeof effectiveMaxWidth === 'number' ? `${effectiveMaxWidth}px` : effectiveMaxWidth};
              width: 100%;
              margin: 0 auto;
              transform-origin: top left;
              height: ${typeof height === 'number' ? `${height}px` : height};
              min-height: ${typeof minHeight === 'number' ? `${minHeight}px` : minHeight};
              position: relative;
            }
            
            .${chartId}-wrapper {
              width: 100%;
              height: 100%;
              position: relative;
            }
            
            /* Ensure SVGs can expand fully */
            .${chartId}-wrapper svg {
              overflow: visible !important;
            }
            
            /* Prevent text truncation */
            .${chartId}-wrapper text {
              overflow: visible !important;
            }
          `;
          
          styleElement.textContent = styles.join('\n') + '\n' + scaleCSS;
          styleElement.setAttribute('data-chart-id', chartId);
          containerRef.current.appendChild(styleElement);
          
          // 创建缩放容器
          const scaleContainer = document.createElement('div');
          scaleContainer.className = `${chartId}-scale-container`;
          
          // 创建带有作用域的包装容器
          const wrapperContainer = document.createElement('div');
          wrapperContainer.className = `${chartId}-wrapper`;
          wrapperContainer.style.width = '100%';
          wrapperContainer.style.height = '100%';
          wrapperContainer.style.position = 'relative';
          
          // 创建图表容器并设置样式
          const chartContainer = document.createElement('div');
          chartContainer.id = `${chartId}-container`;
          chartContainer.className = `visualization-container ${chartId}-container`;
          chartContainer.style.width = '100%';
          
          // 复制原始容器的一些关键样式
          chartContainer.style.position = 'relative';
          chartContainer.style.display = 'flex';
          chartContainer.style.flexDirection = 'column';
          chartContainer.style.alignItems = 'center';
          chartContainer.style.justifyContent = 'center';
          
          // 判断是否是使用D3生成SVG的复杂图表
          const isDynamicD3Chart = scripts.some(script => 
            script.includes('d3.select') && 
            (script.includes('append("svg")') || script.includes("append('svg')")));
            
          // 是否包含多个图表DIV
          const hasMultipleCharts = vizContainer.querySelectorAll('.chart').length > 0;
          
          if (isDynamicD3Chart || hasMultipleCharts) {
            // 复制HTML结构但保留原始ID，以便D3脚本可以找到它们
            chartContainer.innerHTML = '';
            
            // 直接复制主要的HTML结构
            Array.from(vizContainer.children).forEach(child => {
              const clone = child.cloneNode(true) as HTMLElement;
              
              // 为所有有ID的元素添加前缀
              if (clone.id) {
                clone.id = `${chartId}-${clone.id}`;
              }
              
              // 递归处理所有子元素的ID
              const elementsWithId = clone.querySelectorAll('[id]');
              elementsWithId.forEach(el => {
                const originalId = el.id;
                (el as HTMLElement).id = `${chartId}-${originalId}`;
              });
              
              // 移除任何现有的SVG元素，它们将被脚本重新创建
              const svgElements = clone.querySelectorAll('svg');
              svgElements.forEach(svg => svg.remove());
              
              chartContainer.appendChild(clone);
            });
          } else {
            // 非动态图表：直接复制所有内容
            chartContainer.innerHTML = vizContainer.innerHTML;
            
            // 为所有ID添加前缀
            const elementsWithId = chartContainer.querySelectorAll('[id]');
            elementsWithId.forEach(el => {
              const originalId = el.id;
              (el as HTMLElement).id = `${chartId}-${originalId}`;
            });
          }
          
          wrapperContainer.appendChild(chartContainer);
          scaleContainer.appendChild(wrapperContainer);
          containerRef.current.appendChild(scaleContainer);
          
          // 执行脚本，但给DOM一点时间来渲染
          setTimeout(() => {
            // 实现自动缩放函数
            const handleResize = () => {
              if (containerRef.current) {
                const scaleContainer = containerRef.current.querySelector(`.${chartId}-scale-container`) as HTMLElement | null;
                const wrapperContainer = containerRef.current.querySelector(`.${chartId}-wrapper`) as HTMLElement | null;
                
                if (scaleContainer && wrapperContainer) {
                  // 获取原始宽度和容器宽度
                  const originalWidth = wrapperContainer.scrollWidth;
                  const containerWidth = scaleContainer.clientWidth;
                  
                  // 检测SVG元素和图表内容来确定实际高度
                  const svgElements = wrapperContainer.querySelectorAll('svg');
                  let contentHeight = 0;
                  
                  // 检查SVG高度
                  svgElements.forEach(svg => {
                    // 获取SVG的实际内容高度
                    const svgHeight = svg.getBoundingClientRect().height;
                    // 检查SVG的viewBox
                    const viewBox = svg.getAttribute('viewBox');
                    if (viewBox) {
                      const viewBoxParts = viewBox.split(' ');
                      if (viewBoxParts.length >= 4) {
                        const viewBoxHeight = parseFloat(viewBoxParts[3]);
                        contentHeight = Math.max(contentHeight, viewBoxHeight, svgHeight);
                      } else {
                        contentHeight = Math.max(contentHeight, svgHeight);
                      }
                    } else {
                      contentHeight = Math.max(contentHeight, svgHeight);
                    }
                  });
                  
                  // 考虑容器内的其他元素（如标题、注释等）
                  contentHeight = Math.max(contentHeight, wrapperContainer.scrollHeight);
                  
                  // 如果内容宽度超过了容器宽度，则缩放
                  if (originalWidth > containerWidth) {
                    const scale = containerWidth / originalWidth;
                    wrapperContainer.style.transform = `scale(${scale})`;
                    wrapperContainer.style.transformOrigin = 'top left';
                    wrapperContainer.style.width = `${(1/scale) * 100}%`;
                    
                    // 调整容器高度，考虑缩放
                    if (height !== 'auto') {
                      const originalHeight = typeof height === 'number' ? height : parseInt(height.toString(), 10);
                      if (!isNaN(originalHeight)) {
                        const scaledHeight = originalHeight * scale;
                        scaleContainer.style.height = `${Math.max(scaledHeight, typeof minHeight === 'number' ? minHeight : parseInt(String(minHeight), 10) || 0)}px`;
                      }
                    } else {
                      // 对于auto高度，需要根据内容缩放后的高度调整
                      const scaledHeight = contentHeight > 0 ? contentHeight * scale : wrapperContainer.scrollHeight * scale;
                      scaleContainer.style.height = `${Math.max(scaledHeight, typeof minHeight === 'number' ? minHeight : parseInt(String(minHeight), 10) || 0)}px`;
                      setChartHeight(scaledHeight);
                    }
                  } else {
                    // 如果不需要缩放，则重置样式
                    wrapperContainer.style.transform = 'none';
                    wrapperContainer.style.width = '100%';
                    
                    // 仍然需要调整高度以适应内容
                    if (height === 'auto') {
                      const actualHeight = contentHeight > 0 ? contentHeight : wrapperContainer.scrollHeight;
                      scaleContainer.style.height = `${Math.max(actualHeight, typeof minHeight === 'number' ? minHeight : parseInt(String(minHeight), 10) || 0)}px`;
                      setChartHeight(actualHeight);
                    }
                  }
                  
                  // 最后检查是否有被切断的元素
                  ensureNoTruncation(wrapperContainer);
                }
              }
            };
            
            // 辅助函数来确保没有元素被截断
            const ensureNoTruncation = (container: HTMLElement) => {
              const scaleContainer = container.closest(`.${chartId}-scale-container`) as HTMLElement;
              if (!scaleContainer) return;
              
              // 查找所有文本元素、图表元素和底部元素
              const svgs = container.querySelectorAll('svg');
              let maxBottomPosition = 0;
              
              svgs.forEach(svg => {
                // 检查SVG中的所有元素，特别是文本和在底部的图形元素
                const allElements = svg.querySelectorAll('*');
                allElements.forEach(el => {
                  const bounds = el.getBoundingClientRect();
                  const containerBounds = container.getBoundingClientRect();
                  const relativeBottom = bounds.bottom - containerBounds.top;
                  maxBottomPosition = Math.max(maxBottomPosition, relativeBottom);
                });
              });
              
              // 检查DOM元素
              const allElements = container.querySelectorAll('*');
              allElements.forEach(el => {
                if (el instanceof HTMLElement) {
                  const bounds = el.getBoundingClientRect();
                  const containerBounds = container.getBoundingClientRect();
                  const relativeBottom = bounds.bottom - containerBounds.top;
                  maxBottomPosition = Math.max(maxBottomPosition, relativeBottom);
                }
              });
              
              // 获取容器的当前高度和比例
              const currentHeight = parseFloat(scaleContainer.style.height) || scaleContainer.clientHeight;
              const scaleMatch = container.style.transform.match(/scale\(([^)]+)\)/);
              const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
              
              // 如果有内容超出了容器底部，调整高度
              if (maxBottomPosition * scale > currentHeight) {
                // 添加一些额外空间(10%)以确保完全显示
                const newHeight = maxBottomPosition * scale * 1.1;
                scaleContainer.style.height = `${newHeight}px`;
                setChartHeight(newHeight);
              }
            };
          
            const executeAllScripts = () => {
              try {
                // 创建一个函数，它将在闭包中执行，同时能访问d3和新元素
                const scriptFunction = new Function('d3', `
                  // 确保选择器能找到正确的元素
                  const chartContainer = document.getElementById("${chartId}-container");
                  
                  // 定义常见的chart相关变量，以便脚本可以访问
                  const debtEquityChart = document.getElementById("${chartId}-debt-equity-chart");
                  const capitalStackChart = document.getElementById("${chartId}-capital-stack-chart");
                  const debtStructureChart = document.getElementById("${chartId}-debt-structure-chart");
                  const waccChart = document.getElementById("${chartId}-wacc-chart");
                  
                  // 先执行常规脚本
                  ${scripts.join('\n\n')}
                  
                  // 然后执行DOMContentLoaded事件中的代码
                  ${domReadyFunctions.join('\n\n')}
                `);
                
                // 执行合并后的脚本
                scriptFunction(window.d3);
                
                // 等脚本执行完后应用缩放 - 使用多个检查点以确保高度正确
                setTimeout(() => {
                  handleResize();
                  
                  // 再次检查以捕获延迟渲染的元素
                  setTimeout(() => {
                    handleResize();
                    
                    // 最终检查并标记加载完成
                    setTimeout(() => {
                      handleResize();
                      setIsLoaded(true);
                    }, 100);
                  }, 100);
                }, 100);
              } catch (err) {
                console.error('Error executing D3 scripts:', err, err instanceof Error ? err.stack : '');
              }
            };
            
            // 添加窗口大小调整事件监听器
            window.addEventListener('resize', handleResize);
            
            // 执行所有脚本
            executeAllScripts();
            
            // 返回清理函数
            return () => {
              window.removeEventListener('resize', handleResize);
            };
          }, 300); // 增加延迟，确保DOM已完全渲染
        }
        
        return undefined; // 确保返回类型一致
      } catch (err) {
        console.error('Error loading D3 chart:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chart');
        return undefined; // 确保返回类型一致
      }
    };

    const cleanupPromise = loadHtmlContent();
    
    return () => {
      // 执行异步返回的清理函数已在各自范围内处理
      
      // 清理DOM
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
      // 移除添加的字体图标链接（如果图表被卸载）
      const fontAwesomeLink = document.querySelector(`link[data-chart-id="${chartId}"]`);
      if (fontAwesomeLink) {
        fontAwesomeLink.remove();
      }
    };
  }, [htmlPath, isMounted, chartId, height, maxWidth, documentWidth, minHeight]);

  // 为CSS添加作用域的函数
  function scopeCSS(cssText: string, scopeSelector: string): string {
    try {
      // 使用CSSOM解析CSS
      const dummyElement = document.createElement('style');
      dummyElement.textContent = cssText;
      document.head.appendChild(dummyElement);
      
      const rules = dummyElement.sheet?.cssRules;
      let scopedCSS = '';
      
      if (rules) {
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          
          // 处理普通样式规则
          if (rule instanceof CSSStyleRule) {
            const selectors = rule.selectorText.split(',').map(selector => {
              selector = selector.trim();
              
              // 跳过已经有作用域的选择器
              if (selector.includes(scopeSelector)) {
                return selector;
              }
              
              // 处理特殊选择器
              if (selector === 'body' || selector === 'html') {
                return `${scopeSelector} ${selector}`;
              }
              
              // 添加作用域前缀
              return `${scopeSelector} ${selector}`;
            }).join(', ');
            
            scopedCSS += `${selectors} { ${rule.style.cssText} }\n`;
          } 
          // 处理@media等规则
          else if (rule instanceof CSSMediaRule) {
            let mediaText = '@media ' + rule.conditionText + ' {\n';
            for (let j = 0; j < rule.cssRules.length; j++) {
              const nestedRule = rule.cssRules[j];
              if (nestedRule instanceof CSSStyleRule) {
                const selectors = nestedRule.selectorText.split(',').map(selector => {
                  selector = selector.trim();
                  if (selector.includes(scopeSelector)) {
                    return selector;
                  }
                  if (selector === 'body' || selector === 'html') {
                    return `${scopeSelector} ${selector}`;
                  }
                  return `${scopeSelector} ${selector}`;
                }).join(', ');
                mediaText += `  ${selectors} { ${nestedRule.style.cssText} }\n`;
              }
            }
            mediaText += '}\n';
            scopedCSS += mediaText;
          }
          // 其他规则（如@keyframes）直接添加
          else {
            scopedCSS += rule.cssText + '\n';
          }
        }
      }
      
      // 清理
      document.head.removeChild(dummyElement);
      
      return scopedCSS;
    } catch (e) {
      console.error('Error scoping CSS:', e);
      // 出错时返回原始CSS
      return cssText;
    }
  }
  
  // 确定有效的最大宽度
  const effectiveMaxWidth = maxWidth !== undefined 
    ? maxWidth 
    : (documentWidth ? `${documentWidth}px` : '100%');

  if (!isMounted) {
    return <div className={`d3-chart-placeholder ${className}`} style={{ height, maxWidth: effectiveMaxWidth, minHeight, marginTop: '1.5rem', marginBottom: '1.5rem' }}></div>;
  }

  if (error) {
    return (
      <div className={`d3-chart-error ${className}`} style={{ padding: '1rem', color: 'red', maxWidth: effectiveMaxWidth, marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <p>Error loading chart: {error}</p>
      </div>
    );
  }

  // Use calculated height if available
  const displayHeight = chartHeight ? `${chartHeight}px` : height;

  return (
    <div className={`d3-chart-container ${className}`} style={{ 
      width: '100%',
      position: 'relative',
      overflow: 'visible',
      maxWidth: typeof effectiveMaxWidth === 'number' ? `${effectiveMaxWidth}px` : effectiveMaxWidth,
      margin: '2rem auto', // Added vertical margin to create separation
      minHeight,
      padding: '0.75rem 0' // Added vertical padding within the container
    }}>
      {!isLoaded && (
        <div className="d3-chart-loading" style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#666'
        }}>
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
          minHeight
        }}
      />
    </div>
  );
};

declare global {
  interface Window {
    d3: typeof d3;
  }
}

export default D3Chart