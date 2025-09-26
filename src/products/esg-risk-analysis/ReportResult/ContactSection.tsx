import React from 'react';

export const ContactSection: React.FC = () => {
  const sectionTitle = 'Contact';

  const cards = [
    {
      tags: [
        'ESG Rating Enhancement',
        'ESG Risk Check and Evaluation',
        'ESG Conflict Incident Response Plan and Handling Procedures',
      ],
      html: `
        <p>
          Do you have questions or comments about the risks and recommendations? Or if you are currently grappling with ESG conflict incidents or sustaining financial losses as a result, please send email to <a href="mailto:jinxia@mscfv.com"><strong>jinxia@mscfv.com</strong></a> to reach out to us.
        </p>
      `,
    },
    {
      tags: [
        'Sustainability Strategy & Growth',
        'Globalized Expansion & Localized Execution',
      ],
      html: `
        <p>
          If you are struggling to crack new markets or go local, please contact <a href="mailto:jacobtomas@msc-world.com"><strong>jacobtomas@msc-world.com</strong></a>, we unblock international growth for you.
        </p>
      `,
    },
    {
      tags: ['Collaboration partners'],
      html: `
        <p>
          We enable clients and partners to leverage our ESG-integrated growth engines – from sustainability strategy design to cross-border risk mitigation. Please contact <a href="mailto:leon@msc-world.com"><strong>leon@msc-world.com</strong></a>, partner with us to transform ESG risks into sustainable growth.
        </p>
      `,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">Get in touch with our ESG experts</p>
        </div>
      </div>

      {/* 联系方式卡片 */}
      <div className="space-y-6">
        {cards.map((card, idx) => {
          const sorted = [...card.tags].sort((a, b) => b.length - a.length);

          return (
            <div
              key={idx}
              className="group bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300"
            >
              <div className="space-y-6">
                {/* 服务场景标签 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-light text-gray-900">Service Scenarios</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    {sorted.map((tag, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-blue-800 leading-relaxed">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 联系信息 */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div
                    className="prose max-w-none text-gray-700 leading-relaxed prose-a:font-semibold prose-a:text-gray-600 prose-a:no-underline hover:prose-a:underline [&_strong]:text-gray-900 [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: card.html }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 快速联系方式 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-xl font-light text-gray-900 mb-2">Need Immediate Assistance?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our ESG experts are ready to help you navigate sustainability challenges and unlock growth opportunities.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <a
              href="mailto:jinxia@mscfv.com"
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>ESG Risk</span>
            </a>
            
            <a
              href="mailto:jacobtomas@msc-world.com"
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              <span>Growth Strategy</span>
            </a>
            
            <a
              href="mailto:leon@msc-world.com"
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Partnership</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
