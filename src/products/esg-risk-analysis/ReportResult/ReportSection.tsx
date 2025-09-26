import React, { useRef, useState } from 'react';
import { RiskCategory, ThemeEntry } from './parseReportHtml';

interface Props {
  categories: RiskCategory[];
}

const ReportSection: React.FC<Props> = ({ categories }) => {
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
                <ExpandableThemeBlock key={themeIndex} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ExpandableThemeBlock: React.FC<{ theme: ThemeEntry }> = ({ theme }) => {
  const [riskOpen, setRiskOpen] = useState(false);
  const [adviceOpen, setAdviceOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const preserveScrollOnToggle = (toggleFn: () => void) => {
    const scrollY = window.scrollY;
    toggleFn();
    setTimeout(() => window.scrollTo(0, scrollY), 0);
  };

  const toggleRisk = () =>
    preserveScrollOnToggle(() => {
      setRiskOpen(!riskOpen);
      setAdviceOpen(false);
    });

  const toggleAdvice = () =>
    preserveScrollOnToggle(() => {
      setAdviceOpen(!adviceOpen);
      setRiskOpen(false);
    });

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div
        ref={rowRef}
        className={`grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 transition-all duration-300 ${
          riskOpen ? 'bg-gradient-to-r from-red-50 to-red-100' : 
          adviceOpen ? 'bg-gradient-to-r from-green-50 to-green-100' : 
          'bg-white hover:bg-gray-50'
        }`}
      >
        <div
          id={`theme-${theme.themeName.toLowerCase().replace(/\s+/g, '-')}`}
          className="lg:col-span-5 flex items-center"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
            <h4 className="text-lg font-semibold text-gray-900">{theme.themeName}</h4>
          </div>
        </div>

        {(theme.riskCount ?? theme.risks.length) > 0 ? (
          <div
            className="lg:col-span-3 flex items-center gap-3 cursor-pointer group"
            onClick={toggleRisk}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                riskOpen ? 'bg-red-600 text-white rotate-90' : 'bg-gray-100 text-gray-400 group-hover:bg-red-100 group-hover:text-red-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${riskOpen ? 'bg-red-500' : 'bg-red-400'}`}></div>
              <span
                className={`text-sm font-medium transition-colors ${
                  riskOpen ? 'text-red-700' : 'text-gray-700 group-hover:text-red-600'
                }`}
              >
                {theme.riskCount ?? theme.risks.length} 项风险
              </span>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-600">无风险</span>
          </div>
        )}

        {theme.recommendations && theme.recommendations.length > 0 ? (
          <div
            className="lg:col-span-4 flex items-center gap-3 cursor-pointer group"
            onClick={toggleAdvice}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                adviceOpen ? 'bg-green-600 text-white rotate-90' : 'bg-gray-100 text-gray-400 group-hover:bg-green-100 group-hover:text-green-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${adviceOpen ? 'bg-green-500' : 'bg-green-400'}`}></div>
              <span
                className={`text-sm font-medium transition-colors ${
                  adviceOpen ? 'text-gray-700' : 'text-gray-700 group-hover:text-gray-600'
                }`}
              >
                查看建议 ({theme.recommendations.length})
              </span>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4 flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">暂无建议</span>
          </div>
        )}
      </div>

      {riskOpen && theme.risks.length > 0 && (
        <div className="border-t border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h5 className="text-lg font-semibold text-red-900">风险详情</h5>
          </div>
          <div className="space-y-4">
            {theme.risks.map((risk, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-white">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-3">
                      <h6 className="text-base font-semibold text-gray-900 leading-tight">{risk.riskTitle}</h6>
                      <p className="text-sm text-gray-700 leading-relaxed">{risk.riskDescription}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adviceOpen && theme.recommendations && theme.recommendations.length > 0 && (
        <div className="border-t border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h5 className="text-lg font-semibold text-green-900">建议措施</h5>
          </div>
          <div className="space-y-4">
            {theme.recommendations.map((recommendation, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-white">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 leading-relaxed">{recommendation.recommendationText}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportSection;
