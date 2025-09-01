import React, { useRef, useState } from 'react';
import { RiskCategory, ThemeEntry } from './parseReportHtml';

interface Props {
  categories: RiskCategory[];
}

const ReportSection: React.FC<Props> = ({ categories }) => {
  return (
    <section id="risk-analysis" className="space-y-12">
      {categories.map((category) => (
        <div key={category.categoryTitle} className="space-y-4">
          <div className="flex flex-wrap gap-2 font-black uppercase text-violet-800 text-md">
            <h3
              id={category.categoryTitle.toLowerCase().replace(/\s+/g, '-')}
              className="scroll-mt-40 hyphens-auto"
            >
              {category.categoryTitle}
            </h3>
          </div>

          <div className="mb-4 flex flex-col">
            <div className="hidden grid-cols-1 border-b border-beige-500 py-2 text-sm font-medium lg:grid lg:grid-cols-12">
              <div className="col-span-5 px-1">Themes</div>
              <div className="col-span-3 px-1">Risks</div>
              <div className="col-span-4 px-1">Recommendations</div>
            </div>

            <div className="grid grid-cols-1 gap-y-4 lg:gap-0">
              {category.themes.map((theme, index) => (
                <ExpandableThemeBlock key={index} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

const ExpandableThemeBlock: React.FC<{ theme: ThemeEntry }> = ({ theme }) => {
  const [riskOpen, setRiskOpen] = useState(false);
  const [adviceOpen, setAdviceOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const preserveScrollOnToggle = (toggleFn: () => void) => {
    const scrollY = window.scrollY;
    toggleFn();
    setTimeout(() => window.scrollTo({ top: scrollY }), 0);
  };

  const toggleRisk = () =>
    preserveScrollOnToggle(() => {
      setRiskOpen((prev) => !prev);
      setAdviceOpen(false);
    });

  const toggleAdvice = () =>
    preserveScrollOnToggle(() => {
      setAdviceOpen((prev) => !prev);
      setRiskOpen(false);
    });

  const expandedColor =
    riskOpen ? 'bg-purple-50' : adviceOpen ? 'bg-blue-50' : '';

  return (
    <div>
      {/* 表格主行 */}
      <div
        ref={rowRef}
        className={`grid grid-cols-2 border border-beige-500 px-4 py-2 transition-colors lg:grid-cols-12 lg:border-x-0 lg:border-t-0 lg:p-0 ${expandedColor}`}
      >
        {/* Theme 名称 */}
        <div
          id={`theme-${theme.themeName.toLowerCase().replace(/\s+/g, '-')}`}
          className="col-span-6 flex items-center lg:col-span-5 lg:px-3 lg:py-2 lg:text-zinc-700"
        >
          <h3 className="text-md font-semibold lg:text-lg">{theme.themeName}</h3>
        </div>

        {/* Risks 区域 */}
        {(theme.riskCount ?? theme.risks.length) > 0 ? (
          <div
            className="group flex items-center gap-x-2 cursor-pointer lg:col-span-3 lg:border-x lg:px-3 lg:py-2"
            onClick={toggleRisk}
          >
            <div
              className="text-purple-600 transition-transform"
              style={{ transform: riskOpen ? 'rotate(90deg)' : 'rotate(0)' }}
            >
              ▶
            </div>
            <div
              className={`pt-1 font-medium underline group-hover:no-underline ${
                riskOpen ? 'text-purple-600' : 'text-black'
              }`}
            >
              {theme.riskCount ?? theme.risks.length} risk
              {(theme.riskCount ?? theme.risks.length) !== 1 ? 's' : ''}
            </div>
          </div>
        ) : (
          <div className="flex items-center text-gray-500 font-medium lg:col-span-3 lg:border-x lg:px-3 lg:py-2">
            No available risks
          </div>
        )}

        {/* Recommendations 区域 */}
        <div
          className="group flex items-center gap-x-2 cursor-pointer lg:col-span-4 lg:px-3 lg:py-2"
          onClick={toggleAdvice}
        >
          <div
            className="text-blue-600 transition-transform"
            style={{ transform: adviceOpen ? 'rotate(90deg)' : 'rotate(0)' }}
          >
            ▶
          </div>
          <div
            className={`pt-1 font-medium underline group-hover:no-underline ${
              adviceOpen ? 'text-blue-600' : 'text-black'
            }`}
          >
            {theme.recommendationCount ?? theme.recommendations.length} recommendation
            {(theme.recommendationCount ?? theme.recommendations.length) !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* 展开内容：Risk（使用美化卡片结构） */}
      {riskOpen && (
        <div className="risk flex flex-col gap-y-6 bg-beige-300 px-4 py-6 md:px-6 lg:gap-y-8 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-violet-800">
              {(theme.riskCount ?? theme.risks.length)} risk
              {(theme.riskCount ?? theme.risks.length) !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setRiskOpen(false)}
              className="flex items-center gap-x-2 text-sm font-medium text-violet-800 hover:text-violet-800"
            >
              <span>Minimize</span>
              <div className="flex size-6 items-center justify-center rounded-full bg-purple-600 text-white">–</div>
            </button>
          </div>

          {theme.risks.map((risk, idx) => (
            <div key={idx} className="rounded-xl bg-white p-5 shadow ring-1 ring-purple-200">
              {risk.rawHtml ? (
                <div dangerouslySetInnerHTML={{ __html: risk.rawHtml }} />
              ) : (
                <>
                  <p className="mb-3 text-sm font-medium text-purple-600">
                    Risk: {risk.riskTitle}
                  </p>
                  <div className="prose lg:prose-lg whitespace-pre-wrap">
                    <p>{risk.riskDescription || 'No detailed description.'}</p>
                  </div>
                  {risk.sources?.length > 0 && (
                    <div className="mt-4">
                      <span className="font-medium">Sources:</span>
                      <ul className="list-disc pl-5">
                        {risk.sources.map((src, i) => (
                          <li key={i}>{src}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 展开内容：Recommendation（使用美化卡片结构） */}
      {adviceOpen && (
        <div className="risk flex flex-col gap-y-6 bg-beige-300 px-4 py-6 md:px-6 lg:gap-y-8 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-blue-700">
              {(theme.recommendationCount ?? theme.recommendations.length)} recommendation
              {(theme.recommendationCount ?? theme.recommendations.length) !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setAdviceOpen(false)}
              className="flex items-center gap-x-2 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <span>Minimize</span>
              <div className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-white">–</div>
            </button>
          </div>

          {theme.recommendations.map((rec, idx) => (
            <div key={idx} className="rounded-xl bg-white p-5 shadow ring-1 ring-blue-200">
              {rec.rawHtml ? (
                <div dangerouslySetInnerHTML={{ __html: rec.rawHtml }} />
              ) : (
                <>
                  <p className="mb-3 text-sm font-medium text-blue-600">
                    Advice: {theme.themeName}
                  </p>
                  <div className="prose lg:prose-lg whitespace-pre-wrap">
                    <p>{rec.recommendationText}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportSection;
