import React from 'react';
import { ReportSection } from './parseReportHtml';

interface PrintTocProps {
  sections: ReportSection[];
}

const PrintToc: React.FC<PrintTocProps> = ({ sections }) => {
  // 处理点击跳转
  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 获取目录项描述
  const getTocDescription = (sectionId: string): string => {
    const descriptions: Record<string, string> = {
      'introduction': 'Executive overview and methodology framework',
      'important-to-consider': 'Key factors and strategic considerations',
      'risk-analysis': 'Comprehensive risk assessment and evaluation',
      'relevant-organizations': 'Stakeholder mapping and engagement',
      'esg-labels': 'Sustainability standards and certifications',
      'due-diligence': 'Compliance verification and audit processes',
      'about-msc-hk': 'Company profile and expertise overview',
      'contact': 'Professional consultation and support services',
      'disclaimer': 'Terms of use and legal considerations'
    };
    return descriptions[sectionId] || 'Detailed analysis and insights';
  };

  return (
    <div className="print-only print-page toc-page">
      <div className="toc-container">
        {/* 目录标题 */}
        <div className="toc-header">
          <h1 className="toc-title">Table of Contents</h1>
          <div className="toc-title-underline"></div>
          <p className="toc-subtitle">
            Comprehensive ESG Risk Analysis & Strategic Insights
          </p>
        </div>

        {/* 目录内容 */}
        <div className="toc-content">
          {sections.map((section, index) => (
            <div key={section.id} className="toc-item">
              <div 
                className="toc-item-content"
                onClick={() => handleSectionClick(section.id)}
              >
                <span className="toc-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="toc-text-content">
                  <span className="toc-title-text">{section.title}</span>
                  <span className="toc-description">
                    {getTocDescription(section.id)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="toc-footer">
          <p className="toc-footer-text">
            This report provides actionable insights for sustainable business practices
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .toc-page {
            display: none !important;
          }
          
          @media print {
            .toc-page {
              display: flex !important;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 0;
              page-break-after: always;
            }
            
            .toc-container {
              width: 100%;
              max-width: 600px;
              text-align: center;
            }
            
            .toc-header {
              margin-bottom: 32px;
            }
            
            .toc-title {
              font-size: 28px;
              font-weight: 300;
              color: #111827;
              margin: 0 0 12px 0;
              letter-spacing: -0.025em;
            }
            
            .toc-title-underline {
              width: 60px;
              height: 2px;
              background: linear-gradient(90deg, #4f46e5, #06b6d4);
              margin: 0 auto 16px auto;
              border-radius: 1px;
            }
            
            .toc-subtitle {
              font-size: 15px;
              color: #6b7280;
              margin: 0;
              font-weight: 400;
            }
            
            .toc-content {
              margin-bottom: 32px;
            }
            
            .toc-item {
              margin-bottom: 16px;
              text-align: left;
            }
            
            .toc-item-content {
              display: flex;
              align-items: flex-start;
              gap: 16px;
              padding: 12px 0;
              cursor: pointer;
              transition: all 0.2s ease;
              border-radius: 12px;
            }
            
            .toc-item-content:hover {
              background-color: rgba(79, 70, 229, 0.04);
              padding-left: 12px;
              padding-right: 12px;
            }
            
            @media print {
              .toc-item-content:hover {
                background-color: transparent !important;
              }
            }
            
            .toc-number {
              font-size: 16px;
              font-weight: 500;
              color: #4f46e5;
              min-width: 36px;
              text-align: center;
              background: linear-gradient(135deg, #4f46e5, #06b6d4);
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            
            .toc-text-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            
            .toc-title-text {
              font-size: 17px;
              font-weight: 400;
              color: #111827;
              line-height: 1.4;
            }
            
            .toc-description {
              font-size: 13px;
              color: #6b7280;
              line-height: 1.3;
              font-weight: 400;
            }
            
            .toc-footer {
              border-top: 1px solid #e5e7eb;
              padding-top: 16px;
              margin-top: 16px;
            }
            
            .toc-footer-text {
              font-size: 14px;
              color: #9ca3af;
              margin: 0;
              font-weight: 400;
            }
          }
        `
      }} />
    </div>
  );
};

export default PrintToc;