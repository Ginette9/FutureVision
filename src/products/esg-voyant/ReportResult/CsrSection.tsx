import React from 'react';

export const CSRSection: React.FC<{ html: string }> = ({ html }) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const sectionTitle = 'Relevant organizations';

  const cards = Array.from(doc.querySelectorAll('div[x-data]')).filter((card) =>
    card.querySelector('img')
  );

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">Key organizations and standards in your industry</p>
        </div>
      </div>

      {/* 组织卡片列表 */}
      <div className="space-y-6">
        {cards.map((card, idx) => {
          const title =
            card.querySelector('h2, h3')?.textContent?.trim() || 'Untitled';

          const logoSrc =
            card.querySelector('img')?.getAttribute('src') || '';
          const logoAlt =
            card.querySelector('img')?.getAttribute('alt') || 'Organization logo';

          const proseHTML = card.querySelector('div.prose')?.innerHTML?.trim() || '';

          return (
            <div key={idx} className="group bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo区域 */}
                <div className="flex-shrink-0 w-full md:w-48 flex justify-center md:justify-start">
                  <div className="w-32 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-4 group-hover:bg-gray-100 transition-colors">
                    <img
                      src={logoSrc}
                      alt={logoAlt}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
                
                {/* 内容区域 */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></div>
                    <h3 className="text-xl font-light text-gray-900 group-hover:text-gray-700 transition-colors">
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
