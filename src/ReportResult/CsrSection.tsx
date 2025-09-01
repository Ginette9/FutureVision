import React from 'react';

export const CSRSection: React.FC<{ html: string }> = ({ html }) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const sectionTitle = 'Relevant organizations';

  const cards = Array.from(doc.querySelectorAll('div[x-data]')).filter((card) =>
    card.querySelector('img')
  );

  return (
    <section id="relevant-organizations" className="space-y-6">
      <h2 className="text-3xl font-black uppercase text-violet-800 scale-y-[0.9] tracking-wide">{sectionTitle}</h2>

      <div className="flex flex-col gap-6">
        {cards.map((card, idx) => {
          const title =
            card.querySelector('h2, h3')?.textContent?.trim() || 'Untitled';

          const logoSrc =
            card.querySelector('img')?.getAttribute('src') || '';
          const logoAlt =
            card.querySelector('img')?.getAttribute('alt') || 'CSR logo';

          const proseHTML = card.querySelector('div.prose')?.innerHTML?.trim() || '';

          return (
            <div key={idx} className="pdf-card flex flex-col gap-4 rounded-md p-6 md:flex-row md:items-start break-inside-avoid">
              <div className="pdf-card__logo flex justify-center md:w-48 md:min-w-[12rem]">
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="pdf-logo h-24 w-auto object-contain"
                />
              </div>
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
