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
    <section id="contact" className="space-y-6 scroll-mt-28">
      <h2 className="text-3xl font-black uppercase text-violet-800 scale-y-[0.9] tracking-wide">
        {sectionTitle}
      </h2>

      {/* 跟 DueDiligenceSection 一样的外层 */}
      <div className="flex flex-col gap-6">
        {cards.map((card, idx) => {
          const sorted = [...card.tags].sort((a, b) => b.length - a.length);

          return (
            <div
              key={idx}
              className="flex flex-col gap-4 rounded-md p-6 md:flex-row md:items-start"
            >
              {/* 左侧占位，宽度与 DueDiligenceSection 保持一致 */}
              <div className="flex justify-center md:w-48 md:min-w-[12rem]">
                <div className="h-24 w-full" />
              </div>

              {/* 右侧内容 */}
              <div className="flex-1 space-y-3">
                <div className="text-[12px] font-semibold uppercase tracking-widest text-violet-900">
                  Scenarios
                </div>

                <ul className="space-y-2">
                  {sorted.map((tag, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <i
                        className="fa-solid fa-circle-check mt-0.5 text-violet-700"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-gray-900">{tag}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className="prose max-w-none text-[15px] leading-relaxed text-gray-800 prose-a:font-bold prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: card.html }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
