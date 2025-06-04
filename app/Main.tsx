import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import SocialIcon from '@/components/social-icons'

const MAX_DISPLAY = 10

export default function Home({ posts }) {
  return (
    <>
      <ScrollTopAndComment />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Multimodal DeepResearcher
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        {/* Authors Section */}
        <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800/50">
          {/* Authors List - Slightly Larger Font */}
          <div className="text-center text-base leading-relaxed text-gray-700 dark:text-gray-300">
            <span className="font-medium">Zhaorui Yang</span>
            <sup className="text-blue-600 dark:text-blue-400">§*</sup>,
            <span className="font-medium">Bo Pan</span>
            <sup className="text-blue-600 dark:text-blue-400">§*</sup>,
            <span className="font-medium">Han Wang</span>
            <sup className="text-blue-600 dark:text-blue-400">§*</sup>,
            <span className="font-medium">Yiyao Wang</span>
            <sup className="text-blue-600 dark:text-blue-400">§</sup>,
            <span className="font-medium">Xingyu Liu</span>
            <sup className="text-blue-600 dark:text-blue-400">§</sup>,
            <span className="font-medium">Minfeng Zhu</span>
            <sup className="text-orange-600 dark:text-orange-400">‡</sup>
            <sup className="text-green-600 dark:text-green-400">✉</sup>,
            <span className="font-medium">Bo Zhang</span>
            <sup className="text-blue-600 dark:text-blue-400">§</sup>
            <sup className="text-green-600 dark:text-green-400">✉</sup>,
            <span className="font-medium">Wei Chen</span>
            <sup className="text-blue-600 dark:text-blue-400">§</sup>
          </div>

          {/* Affiliations - Same Line */}
          <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
            <span>
              <sup className="text-blue-600 dark:text-blue-400">§</sup>State Key Lab of CAD&CG,
              Zhejiang University
            </span>
            <span className="mx-4"></span>
            <span>
              <sup className="text-orange-600 dark:text-orange-400">‡</sup>Zhejiang University
            </span>
          </div>

          {/* Legend - Slightly Larger */}
<div className="mt-3 flex justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
  <span>
    <sup className="text-blue-600 dark:text-blue-400">*</sup>Equal Contribution
  </span>
  <span>
    <sup className="text-green-600 dark:text-green-400">✉</sup>Corresponding Authors
  </span>
  {/* arXiv Button */}
  <Link
    href="https://arxiv.org/abs/2506.02454"
    className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800 transition-colors duration-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
    target="_blank"
    rel="noopener noreferrer"
  >
    arXiv
    <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.8423 0a1.0037 1.0037 0 0 0-.922.6078c-.1536.3687-.0438.6275.2938 1.1113l6.9185 8.3597-1.0223 1.1058a1.0393 1.0393 0 0 0 .003 1.4229l1.2292 1.3135-5.4391 6.4444c-.2803.299-.4538.823-.2971 1.1986a1.0253 1.0253 0 0 0 .9585.635.9133.9133 0 0 0 .6891-.3405l5.783-6.126 7.4902 8.0051a.8527.8527 0 0 0 .6835.2597.9575.9575 0 0 0 .8777-.6138c.1577-.377-.017-.7502-.306-1.1407l-7.0518-8.3418 1.0632-1.13a.9626.9626 0 0 0 .0089-1.3165L4.6336.4639s-.3733-.4535-.768-.463zm0 .272h.0166c.2179.0052.4874.2715.5644.3639l.005.006.0052.0055 10.169 10.9905a.6915.6915 0 0 1-.0072.945l-1.0666 1.133-1.4982-1.7724-8.5994-10.39c-.3286-.472-.352-.6183-.2592-.841a.7307.7307 0 0 1 .6704-.4401Zm14.341 1.5701a.877.877 0 0 0-.6554.2418l-5.6962 6.1584 1.6944 1.8319 5.3089-6.5138c.3251-.4335.479-.6603.3247-1.0292a1.1205 1.1205 0 0 0-.9763-.689zm-7.6557 12.2823 1.3186 1.4135-5.7864 6.1295a.6494.6494 0 0 1-.4959.26.7516.7516 0 0 1-.706-.4669c-.1119-.2682.0359-.6864.2442-.9083l.0051-.0055.0047-.0055z"
      />
    </svg>
  </Link>
</div>
        </div>
        {/* Project Introduction Section */}
        <div className="border-b border-gray-200 py-12 dark:border-gray-700">
          <div className="mx-auto max-w-6xl space-y-12">
            {/* TL;DR Section */}
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-8 dark:border-indigo-700 dark:from-indigo-900/30 dark:to-blue-900/30">
              <div className="space-y-6 text-center">
                <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></span>
                  <span>TL;DR</span>
                </div>

                <div className="mx-auto max-w-4xl">
                  <p className="mb-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    We introduce an{' '}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      agentic framework
                    </span>{' '}
                    that automatically generates comprehensive multimodal reports{' '}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      from scratch
                    </span>{' '}
                    with{' '}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      interleaved texts and visualizations
                    </span>
                    , going beyond text-only content generation.
                  </p>
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="rounded-xl bg-red-50 p-8 dark:bg-red-900/20">
              <h3 className="mb-6 flex items-center text-2xl font-semibold text-red-800 dark:text-red-200">
                <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm text-white">
                  !
                </span>
                The Problem We Study
              </h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="flex items-start space-x-3">
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-400"></span>
                  <p>
                    Existing deep research frameworks primarily focus on generating text-only
                    content, leaving the automated generation of interleaved texts and
                    visualizations underexplored
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-400"></span>
                  <p>
                    Visualizations play a crucial part in effective communication of concepts and
                    information, yet automated generation remains challenging
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-400"></span>
                  <p>
                    Despite advances in reasoning and retrieval augmented generation, LLMs lack
                    standardized methods for understanding and generating diverse, high-quality
                    visualizations
                  </p>
                </div>
              </div>
            </div>

            {/* Key Challenges */}
            <div className="rounded-xl bg-amber-50 p-8 dark:bg-amber-900/20">
              <h3 className="mb-6 flex items-center text-2xl font-semibold text-amber-800 dark:text-amber-200">
                <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm text-white">
                  ⚡
                </span>
                Key Challenges
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400"></span>
                    <p className="text-gray-700 dark:text-gray-300">
                      Designing informative and meaningful visualizations that enhance content
                      understanding
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400"></span>
                    <p className="text-gray-700 dark:text-gray-300">
                      Effectively integrating visualizations with text reports in a coherent manner
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400"></span>
                    <p className="text-gray-700 dark:text-gray-300">
                      Enabling LLMs to learn from and generate diverse, high-quality chart
                      representations
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400"></span>
                    <p className="text-gray-700 dark:text-gray-300">
                      Developing comprehensive evaluation frameworks for multimodal report
                      generation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Approach */}
            <div className="rounded-xl bg-blue-50 p-8 dark:bg-blue-900/20">
              <h3 className="mb-6 flex items-center text-2xl font-semibold text-blue-800 dark:text-blue-200">
                <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
                  💡
                </span>
                Our Method
              </h3>

              {/* FDV Introduction */}
              <div className="mb-8">
                <h4 className="mb-6 text-xl font-semibold text-blue-700 dark:text-blue-300">
                  Formal Description of Visualization (FDV)
                </h4>

                <div className="space-y-6">
                  <p className="text-gray-700 dark:text-gray-300">
                    We propose FDV, a structured textual representation of charts that enables Large
                    Language Models to learn from and generate diverse, high-quality visualizations.
                  </p>

                  <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="flex items-start space-x-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400"></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Structured textual representation for charts
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400"></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Enables in-context learning and generation of LLM
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400"></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Supports diverse visualization types
                      </span>
                    </div>
                  </div>

                  {/* FDV Image - Full Width */}
                  <div className="rounded-lg border-2 border-dashed border-blue-300 bg-white p-6 dark:border-blue-600 dark:bg-gray-800">
                    <img
                      src="./mdr/fdv.png"
                      alt="Formal Description of Visualization (FDV) Example"
                      className="h-auto w-full rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Framework Introduction */}
              <div>
                <h4 className="mb-6 text-xl font-semibold text-blue-700 dark:text-blue-300">
                  Four-Stage Agentic Framework
                </h4>

                {/* Framework Image - Full Width */}
                <div className="mb-8">
                  <div className="rounded-lg border-2 border-dashed border-blue-300 bg-white p-6 dark:border-blue-600 dark:bg-gray-800">
                    <img
                      src="./mdr/framework.png"
                      alt="Multimodal DeepResearcher Framework"
                      className="h-auto w-full rounded-lg"
                    />
                  </div>
                </div>

                {/* Framework Steps */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-start space-x-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                      A
                    </span>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                        Researching
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Iterative researching about given topic
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                      B
                    </span>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                        Exemplar Report Textualization
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        In-context learning from high-quality multimodal reports
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                      C
                    </span>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">Planning</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Strategic content organization and visualization style guide
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                      D
                    </span>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                        Multimodal Report Generation
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Generation of multimodal reports with interleaved texts and visualizations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation and Results */}
            <div className="rounded-xl bg-green-50 p-8 dark:bg-green-900/20">
              <h3 className="mb-6 flex items-center text-2xl font-semibold text-green-800 dark:text-green-200">
                <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm text-white">
                  📊
                </span>
                Evaluation and Results
              </h3>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-700 dark:text-green-300">
                    MultimodalReportBench
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-400"></span>
                      <p className="text-gray-700 dark:text-gray-300">
                        Comprehensive evaluation benchmark with 100 diverse topics
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-400"></span>
                      <p className="text-gray-700 dark:text-gray-300">
                        5 dedicated metrics for multimodal report assessment
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-400"></span>
                      <p className="text-gray-700 dark:text-gray-300">
                        Extensive experiments across models (proprietary and open-source models) and
                        evaluation methods (automatic and human evaluation)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-700 dark:text-green-300">
                    Experimental Results
                  </h4>
                  <div className="rounded-lg bg-white p-6 dark:bg-green-800/30">
                    <div className="text-center">
                      <div className="mb-2 text-4xl font-bold text-green-600 dark:text-green-400">
                        82%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Overall win rate over baseline method using Claude 3.7 Sonnet model
                      </p>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Demonstrating the effectiveness of our approach across diverse evaluation
                        scenarios
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Demo Reports Link Section */}
        <div className="border-t border-gray-200 py-8 dark:border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4">
              <Link
                href="/report"
                className="bg-primary-500 hover:bg-primary-600 inline-flex items-center rounded-lg px-6 py-3 font-medium text-white transition-colors duration-200"
              >
                View Demo Reports
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <Link
                href="https://arxiv.org/abs/2506.02454"
                className="inline-flex items-center rounded-lg bg-gray-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-gray-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Full Paper
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.8423 0a1.0037 1.0037 0 0 0-.922.6078c-.1536.3687-.0438.6275.2938 1.1113l6.9185 8.3597-1.0223 1.1058a1.0393 1.0393 0 0 0 .003 1.4229l1.2292 1.3135-5.4391 6.4444c-.2803.299-.4538.823-.2971 1.1986a1.0253 1.0253 0 0 0 .9585.635.9133.9133 0 0 0 .6891-.3405l5.783-6.126 7.4902 8.0051a.8527.8527 0 0 0 .6835.2597.9575.9575 0 0 0 .8777-.6138c.1577-.377-.017-.7502-.306-1.1407l-7.0518-8.3418 1.0632-1.13a.9626.9626 0 0 0 .0089-1.3165L4.6336.4639s-.3733-.4535-.768-.463zm0 .272h.0166c.2179.0052.4874.2715.5644.3639l.005.006.0052.0055 10.169 10.9905a.6915.6915 0 0 1-.0072.945l-1.0666 1.133-1.4982-1.7724-8.5994-10.39c-.3286-.472-.352-.6183-.2592-.841a.7307.7307 0 0 1 .6704-.4401Zm14.341 1.5701a.877.877 0 0 0-.6554.2418l-5.6962 6.1584 1.6944 1.8319 5.3089-6.5138c.3251-.4335.479-.6603.3247-1.0292a1.1205 1.1205 0 0 0-.9763-.689zm-7.6557 12.2823 1.3186 1.4135-5.7864 6.1295a.6494.6494 0 0 1-.4959.26.7516.7516 0 0 1-.706-.4669c-.1119-.2682.0359-.6864.2442-.9083l.0051-.0055.0047-.0055z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
