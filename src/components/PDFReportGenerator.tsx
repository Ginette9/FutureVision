import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { 
  getRiskIdsByCountryAndIndustry, 
  getRisksByIds, 
  getAdviceIdsByCountryAndIndustry, 
  getAdviceByIds 
} from '../lib/database';

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

interface ThemeData {
  themeName: string;
  risks: RiskItem[];
  recommendations: AdviceItem[];
}

interface CategoryData {
  categoryTitle: string;
  themes: ThemeData[];
}

interface PDFReportGeneratorProps {
  countryId: number;
  industryId: number;
  countryName: string;
  industryName: string;
  className?: string;
}

const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({ 
  countryId,
  industryId,
  countryName, 
  industryName, 
  className = "" 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // 获取数据并组织结构
  const fetchReportData = async (): Promise<CategoryData[]> => {
    try {
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
      const categoryMap: Record<string, CategoryData> = {};

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
            recommendations: []
          };
          categoryMap[categoryTitle].themes.push(theme);
        }

        theme.risks.push(risk);
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
            recommendations: []
          };
          categoryMap[categoryTitle].themes.push(theme);
        }

        theme.recommendations.push(adviceItem);
      });

      return Object.values(categoryMap);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      return [];
    }
  };

  // 清理HTML标签和格式化文本
  const cleanText = (htmlText: string): string => {
    return htmlText
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/&nbsp;/g, ' ') // 替换&nbsp;
      .replace(/&amp;/g, '&') // 替换&amp;
      .replace(/&lt;/g, '<') // 替换&lt;
      .replace(/&gt;/g, '>') // 替换&gt;
      .replace(/&quot;/g, '"') // 替换&quot;
      .trim();
  };

  // 绘制议题总起排版 - 跨两列显示
  const drawCategorySummary = (pdf: jsPDF, category: CategoryData, startY: number, pageWidth: number, margin: number): number => {
    let currentY = startY;
    const fullWidth = pageWidth - margin * 2; // 整页宽度
    
    // 议题标题
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(category.categoryTitle, margin, currentY);
    currentY += 12;
    
    // 动态计算需要显示的主题数量和内容
    const actualThemeCount = category.themes.length;
    const displayThemes = category.themes; // 显示所有主题
    
    // 计算每个主题需要的行数
    let maxItemsPerTheme = 0;
    displayThemes.forEach(theme => {
      const riskCount = theme.risks.length;
      const adviceCount = theme.recommendations.length;
      const totalItems = riskCount + adviceCount;
      maxItemsPerTheme = Math.max(maxItemsPerTheme, totalItems);
    });
    
    // 动态计算方块高度
    const baseHeight = 25; // 基础高度
    const itemHeight = 4; // 每个风险/建议项的高度
    const boxHeight = baseHeight + (maxItemsPerTheme * itemHeight);
    const boxY = currentY;
    
    // 绘制灰色背景 - 跨整页宽度
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, boxY, fullWidth, boxHeight, 'F');
    
    // 统计文本
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`${actualThemeCount} themes analyzed`, margin + 5, boxY + 8);
    
    // 动态计算主题布局 - 使用整页宽度
    const themeStartY = boxY + 16;
    const availableWidth = fullWidth - 10; // 减去左右边距
    const themeWidth = displayThemes.length > 0 ? availableWidth / Math.min(displayThemes.length, 3) : availableWidth; // 最多3列
    
    displayThemes.slice(0, 3).forEach((theme, index) => {
      const themeX = margin + 5 + (index * themeWidth);
      let themeY = themeStartY;
      
      // 警告图标 (用三角形代替)
      pdf.setFillColor(255, 165, 0); // 橙色
      const triangleSize = 2;
      pdf.triangle(themeX, themeY, themeX + triangleSize, themeY + triangleSize, themeX - triangleSize, themeY + triangleSize, 'F');
      
      // 主题名称 - 使用文本换行处理长名称
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const maxThemeWidth = themeWidth - 8; // 为图标和边距留空间
      const themeNameLines = pdf.splitTextToSize(theme.themeName, maxThemeWidth);
      
      // 显示主题名称（最多2行）
      const displayLines = themeNameLines.slice(0, 2);
      displayLines.forEach((line: string, lineIndex: number) => {
        pdf.text(line, themeX + 4, themeY + 1 + (lineIndex * 3));
      });
      
      // 调整后续内容的Y坐标
      themeY += 4 + (displayLines.length * 3);
      
      // 显示风险（红色圆点）
      theme.risks.forEach((risk, riskIndex) => {
        if (themeY + 4 > boxY + boxHeight - 2) return; // 防止超出边界
        
        pdf.setFillColor(220, 53, 69); // 红色
        pdf.circle(themeX + 1, themeY, 1, 'F');
        pdf.setFontSize(7);
        pdf.setTextColor(220, 53, 69);
        
        // 简化风险文本显示
        const riskText = `Risk: ${theme.themeName.substring(0, 8)}... ${riskIndex + 1}`;
        const riskLines = pdf.splitTextToSize(riskText, maxThemeWidth - 6);
        pdf.text(riskLines[0], themeX + 4, themeY + 1);
        themeY += 4;
      });
      
      // 显示建议（绿色圆点）
      theme.recommendations.forEach((advice, adviceIndex) => {
        if (themeY + 4 > boxY + boxHeight - 2) return; // 防止超出边界
        
        pdf.setFillColor(40, 167, 69); // 绿色
        pdf.circle(themeX + 1, themeY, 1, 'F');
        pdf.setFontSize(7);
        pdf.setTextColor(40, 167, 69);
        
        // 简化建议文本显示
        const adviceText = `Advice: ${theme.themeName.substring(0, 8)}...`;
        const adviceLines = pdf.splitTextToSize(adviceText, maxThemeWidth - 6);
        pdf.text(adviceLines[0], themeX + 4, themeY + 1);
        themeY += 4;
      });
    });
    
    // 重置文本颜色
    pdf.setTextColor(0, 0, 0);
    
    return currentY + boxHeight + 8; // 返回下一个内容的Y坐标
  };

  // 生成PDF报告
  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const categories = await fetchReportData();
      
      if (categories.length === 0) {
        alert('没有找到相关数据，无法生成报告');
        return;
      }

      // 创建PDF文档
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const columnWidth = (pageWidth - margin * 3) / 2; // 双列布局
      const lineHeight = 6;
      
      let currentY = margin;
      let currentColumn = 0; // 0 = 左列, 1 = 右列
      let categoryStartY = margin; // 记录每个议题开始的Y坐标
      
      // 添加标题
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ESG Risk Analysis Report', margin, currentY);
      currentY += 15;
      
      // 添加基本信息
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Industry: ${industryName}`, margin, currentY);
      currentY += 8;
      pdf.text(`Country: ${countryName}`, margin, currentY);
      currentY += 15;
      
      // 检查是否需要换页 - 优化逻辑以适应新的布局
      const checkPageBreak = (additionalHeight: number = 0) => {
        if (currentY + additionalHeight > pageHeight - margin) {
          if (currentColumn === 0) {
            // 切换到右列，Y坐标应该从当前议题的卡片下方开始
            currentColumn = 1;
            currentY = categoryStartY; // 从当前议题开始的位置开始
          } else {
            // 新页面
            pdf.addPage();
            currentColumn = 0;
            currentY = margin;
            categoryStartY = margin; // 重置议题开始位置
          }
        }
      };
      
      // 检查卡片换页 - 专门为跨页卡片设计
      const checkCardPageBreak = (cardHeight: number) => {
        if (currentY + cardHeight > pageHeight - margin) {
          pdf.addPage();
          currentColumn = 0;
          currentY = margin;
        }
      };
      
      // 获取当前列的X坐标
      const getColumnX = () => {
        return currentColumn === 0 ? margin : margin * 2 + columnWidth;
      };
      
      // 处理每个类别
      categories.forEach((category, categoryIndex) => {
        // 只处理前4个议题
        if (categoryIndex >= 4) return;
        
        // 记录当前议题开始的Y坐标
        categoryStartY = currentY;
        
        // 使用新的议题总起排版 - 跨整页宽度
        // 先检查卡片是否需要换页
        checkCardPageBreak(60); // 为总起排版预留空间
        // 重置到左列开始，确保卡片占满整行
        currentColumn = 0;
        const cardEndY = drawCategorySummary(pdf, category, currentY, pageWidth, margin);
        currentY = cardEndY;
        
        // 更新categoryStartY为卡片结束后的位置，确保详细内容从卡片下方开始
        categoryStartY = cardEndY;
        
        // 详细内容从卡片下方开始，采用两列排版
        currentColumn = 0; // 重置到左列
        
        // 处理每个主题
        category.themes.forEach((theme, themeIndex) => {
          // 只处理前3个子议题
          if (themeIndex >= 3) return;
          
          // 主题标题
          checkPageBreak(15);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(theme.themeName, getColumnX(), currentY, { maxWidth: columnWidth });
          currentY += 10;
          
          // 风险部分
          if (theme.risks.length > 0) {
            checkPageBreak(10);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Risks:', getColumnX(), currentY, { maxWidth: columnWidth });
            currentY += 6;
            
            theme.risks.forEach((risk) => {
              const riskText = cleanText(risk.content);
              checkPageBreak(lineHeight * 3);
              
              pdf.setFont('helvetica', 'normal');
              const lines = pdf.splitTextToSize(`• ${riskText}`, columnWidth - 5);
              
              lines.forEach((line: string) => {
                checkPageBreak(lineHeight);
                pdf.text(line, getColumnX() + 3, currentY, { maxWidth: columnWidth - 5 });
                currentY += lineHeight;
              });
              
              currentY += 2; // 风险项之间的间距
            });
            
            currentY += 4; // 风险和建议之间的间距
          }
          
          // 建议部分
          if (theme.recommendations.length > 0) {
            checkPageBreak(10);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Recommendations:', getColumnX(), currentY, { maxWidth: columnWidth });
            currentY += 6;
            
            theme.recommendations.forEach((recommendation) => {
              const recText = cleanText(recommendation.content);
              checkPageBreak(lineHeight * 3);
              
              pdf.setFont('helvetica', 'normal');
              const lines = pdf.splitTextToSize(`• ${recText}`, columnWidth - 5);
              
              lines.forEach((line: string) => {
                checkPageBreak(lineHeight);
                pdf.text(line, getColumnX() + 3, currentY, { maxWidth: columnWidth - 5 });
                currentY += lineHeight;
              });
              
              currentY += 2; // 建议项之间的间距
            });
          }
          
          currentY += 8; // 主题之间的间距
        });
        
        // 类别结束后，确保下一个类别从新的位置开始
        // 如果当前在右列，需要换到下一行的左列
        if (currentColumn === 1) {
          currentColumn = 0;
          currentY += 15; // 类别之间的额外间距
        } else {
          currentY += 10; // 类别之间的间距
        }
      });
      
      // 保存PDF
      const fileName = `ESG_Risk_Report_${industryName}_${countryName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF生成失败:', error);
      alert('PDF生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          生成中...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          导出PDF报告
        </>
      )}
    </button>
  );
};

export default PDFReportGenerator;