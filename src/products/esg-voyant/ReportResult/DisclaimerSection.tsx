import React from 'react';

export const DisclaimerSection: React.FC = () => {
  const sectionTitle = 'Disclaimer';

  const proseHTML = `
    <p style="margin-bottom: 1.5rem;">
      The risks and advice in the ESG Risk Check are based on public sources and are in line with the themes from the 
      <a href="https://mneguidelines.oecd.org/mneguidelines/" target="_blank"><strong><span style="text-decoration: underline;">OECD Guidelines</span></strong></a> and the 
      <a href="https://www.ohchr.org/sites/default/files/Documents/Publications/GuidingPrinciplesBusinessHR_EN.pdf" target="_blank"><strong><span style="text-decoration: underline;">UN Guiding Principles on Business and Human Rights</span></strong></a>. 
      In the ESG Risk Check, gender-neutral descriptions are used where possible in describing risks. If risks are not applicable to both men and women, gender specific terms will be used.
    </p>
    <p style="margin-bottom: 1.5rem;">
      The risks, identified by the ESG Risk Check, and information described and contained have been compiled from public online sources, which are subject to a reliability check based upon a reliability scheme before they are used. We do however not warrant or represent the correctness, accuracy, up-to-dateness, and completeness of the information processed, or wording of the risks used.
    </p>
    <p style="margin-bottom: 1.5rem;">
      The list of countries and territories that is used in the ESG Risk Check is the 
      <a href="https://www.iso.org/iso-3166-country-codes.html" target="_blank"><strong><span style="text-decoration: underline;">ISO 3166 standard</span></strong></a>, 
      which is based on the official list of country and territory names as defined by the United Nations Statistics Division. 
      For the world map Google Maps is used, this means that land borders and country names mentioned on this map are not the responsibility of MVO Nederland and may change resulting from international border disputes. 
      For the product classification in the tool, the 
      <a href="https://unstats.un.org/unsd/publication/SeriesM/SeriesM_34rev4E.pdf" target="_blank"><strong><span style="text-decoration: underline;">SITC codes</span></strong></a> are used, also established by the United Nations Statistics Division. 
      The product list is complemented by services that are derived from the 
      <a href="https://unstats.un.org/unsd/publication/seriesm/seriesm_4rev4e.pdf" target="_blank"><strong><span style="text-decoration: underline;">UN ISIC system</span></strong></a>.
    </p>
    <p style="margin-bottom: 1.5rem;">
      ESG risk information is not (yet) available for all countries and products, but this does not imply nor mean that no ESG risks will be present or occur. 
      In some cases, it may occur that a proper source to describe a certain risk has not yet been found or identified.
    </p>
    <p style="margin-bottom: 1.5rem;">
      Users downloading this free ESG risk report assume sole responsibility for all outcomes arising from its application. 
      When utilizing insights for material business decisions, engagement with accredited ESG specialists is strongly advised.
    </p>
  `;

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">Important legal and usage information</p>
        </div>
      </div>

      {/* 免责声明内容卡片 */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="space-y-6">
          {/* 重要提醒 */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Important Notice</h3>
                <p className="text-orange-700 text-sm leading-relaxed">
                  This ESG Risk Check is provided for informational purposes only. Users assume sole responsibility for all outcomes arising from its application. For material business decisions, consultation with accredited ESG specialists is strongly advised.
                </p>
              </div>
            </div>
          </div>

          {/* 详细免责声明 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
              <h3 className="text-xl font-medium text-gray-900">Legal Disclaimer</h3>
            </div>
            
            <div
              className={[
                'prose prose-lg max-w-none text-gray-700 leading-relaxed',
                'prose-a:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
                '[&_strong]:text-gray-900 [&_strong]:font-semibold',
                '[&_p]:mb-6 [&_p]:leading-relaxed',
              ].join(' ')}
              dangerouslySetInnerHTML={{ __html: proseHTML }}
            />
          </div>
        </div>
      </div>

      {/* 数据来源和标准 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">International Standards</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Based on OECD Guidelines and UN Guiding Principles on Business and Human Rights, ensuring alignment with globally recognized ESG frameworks.
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Data Sources</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Information compiled from verified public sources using ISO 3166 standards, UN Statistics Division classifications, and reliability-checked data.
          </p>
        </div>
      </div>
    </div>
  );
};
