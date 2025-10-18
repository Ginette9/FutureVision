import React from 'react';
import { RiskCategory, ThemeEntry } from './parseReportHtml';

interface Props {
  categories: RiskCategory[];
}

const PrintReportSection: React.FC<Props> = ({ categories }) => {
  return (
    <div className="space-y-8">
      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative bg-white p-6">
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-600 to-red-300"></div>
            <div className="pl-6">
              <h3 className="text-2xl font-light text-gray-900 mb-2">
                {category.categoryTitle}
              </h3>
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {category.themes.length} themes analyzed
                </span>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {category.themes.map((theme, themeIndex) => (
                <PrintThemeBlock key={themeIndex} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PrintThemeBlock: React.FC<{ theme: ThemeEntry }> = ({ theme }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* 主题标题区域 - 简化版本，仅显示标题 */}
      <div className="bg-white p-6">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
          <h4 className="text-lg font-semibold text-gray-900">{theme.themeName}</h4>
        </div>
      </div>

      {/* 风险详情区域 */}
      {theme.risks.length > 0 && (
        <div className="border-t border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6">
          <div className="space-y-4">
            {theme.risks.map((risk, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
                {risk.rawHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: risk.rawHtml }} />
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-white">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-3">
                        <p className="text-sm text-gray-700 leading-relaxed">{risk.riskDescription}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 建议措施区域 */}
      {theme.recommendations && theme.recommendations.length > 0 && (
        <div className="border-t border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
          <div className="space-y-4">
            {theme.recommendations.map((recommendation, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
                {recommendation.rawHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: recommendation.rawHtml }} />
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-white">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 leading-relaxed">{recommendation.recommendationText}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintReportSection;