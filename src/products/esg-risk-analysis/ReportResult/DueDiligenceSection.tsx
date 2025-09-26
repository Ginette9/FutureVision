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
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">ESG risk management and compliance framework</p>
        </div>
      </div>

      {/* 尽职调查内容卡片 */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="space-y-6">
          <div
            className={[
              'prose prose-lg max-w-none text-gray-700 leading-relaxed',
              '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-emerald-700 [&_h3]:mb-4 [&_h3]:mt-8 [&_h3:first-of-type]:mt-0',
              '[&_ol]:my-4 [&_ol]:pl-6 [&_ol>li]:mb-3 [&_ol>li]:text-gray-700',
              '[&_ol>li::marker]:font-semibold [&_ol>li::marker]:text-emerald-600',
              '[&_p]:mb-4 [&_p]:leading-relaxed',
              'prose-a:font-semibold prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline',
              '[&_strong]:text-gray-900 [&_strong]:font-semibold',
            ].join(' ')}
            dangerouslySetInnerHTML={{ __html: proseHTML }}
          />
        </div>
      </div>

      {/* 关键要点卡片 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-emerald-800">OECD Guidelines</h3>
          </div>
          <p className="text-emerald-700 text-sm leading-relaxed">
            Endorsed by 35 governments worldwide, providing a comprehensive framework for companies to address sustainability issues including child labor, environment, and corruption.
          </p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-teal-800">UN Guiding Principles</h3>
          </div>
          <p className="text-teal-700 text-sm leading-relaxed">
            Three pillars framework: state duty to protect human rights, corporate responsibility to respect human rights, and access to effective remedy.
          </p>
        </div>
      </div>
    </div>
  );
};
