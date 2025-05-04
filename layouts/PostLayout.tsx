"use client"

import { ReactNode, useEffect, useState, useRef } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface TOCItem {
  id: string
  text: string
  level: number
}

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags } = content
  const basePath = path.split('/')[0]
  const [toc, setToc] = useState<TOCItem[]>([])
  const [showToc, setShowToc] = useState(false)
  const [activeId, setActiveId] = useState("")
  const headingElementsRef = useRef<Record<string, IntersectionObserverEntry>>({})
  const tocRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLLIElement>(null)

  // Extract headings after component mounts
  useEffect(() => {
    const headings = document.querySelectorAll('h2, h3, h4')
    const tocItems: TOCItem[] = []

    headings.forEach((heading) => {
      const id = heading.id
      const text = heading.textContent
      const level = parseInt(heading.tagName.substring(1))

      if (id && text) {
        tocItems.push({ id, text, level })
      }
    })

    setToc(tocItems)
  }, [])

  // 监听滚动，设置当前活动标题
  useEffect(() => {
    if (toc.length === 0) return

    const headingElements = toc.map(item => document.getElementById(item.id))
    
    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        headingElementsRef.current[entry.target.id] = entry
      })

      // 获取当前可见的所有标题
      const visibleHeadings: IntersectionObserverEntry[] = []
      Object.keys(headingElementsRef.current).forEach((key) => {
        const entry = headingElementsRef.current[key]
        if (entry.isIntersecting) visibleHeadings.push(entry)
      })

      if (visibleHeadings.length === 0) return
      
      // 找到最靠近顶部的标题
      let closestHeading = visibleHeadings[0]
      visibleHeadings.forEach(heading => {
        if (heading.boundingClientRect.top < closestHeading.boundingClientRect.top) {
          closestHeading = heading
        }
      })

      setActiveId(closestHeading.target.id)
    }

    const observer = new IntersectionObserver(callback, {
      rootMargin: '-20px 0px -20px 0px',
      threshold: [0, 1]
    })

    headingElements.forEach(element => {
      if (element) observer.observe(element)
    })

    return () => {
      headingElements.forEach(element => {
        if (element) observer.unobserve(element)
      })
    }
  }, [toc])

  // 当活动标题改变时，自动滚动TOC面板
  useEffect(() => {
    if (showToc && activeItemRef.current && tocRef.current) {
      const tocContainer = tocRef.current
      const activeElement = activeItemRef.current
      
      // 计算元素相对于容器的位置
      const activeRect = activeElement.getBoundingClientRect()
      const containerRect = tocContainer.getBoundingClientRect()
      
      // 检查元素是否在容器可视区域内
      const isInView = (
        activeRect.top >= containerRect.top &&
        activeRect.bottom <= containerRect.bottom
      )
      
      // 如果不在可视区域内，滚动容器
      if (!isInView) {
        // 计算滚动位置，使活动项在容器中间
        const scrollTop = 
          activeElement.offsetTop - 
          tocContainer.offsetHeight / 2 + 
          activeElement.offsetHeight / 2
        
        // 平滑滚动到该位置
        tocContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        })
      }
    }
  }, [activeId, showToc])

  // 切换目录的显示状态
  const toggleToc = () => {
    setShowToc(!showToc)
  }

  // 处理目录项点击，跳转到对应标题但不关闭TOC
  const handleTocItemClick = (e, id) => {
    e.preventDefault()
    
    // 获取目标元素
    const targetElement = document.getElementById(id)
    if (targetElement) {
      // 平滑滚动到目标元素
      targetElement.scrollIntoView({ behavior: 'smooth' })
      
      // 设置当前活动标题（不等待IntersectionObserver触发）
      setActiveId(id)
      
      // 可选：更新浏览器URL，但不导致页面跳转
      if (history.pushState) {
        history.pushState(null, "", `#${id}`)
      }
    }
  }

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      
      {/* 固定位置的TOC按钮和面板容器 */}
      {toc.length > 0 && (
        <div className="fixed left-4 bottom-24 z-40 md:left-6">
          <button 
            onClick={toggleToc}
            className={`bg-primary-500 text-white rounded-full p-3 shadow-lg hover:bg-primary-600 transition-all duration-200 flex items-center justify-center ${showToc ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-label="Show Table of Contents"
            title="Table of Contents"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          
          {/* TOC展开面板 */}
          <div 
            ref={tocRef}
            className={`fixed left-4 bottom-24 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:left-6 transition-all duration-300 max-h-[60vh] overflow-auto w-64 ${showToc ? 'opacity-100 transform translate-y-0' : 'opacity-0 pointer-events-none transform translate-y-4'}`}
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 py-1">
              <h2 className="text-sm tracking-wide text-gray-500 uppercase font-bold dark:text-gray-400">
                Table of Contents
              </h2>
              <button 
                onClick={toggleToc}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Close Table of Contents"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="toc">
              <ul className="space-y-2 overflow-hidden">
                {toc.map((item) => {
                  const isActive = activeId === item.id
                  return (
                    <li 
                      key={item.id}
                      ref={isActive ? activeItemRef : null}
                      style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
                      className={`truncate transition-colors duration-200 py-1 ${isActive ? 'border-l-2 border-primary-500 pl-2 -ml-2' : ''}`}
                    >
                      <a
                        href={`#${item.id}`}
                        className={`text-sm hover:text-primary-500 dark:hover:text-primary-400 ${
                          isActive 
                            ? 'text-primary-500 font-medium dark:text-primary-400' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={(e) => handleTocItemClick(e, item.id)}
                      >
                        {item.text}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
      
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0 dark:divide-gray-700">
            <dl className="pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
              <dt className="sr-only">Authors</dt>
              <dd>
                <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-y-8 xl:space-x-0">
                  {authorDetails.map((author) => (
                    <li className="flex items-center space-x-2" key={author.name}>
                      {author.avatar && (
                        <Image
                          src={author.avatar}
                          width={38}
                          height={38}
                          alt="avatar"
                          className="h-10 w-10 rounded-full"
                        />
                      )}
                      <dl className="text-sm leading-5 font-medium whitespace-nowrap">
                        <dt className="sr-only">Name</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                        <dt className="sr-only">Twitter</dt>
                        <dd>
                          {author.twitter && (
                            <Link
                              href={author.twitter}
                              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {author.twitter
                                .replace('https://twitter.com/', '@')
                                .replace('https://x.com/', '@')}
                            </Link>
                          )}
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              </dd>
              
              <footer>
              <div className="divide-gray-200 text-sm leading-5 font-medium xl:col-start-1 xl:row-start-2 xl:divide-y dark:divide-gray-700">
                {tags && (
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      Tags
                    </h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {(next || prev) && (
                  <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                    {prev && prev.path && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          Previous Article
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/${prev.path}`}>{prev.title}</Link>
                        </div>
                      </div>
                    )}
                    {next && next.path && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          Next Article
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/${next.path}`}>{next.title}</Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4 xl:pt-8">
                <Link
                  href={`/${basePath}`}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Back to the report"
                >
                  &larr; Back to the report
                </Link>
              </div>
            </footer>
            </dl>
            <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
              <div className="prose dark:prose-invert max-w-none pt-10 pb-8">{children}</div>
              <div className="pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
                <Link href={discussUrl(path)} rel="nofollow">
                  Discuss on Twitter
                </Link>
                {` • `}
                <Link href={editUrl(filePath)}>View on GitHub</Link>
              </div>
              {siteMetadata.comments && (
                <div
                  className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300"
                  id="comment"
                >
                  <Comments slug={slug} />
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}