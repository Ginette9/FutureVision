import React, { useMemo } from 'react';

export const DueDiligenceSection: React.FC = () => {
  const sectionTitle = 'Due diligence';

  const rawHtml = `
    <p><strong>About due diligence</strong></p>
    <p>
      Customers, governments and civil society organisations increasingly expect companies to do business with respect for people and planet. Companies are demanded to identify, prevent and reduce ESG risks in their supply chain; both upstream and downstream. This is also called 'due diligence' or 'ESG risk management' and can consist of the following steps:
    </p>
    <ol>
      <li>The formulation of an ESG strategy.</li>
      <li>Mapping your value chain.</li>
      <li>Performing a risk assessment and prioritizing the risks.</li>
      <li>Collaborating with value chain partners to address risks, as well as monitoring and communicating about your policies and progress.</li>
    </ol>
    <p>
      Due diligence is becoming mandatory through legislation, varying per country. It is essential to integrate it throughout your organization: your management systems, policies and procedures.
    </p>
    <p><strong>OECD Guidelines and UN Guiding Principles as a basis</strong></p>
    <p>
      The <a href="https://www.oecd-ilibrary.org/finance-and-investment/oecd-guidelines-for-multinational-enterprises-on-responsible-business-conduct_81f92357-en" target="_blank"><strong><span style="text-decoration: underline;">OECD Guidelines</span></strong></a> and the <a href="https://www.ohchr.org/sites/default/files/documents/publications/guidingprinciplesbusinesshr_en.pdf" target="_blank"><strong><span style="text-decoration: underline;">UN Guiding Principles</span></strong></a> are the most widely accepted international guidelines that explain to companies how to perform CSR due diligence in their value chains. The OECD Guidelines are endorsed by 35 governments worldwide and offer a framework for companies to deal with sustainability issues such as child labour, environment and corruption. These governments expect companies with international business activities to operate in accordance with them. The recommendations of the OECD guidelines apply where local rules and regulations, or enforcement of these, do not suffice. It is important that companies know the social and environmental risks in their value chain, and take mitigating measures. Stakeholders can report suspected violations of the OECD guidelines to the National Contact Point in their respective country. The UN Guiding Principles distinguish the state's duty to protect human rights, the responsibility of companies to respect human rights, as well as the provision of access to effective remedy. Based on these three pillars of the UNGPs, more than twenty national action plans on business and human rights (NAPs) have been developed so far.
    </p>
  `;

  const proseHTML = useMemo(() => {
    let s = rawHtml;

    // 移除内联 style
    s = s.replace(/\sstyle="[^"]*"/g, '');

    // CSR → ESG
    s = s.replace(/\bCSR\b/g, 'ESG');

    // 外链安全属性
    s = s.replace(
      /<a([^>]*?)target="_blank"([^>]*?)>/g,
      (m, p1, p2) =>
        /rel=/.test(m)
          ? m
          : `<a${p1}target="_blank"${p2} rel="noopener noreferrer">`
    );

    // 处理小标题：第一个小标题与主标题保持常规间距，其余小标题加大上间距
    let firstHeadingReplaced = false;
    s = s.replace(
      /<p>\s*<strong>(.*?)<\/strong>\s*<\/p>/g,
      (match, titleText) => {
        if (!firstHeadingReplaced) {
          firstHeadingReplaced = true;
          return `<h3 class="text-[13px] font-bold uppercase tracking-widest text-violet-800 mt-2 mb-3">${titleText}</h3>`;
        }
        return `<h3 class="text-[13px] font-bold uppercase tracking-widest text-violet-800 mt-12 mb-3">${titleText}</h3>`;
      }
    );

    return s.trim();
  }, [rawHtml]);

  return (
    <section
      id="due-diligence"
      aria-labelledby="due-diligence-title"
      className="space-y-6 scroll-mt-28"
    >
      <h2
        id="due-diligence-title"
        className="text-3xl font-black uppercase text-violet-800 scale-y-[0.9] tracking-wide"
      >
        {sectionTitle}
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-md p-6 md:flex-row md:items-start">
          {/* 左列占位 */}
          <div className="flex justify-center md:w-48 md:min-w-[12rem]">
            <div className="h-24 w-full" />
          </div>

          {/* 正文 */}
          <div className="flex-1 space-y-2">
            <div
              className={[
                'prose max-w-none text-[15px] leading-relaxed text-gray-800',
                '[&_ol]:my-3 [&_ol]:pl-5 [&_ol>li]:mb-1',
                '[&_ol>li::marker]:font-semibold',
                '[&_ol>li::marker]:text-violet-700',
                'prose-a:font-bold prose-a:underline',
              ].join(' ')}
              dangerouslySetInnerHTML={{ __html: proseHTML }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
