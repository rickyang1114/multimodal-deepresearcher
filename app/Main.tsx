import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'

const MAX_DISPLAY = 10

export default function Home({ posts }) {
  return (
    <>
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
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">

          {/* Authors List - Slightly Larger Font */}
          <div className="text-center text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            <span className="font-medium">Zhaorui Yang</span><sup className="text-blue-600 dark:text-blue-400">§*</sup>,
            <span className="font-medium">Bo Pan</span><sup className="text-blue-600 dark:text-blue-400">§*</sup>,
            <span className="font-medium">Han Wang</span><sup className="text-blue-600 dark:text-blue-400">§*</sup>,
            <span className="font-medium">Yiyao Wang</span><sup className="text-blue-600 dark:text-blue-400">§</sup>,
            <span className="font-medium">Xingyu Liu</span><sup className="text-blue-600 dark:text-blue-400">§</sup>,
            <span className="font-medium">Minfeng Zhu</span><sup className="text-orange-600 dark:text-orange-400">‡</sup><sup className="text-green-600 dark:text-green-400">✉</sup>,
            <span className="font-medium">Bo Zhang</span><sup className="text-blue-600 dark:text-blue-400">§</sup><sup className="text-green-600 dark:text-green-400">✉</sup>,
            <span className="font-medium">Wei Chen</span><sup className="text-blue-600 dark:text-blue-400">§</sup>
          </div>

          {/* Affiliations - Same Line */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
            <span><sup className="text-blue-600 dark:text-blue-400">§</sup>State Key Lab of CAD&CG, Zhejiang University</span>
            <span className="mx-4"></span>
            <span><sup className="text-orange-600 dark:text-orange-400">‡</sup>Zhejiang University</span>
          </div>

          {/* Legend - Slightly Larger */}
          <div className="flex justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
            <span><sup className="text-blue-600 dark:text-blue-400">*</sup>Equal Contribution</span>
            <span><sup className="text-green-600 dark:text-green-400">✉</sup>Corresponding Authors</span>
          </div>
        </div>
        {/* Project Introduction Section */}
        <div className="py-12 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto space-y-12">

            {/* TL;DR Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-700">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center space-x-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 px-4 py-2 rounded-full text-sm font-semibold">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  <span>TL;DR</span>
                </div>

                <div className="max-w-4xl mx-auto">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    We introduce an <span className="font-semibold text-indigo-600 dark:text-indigo-400">agentic framework</span> that
                    automatically generates comprehensive multimodal reports <span className="font-semibold text-indigo-600 dark:text-indigo-400">from scratch</span> with <span className="font-semibold text-indigo-600 dark:text-indigo-400">interleaved texts and visualizations</span>,
                    going beyond text-only content generation.
                  </p>
                </div>
              </div>
            </div>



            {/* Problem Statement */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-red-800 dark:text-red-200 flex items-center">
                <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm mr-3">!</span>
                The Problem We Study
              </h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                  <p>Existing deep research frameworks primarily focus on generating text-only content, leaving the automated generation of interleaved texts and visualizations underexplored</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                  <p>Visualizations play a crucial part in effective communication of concepts and information, yet automated generation remains challenging</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                  <p>Despite advances in reasoning and retrieval augmented generation, LLMs lack standardized methods for understanding and generating diverse, high-quality visualizations</p>
                </div>
              </div>
            </div>

            {/* Key Challenges */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-amber-800 dark:text-amber-200 flex items-center">
                <span className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm mr-3">⚡</span>
                Key Challenges
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-gray-700 dark:text-gray-300">Designing informative and meaningful visualizations that enhance content understanding</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-gray-700 dark:text-gray-300">Effectively integrating visualizations with text reports in a coherent manner</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-gray-700 dark:text-gray-300">Enabling LLMs to learn from and generate diverse, high-quality chart representations</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></span>
                    <p className="text-gray-700 dark:text-gray-300">Developing comprehensive evaluation frameworks for multimodal report generation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Approach */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-blue-800 dark:text-blue-200 flex items-center">
                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-3">💡</span>
                Our Method
              </h3>

              {/* FDV Introduction */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-6 text-blue-700 dark:text-blue-300">
                  Formal Description of Visualization (FDV)
                </h4>

                <div className="space-y-6">
                  <p className="text-gray-700 dark:text-gray-300">
                    We propose FDV, a structured textual representation of charts that enables Large Language Models
                    to learn from and generate diverse, high-quality visualizations.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Structured textual representation for charts</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Enables in-context learning and generation of LLM</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Supports diverse visualization types</span>
                    </div>
                  </div>

                  {/* FDV Image - Full Width */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed border-blue-300 dark:border-blue-600">
                    <img
                      src="/mdr/fdv.png"
                      alt="Formal Description of Visualization (FDV) Example"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Framework Introduction */}
              <div>
                <h4 className="text-xl font-semibold mb-6 text-blue-700 dark:text-blue-300">
                  Four-Stage Agentic Framework
                </h4>

                {/* Framework Image - Full Width */}
                <div className="mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed border-blue-300 dark:border-blue-600">
                    <img
                      src="/mdr/framework.png"
                      alt="Multimodal DeepResearcher Framework"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>

                {/* Framework Steps */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">Researching</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Iterative researching about given topic</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">Exemplar Report Textualization</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">In-context learning from high-quality multimodal reports</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">Planning</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Strategic content organization and visualization style guide</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">Multimodal Report Generation</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Generation of multimodal reports with interleaved texts and visualizations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation and Results */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold mb-6 text-green-800 dark:text-green-200 flex items-center">
                <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-3">📊</span>
                Evaluation and Results
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-700 dark:text-green-300">MultimodalReportBench</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700 dark:text-gray-300">Comprehensive evaluation benchmark with 100 diverse topics</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700 dark:text-gray-300">5 dedicated metrics for multimodal report assessment</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                      <p className="text-gray-700 dark:text-gray-300">Extensive experiments across models (proprietary and open-source models) and evaluation methods (automatic and human evaluation)</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-700 dark:text-green-300">Experimental Results</h4>
                  <div className="bg-white dark:bg-green-800/30 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">82%</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Overall win rate over baseline method using Claude 3.7 Sonnet model
                      </p>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Demonstrating the effectiveness of our approach across diverse evaluation scenarios
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        {/* Demo Reports Link Section */}
        <div className="py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4">
              <Link
                href="/report"
                className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                View Demo Reports
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="https://arxiv.org/"
                className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Full Paper
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
