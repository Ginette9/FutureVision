import React, { useRef, useState, useEffect } from 'react';
import { getRiskIdsByCountryAndIndustry, getRisksByIds, getAdviceIdsByCountryAndIndustry, getAdviceByIds } from '../../../lib/database';

// 处理 TBD 标签替换的工具函数
const replaceTBDTags = (html: string, classification: string, countryName: string, industryName: string): string => {
  if (!html) return html;
  
  // 根据 classification 确定替换值和背景色
  let replacementValue = '';
  let backgroundColorClass = '';
  switch (classification) {
    case 'country':
      replacementValue = countryName;
      backgroundColorClass = 'bg-sky-600'; // Country标签背景色
      break;
    case 'industry':
      replacementValue = industryName;
      backgroundColorClass = 'bg-cyan-600'; // Industry标签背景色
      break;
    default:
      replacementValue = 'General';
      backgroundColorClass = 'bg-gray-500'; // General标签背景色
  }
  
  // 替换完整的标签结构 - 包括冒号前的分类标签和冒号后的TBD值
  // 匹配整个标签div结构：<div class="..."><span class="...">分类:</span><span class="...">TBD</span></div>
  return html.replace(
    /<div class="flex items-center rounded-sm px-2 text-xs[^"]*"[^>]*>\s*<span class="[^"]*font-semibold[^"]*text-white[^"]*uppercase[^"]*"[^>]*>\s*([^<]*?)\s*:\s*<\/span>\s*<span class="[^"]*h-6[^"]*text-white[^"]*"[^>]*>\s*TBD\s*<\/span>\s*<\/div>/gi,
    `<div class="flex items-center rounded-sm px-2 text-xs ${backgroundColorClass}"><span class="font-semibold text-white uppercase">$1:</span><span class="flex items-center h-6 text-white ml-1">${replacementValue}</span></div>`
  ).replace(
    // 备用匹配模式 - 如果上面的模式不匹配，尝试更简单的模式
    /<span[^>]*class="[^"]*h-6[^"]*text-white[^"]*"[^>]*>\s*TBD\s*<\/span>/gi,
    `<span class="flex items-center h-6 text-white">${replacementValue}</span>`
  );
};

interface RiskItem {
  id: number;
  issue_id: number;
  sub_issue_id: number;
  content: string;
  classification: string;
  source: string;
  content_html: string;
  issue_name?: string;
  sub_issue_name?: string;
}

interface AdviceItem {
  id: number;
  issue_id: number;
  sub_issue_id: number;
  content: string;
  classification: string;
  source: string;
  content_html: string;
  issue_name?: string;
  sub_issue_name?: string;
}

interface ThemeEntry {
  themeName: string;
  risks: RiskItem[];
  recommendations: AdviceItem[];
  riskCount: number;
  recommendationCount: number;
}

interface RiskCategory {
  categoryTitle: string;
  themes: ThemeEntry[];
}

interface Props {
  countryName: string;
  industryName: string;
}

const ReportSection: React.FC<Props> = ({ countryName, industryName }) => {
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取风险和建议的 IDs
        const [riskIds, adviceIds] = await Promise.all([
          getRiskIdsByCountryAndIndustry(countryName, industryName),
          getAdviceIdsByCountryAndIndustry(countryName, industryName)
        ]);

        // 获取详细数据
        const [risks, advice] = await Promise.all([
          getRisksByIds(riskIds),
          getAdviceByIds(adviceIds)
        ]);

        // 按议题和子议题组织数据
        const categoryMap: Record<string, RiskCategory> = {};

        // 处理风险数据
        risks.forEach(risk => {
          const categoryTitle = risk.issue_name || 'Unknown Issue';
          const themeName = risk.sub_issue_name || 'Unknown Sub-issue';

          if (!categoryMap[categoryTitle]) {
            categoryMap[categoryTitle] = { categoryTitle, themes: [] };
          }

          let theme = categoryMap[categoryTitle].themes.find(t => t.themeName === themeName);
          if (!theme) {
            theme = {
              themeName,
              risks: [],
              recommendations: [],
              riskCount: 0,
              recommendationCount: 0
            };
            categoryMap[categoryTitle].themes.push(theme);
          }

          theme.risks.push(risk);
          theme.riskCount = theme.risks.length;
        });

        // 处理建议数据
        advice.forEach(adviceItem => {
          const categoryTitle = adviceItem.issue_name || 'Unknown Issue';
          const themeName = adviceItem.sub_issue_name || 'Unknown Sub-issue';

          if (!categoryMap[categoryTitle]) {
            categoryMap[categoryTitle] = { categoryTitle, themes: [] };
          }

          let theme = categoryMap[categoryTitle].themes.find(t => t.themeName === themeName);
          if (!theme) {
            theme = {
              themeName,
              risks: [],
              recommendations: [],
              riskCount: 0,
              recommendationCount: 0
            };
            categoryMap[categoryTitle].themes.push(theme);
          }

          theme.recommendations.push(adviceItem);
          theme.recommendationCount = theme.recommendations.length;
        });

        setCategories(Object.values(categoryMap));
      } catch (err) {
        console.error('Failed to fetch report data:', err);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    if (countryName && industryName) {
      fetchData();
    }
  }, [countryName, industryName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading report data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No report data available</h3>
        <p className="mt-1 text-sm text-gray-500">No risks or recommendations found for the selected country and industry.</p>
      </div>
    );
  }

  // 计算总风险数量
  const totalRisks = categories.reduce(
    (sum, cat) =>
      sum +
      cat.themes.reduce(
        (tSum, theme) => tSum + theme.riskCount,
        0
      ),
    0
  );

  return (
    <div className="space-y-8">
      {/* 返回链接和风险统计部分 */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <p className="text-gray-700 mb-4 text-sm sm:text-base">
            Below you will find the results of the risk analysis based on your submitted answers.
            Would you like to switch your product or country?
          </p>
          <a 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base" 
            href="/esg-risk-analysis"
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Fill out the ESG Risk Form again
          </a>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 sm:p-6 gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">Risk Summary</h3>
            <p className="text-gray-600 text-sm sm:text-base">Total risks identified in your analysis</p>
          </div>
          <div className="text-center sm:text-right flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              {totalRisks}
            </div>
            <div className="text-sm text-gray-500">risks found</div>
          </div>
        </div>
      </div>

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
                <ExpandableThemeBlock key={themeIndex} theme={theme} countryName={countryName} industryName={industryName} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ExpandableThemeBlock: React.FC<{ theme: ThemeEntry; countryName: string; industryName: string }> = ({ theme, countryName, industryName }) => {
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

        {theme.riskCount > 0 ? (
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
                {theme.riskCount} 项风险
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

        {theme.recommendationCount > 0 ? (
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
                查看建议 ({theme.recommendationCount})
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
              <div key={risk.id} className="bg-white rounded-xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                <div 
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: replaceTBDTags(risk.content_html || risk.content, risk.classification, countryName, industryName) }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {adviceOpen && theme.recommendations.length > 0 && (
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
              <div key={recommendation.id} className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
                <div 
                  className="text-sm text-gray-900 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: replaceTBDTags(recommendation.content_html || recommendation.content, recommendation.classification, countryName, industryName) }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportSection;
