import React from 'react';

export const CsrLabelsSection: React.FC<{ html: string }> = ({ html }) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const sectionTitle = 'ESG labels, supply chain initiatives & guidelines';

  const cards = Array.from(doc.querySelectorAll('div[x-data]'));

  return (
    <section id="esg-labels-supply-chain-initiatives-guidelines" className="space-y-6">
      <h2 className="text-3xl font-black uppercase text-violet-800 scale-y-[0.9] tracking-wide">{sectionTitle}</h2>

      <div className="flex flex-col gap-6">
        {cards.map((card, idx) => {
          const title = card.querySelector('h2, h3')?.textContent?.trim() || 'Untitled';

          const logo = card.querySelector('img');
          const logoSrc = logo?.getAttribute('src') || '';
          const logoAlt = logo?.getAttribute('alt') || 'Label logo';

          const proseHTML = card.querySelector('div.prose')?.innerHTML?.trim() || '';

          return (
            <div key={idx} className="pdf-card flex flex-col gap-4 rounded-md p-6 md:flex-row md:items-start break-inside-avoid">
              {/* 左侧 logo：始终预留宽度，保持与有图项目一致 */}
              <div className="pdf-card__logo flex justify-center md:w-48 md:min-w-[12rem]">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={logoAlt}
                    className="pdf-logo h-24 w-auto object-contain"
                  />
                ) : (
                  <div className="h-24 w-auto" />
                )}
              </div>

              {/* 右侧正文 */}
              <div className="pdf-card__body flex-1 space-y-2">
                <h3 className="text-base font-bold uppercase text-violet-900">{title}</h3>
                <div
                  className="prose max-w-none text-[15px] leading-relaxed text-gray-800"
                  dangerouslySetInnerHTML={{ __html: proseHTML }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
