import React from 'react';

export const CsrLabelsSection: React.FC<{ html: string }> = ({ html }) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const sectionTitle = 'ESG labels, supply chain initiatives & guidelines';

  const cards = Array.from(doc.querySelectorAll('div[x-data]'));

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">Industry standards and certification programs</p>
        </div>
      </div>

      {/* 标签和指南卡片列表 */}
      <div className="space-y-6">
        {cards.map((card, idx) => {
          const title = card.querySelector('h2, h3')?.textContent?.trim() || 'Untitled';

          const logo = card.querySelector('img');
          const logoSrc = logo?.getAttribute('src') || '';
          const logoAlt = logo?.getAttribute('alt') || 'Label logo';

          const proseHTML = card.querySelector('div.prose')?.innerHTML?.trim() || '';

          return (
            <div key={idx} className="group bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo区域 */}
                <div className="flex-shrink-0 w-full md:w-48 flex justify-center md:justify-start">
                  <div className="w-32 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-4 group-hover:bg-gray-100 transition-colors">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={logoAlt}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 内容区域 */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-cyan-600 to-blue-600 rounded-full"></div>
                    <h3 className="text-2xl font-light text-gray-900 group-hover:text-gray-700 transition-colors">
                      {title}
                    </h3>
                  </div>
                  <div
                    className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: proseHTML }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
