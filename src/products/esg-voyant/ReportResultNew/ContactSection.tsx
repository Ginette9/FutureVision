import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToTraditional } from '@/locales/zh-HK';

export const ContactSection: React.FC = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh-CN' || language === 'zh-HK';
  const sectionTitle = language === 'zh-HK' ? '聯繫我們' : isZh ? '联系我们' : 'Contact';
  const sectionSubtitle = language === 'zh-HK' ? '聯絡我們的 ESG 專家' : isZh ? '与我们的 ESG 专家取得联系' : 'Get in touch with our ESG experts';
  const toZhHK = (s: string) => (language === 'zh-HK' ? convertToTraditional(s) : s);

  const cards = [
    {
      tags:
        isZh
          ? [
              toZhHK('ESG 评级提升'),
              toZhHK('ESG 风险检查与评估'),
              toZhHK('ESG 冲突事件应急预案与处置流程'),
            ]
          : [
              'ESG Rating Enhancement',
              'ESG Risk Check and Evaluation',
              'ESG Conflict Incident Response Plan and Handling Procedures',
            ],
      html:
        isZh
          ? (language === 'zh-HK' ? convertToTraditional(`
        <p>
          如对风险与建议有疑问，或正遭遇 ESG 冲突事件并因此承受财务损失，欢迎邮件联系 <a href="mailto:jinxia@mscfv.com"><strong>jinxia@mscfv.com</strong></a>。
        </p>
      `) : `
        <p>
          如对风险与建议有疑问，或正遭遇 ESG 冲突事件并因此承受财务损失，欢迎邮件联系 <a href="mailto:jinxia@mscfv.com"><strong>jinxia@mscfv.com</strong></a>。
        </p>
      `)
          : `
        <p>
          Do you have questions or comments about the risks and recommendations? Or if you are currently grappling with ESG conflict incidents or sustaining financial losses as a result, please send email to <a href="mailto:jinxia@mscfv.com"><strong>jinxia@mscfv.com</strong></a> to reach out to us.
        </p>
      `,
    },
    {
      tags:
        isZh
          ? [toZhHK('可持续战略与增长'), toZhHK('全球化拓展与本地化执行')]
          : ['Sustainability Strategy & Growth', 'Globalized Expansion & Localized Execution'],
      html:
        isZh
          ? (language === 'zh-HK' ? convertToTraditional(`
        <p>
          若您在开拓新市场或本地化运营方面面临挑战，请联系 <a href="mailto:jacobtomas@msc-world.com"><strong>jacobtomas@msc-world.com</strong></a>，我们助您畅通国际增长路径。
        </p>
      `) : `
        <p>
          若您在开拓新市场或本地化运营方面面临挑战，请联系 <a href="mailto:jacobtomas@msc-world.com"><strong>jacobtomas@msc-world.com</strong></a>，我们助您畅通国际增长路径。
        </p>
      `)
          : `
        <p>
          If you are struggling to crack new markets or go local, please contact <a href="mailto:jacobtomas@msc-world.com"><strong>jacobtomas@msc-world.com</strong></a>, we unblock international growth for you.
        </p>
      `,
    },
    {
      tags: isZh ? [toZhHK('合作伙伴')] : ['Collaboration partners'],
      html:
        isZh
          ? (language === 'zh-HK' ? convertToTraditional(`
        <p>
          我们帮助客户与伙伴利用 ESG 融合的增长引擎——从可持续战略设计到跨境风险缓释。请联系 <a href="mailto:leon@msc-world.com"><strong>leon@msc-world.com</strong></a>，携手把 ESG 风险转化为可持续增长。
        </p>
      `) : `
        <p>
          我们帮助客户与伙伴利用 ESG 融合的增长引擎——从可持续战略设计到跨境风险缓释。请联系 <a href="mailto:leon@msc-world.com"><strong>leon@msc-world.com</strong></a>，携手把 ESG 风险转化为可持续增长。
        </p>
      `)
          : `
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
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">{sectionSubtitle}</p>
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
                    <div className="w-2 h-6 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
                    <h3 className="text-lg font-light text-gray-900">{isZh ? '服务场景' : 'Service Scenarios'}</h3>
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
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-light text-gray-900">{isZh ? '需要即时支持？' : 'Need Immediate Assistance?'}</h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {isZh
                ? '我们的 ESG 专家随时为您提供支持，帮助您应对可持续挑战并解锁增长机会。'
                : 'Our ESG experts are ready to help you navigate sustainability challenges and unlock growth opportunities.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
            <a
              href="mailto:jinxia@mscfv.com"
              className="flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{isZh ? 'ESG 风险' : 'ESG Risk'}</span>
            </a>
            
            <a
              href="mailto:jacobtomas@msc-world.com"
              className="flex items-center justify-center space-x-3 px-6 py-4 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              <span>{isZh ? '增长战略' : 'Growth Strategy'}</span>
            </a>
            
            <a
              href="mailto:leon@msc-world.com"
              className="flex items-center justify-center space-x-3 px-6 py-4 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{isZh ? '合作伙伴' : 'Partnership'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
