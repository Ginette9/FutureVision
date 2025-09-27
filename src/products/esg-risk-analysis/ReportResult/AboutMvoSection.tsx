import React from 'react';

// ✅ 导入本地图片
import MscLogo from '@/images/msc-hk-logo.png';
import FutureVisionLogo from '@/images/future-vision-logo.png';

export const AboutMvoSection: React.FC = () => {
  const sectionTitle = 'About MSC HK';

  // 卡片内容数组
  const cards = [
    {
      title: 'MSC HK',
      logo: MscLogo, 
      html: `
        <p><strong>Maker Sustainability Consulting</strong> is a sustainability strategy firm rooted in China and oriented toward the world. We drive the transition to a sustainable economy through providing consulting services to our global enterprise clients.</p>
        <p>With a decade of experience, we integrate strategic thinking with practical execution, working alongside global enterprises to redefine growth—toward a future that is sustainable, intelligent, and globally connected, powered by Chinese insight.</p>
      `,
    },
    {
      title: 'Future Vision',
      logo: FutureVisionLogo,
      html: `
        <p><strong>Future Vision</strong> is an AI-powered business and sustainability intelligence assistant that helps entrepreneurs explore future business opportunities for sustainable growth.</p>
        <p>Through Future Vision, executives can monitor ESG risks, track competitor insights and global business updates in real time, and connect with global organizations and expert networks.</p>
        <p>Are you interested in our products or services? Visit <a href="https://www.msc-world.cn/" target="_blank"><strong>MSC website</strong></a> and <a href="https://mscfv.com/futureVision/" target="_blank"><strong>Future Vision</strong></a> to discover more about what we can do for you.</p>
      `,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">Sustainability consulting and AI-powered intelligence</p>
        </div>
      </div>

      {/* 公司介绍卡片 */}
      <div className="space-y-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="group bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300"
          >
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Logo区域 */}
              <div className="flex-shrink-0 w-full lg:w-64 flex justify-center lg:justify-start">
                <div className="w-48 h-32 bg-gray-50 rounded-xl flex items-center justify-center p-6 group-hover:bg-gray-100 transition-colors">
                  <img
                    src={card.logo}
                    alt={`${card.title} logo`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              
              {/* 内容区域 */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                </div>
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-a:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline [&_strong]:text-gray-900 [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: card.html }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 联系我们行动号召 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Ready to Transform Your Business?</h3>
          <p className="text-gray-600">
            Discover how our sustainability consulting and AI-powered intelligence can drive your company's sustainable growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <a
              href="https://www.msc-world.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Visit MSC Website
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://mscfv.com/futureVision/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Explore Future Vision
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
