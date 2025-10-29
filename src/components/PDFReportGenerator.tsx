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

  // 获取报告数据
  const fetchReportData = async (): Promise<CategoryData[]> => {
    try {
      const riskIds = await getRiskIdsByCountryAndIndustry(countryName, industryName);
      const risks = await getRisksByIds(riskIds);
      
      const adviceIds = await getAdviceIdsByCountryAndIndustry(countryName, industryName);
      const advice = await getAdviceByIds(adviceIds);

      const categoryMap: { [key: string]: CategoryData } = {};

      risks.forEach((riskItem) => {
        const categoryTitle = riskItem.issue_name || 'Unknown Category';
        const themeName = riskItem.sub_issue_name || 'Unknown Theme';

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

        theme.risks.push(riskItem);
      });

      advice.forEach((adviceItem) => {
        const categoryTitle = adviceItem.issue_name || 'Unknown Category';
        const themeName = adviceItem.sub_issue_name || 'Unknown Theme';

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

  // 清理HTML文本
  const cleanText = (htmlText: string): string => {
    return htmlText
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  };

  // HTML内容解析和处理函数
  const parseHtmlContent = (html: string, classification: string, countryName: string, industryName: string) => {
    if (!html) return { text: '', hasFormatting: false, elements: [] };

    // 去除开头的重复标签
    let cleanedHtml = html;
    
    // 去除Risk/Advice开头标签
    cleanedHtml = cleanedHtml.replace(
      /<p class="[^"]*text-red[^"]*"[^>]*>\s*Risk\s*:\s*[^<]*<\/p>/gi, ''
    ).replace(
      /<p class="[^"]*text-blue-700[^"]*"[^>]*>\s*Advice\s*:\s*[^<]*<\/p>/gi, ''
    );
    
    // 去除Country/Product/General分类标签div
    cleanedHtml = cleanedHtml.replace(
      /<div class="mb-4 flex flex-wrap gap-2">\s*<div class="flex items-center rounded-sm px-2 text-xs[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, ''
    );

    // 首先处理TBD标签替换
    const processedHtml = replaceTBDTags(cleanedHtml, classification, countryName, industryName);
    
    // 创建临时DOM元素来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedHtml;
    
    const elements: Array<{
      type: 'text' | 'bold' | 'list' | 'tag' | 'link' | 'sources',
      content: string,
      tagColor?: string,
      tagText?: string,
      url?: string
    }> = [];
    
    // 递归解析DOM节点
    const parseNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          elements.push({ type: 'text', content: text });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        // 处理Sources部分
        if (element.classList.contains('mt-6') && element.textContent?.includes('Source(s)')) {
          // 处理Sources标题
          const sourceTitle = element.querySelector('span.font-medium');
          if (sourceTitle) {
            elements.push({ type: 'sources', content: 'Source(s):' });
          }
          
          // 处理链接列表
          const links = element.querySelectorAll('a');
          links.forEach(link => {
            const linkText = link.textContent?.trim();
            const linkUrl = link.getAttribute('href');
            if (linkText && linkUrl) {
              elements.push({ 
                type: 'link', 
                content: `• ${linkText}`, 
                url: linkUrl 
              });
            }
          });
          return;
        }
        
        // 处理超链接
        if (element.tagName === 'A') {
          const linkText = element.textContent?.trim();
          const linkUrl = element.getAttribute('href');
          if (linkText && linkUrl) {
            elements.push({ 
              type: 'link', 
              content: linkText, 
              url: linkUrl 
            });
          }
          return;
        }
        
        // 处理分类标签
        if (element.classList.contains('flex') && element.classList.contains('items-center')) {
          const tagSpan = element.querySelector('span.uppercase');
          const valueSpan = element.querySelector('span.h-6');
          if (tagSpan && valueSpan) {
            const tagText = tagSpan.textContent?.trim() || '';
            const valueText = valueSpan.textContent?.trim() || '';
            let tagColor = '#6B7280'; // 默认灰色
            
            if (element.classList.contains('bg-sky-600')) {
              tagColor = '#0284C7'; // Country标签颜色
            } else if (element.classList.contains('bg-cyan-600')) {
              tagColor = '#0891B2'; // Industry标签颜色
            }
            
            elements.push({
              type: 'tag',
              content: `${tagText} ${valueText}`,
              tagColor,
              tagText: tagText
            });
          }
        }
        // 处理粗体文本
        else if (element.tagName === 'STRONG' || element.tagName === 'B') {
          elements.push({ type: 'bold', content: element.textContent?.trim() || '' });
        }
        // 处理列表项
        else if (element.tagName === 'LI') {
          elements.push({ type: 'list', content: element.textContent?.trim() || '' });
        }
        // 处理其他元素，递归解析子节点
        else {
          for (const child of Array.from(element.childNodes)) {
            parseNode(child);
          }
        }
      }
    };
    
    // 解析所有子节点
    for (const child of Array.from(tempDiv.childNodes)) {
      parseNode(child);
    }
    
    // 生成纯文本版本作为备用
    const plainText = tempDiv.textContent?.trim() || '';
    
    return {
      text: plainText,
      hasFormatting: elements.length > 0,
      elements
    };
  };

  // TBD标签替换函数（从ReportSection.tsx复制）
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
    
    // 替换完整的标签结构
    return html.replace(
      /<div class="flex items-center rounded-sm px-2 text-xs[^"]*"[^>]*>\s*<span class="[^"]*font-semibold[^"]*text-white[^"]*uppercase[^"]*"[^>]*>\s*([^<]*?)\s*:\s*<\/span>\s*<span class="[^"]*h-6[^"]*text-white[^"]*"[^>]*>\s*TBD\s*<\/span>\s*<\/div>/gi,
      `<div class="flex items-center rounded-sm px-2 text-xs ${backgroundColorClass}"><span class="font-semibold text-white uppercase">$1:</span><span class="flex items-center h-6 text-white ml-1">${replacementValue}</span></div>`
    ).replace(
      // 备用匹配模式
      /<span[^>]*class="[^"]*h-6[^"]*text-white[^"]*"[^>]*>\s*TBD\s*<\/span>/gi,
      `<span class="flex items-center h-6 text-white">${replacementValue}</span>`
    );
  };

  // 绘制类别总结卡片 - 完全按照参考样例设计
  const drawCategorySummary = (pdf: jsPDF, category: CategoryData, startY: number, pageWidth: number, margin: number, colors: any, lineHeight: number): number => {
    const totalThemes = category.themes.length;
    let currentY = startY;
    
    // 类别标题 - 使用引用块样式，粗体，较大字号
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(category.categoryTitle, margin, currentY);
    // 分类标题后添加自然间距
    currentY += lineHeight * 1.5;
    
    // 计算动态卡片高度 - 根据新的布局逻辑重新计算，使用与实际渲染相同的参数
    const preCalculatedColumnHeights = [0, 0, 0]; // 预计算每列高度
    
    category.themes.forEach((theme, index) => {
      const col = index % 3;
      let themeContentHeight = 0;
      
      // 主题名称高度 - 使用与实际渲染相同的参数
      const maxThemeWidth = (pageWidth - margin * 2) / 3 - 25;
      const themeLines = pdf.splitTextToSize(theme.themeName, maxThemeWidth);
      themeContentHeight += themeLines.length * 5 + 5; // 更新为新的行间距：行间距5，主题后间距5
      
      // 风险项高度 - 使用与实际渲染相同的参数
      theme.risks.forEach((risk, riskIndex) => {
        const riskText = `Risk : ${theme.themeName} ${riskIndex + 1}`;
        const maxWidth = (pageWidth - margin * 2) / 3 - 20;
        const riskLines = pdf.splitTextToSize(riskText, maxWidth);
        themeContentHeight += riskLines.length * 4 + 3; // 更新为新的行间距：行间距4，项目间距3
      });
      
      // 建议项高度 - 使用与实际渲染相同的参数
      theme.recommendations.forEach((rec, recIndex) => {
        const adviceText = `Advice : ${theme.themeName} ${recIndex + 1}`; // 添加编号以保持一致
        const maxWidth = (pageWidth - margin * 2) / 3 - 20;
        const adviceLines = pdf.splitTextToSize(adviceText, maxWidth);
        themeContentHeight += adviceLines.length * 4 + 3; // 更新为新的行间距：行间距4，项目间距3
      });
      
      // 累加到对应列的高度（移除额外的主题间距，因为已经包含在各项的间距中）
      preCalculatedColumnHeights[col] += themeContentHeight;
    });
    
    // 动态计算卡片高度，取最高列的高度
    const maxColumnHeight = Math.max(...preCalculatedColumnHeights);
    const cardHeight = Math.max(50, 30 + maxColumnHeight); // 增加底部内边距从20到30
    
    // 先计算实际内容高度
    const columnHeights = [0, 0, 0]; // 跟踪每列的实际高度
    const cardPadding = 8; // 定义统一的卡片内边距
    const contentStartY = currentY + 18; // 从20减少到18，减少内容开始位置间距
    const tableWidth = pageWidth - margin * 2;
    const columnWidth = tableWidth / 3;
    const columnStartX = [margin + cardPadding, margin + columnWidth + cardPadding, margin + columnWidth * 2 + cardPadding]; // 统一使用cardPadding
    
    // 预计算内容高度（使用与实际渲染相同的逻辑）
    category.themes.forEach((theme, index) => {
      const col = index % 3;
      let themeY = contentStartY + columnHeights[col]; // 基于列高度定位
      
      // 计算主题名称高度 - 使用与实际渲染相同的splitTextToSize
      const maxThemeWidth = columnWidth - 25;
      // 创建临时PDF对象来计算文本分行
      const tempPdf = new jsPDF();
      tempPdf.setFontSize(10);
      tempPdf.setFont('helvetica', 'bold');
      const themeLines = tempPdf.splitTextToSize(theme.themeName, maxThemeWidth);
      themeY += themeLines.length * 5 + 5; // 增大主题后间距从4到5
      
      // 计算风险项高度 - 使用与实际渲染相同的splitTextToSize
      theme.risks.forEach((risk, riskIndex) => {
        tempPdf.setFontSize(8);
        tempPdf.setFont('helvetica', 'normal');
        const riskText = `Risk : ${theme.themeName} ${riskIndex + 1}`;
        const maxWidth = columnWidth - 20;
        const riskLines = tempPdf.splitTextToSize(riskText, maxWidth);
        themeY += riskLines.length * 4 + 3; // 增大风险项间距从2到3
      });
      
      // 计算建议项高度 - 使用与实际渲染相同的splitTextToSize
      theme.recommendations.forEach((rec, recIndex) => {
        tempPdf.setFontSize(8);
        tempPdf.setFont('helvetica', 'normal');
        const adviceText = `Advice : ${theme.themeName} ${recIndex + 1}`; // 添加编号以保持一致
        const maxWidth = columnWidth - 20;
        const adviceLines = tempPdf.splitTextToSize(adviceText, maxWidth);
        themeY += adviceLines.length * 4 + 3; // 增大建议项间距从2到3
      });
      
      // 更新列高度，减少主题间距
      columnHeights[col] = themeY - contentStartY + 3; // 从6减少到3
    });
    
    // 获取实际内容高度并绘制背景
    const actualContentHeight = Math.max(...columnHeights);
    const actualCardHeight = 23 + actualContentHeight; // 从25减少到23，进一步减少顶部间距
    
    // 绘制圆角灰色背景卡片 - 使用实际高度
    pdf.setFillColor(245, 245, 245); // 稍微深一点的灰色背景
    const cornerRadius = 6; // 减小圆角半径
    const cardMargin = margin; // 与下方两列内容对齐，使用相同的margin
    pdf.roundedRect(cardMargin, currentY, pageWidth - cardMargin * 2, actualCardHeight, cornerRadius, cornerRadius, 'F');
    
    // 绘制统计信息
    const statsY = currentY + cardPadding; // 使用统一的内边距
    pdf.setFontSize(12); // 增大字体从10到12
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${totalThemes} themes analyzed`, cardMargin + cardPadding, statsY);
    
    // 重置列高度并绘制实际内容
    columnHeights[0] = 0;
    columnHeights[1] = 0;
    columnHeights[2] = 0;
    
    category.themes.forEach((theme, index) => {
      const col = index % 3;
      const startX = columnStartX[col];
      let themeY = contentStartY + columnHeights[col]; // 基于列高度定位
      
      // 绘制主题名称和警告图标 - 参考用户样式
      // 绘制黑色三角形警告图标 - 调整颜色和大小
      pdf.setFillColor(0, 0, 0); // 黑色
      pdf.setDrawColor(0, 0, 0);
      
      // 绘制三角形 - 调整位置与themes总数对齐
      const triangleSize = 3.5;
      const triangleX = startX; // 直接使用startX，与themes总数左对齐
      const triangleY = themeY;
      
      pdf.triangle(
        triangleX, triangleY - triangleSize,
        triangleX - triangleSize, triangleY + triangleSize,
        triangleX + triangleSize, triangleY + triangleSize,
        'F'
      );
      
      // 在三角形中心绘制白色感叹号 - 减小感叹号字体
      pdf.setTextColor(255, 255, 255); // 白色
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text('!', triangleX - 0.6, triangleY + 1.2);
      
      // 绘制主题名称 - 增大字体
      pdf.setFontSize(10); // 增大字体从9到10
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const maxThemeWidth = columnWidth - 25;
      const themeLines = pdf.splitTextToSize(theme.themeName, maxThemeWidth);
      themeLines.forEach((line: string, lineIndex: number) => {
        pdf.text(line, startX + 6, themeY + lineIndex * 5); // 减少警告图标与文字间距从10到6
      });
      themeY += themeLines.length * 5 + 5; // 增大主题后间距从4到5
      
      // 绘制风险项 - 调整圆点颜色和大小
      theme.risks.forEach((risk, riskIndex) => {
        // 绘制红色实心圆点 - 调整位置与整体对齐
        pdf.setFillColor(220, 53, 69); // 更深的红色
        pdf.circle(startX, themeY - 0.5, 1.5, 'F'); // 调整圆点位置与themes总数对齐
        
        // 风险文本 - 增大字体
        pdf.setFontSize(8); // 增大字体从7到8
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        const riskText = `Risk : ${theme.themeName} ${riskIndex + 1}`;
        const maxWidth = columnWidth - 20;
        const riskLines = pdf.splitTextToSize(riskText, maxWidth);
        riskLines.forEach((line: string, lineIndex: number) => {
          pdf.text(line, startX + 5, themeY + lineIndex * 4); // 减少风险圆点与文字间距从8到5
        });
        themeY += riskLines.length * 4 + 3; // 增大风险项间距从2到3
      });
      
      // 绘制建议项 - 调整圆点颜色和大小
      theme.recommendations.forEach((rec, recIndex) => {
        // 绘制绿色实心圆点 - 调整位置与整体对齐
        pdf.setFillColor(40, 167, 69); // 更鲜艳的绿色
        pdf.circle(startX, themeY - 0.5, 1.5, 'F'); // 调整圆点位置与themes总数对齐
        
        // 建议文本 - 增大字体
        pdf.setFontSize(8); // 增大字体从7到8
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        const adviceText = `Advice : ${theme.themeName} ${recIndex + 1}`; // 添加编号显示
        const maxWidth = columnWidth - 20;
        const adviceLines = pdf.splitTextToSize(adviceText, maxWidth);
        adviceLines.forEach((line: string, lineIndex: number) => {
          pdf.text(line, startX + 5, themeY + lineIndex * 4); // 减少建议圆点与文字间距从8到5
        });
        themeY += adviceLines.length * 4 + 3; // 增大建议项间距从2到3
      });
      
      // 更新列高度，添加主题间距
      columnHeights[col] = themeY - contentStartY + 6;
    });
    
    // 使用实际内容高度更新currentY
    return currentY + 23 + actualContentHeight + 8; // 顶部间距23，底部间距8
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
      const margin = 12; // 从15减少到12，减少页边距以容纳更多文字
      const columnWidth = (pageWidth - margin * 3) / 2;
      const lineHeight = 5;
      
      // 定义颜色方案 - 按照参考样例调整
      const colors = {
        primary: '#000000',      // 纯黑色，更符合参考样例
        secondary: '#333333',    // 深灰色
        risk: '#dc2626',         // 红色
        advice: '#16a34a',       // 绿色
        warning: '#000000',      // 警告图标黑色
        cardBg: '#f8f8f8',      // 卡片背景浅灰
        text: '#000000',         // 文本黑色
        lightText: '#666666',    // 浅色文本
        border: '#cccccc'        // 边框灰色
      };
      
      let currentY = margin;
      let currentColumn = 0;
      let categoryStartY = margin;
      
      // 添加页脚函数
      const addFooter = () => {
        const footerY = pageHeight - 10;
        pdf.setFontSize(8);
        pdf.setTextColor(colors.lightText);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Future Vision', margin, footerY);
        pdf.text('www.mscfv.com', pageWidth - margin - 30, footerY);
      };
      
      // 添加标题 - 移除，因为参考样例中没有总标题
      // 直接从第一个议题开始
      
      // 检查换页
      const checkPageBreak = (additionalHeight: number = 0) => {
        if (currentY + additionalHeight > pageHeight - margin - 15) {
          if (currentColumn === 0) {
            // 从左列切换到右列
            currentColumn = 1;
            currentY = categoryStartY;
          } else {
            // 从右列切换到新页面
            addFooter();
            pdf.addPage();
            currentColumn = 0;
            currentY = margin;
            categoryStartY = margin;
            // 重新设置正文字体，避免使用页脚字体
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(colors.text);
          }
        }
      };
      
      const checkCardPageBreak = (cardHeight: number) => {
        if (currentY + cardHeight > pageHeight - margin - 15) {
          addFooter();
          pdf.addPage();
          currentColumn = 0;
          currentY = margin;
          // 重新设置正文字体，避免使用页脚字体
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.text);
        }
      };
      
      const getColumnX = () => {
        return currentColumn === 0 ? margin : margin * 2 + columnWidth;
      };
      
      // 处理每个类别
      categories.forEach((category, categoryIndex) => {
        if (categoryIndex >= 4) return;
        
        // 每个议题新开一页（除了第一个）
        if (categoryIndex > 0) {
          addFooter();
          pdf.addPage();
          currentY = margin;
          // 重新设置正文字体，避免使用页脚字体
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.text);
        }
        
        categoryStartY = currentY;
        currentColumn = 0;
        
        const cardEndY = drawCategorySummary(pdf, category, currentY, pageWidth, margin, colors, lineHeight);
        currentY = cardEndY;
        categoryStartY = cardEndY;
        currentColumn = 0;
        
        // 处理主题 - 按照截图要求优化详情页面排版
        category.themes.forEach((theme, themeIndex) => {
          // 主题标题 - 调整字体大小，添加浅灰色短下划线，支持自动换行
          checkPageBreak(20);
          pdf.setFontSize(14); // 增大字体，从12增加到14
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(colors.primary);
          
          // 使用splitTextToSize确保主题标题自动换行
          const themeLines = pdf.splitTextToSize(theme.themeName, columnWidth - 5);
          themeLines.forEach((line: string, lineIndex: number) => {
            checkPageBreak(lineHeight);
            pdf.text(line, getColumnX(), currentY);
            currentY += lineHeight;
          });
          
          // 添加主题下方的更深灰色居左短下划线（如截图所示）
          // 确保下划线位置根据标题行数自动调整
          pdf.setDrawColor(120, 120, 120); // 更深的灰色，从180改为120
          pdf.setLineWidth(0.8);
          const underlineLength = Math.min(25, columnWidth * 0.2); // 缩短下划线，从40改为25，比例从0.3改为0.2
          pdf.line(getColumnX(), currentY - 2, getColumnX() + underlineLength, currentY - 2); // 短下划线
          // 下划线后添加一个空行作为自然间距
          currentY += lineHeight;
          
          // 风险部分
          if (theme.risks.length > 0) {
            theme.risks.forEach((risk, riskIndex) => {
              checkPageBreak(15);
              
              // 风险标签 - 根据字体高度自适应色块高度，文字垂直居中，支持自动换行
              const fontSize = 8;
              pdf.setFontSize(fontSize);
              pdf.setFont('helvetica', 'bold');
              
              // 计算标签文本并检查是否需要换行 - 每条风险独立编号
              const riskLabelText = `Risk : ${theme.themeName} ${riskIndex + 1}`;
              const labelLines = pdf.splitTextToSize(riskLabelText, columnWidth - 15);
              
              // 计算文字的实际高度（字体大小的约1.2倍是合理的行高）
              const textHeight = fontSize * 0.35; // jsPDF中字体高度约为字体大小的0.35倍
              const labelPadding = 2; // 上下各1px的内边距
              const lineSpacing = 1; // 行间距
              const totalTextHeight = labelLines.length * textHeight + (labelLines.length - 1) * lineSpacing;
              const labelHeight = totalTextHeight + labelPadding;
              const labelWidth = columnWidth - 10;
              
              // 绘制色块 - 高度根据文本行数动态调整
              pdf.setFillColor(204, 85, 85); // 更柔和的红色
              pdf.rect(getColumnX(), currentY, labelWidth, labelHeight, 'F');
              
              // 绘制多行文字，每行垂直居中
              pdf.setTextColor(255, 255, 255);
              labelLines.forEach((line: string, lineIndex: number) => {
                const lineY = currentY + labelPadding/2 + textHeight + lineIndex * (textHeight + lineSpacing);
                pdf.text(line, getColumnX() + 1, lineY);
              });
              
              currentY += labelHeight;
              // 标签后添加一个空行作为自然间距
              currentY += lineHeight;
              
              // 根据classification动态显示标签，支持自动换行
              let labelText = '';
              switch (risk.classification) {
                case 'country':
                  labelText = `COUNTRY : ${countryName}`;
                  break;
                case 'industry':
                  labelText = `PRODUCT : ${industryName}`;
                  break;
                default:
                  labelText = 'GENERAL : General';
              }
              
              // 分类信息 - 优化字体大小和颜色为灰蓝色，支持自动换行
              pdf.setFontSize(8); // 更小的字体
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(70, 130, 180); // 灰蓝色 (70, 130, 180)
              
              // 使用splitTextToSize确保分类标签自动换行
              const classificationLines = pdf.splitTextToSize(labelText, columnWidth - 5);
              const classificationLineHeight = lineHeight * 0.8; // 分类标签使用更小的行间距
              classificationLines.forEach((line: string, lineIndex: number) => {
                checkPageBreak(classificationLineHeight);
                pdf.text(line, getColumnX(), currentY);
                currentY += classificationLineHeight;
              });
              
              // 分类标签与正文之间添加间距
              currentY += lineHeight * 0.5;
              
              // 使用HTML内容进行渲染
              const parsedContent = parseHtmlContent(risk.content_html || risk.content, risk.classification, countryName, industryName);
              checkPageBreak(lineHeight * 4);
              
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(colors.text);
              
              if (parsedContent.hasFormatting && parsedContent.elements.length > 0) {
                // 渲染带格式的内容 - 使用内联文本流渲染
                let currentX = getColumnX();
                let lineStartY = currentY;
                
                for (let i = 0; i < parsedContent.elements.length; i++) {
                  const element = parsedContent.elements[i];
                  
                  switch (element.type) {
                    case 'sources':
                       // Sources标题前添加更大间距，需要换行
                       if (currentX > getColumnX()) {
                         currentY += lineHeight;
                         currentX = getColumnX();
                       }
                       currentY += lineHeight * 1.2; // 增加上方间距
                       pdf.setFontSize(9);
                       pdf.setFont('helvetica', 'bold');
                       pdf.setTextColor(colors.text);
                       
                       checkPageBreak(lineHeight);
                       // 在checkPageBreak后重新获取正确的X位置
                       const xPos = getColumnX();
                       pdf.text(element.content, xPos, currentY);
                       currentY += lineHeight * 0.6; // 标题下方间距
                       currentX = getColumnX(); // 重置X位置
                       
                       // 恢复正文字体
                       pdf.setFont('helvetica', 'normal');
                       break;
                      
                    case 'link':
                       // 检查是否是Sources部分的bullet point链接
                       if (element.content.startsWith('• ')) {
                         // 作为列表项渲染，支持自动换行
                         if (currentX > getColumnX()) {
                           currentY += lineHeight;
                           currentX = getColumnX();
                         }
                         if (i > 0) {
                           currentY += lineHeight * 0.2; // 列表前间距
                         }
                         
                         pdf.setFont('helvetica', 'normal');
                         pdf.setTextColor(colors.text);
                         
                         // 使用splitTextToSize处理长文本自动换行
                         const listLines = pdf.splitTextToSize(element.content, columnWidth - 10);
                         listLines.forEach((line: string, lineIndex: number) => {
                           checkPageBreak(lineHeight);
                           
                           // 渲染文本 - 在checkPageBreak后重新获取正确的X位置
                           const xPos = getColumnX() + (lineIndex === 0 ? 0 : 5);
                           pdf.text(line, xPos, currentY);
                           
                           // 为每一行都添加下划线（超链接效果）
                           const lineWidth = pdf.getTextWidth(line);
                           pdf.setDrawColor(colors.text);
                           pdf.setLineWidth(0.2);
                           pdf.line(xPos, currentY + 1, xPos + lineWidth, currentY + 1);
                           
                           // 为每一行都添加可点击链接
                           if (element.url) {
                             pdf.link(xPos, currentY - 6, lineWidth, 8, { url: element.url });
                           }
                           
                           currentY += lineHeight;
                         });
                         currentX = getColumnX(); // 重置X位置
                         
                         // 列表后间距
                         if (i < parsedContent.elements.length - 1) {
                           currentY += lineHeight * 0.1;
                         }
                       } else {
                         // 内联渲染超链接
                         pdf.setFont('helvetica', 'normal');
                         pdf.setTextColor(colors.text);
                         
                         const linkText = element.content;
                         const textWidth = pdf.getTextWidth(linkText);
                         const spaceWidth = pdf.getTextWidth(' ');
                         
                         // 检查是否需要换行（包括后续空格的宽度）
                         if (currentX + textWidth + spaceWidth > getColumnX() + columnWidth - 5) {
                           checkPageBreak(lineHeight);
                           currentY += lineHeight;
                           currentX = getColumnX();
                         }
                         
                         // 渲染文本
                         pdf.text(linkText, currentX, currentY);
                         
                         // 添加下划线
                         pdf.setDrawColor(colors.text);
                         pdf.setLineWidth(0.2);
                         pdf.line(currentX, currentY + 1, currentX + textWidth, currentY + 1);
                         
                         // 添加可点击链接
                         if (element.url) {
                           pdf.link(currentX, currentY - 6, textWidth, 8, { url: element.url });
                         }
                         
                         // 更新X位置，包括超链接文本和后续空格
                         currentX += textWidth;
                         
                         // 如果不是最后一个元素，添加空格
                         if (i < parsedContent.elements.length - 1) {
                           const nextElement = parsedContent.elements[i + 1];
                           // 只有当下一个元素是文本或其他内联元素时才添加空格
                           if (nextElement.type === 'text' || nextElement.type === 'link') {
                             pdf.text(' ', currentX, currentY);
                             currentX += spaceWidth;
                           }
                         }
                       }
                       break;
                      
                    case 'tag':
                        // 渲染分类标签，需要换行
                        if (currentX > getColumnX()) {
                          currentY += lineHeight;
                          currentX = getColumnX();
                        }
                        if (i > 0) {
                          currentY += lineHeight * 0.3; // 标签前间距
                        }
                        
                        pdf.setFontSize(7);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(element.tagColor || '#6B7280');
                        
                        // 绘制标签背景
                        const tagWidth = pdf.getTextWidth(element.content) + 4;
                        const tagHeight = 8;
                        pdf.setFillColor(element.tagColor || '#6B7280');
                        pdf.roundedRect(currentX, currentY - 6, tagWidth, tagHeight, 1, 1, 'F');
                        
                        // 绘制标签文字
                        pdf.setTextColor('#FFFFFF');
                        pdf.text(element.content, currentX + 2, currentY - 1);
                        currentY += lineHeight;
                        currentX = getColumnX(); // 重置X位置
                        
                        // 标签后间距
                        currentY += lineHeight * 0.2;
                        
                        // 恢复正文字体
                        pdf.setFontSize(9);
                        pdf.setFont('helvetica', 'normal');
                        pdf.setTextColor(colors.text);
                        break;
                      
                    case 'bold':
                        // 渲染粗体文本，需要换行
                        if (currentX > getColumnX()) {
                          currentY += lineHeight;
                          currentX = getColumnX();
                        }
                        if (i > 0 && parsedContent.elements[i - 1].type !== 'tag') {
                          currentY += lineHeight * 0.3; // 粗体前间距
                        }
                        
                        pdf.setFont('helvetica', 'bold');
                        const boldLines = pdf.splitTextToSize(element.content, columnWidth - 5);
                        boldLines.forEach((line: string) => {
                          checkPageBreak(lineHeight);
                          // 在checkPageBreak后重新获取正确的X位置
                          const xPos = getColumnX();
                          pdf.text(line, xPos, currentY);
                          currentY += lineHeight;
                        });
                        currentX = getColumnX(); // 重置X位置
                        
                        // 粗体后间距
                        if (i < parsedContent.elements.length - 1) {
                          currentY += lineHeight * 0.2;
                        }
                        
                        // 恢复正文字体
                        pdf.setFontSize(9);
                        pdf.setFont('helvetica', 'normal');
                        pdf.setTextColor(colors.text);
                        break;
                      
                    case 'list':
                      // 渲染列表项，需要换行
                      if (currentX > getColumnX()) {
                        currentY += lineHeight;
                        currentX = getColumnX();
                      }
                      if (i > 0) {
                        currentY += lineHeight * 0.2; // 列表前间距
                      }
                      
                      const listLines = pdf.splitTextToSize(`• ${element.content}`, columnWidth - 10);
                      listLines.forEach((line: string, lineIndex: number) => {
                        checkPageBreak(lineHeight);
                        // 在checkPageBreak后重新获取正确的X位置
                        const xPos = getColumnX() + (lineIndex === 0 ? 0 : 5);
                        pdf.text(line, xPos, currentY);
                        currentY += lineHeight;
                      });
                      currentX = getColumnX(); // 重置X位置
                      
                      // 列表后间距
                      if (i < parsedContent.elements.length - 1) {
                        currentY += lineHeight * 0.1;
                      }
                      break;
                      
                    case 'text':
                      // 内联渲染普通文本
                      const words = element.content.split(' ');
                      for (const word of words) {
                        const wordWidth = pdf.getTextWidth(word + ' ');
                        
                        // 检查是否需要换行
                        if (currentX + wordWidth > getColumnX() + columnWidth - 5) {
                          checkPageBreak(lineHeight);
                          currentY += lineHeight;
                          currentX = getColumnX(); // 在checkPageBreak后重新获取正确的列X位置
                        }
                        
                        // 渲染单词 - 确保使用正确的列位置
                        pdf.text(word + ' ', currentX, currentY);
                        currentX += wordWidth;
                      }
                      break;
                  }
                }
                
                // 如果最后一行有内容，需要换行
                if (currentX > getColumnX()) {
                  currentY += lineHeight;
                }
              } else {
                // 回退到纯文本渲染
                const riskText = cleanText(parsedContent.text || risk.content);
                const lines = pdf.splitTextToSize(riskText, columnWidth - 5);
                
                lines.forEach((line: string) => {
                  checkPageBreak(lineHeight);
                  pdf.text(line, getColumnX(), currentY);
                  currentY += lineHeight;
                });
              }
              
              // 风险项之间添加间距
              currentY += lineHeight;
            });
          
            // 风险部分结束后添加一个空行
            currentY += lineHeight;
          }
          
          // 建议部分
          if (theme.recommendations.length > 0) {
            theme.recommendations.forEach((recommendation, recIndex) => {
              checkPageBreak(15);
              
              // 建议标签 - 根据字体高度自适应色块高度，文字垂直居中，支持自动换行
              const fontSize = 8;
              pdf.setFontSize(fontSize);
              pdf.setFont('helvetica', 'bold');
              
              // 计算标签文本并检查是否需要换行 - 每条建议独立编号
              const adviceLabelText = `Advice : ${theme.themeName} ${recIndex + 1}`;
              const labelLines = pdf.splitTextToSize(adviceLabelText, columnWidth - 15);
              
              // 计算文字的实际高度
              const textHeight = fontSize * 0.35; // jsPDF中字体高度约为字体大小的0.35倍
              const labelPadding = 2; // 上下各1px的内边距
              const lineSpacing = 1; // 行间距
              const totalTextHeight = labelLines.length * textHeight + (labelLines.length - 1) * lineSpacing;
              const labelHeight = totalTextHeight + labelPadding;
              const labelWidth = columnWidth - 10;
              
              // 绘制色块 - 高度根据文本行数动态调整
              pdf.setFillColor(85, 170, 85); // 更柔和的绿色
              pdf.rect(getColumnX(), currentY, labelWidth, labelHeight, 'F');
              
              // 绘制多行文字，每行垂直居中
              pdf.setTextColor(255, 255, 255);
              labelLines.forEach((line: string, lineIndex: number) => {
                const lineY = currentY + labelPadding/2 + textHeight + lineIndex * (textHeight + lineSpacing);
                pdf.text(line, getColumnX() + 1, lineY);
              });
              
              currentY += labelHeight;
              // 标签后添加一个空行作为自然间距
              currentY += lineHeight;
              
              // 根据classification动态显示标签，支持自动换行
              let labelText = '';
              switch (recommendation.classification) {
                case 'country':
                  labelText = `COUNTRY : ${countryName}`;
                  break;
                case 'industry':
                  labelText = `PRODUCT : ${industryName}`;
                  break;
                default:
                  labelText = 'GENERAL : General';
              }
              
              // 分类信息 - 优化字体大小和颜色为灰蓝色，支持自动换行
              pdf.setFontSize(8); // 更小的字体
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(70, 130, 180); // 灰蓝色 (70, 130, 180)
              
              // 使用splitTextToSize确保分类标签自动换行
              const classificationLines = pdf.splitTextToSize(labelText, columnWidth - 5);
              const classificationLineHeight = lineHeight * 0.8; // 分类标签使用更小的行间距
              classificationLines.forEach((line: string, lineIndex: number) => {
                checkPageBreak(classificationLineHeight);
                pdf.text(line, getColumnX(), currentY);
                currentY += classificationLineHeight;
              });
              
              // 分类标签与正文之间添加间距
              currentY += lineHeight * 0.5;
              
              // 使用HTML内容进行渲染
              const parsedContent = parseHtmlContent(recommendation.content_html || recommendation.content, recommendation.classification, countryName, industryName);
              checkPageBreak(lineHeight * 4);
              
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(colors.text);
              
              if (parsedContent.hasFormatting && parsedContent.elements.length > 0) {
                // 渲染带格式的内容 - 使用内联文本流渲染
                let currentX = getColumnX();
                let lineStartY = currentY;
                
                for (let i = 0; i < parsedContent.elements.length; i++) {
                  const element = parsedContent.elements[i];
                  
                  switch (element.type) {
                    case 'sources':
                       // Sources标题前添加更大间距，需要换行
                       if (currentX > getColumnX()) {
                         currentY += lineHeight;
                         currentX = getColumnX();
                       }
                       currentY += lineHeight * 1.2; // 增加上方间距
                       pdf.setFontSize(9);
                       pdf.setFont('helvetica', 'bold');
                       pdf.setTextColor(colors.text);
                       
                       checkPageBreak(lineHeight);
                       // 在checkPageBreak后重新获取正确的X位置
                       const xPos = getColumnX();
                       pdf.text(element.content, xPos, currentY);
                       currentY += lineHeight * 0.6; // 标题下方间距
                       currentX = getColumnX(); // 重置X位置
                       
                       // 恢复正文字体
                       pdf.setFont('helvetica', 'normal');
                       break;
                      
                    case 'link':
                       // 检查是否是Sources部分的bullet point链接
                       if (element.content.startsWith('• ')) {
                         // 作为列表项渲染，支持自动换行
                         if (currentX > getColumnX()) {
                           currentY += lineHeight;
                           currentX = getColumnX();
                         }
                         if (i > 0) {
                           currentY += lineHeight * 0.2; // 列表前间距
                         }
                         
                         pdf.setFont('helvetica', 'normal');
                         pdf.setTextColor(colors.text);
                         
                         // 使用splitTextToSize处理长文本自动换行
                         const listLines = pdf.splitTextToSize(element.content, columnWidth - 10);
                         listLines.forEach((line: string, lineIndex: number) => {
                           checkPageBreak(lineHeight);
                           
                           // 渲染文本 - 在checkPageBreak后重新获取正确的X位置
                           const xPos = getColumnX() + (lineIndex === 0 ? 0 : 5);
                           pdf.text(line, xPos, currentY);
                           
                           // 为每一行都添加下划线（超链接效果）
                           const lineWidth = pdf.getTextWidth(line);
                           pdf.setDrawColor(colors.text);
                           pdf.setLineWidth(0.2);
                           pdf.line(xPos, currentY + 1, xPos + lineWidth, currentY + 1);
                           
                           // 为每一行都添加可点击链接
                           if (element.url) {
                             pdf.link(xPos, currentY - 6, lineWidth, 8, { url: element.url });
                           }
                           
                           currentY += lineHeight;
                         });
                         currentX = getColumnX(); // 重置X位置
                         
                         // 列表后间距
                         if (i < parsedContent.elements.length - 1) {
                           currentY += lineHeight * 0.1;
                         }
                       } else {
                         // 内联渲染超链接
                         pdf.setFont('helvetica', 'normal');
                         pdf.setTextColor(colors.text);
                         
                         const linkText = element.content;
                         const textWidth = pdf.getTextWidth(linkText);
                         const spaceWidth = pdf.getTextWidth(' ');
                         
                         // 检查是否需要换行（包括后续空格的宽度）
                         if (currentX + textWidth + spaceWidth > getColumnX() + columnWidth - 5) {
                           checkPageBreak(lineHeight);
                           currentY += lineHeight;
                           currentX = getColumnX();
                         }
                         
                         // 渲染文本
                         pdf.text(linkText, currentX, currentY);
                         
                         // 添加下划线
                         pdf.setDrawColor(colors.text);
                         pdf.setLineWidth(0.2);
                         pdf.line(currentX, currentY + 1, currentX + textWidth, currentY + 1);
                         
                         // 添加可点击链接
                         if (element.url) {
                           pdf.link(currentX, currentY - 6, textWidth, 8, { url: element.url });
                         }
                         
                         // 更新X位置，包括超链接文本和后续空格
                         currentX += textWidth;
                         
                         // 如果不是最后一个元素，添加空格
                         if (i < parsedContent.elements.length - 1) {
                           const nextElement = parsedContent.elements[i + 1];
                           // 只有当下一个元素是文本或其他内联元素时才添加空格
                           if (nextElement.type === 'text' || nextElement.type === 'link') {
                             pdf.text(' ', currentX, currentY);
                             currentX += spaceWidth;
                           }
                         }
                       }
                       break;
                      
                    case 'tag':
                      // 渲染分类标签，需要换行
                      if (currentX > getColumnX()) {
                        currentY += lineHeight;
                        currentX = getColumnX();
                      }
                      if (i > 0) {
                        currentY += lineHeight * 0.3; // 标签前间距
                      }
                      
                      pdf.setFontSize(7);
                      pdf.setFont('helvetica', 'bold');
                      pdf.setTextColor(element.tagColor || '#6B7280');
                      
                      // 绘制标签背景
                      const tagWidth = pdf.getTextWidth(element.content) + 4;
                      const tagHeight = 8;
                      pdf.setFillColor(element.tagColor || '#6B7280');
                      pdf.roundedRect(currentX, currentY - 6, tagWidth, tagHeight, 1, 1, 'F');
                      
                      // 绘制标签文字
                      pdf.setTextColor('#FFFFFF');
                      pdf.text(element.content, currentX + 2, currentY - 1);
                      currentY += lineHeight;
                      currentX = getColumnX(); // 重置X位置
                      
                      // 标签后间距
                      currentY += lineHeight * 0.2;
                      
                      // 恢复正文字体
                      pdf.setFontSize(9);
                      pdf.setFont('helvetica', 'normal');
                      pdf.setTextColor(colors.text);
                      break;
                      
                    case 'bold':
                      // 渲染粗体文本，需要换行
                      if (currentX > getColumnX()) {
                        currentY += lineHeight;
                        currentX = getColumnX();
                      }
                      if (i > 0 && parsedContent.elements[i - 1].type !== 'tag') {
                        currentY += lineHeight * 0.3; // 粗体前间距
                      }
                      
                      pdf.setFont('helvetica', 'bold');
                      const boldLines = pdf.splitTextToSize(element.content, columnWidth - 5);
                      boldLines.forEach((line: string) => {
                        checkPageBreak(lineHeight);
                        // 在checkPageBreak后重新获取正确的X位置
                        const xPos = getColumnX();
                        pdf.text(line, xPos, currentY);
                        currentY += lineHeight;
                      });
                      currentX = getColumnX(); // 重置X位置
                      
                      // 粗体后间距
                      if (i < parsedContent.elements.length - 1) {
                        currentY += lineHeight * 0.2;
                      }
                      
                      // 恢复正文字体
                      pdf.setFontSize(9);
                      pdf.setFont('helvetica', 'normal');
                      pdf.setTextColor(colors.text);
                      break;
                      
                    case 'list':
                      // 渲染列表项，需要换行
                      if (currentX > getColumnX()) {
                        currentY += lineHeight;
                        currentX = getColumnX();
                      }
                      if (i > 0) {
                        currentY += lineHeight * 0.2; // 列表前间距
                      }
                      
                      const listLines = pdf.splitTextToSize(`• ${element.content}`, columnWidth - 10);
                      listLines.forEach((line: string, lineIndex: number) => {
                        checkPageBreak(lineHeight);
                        // 在checkPageBreak后重新获取正确的X位置
                        const xPos = getColumnX() + (lineIndex === 0 ? 0 : 5);
                        pdf.text(line, xPos, currentY);
                        currentY += lineHeight;
                      });
                      currentX = getColumnX(); // 重置X位置
                      
                      // 列表后间距
                      if (i < parsedContent.elements.length - 1) {
                        currentY += lineHeight * 0.1;
                      }
                      break;
                      
                    case 'text':
                    default:
                      // 内联渲染普通文本
                      const words = element.content.split(' ');
                      for (const word of words) {
                        const wordWidth = pdf.getTextWidth(word + ' ');
                        
                        // 检查是否需要换行
                        if (currentX + wordWidth > getColumnX() + columnWidth - 5) {
                          checkPageBreak(lineHeight);
                          currentY += lineHeight;
                          currentX = getColumnX(); // 在checkPageBreak后重新获取正确的列X位置
                        }
                        
                        // 渲染单词 - 确保使用正确的列位置
                        pdf.text(word + ' ', currentX, currentY);
                        currentX += wordWidth;
                      }
                      break;
                  }
                }
                
                // 如果最后一行有内容，需要换行
                if (currentX > getColumnX()) {
                  currentY += lineHeight;
                }
              } else {
                // 回退到纯文本渲染
                const recText = cleanText(parsedContent.text || recommendation.content);
                const lines = pdf.splitTextToSize(recText, columnWidth - 5);
                
                lines.forEach((line: string) => {
                  checkPageBreak(lineHeight);
                  pdf.text(line, getColumnX(), currentY);
                  currentY += lineHeight;
                });
              }
              
              // 建议项之间添加间距
              currentY += lineHeight;
            });
          }
          
          // 每个主题结束后添加两个空行作为主题间的自然间距
          currentY += lineHeight * 2;
        });
        
        // 移除手动设置的列间距，让内容自然流动
        if (currentColumn === 1) {
          currentColumn = 0;
          // 添加适当的页面间距
          currentY += lineHeight * 2;
        } else {
          // 添加适当的页面间距
          currentY += lineHeight;
        }
      });
      
      // 添加最后一页的页脚
      addFooter();
      
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