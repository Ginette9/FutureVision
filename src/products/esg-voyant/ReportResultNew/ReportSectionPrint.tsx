import React from 'react';
import { RiskCategory } from './parseReportHtml';

interface Props {
  categories: RiskCategory[];
}

// 打印专用：不包含任何折叠/交互，全部内容展开，版式更紧凑，避免分页硬切
const ReportSectionPrint: React.FC<Props> = ({ categories }) => {
  return (
    <section id="risk-analysis" className="space-y-6">
      {categories.map((category) => (
        <div key={category.categoryTitle} className="space-y-4">
          <h2 className="text-xl font-extrabold uppercase text-violet-800 tracking-wide break-after-avoid">
            {category.categoryTitle}
          </h2>

          <div className="space-y-4">
            {category.themes.map((theme, idx) => (
              <article key={idx} className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 break-after-avoid">
                  {theme.themeName}
                </h3>

                {/* Risks */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-violet-800 break-after-avoid">
                    {(theme.riskCount ?? theme.risks.length)} risk{(theme.riskCount ?? theme.risks.length) !== 1 ? 's' : ''}
                  </p>
                  {theme.risks.length > 0 ? (
                    <div className="space-y-2">
                      {theme.risks.map((risk, i) => (
                        <div key={i} className="rounded-md border border-purple-200 p-3 break-inside-avoid-page">
                          {risk.rawHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: risk.rawHtml }} />
                          ) : (
                            <>
                              <p className="mb-2 text-[13px] font-medium text-purple-700">
                                Risk: {risk.riskTitle}
                              </p>
                              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                                <p>{risk.riskDescription || 'No detailed description.'}</p>
                              </div>
                              {risk.sources?.length ? (
                                <div className="mt-2">
                                  <span className="text-[13px] font-medium">Sources:</span>
                                  <ul className="list-disc pl-5">
                                    {risk.sources.map((src, si) => (
                                      <li key={si} className="text-[13px]">{src}</li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No available risks</p>
                  )}
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-700 break-after-avoid">
                    {(theme.recommendationCount ?? theme.recommendations.length)} recommendation{(theme.recommendationCount ?? theme.recommendations.length) !== 1 ? 's' : ''}
                  </p>
                  {theme.recommendations.length > 0 ? (
                    <div className="space-y-2">
                      {theme.recommendations.map((rec, i) => (
                        <div key={i} className="rounded-md border border-blue-200 p-3 break-inside-avoid-page">
                          {rec.rawHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: rec.rawHtml }} />
                          ) : (
                            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                              <p>{rec.recommendationText}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No available recommendations</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default ReportSectionPrint;


