import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import coverImageUrl from '@/images/pdf-cover-new.png';
import backImageUrl from '@/images/pdf-back-new.png';
import fvLogoUrl from '@/images/future-vision-logo.png';
import { 
  getRiskIdsByCountryAndIndustry, 
  getRisksByIds, 
  getAdviceIdsByCountryAndIndustry, 
  getAdviceByIds,
  getOrganizationIdsByCountryAndIndustry,
  getOrganizationsByIds,
  getConsiderationIdsByCountryAndIndustry,
  getConsiderationsByIds,
  getInitiativeIdsByCountryAndIndustry,
  getInitiativesByIds,
  closeDatabase
} from '../lib/database';
import { scrapeUrlContent, buildScrapeUrl, getBackendBase } from '../lib/utils';
import { parseReportHtml } from '../products/esg-risk-analysis/ReportResultNew/parseReportHtml';
import { getSectionsContent } from '../products/esg-risk-analysis/ReportResultNew/sectionsContent';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface OrganizationData {
  id: number;
  name: string;
  intro: string;
  logo: string;
  link: string;
  classification: string;
  intro_html: string;
}

interface SectionData {
  organizations: OrganizationData[];
  considerations: Array<{
    id: number;
    content: string;
    classification: string;
    content_html: string;
  }>;
  initiatives: Array<{
    id: number;
    name: string;
    intro: string;
    logo: string;
    link: string;
    classification: string;
    intro_html: string;
  }>;
  introSection: { html: string };
  payAttentionSection: { html: string };
  csrLabelsSection: { html: string };
  dueDiligenceSection: { html: string };
  aboutMvoSection: { html: string };
  contactSection: { html: string };
  disclaimerSection: { html: string };
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
  const { language } = useLanguage();
  // 中文模式下导出强制使用英文内容
  const exportLanguage = (language === 'zh-CN' || language === 'zh-HK') ? 'en-US' : language;

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

  // 获取其他板块数据（Introduction动态对齐网页）
  const fetchOtherSectionsData = async () => {
    try {
      // 获取组织数据 (CSR Section)
      const organizationIds = await getOrganizationIdsByCountryAndIndustry(countryName, industryName);
      const organizations = organizationIds.length > 0 ? await getOrganizationsByIds(organizationIds) : [];

      // 获取考虑因素数据 (Pay Attention Section)
      const considerationIds = await getConsiderationIdsByCountryAndIndustry(countryName, industryName);
      const considerations = considerationIds ? await getConsiderationsByIds(considerationIds) : [];

      // 获取倡议数据 (CSR Labels Section)
      const initiativeIds = await getInitiativeIdsByCountryAndIndustry(countryName, industryName);
      const initiatives = initiativeIds.length > 0 ? await getInitiativesByIds(initiativeIds) : [];

      // Introduction section - 通过抓取并解析网页，保持与网页一致
      let introContent = '';
      try {
        const url = buildScrapeUrl(String(industryId), String(countryId));
        const htmlContent = await scrapeUrlContent(url);
        if (htmlContent) {
          const sections = parseReportHtml(htmlContent);
          const intro = sections.find(s => s.id === 'introduction');
          if (intro && intro.html) {
            introContent = intro.html;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch introduction from web, fallback to static');
        introContent = `
          <div>
            <h2>Executive Summary</h2>
            <p>This comprehensive ESG risk analysis provides detailed insights into environmental, social, and governance factors specific to your selected country and industry combination. Our analysis covers key risk areas, regulatory considerations, and actionable recommendations to help you navigate the complex ESG landscape.</p>
            <p>The report includes risk assessments, compliance guidelines, industry-specific considerations, and strategic recommendations tailored to your operational context.</p>
          </div>
        `;
      }

      // 使用共享模块中的固定内容，确保与网页一致，且跟随语言切换
      const fixed = getSectionsContent(exportLanguage);
      const dueDiligenceContent = fixed.dueDiligenceHtml;
      const aboutMvoContent = fixed.aboutMvoHtml;
      const contactContent = fixed.contactHtml;
      const disclaimerContent = fixed.disclaimerHtml;

      return {
        organizations,
        considerations,
        initiatives,
        introSection: { html: introContent },
        payAttentionSection: { html: '' }, // Will be generated from considerations
        csrLabelsSection: { html: '' }, // Will be generated from initiatives
        dueDiligenceSection: { html: dueDiligenceContent },
        aboutMvoSection: { html: aboutMvoContent },
        contactSection: { html: contactContent },
        disclaimerSection: { html: disclaimerContent }
      };
    } catch (error) {
      console.error('Failed to fetch other sections data:', error);
      return {
        organizations: [],
        considerations: [],
        initiatives: [],
        introSection: { html: '' },
        payAttentionSection: { html: '' },
        csrLabelsSection: { html: '' },
        dueDiligenceSection: { html: '' },
        aboutMvoSection: { html: '' },
        contactSection: { html: '' },
        disclaimerSection: { html: '' }
      };
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

  // 按文本移除指定的标题标签（用于去掉意外的“Introduction”行）
  const stripHeadingByText = (html: string, headingText: string): string => {
    if (!html) return html;
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const headings = temp.querySelectorAll('h1,h2,h3,h4,h5,h6');
    headings.forEach(h => {
      const t = (h.textContent || '').trim().toLowerCase();
      if (t === headingText.toLowerCase()) {
        h.remove();
      }
    });
    return temp.innerHTML;
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
      type: 'text' | 'bold' | 'list' | 'tag' | 'link' | 'sources' | 'linebreak',
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
        
        // 处理段落与换行（用于保留文本分段）
        if (element.tagName === 'P') {
          // 递归处理段落内部内容
          for (const child of Array.from(element.childNodes)) {
            parseNode(child);
          }
          // 在段落结束处插入换行标记
          elements.push({ type: 'linebreak', content: '' });
          return;
        }
        if (element.tagName === 'BR') {
          elements.push({ type: 'linebreak', content: '' });
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
  const drawCategorySummary = (pdf: jsPDF, category: CategoryData, startY: number, pageWidth: number, margin: number, colors: any, lineHeight: number, warningIcon?: string | null): number => {
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
      
      // 绘制主题名称和警示图标
      const triangleSize = 3.5;
      const triangleX = startX; // 与themes总数左对齐
      const triangleY = themeY;
      // 使用已设计好的PNG图标替代三角形
      if (warningIcon) {
        // 尺寸与原三角形大致一致（约7x7mm），稍微留一点边距
        const iconW = triangleSize * 2;
        const iconH = triangleSize * 2;
        try {
          const isPng = warningIcon.startsWith('data:image/png');
          pdf.addImage(warningIcon, isPng ? 'PNG' : 'JPEG', triangleX - iconW / 2, triangleY - iconH / 2, iconW, iconH);
        } catch {}
      } else {
        // 兜底：若未能加载图片，仍绘制黑色三角
        pdf.setFillColor(0, 0, 0);
        pdf.setDrawColor(0, 0, 0);
        pdf.triangle(
          triangleX, triangleY - triangleSize,
          triangleX - triangleSize, triangleY + triangleSize,
          triangleX + triangleSize, triangleY + triangleSize,
          'F'
        );
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.text('!', triangleX - 0.6, triangleY + 1.2);
      }
      
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
      // 中文模式下提示仅支持英文导出
      if (language === 'zh-CN' || language === 'zh-HK') {
        const ok = window.confirm('当前仅支持英文版 PDF 导出，是否继续导出英文版？');
        if (!ok) {
          setIsGenerating(false);
          return;
        }
        // 临时强制数据库语言切换为英文，避免中文内容导致PDF乱码
        const prevLang = (window as any).__fvLanguage || localStorage.getItem('language') || 'en-US';
        (window as any).__fvLanguage = 'en-US';
        try { await closeDatabase(); } catch {}
        // 在finally中恢复
        (window as any).__fvPrevLangForPdf = prevLang;
      }

      const categories = await fetchReportData();
      const sectionsData = await fetchOtherSectionsData();
      
      if (categories.length === 0) {
        alert('没有找到相关数据，无法生成报告');
        return;
      }

      // 创建PDF文档：尽量与静态页尺寸保持一致，避免合并后大小不一致
      let pdf: jsPDF;
      let staticDocForMerge: PDFDocument | null = null;
      try {
        const staticResProbe = await fetch('/static_pages.pdf');
        if (staticResProbe.ok) {
          const staticBytesProbe = await staticResProbe.arrayBuffer();
          staticDocForMerge = await PDFDocument.load(staticBytesProbe);
          const firstPage = staticDocForMerge.getPage(0);
          const size = firstPage.getSize();
          const ptToMm = (pt: number) => pt * 0.352778; // 1pt = 0.352778mm
          const formatMm: [number, number] = [ptToMm(size.width), ptToMm(size.height)];
          pdf = new jsPDF('p', 'mm', formatMm);
        } else {
          pdf = new jsPDF('p', 'mm', 'a4');
        }
      } catch {
        pdf = new jsPDF('p', 'mm', 'a4');
      }
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 7; // 再次减小页边距，提升页面可用空间
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

      // 读取本地 logo 缓存映射（由脚本生成），优先使用本地文件路径
      let logoCacheMap: Record<string, string> | null = null;
      const loadLogoCache = async (): Promise<Record<string, string>> => {
        if (logoCacheMap) return logoCacheMap;
        try {
          const resp = await fetch('/images/reports/logo-cache.json', { cache: 'no-store' });
          if (resp.ok) {
            logoCacheMap = await resp.json();
          } else {
            logoCacheMap = {};
          }
        } catch {
          logoCacheMap = {};
        }
        return logoCacheMap!;
      };

      // 工具：将图片URL转换为DataURL，便于jsPDF嵌入
      const toDataUrl = async (url: string): Promise<string | null> => {
        try {
          if (!url) return null;
          // 优先映射为本地缓存路径
          const cache = await loadLogoCache();
          if (cache[url]) {
            url = cache[url];
          }
          // 外链通过代理拉取，避免跨域与混合内容
          let fetchUrl = url;
          if (/^https?:\/\//.test(url)) {
            const { type, base } = getBackendBase();
            const proxyBase = type === 'same-origin' ? `${base}/image` : `${base}/proxy/image`;
            const u = new URL(proxyBase, window.location.origin);
            u.searchParams.set('url', url);
            fetchUrl = u.toString();
          }
          const res = await fetch(fetchUrl, { cache: 'no-store' });
          if (!res.ok) return null;
          const blob = await res.blob();
          // 将 blob 转为 dataURL；若为 SVG/WEBP，则转为 PNG
          const rawDataUrl: string | null = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(String(reader.result));
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
          if (!rawDataUrl) return null;
          const isSvg = blob.type.includes('image/svg');
          const isWebp = blob.type.includes('image/webp');
          if (isSvg || isWebp) {
            try {
              return await new Promise<string>((resolve2) => {
                const img = new Image();
                img.onload = () => {
                  const naturalW = img.naturalWidth || img.width;
                  const naturalH = img.naturalHeight || img.height;
                  if (!naturalW || !naturalH) {
                    // 无法获取自然尺寸，直接回退原始dataURL，避免错误拉伸
                    resolve2(rawDataUrl);
                    return;
                  }
                  const aspect = naturalH / naturalW; // 保留真实长宽比
                  const maxW = 140; // 控制PNG大小，避免过大
                  const targetW = Math.min(maxW, naturalW);
                  const targetH = Math.max(1, Math.round(targetW * aspect));
                  const canvas = document.createElement('canvas');
                  canvas.width = targetW;
                  canvas.height = targetH;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) {
                    resolve2(rawDataUrl);
                    return;
                  }
                  ctx.clearRect(0, 0, targetW, targetH);
                  // 按真实比例绘制到目标尺寸
                  ctx.drawImage(img, 0, 0, targetW, targetH);
                  const pngUrl = canvas.toDataURL('image/png');
                  resolve2(pngUrl);
                };
                img.onerror = () => resolve2(rawDataUrl);
                img.src = rawDataUrl;
              });
            } catch {
              return rawDataUrl;
            }
          }
          return rawDataUrl;
        } catch (e) {
          return null;
        }
      };

      // 预加载 Introduction 板块的四个小图标（从 public/images/graphs）
      const introIcons: {
        title: string | null;
        industry: string | null;
        country: string | null;
        detailed: string | null;
      } = {
        title: await toDataUrl('/images/graphs/introduction-title.png'),
        industry: await toDataUrl('/images/graphs/introduction-industry.png'),
        country: await toDataUrl('/images/graphs/introduction-country.png'),
        detailed: await toDataUrl('/images/graphs/introduction-detailed.png')
      };

      // 预加载 Risk Analysis 标题图标
      const riskTitleIcon = await toDataUrl('/images/graphs/risk-title.png');

      // 简易图标绘制：在给定位置绘制 dataURL 图片，带兜底
      const drawIcon = (dataUrl: string | null, x: number, y: number, w: number, h: number) => {
        if (!dataUrl) return;
        try {
          const isPng = dataUrl.startsWith('data:image/png');
          pdf.addImage(dataUrl, isPng ? 'PNG' : 'JPEG', x, y, w, h);
        } catch {}
      };

      // 分析logo图像，给出容器推荐背景色（RGB）
      const analyzeLogoBg = async (dataUrl: string): Promise<[number, number, number]> => {
        try {
          const img = new Image();
          const loaded = await new Promise<boolean>((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = dataUrl;
          });
          if (!loaded) return [229, 231, 235];
          const naturalW = img.naturalWidth || img.width || 0;
          const naturalH = img.naturalHeight || img.height || 0;
          if (!naturalW || !naturalH) return [229, 231, 235];
          const sampleW = Math.min(80, naturalW);
          const sampleH = Math.max(1, Math.round(sampleW * (naturalH / naturalW)));
          const canvas = document.createElement('canvas');
          canvas.width = sampleW; canvas.height = sampleH;
          const ctx = canvas.getContext('2d');
          if (!ctx) return [229, 231, 235];
          ctx.drawImage(img, 0, 0, sampleW, sampleH);
          const { data } = ctx.getImageData(0, 0, sampleW, sampleH);
          let edgeAlphaSum = 0, edgeCount = 0;
          let nonTransparentBrightnessSum = 0, nonTransparentCount = 0;
          let cornerBrightnessSum = 0, cornerCount = 0;
          const alphaAt = (i: number) => data[i + 3] / 255;
          const brightAt = (i: number) => {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            return 0.299 * r + 0.587 * g + 0.114 * b;
          };
          for (let y = 0; y < sampleH; y++) {
            for (let x = 0; x < sampleW; x++) {
              const idx = (y * sampleW + x) * 4;
              const a = alphaAt(idx);
              const br = brightAt(idx);
              // 边缘区域（3px内）用于估计背景是否透明
              if (x < 3 || x >= sampleW - 3 || y < 3 || y >= sampleH - 3) {
                edgeAlphaSum += a; edgeCount++;
                // 角落区域用于估计不透明背景的亮度
                const isCorner = (x < 3 && y < 3) || (x < 3 && y >= sampleH - 3) || (x >= sampleW - 3 && y < 3) || (x >= sampleW - 3 && y >= sampleH - 3);
                if (isCorner && a > 0.95) { cornerBrightnessSum += br; cornerCount++; }
              }
              if (a > 0.2) { nonTransparentBrightnessSum += br; nonTransparentCount++; }
            }
          }
          const edgeAlphaAvg = edgeCount ? edgeAlphaSum / edgeCount : 1;
          const nonTransBrightAvg = nonTransparentCount ? nonTransparentBrightnessSum / nonTransparentCount : 128;
          const cornerBrightAvg = cornerCount ? cornerBrightnessSum / cornerCount : 255;
          // 判定逻辑：
          // 1) Opaque且角落很亮 => 白底图，容器用白色避免双层背景
          if (edgeAlphaAvg > 0.95 && cornerBrightAvg > 240) return [255, 255, 255];
          // 2) 透明且前景偏亮（白色logo） => 用更深的灰提升对比
          if (edgeAlphaAvg < 0.2 && nonTransBrightAvg > 200) return [209, 213, 219];
          // 3) 透明且前景偏暗 => 用极浅灰或白
          if (edgeAlphaAvg < 0.2 && nonTransBrightAvg < 90) return [247, 247, 247];
          // 默认浅灰
          return [229, 231, 235];
        } catch {
          return [229, 231, 235];
        }
      };

      // 预加载组织logo，构建映射
      const resolveLogoUrl = (raw?: string): string | null => {
        if (!raw) return null;
        if (/^https?:\/\//.test(raw)) return raw;
        if (raw.startsWith('/')) return raw;
        // 尝试常见位置：/images/ 与原字符串
        return `/images/${raw}`;
      };

      const orgLogoInfoMap: Record<number, { dataUrl: string; w: number; h: number; bg?: [number, number, number] } | null> = {};
      if (sectionsData && sectionsData.organizations) {
        await Promise.all(sectionsData.organizations.map(async (o) => {
          const url = resolveLogoUrl(o.logo) || '';
          const dataUrl = url ? await toDataUrl(url) : null;
          if (dataUrl) {
            // 读取原始像素尺寸，用于保持等比缩放
            let iw = 0, ih = 0;
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => { iw = img.naturalWidth || img.width || 0; ih = img.naturalHeight || img.height || 0; resolve(); };
              img.onerror = () => resolve();
              img.src = dataUrl;
            });
            if (!iw || !ih) { iw = 140; ih = 100; }
            const bg = await analyzeLogoBg(dataUrl);
            orgLogoInfoMap[o.id] = { dataUrl, w: iw, h: ih, bg };
          } else {
            orgLogoInfoMap[o.id] = null;
          }
        }));
      }

      // 预加载倡议（Labels/Initiatives）logo，构建映射
      const initiativeLogoInfoMap: Record<number, { dataUrl: string; w: number; h: number; bg?: [number, number, number] } | null> = {};
      if (sectionsData && sectionsData.initiatives) {
        await Promise.all(sectionsData.initiatives.map(async (it) => {
          const url = resolveLogoUrl(it.logo) || '';
          const dataUrl = url ? await toDataUrl(url) : null;
          if (dataUrl) {
            let iw = 0, ih = 0;
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => { iw = img.naturalWidth || img.width || 0; ih = img.naturalHeight || img.height || 0; resolve(); };
              img.onerror = () => resolve();
              img.src = dataUrl;
            });
            if (!iw || !ih) { iw = 140; ih = 100; }
            const bg = await analyzeLogoBg(dataUrl);
            initiativeLogoInfoMap[it.id] = { dataUrl, w: iw, h: ih, bg };
          } else {
            initiativeLogoInfoMap[it.id] = null;
          }
        }));
      }

      // 添加封面页
      try {
        const coverImg = new Image();
        coverImg.src = coverImageUrl;
        await new Promise((resolve, reject) => {
          coverImg.onload = resolve;
          coverImg.onerror = reject;
        });
        pdf.addImage(coverImg, 'PNG', 0, 0, pageWidth, pageHeight);
      } catch (error) {
        console.warn('封面图片加载失败，跳过封面页');
      }

      // 添加新页面开始内容
      pdf.addPage();
      currentY = margin;
      
      // 预加载页脚Logo（Future Vision）供所有页面复用
      const fvFooterLogoUrl = await toDataUrl(fvLogoUrl);
      let fvFooterLogoAspect = 1; // w/h
      if (fvFooterLogoUrl) {
        try {
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = fvFooterLogoUrl;
          });
          const w = img.naturalWidth || img.width || 0;
          const h = img.naturalHeight || img.height || 0;
          if (w && h) fvFooterLogoAspect = w / h;
        } catch {}
      }

      // 添加页脚函数：除封面与尾页外均绘制左Logo、底中网址、右页码
      const addFooter = () => {
        try {
          const currentPage = pdf.getNumberOfPages();
          // 约定：封面是第1页，尾页由合并阶段追加；此处仅对当前jsPDF页面绘制
          if (currentPage <= 1) return; // 跳过封面
          const footerY = pageHeight - margin + 1.2; // 再次贴近底部
          // 左下角：FV Logo（固定高度，按比例缩放宽度）
          if (fvFooterLogoUrl) {
            const logoH = 13; // 保持大小
            const logoW = Math.max(6, Math.round(logoH * fvFooterLogoAspect));
            const isPng = fvFooterLogoUrl.startsWith('data:image/png');
            try {
              // 进一步向下移动，使其相对文字更低一些
              pdf.addImage(fvFooterLogoUrl, isPng ? 'PNG' : 'JPEG', margin, footerY - logoH + 5, logoW, logoH);
            } catch {}
          }
          // 底部居中：网址
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(60, 60, 60);
          pdf.text('www.mscfv.com', pageWidth / 2, footerY - 0.05, { align: 'center' });
          // 右下角：页码（当前页）
          pdf.setFontSize(8);
          pdf.setTextColor(80, 80, 80);
          pdf.text(String(currentPage), pageWidth - margin, footerY - 0.05, { align: 'right' });
        } catch {}
      };
      
      // 添加标题 - 移除，因为参考样例中没有总标题
      // 直接从第一个议题开始
      
      // 单/双列模式控制：风险板块采用双列，其余板块采用单列
      let singleColumnMode = false;

      // 检查换页（支持单列模式：不做列切换，直接换页）
      const checkPageBreak = (additionalHeight: number = 0) => {
        if (currentY + additionalHeight > pageHeight - margin - 15) {
          if (!singleColumnMode && currentColumn === 0) {
            // 双列：从左列切换到右列
            currentColumn = 1;
            currentY = categoryStartY;
          } else {
            // 单列或双列右列：直接换页
            addFooter();
            pdf.addPage();
            currentColumn = 0;
            currentY = margin;
            categoryStartY = margin;
            // 重新设置正文字体，避免使用页脚字体
            pdf.setFontSize(8); // 统一为8号字体
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
          pdf.setFontSize(8); // 统一为8号字体
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.text);
        }
      };
      
      const getColumnX = () => {
        return currentColumn === 0 ? margin : margin * 2 + columnWidth;
      };
      
      // 辅助函数：将十六进制颜色转换为RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };

      // 规范化文本：清除不可见空格/软连字符，统一连字符/空格，避免PDF排版异常
      const normalizeText = (input: string): string => {
        if (!input) return '';
        return input
          // 将各种空格归一化为普通空格
          .replace(/[\u00A0\u202F\u2000-\u200B]/g, ' ')
          // 将软连字符和非断行连字符替换为普通连字符
          .replace(/[\u00AD\u2010\u2011]/g, '-')
          // 统一中文全角连字符等为半角
          .replace(/[\uFF0D]/g, '-')
          // 收敛连续空格
          .replace(/\s{2,}/g, ' ')
          .trim();
      };

      // 渲染组织卡片（修复：logo显示、正文链接行内与可点击、分页）
      const renderOrganizationCard = (org: OrganizationData) => {
        const parsed = parseHtmlContent(org.intro_html, org.classification, countryName, industryName);
        // 标题回退策略：优先 org.name；否则取首个粗体；否则从链接域名；再否则“Untitled”
        const deriveTitle = (): string => {
          const primary = (org.name || '').trim();
          if (primary) return primary;
          const bold = parsed.elements?.find(e => e.type === 'bold' && e.content.trim());
          if (bold) return bold.content.trim();
          const url = (org.link || '').trim();
          if (url) {
            try { const u = new URL(url); return u.hostname; } catch {}
            return url;
          }
          return 'Untitled';
        };
        const titleText = deriveTitle();
        const horizontalPadding = 12;
        const contentWidth = pageWidth - margin * 2 - horizontalPadding * 2;
        const cardPaddingTop = 6;
        const cardPaddingBottom = 8;
        const contentMarginX = margin + horizontalPadding;
        // 顶部logo容器尺寸（更小且等比显示），并据此动态计算标题区高度
        const logoW = 60; // 之前为120，过大导致视觉压迫
        const logoH = 21; // 之前为36，适当减小高度
        const computedHeaderHeight = logoH + 24; // logo高度 + 胶囊与标题留白，避免与正文重叠

        // 将正文合并为“段落+链接位置”，列表保持单独行
        const blocks: Array<{
          kind: 'paragraph' | 'list' | 'bold';
          content: string;
          indent?: number;
          links?: Array<{ text: string; url: string }>;
        }> = [];

        if (parsed.elements && parsed.elements.length > 0) {
          let paraText = '';
          let paraLinks: Array<{ text: string; url: string }> = [];
          const flushPara = () => {
            if (paraText.trim()) {
              blocks.push({ kind: 'paragraph', content: paraText.trim(), indent: 0, links: paraLinks.slice() });
            }
            paraText = '';
            paraLinks = [];
          };

          parsed.elements.forEach((el) => {
            if (el.type === 'list') {
              flushPara();
              blocks.push({ kind: 'list', content: normalizeText(el.content), indent: 5 });
            } else if (el.type === 'bold') {
              flushPara();
              blocks.push({ kind: 'bold', content: normalizeText(el.content) });
            } else if (el.type === 'linebreak') {
              // 段落边界：遇到换行标记立即换段
              flushPara();
            } else if (el.type === 'link') {
              if (paraText && !/\s$/.test(paraText)) paraText += ' ';
              paraText += normalizeText(el.content);
              const url = (el as any).url || '';
              if (url) paraLinks.push({ text: normalizeText(el.content), url });
              paraText += ' ';
            } else {
              if (paraText && !/\s$/.test(paraText)) paraText += ' ';
              paraText += normalizeText(el.content);
            }
          });
          // 在入块前统一规范化段落文本
          paraText = normalizeText(paraText);
          flushPara();
        }

        let pointer = 0;
        let firstPage = true;

        while (pointer < blocks.length || firstPage) {
          const headerH = firstPage ? computedHeaderHeight : 0;
          // 当页面可用高度过小时，先分页
          let availableHeight = pageHeight - margin - 15 - currentY - cardPaddingTop - cardPaddingBottom - headerH;
          if (availableHeight < 20) {
            // 页面底部空间不足，在绘制标题前先分页，但保持这是卡片的首页
            addFooter();
            pdf.addPage();
            currentY = margin;
            // 保持 firstPage = true，确保新页仍绘制标题与logo
            firstPage = true;
            availableHeight = pageHeight - margin - 15 - currentY - cardPaddingTop - cardPaddingBottom - headerH;
          }

          // 预估本页高度：按块拆分后估计行数（使用一致的字体设置，避免误差）
          let consumedHeight = 0;
          let count = 0; // 本页将渲染的行计数
          const tempPdf = new jsPDF();
          // 简单估算：每个块拆成行数
          for (let bi = pointer; bi < blocks.length; bi++) {
            const b = blocks[bi];
            let lines: string[] = [];
            if (b.kind === 'list') {
              tempPdf.setFontSize(10);
              tempPdf.setFont('helvetica', 'normal');
              lines = tempPdf.splitTextToSize(`• ${b.content}`, contentWidth - (b.indent || 0)) as string[];
            } else if (b.kind === 'bold') {
              tempPdf.setFontSize(10);
              tempPdf.setFont('helvetica', 'bold');
              lines = tempPdf.splitTextToSize(b.content, contentWidth) as string[];
            } else {
              tempPdf.setFontSize(10);
              tempPdf.setFont('helvetica', 'normal');
              lines = tempPdf.splitTextToSize(b.content, contentWidth) as string[];
            }
            const needH = lines.length * 6; // 每行约6mm高度（进一步压缩行距）
            if (consumedHeight + needH > availableHeight) break;
            consumedHeight += needH;
            count += lines.length;
            // 为简化估算：一旦超过高度，停止
          }
          // 预留1行安全余量，避免绘制时出现轻微溢出
          consumedHeight = Math.min(consumedHeight, Math.max(0, availableHeight - 9));

          // 如果由于页底空间太小导致本页无法容纳任何正文，则先换页
          if (count === 0 && pointer < blocks.length) {
            // 当前页无法容纳任何正文，在标题尚未绘制前先换到新页，仍保留为首页
            addFooter();
            pdf.addPage();
            currentY = margin;
            firstPage = true;
            continue;
          }

          // 绘制卡片背景（按页分段）
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(229, 231, 235);
          pdf.setLineWidth(0.5);
          const rectHeight = headerH + consumedHeight + cardPaddingTop + cardPaddingBottom;
          pdf.roundedRect(margin, currentY, pageWidth - margin * 2, rectHeight, 6, 6, 'FD');

          // 首页绘制标题与装饰
          if (firstPage) {
            // 顶部Logo容器：浅灰圆角矩形，居中于名称列（缩小尺寸，保持等比）
            const logoX = contentMarginX + (contentWidth - logoW) / 2;
            const logoY = currentY + cardPaddingTop + 4;
            const info = orgLogoInfoMap[org.id];
            if (info && info.dataUrl) {
              try {
                const ratio = info.w > 0 ? info.h / info.w : 0.75; // h/w
                const pad = 2; // 轻微内边距，避免紧贴容器边缘
                // 优先以“宽度”适配，避免宽图被横向压缩
                let drawW = logoW - pad;
                let drawH = drawW * (ratio || 0.75);
                // 若高度超出容器，则改为以高度适配
                if (drawH > logoH - pad) {
                  drawH = logoH - pad;
                  drawW = drawH / (ratio || 0.75);
                }
                const cx = logoX + (logoW - drawW) / 2;
                const cy = logoY + (logoH - drawH) / 2;
                const isPng = info.dataUrl.startsWith('data:image/png');
                // 背景根据logo特性自适应
                const bg = info.bg || [229, 231, 235];
                pdf.setFillColor(bg[0], bg[1], bg[2]);
                pdf.setDrawColor(209, 213, 219);
                pdf.setLineWidth(0.3);
                pdf.roundedRect(logoX, logoY, logoW, logoH, 6, 6, 'FD');
                pdf.addImage(info.dataUrl, isPng ? 'PNG' : 'JPEG', cx, cy, drawW, drawH);
              } catch (e) {
                const bg = info.bg || [229, 231, 235];
                pdf.setFillColor(bg[0], bg[1], bg[2]);
                pdf.setDrawColor(209, 213, 219);
                pdf.setLineWidth(0.3);
                pdf.roundedRect(logoX, logoY, logoW, logoH, 8, 8, 'FD');
              }
            } else {
              pdf.setFillColor(229, 231, 235);
              pdf.setDrawColor(209, 213, 219);
              pdf.setLineWidth(0.3);
              pdf.roundedRect(logoX, logoY, logoW, logoH, 8, 8, 'FD');
            }

            // 左侧蓝色小胶囊（缩短并左移）
            const pillX = contentMarginX - 5;
            const pillY = logoY + logoH + 5; // 缩短标题与胶囊的间距
            // 颜色稍微调浅（接近 indigo-200）
            pdf.setFillColor(199, 210, 254);
            pdf.roundedRect(pillX, pillY, 11, 8, 1, 1, 'F');

            // 名称与正文左对齐
            const nameX = contentMarginX;
            const nameY = pillY + 6;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(17, 24, 39);
            const titleLink = (org.link || (parsed.elements?.find(e => e.type === 'link' && (e as any).url)?.url as string) || '').trim();
            // 标题统一黑色加粗；若存在链接，仅添加可点击区域，不改变样式
            pdf.setTextColor(17, 24, 39);
            pdf.text(titleText, nameX, nameY);
            const nameWidth = pdf.getTextWidth(titleText);
            if (titleLink) {
              pdf.link(nameX, nameY - 5, nameWidth, 8, { url: titleLink });
            }
          }

          // 渲染正文块（段落行内分段渲染链接，避免重叠）
          let bodyY = currentY + headerH + cardPaddingTop;
          let nextPointer = pointer;
          for (let bi = pointer; bi < blocks.length; bi++) {
            const b = blocks[bi];
            if (bodyY + 6 > currentY + rectHeight) break; // 超出本页卡片高度则停止

            if (b.kind === 'bold') {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(17, 24, 39);
              const lines = pdf.splitTextToSize(normalizeText(b.content), contentWidth) as string[];
              lines.forEach((ln) => {
                pdf.text(ln, contentMarginX, bodyY);
                bodyY += 6;
              });
              continue;
            }

            if (b.kind === 'list') {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              const lines = pdf.splitTextToSize(`• ${normalizeText(b.content)}`, contentWidth - (b.indent || 0)) as string[];
              pdf.setTextColor(75, 85, 99);
              lines.forEach((ln) => {
                pdf.text(ln, contentMarginX + (b.indent || 0), bodyY);
                bodyY += 6;
              });
              continue;
            }

            // 段落：逐行渲染并在本页高度耗尽时截断，防止溢出
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(normalizeText(b.content), contentWidth) as string[];
            let consumedAllParagraph = true;
            for (const ln of lines) {
              if (bodyY + 6 > currentY + rectHeight) { consumedAllParagraph = false; break; }
              let cursorX = contentMarginX + (b.indent || 0);
              const positions: Array<{ start: number; len: number; url: string }> = [];
              (b.links || []).forEach(l => {
                const normText = normalizeText(l.text);
                const idx = ln.indexOf(normText);
                if (idx >= 0) positions.push({ start: idx, len: l.text.length, url: l.url });
              });
              if (positions.length === 0) {
                pdf.setTextColor(75, 85, 99);
                pdf.text(ln, cursorX, bodyY);
              } else {
                positions.sort((a, b) => a.start - b.start);
                let from = 0;
                positions.forEach(p => {
                  const pre = ln.slice(from, p.start);
                  if (pre) { pdf.setTextColor(75, 85, 99); pdf.text(pre, cursorX, bodyY); cursorX += pdf.getTextWidth(pre); }
                  const mid = ln.slice(p.start, p.start + p.len);
                  if (mid) {
                    pdf.setTextColor(75, 85, 99);
                    pdf.text(mid, cursorX, bodyY);
                    const lw = pdf.getTextWidth(mid);
                    pdf.setDrawColor(75, 85, 99);
                    pdf.line(cursorX, bodyY + 1, cursorX + lw, bodyY + 1);
                    pdf.link(cursorX, bodyY - 5, lw, 8, { url: p.url });
                    cursorX += lw;
                  }
                  from = p.start + p.len;
                });
                const tail = ln.slice(from);
                if (tail) { pdf.setTextColor(75, 85, 99); pdf.text(tail, cursorX, bodyY); }
              }
              bodyY += 6;
            }
            nextPointer = consumedAllParagraph ? bi + 1 : bi;
            if (!consumedAllParagraph) break;
          }

          // 更新位置与状态
          currentY = currentY + rectHeight;
          pointer = nextPointer; // 跳到下一未渲染块
          if (pointer < blocks.length) {
            addFooter();
            pdf.addPage();
            currentY = margin;
            firstPage = false;
          } else {
            // 完成卡片，适当增大卡片间距
            currentY += 6;
            break;
          }
        }
      };

      // 渲染倡议卡片（统一与组织卡片：左侧logo、黑色加粗标题、段落与行内链接、分页）
      const renderInitiativeCard = (initiative: any) => {
        const parsed = parseHtmlContent(initiative.intro_html, initiative.classification, countryName, industryName);
        const deriveTitle = (): string => {
          const primary = (initiative.name || '').trim();
          if (primary) return primary;
          const bold = parsed.elements?.find(e => e.type === 'bold' && e.content.trim());
          if (bold) return bold.content.trim();
          const url = (initiative.link || '').trim();
          if (url) { try { const u = new URL(url); return u.hostname; } catch {} return url; }
          return 'Untitled';
        };
        const titleText = deriveTitle();
        const headerHeight = 34;
        const horizontalPadding = 12;
        const contentWidth = pageWidth - margin * 2 - horizontalPadding * 2;
        const cardPaddingTop = 6;
        const cardPaddingBottom = 8;
        const contentMarginX = margin + horizontalPadding;
        const logoW = 60;
        const logoH = 21;
        const computedHeaderHeight = logoH + 24; // 增加标题与正文的间距，匹配组织卡片的舒适度

        const blocks: Array<{ kind: 'paragraph' | 'list' | 'bold'; content: string; indent?: number; links?: Array<{ text: string; url: string }>; }> = [];
        if (parsed.elements && parsed.elements.length > 0) {
          let paraText = '';
          let paraLinks: Array<{ text: string; url: string }> = [];
          const flushPara = () => {
            if (paraText.trim()) {
              blocks.push({ kind: 'paragraph', content: paraText.trim(), indent: 0, links: paraLinks.slice() });
            }
            paraText = '';
            paraLinks = [];
          };
          parsed.elements.forEach((el) => {
            if (el.type === 'list') {
              flushPara();
              blocks.push({ kind: 'list', content: el.content, indent: 5 });
            } else if (el.type === 'bold') {
              flushPara();
              blocks.push({ kind: 'bold', content: el.content });
            } else if (el.type === 'linebreak') {
              flushPara();
            } else if (el.type === 'link') {
              if (paraText && !/\s$/.test(paraText)) paraText += ' ';
              paraText += el.content;
              const url = (el as any).url || '';
              if (url) paraLinks.push({ text: el.content, url });
              paraText += ' ';
            } else {
              if (paraText && !/\s$/.test(paraText)) paraText += ' ';
              paraText += el.content;
            }
          });
          flushPara();
        }

        let pointer = 0;
        let firstPage = true;
        while (pointer < blocks.length || firstPage) {
          const headerH = firstPage ? computedHeaderHeight : 0;
          let availableHeight = pageHeight - margin - 15 - currentY - cardPaddingTop - cardPaddingBottom - headerH;
          if (availableHeight < 20) {
            addFooter();
            pdf.addPage();
            currentY = margin;
            firstPage = true; // 保持首页以绘制标题与logo
            availableHeight = pageHeight - margin - 15 - currentY - cardPaddingTop - cardPaddingBottom - headerH;
          }

          let consumedHeight = 0;
          let countLines = 0;
          const tempPdf = new jsPDF();
          for (let bi = pointer; bi < blocks.length; bi++) {
            const b = blocks[bi];
            let lines: string[] = [];
            if (b.kind === 'list') {
              tempPdf.setFontSize(10);
              tempPdf.setFont('helvetica', 'normal');
              lines = tempPdf.splitTextToSize(`• ${b.content}`, contentWidth - (b.indent || 0)) as string[];
            } else if (b.kind === 'bold') {
              tempPdf.setFontSize(10);
              tempPdf.setFont('helvetica', 'bold');
              lines = tempPdf.splitTextToSize(b.content, contentWidth) as string[];
            } else {
              tempPdf.setFontSize(10);
              tempPdf.setFont('helvetica', 'normal');
              lines = tempPdf.splitTextToSize(b.content, contentWidth) as string[];
            }
            const needH = lines.length * 6;
            if (consumedHeight + needH > availableHeight) break;
            consumedHeight += needH;
            countLines += lines.length;
          }
          consumedHeight = Math.min(consumedHeight, Math.max(0, availableHeight - 9));

          if (countLines === 0 && pointer < blocks.length) {
            addFooter();
            pdf.addPage();
            currentY = margin;
            firstPage = true;
            continue;
          }

          // 背景（分段）
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(229, 231, 235);
          pdf.setLineWidth(0.5);
          const rectHeight = headerH + consumedHeight + cardPaddingTop + cardPaddingBottom;
          pdf.roundedRect(margin, currentY, pageWidth - margin * 2, rectHeight, 6, 6, 'FD');

          // 首页：居中logo容器 + 左侧浅蓝胶囊 + 黑色加粗标题（可点击但不改变样式）
          if (firstPage) {
            const logoX = contentMarginX + (contentWidth - logoW) / 2;
            const logoY = currentY + cardPaddingTop + 4;
            const info = initiativeLogoInfoMap[initiative.id];
            if (info && info.dataUrl) {
              try {
                const ratio = info.w > 0 ? info.h / info.w : 0.75; // h/w
                const pad = 2;
                // 宽度优先适配，减少宽图被横向压缩的观感
                let drawW = logoW - pad;
                let drawH = drawW * (ratio || 0.75);
                if (drawH > logoH - pad) {
                  drawH = logoH - pad;
                  drawW = drawH / (ratio || 0.75);
                }
                const cx = logoX + (logoW - drawW) / 2;
                const cy = logoY + (logoH - drawH) / 2;
                const isPng = info.dataUrl.startsWith('data:image/png');
                const bg = info.bg || [229, 231, 235];
                pdf.setFillColor(bg[0], bg[1], bg[2]);
                pdf.setDrawColor(209, 213, 219);
                pdf.setLineWidth(0.3);
                pdf.roundedRect(logoX, logoY, logoW, logoH, 6, 6, 'FD');
                pdf.addImage(info.dataUrl, isPng ? 'PNG' : 'JPEG', cx, cy, drawW, drawH);
              } catch {
                const bg = info.bg || [229, 231, 235];
                pdf.setFillColor(bg[0], bg[1], bg[2]);
                pdf.setDrawColor(209, 213, 219);
                pdf.setLineWidth(0.3);
                pdf.roundedRect(logoX, logoY, logoW, logoH, 6, 6, 'FD');
              }
            } else {
              pdf.setFillColor(229, 231, 235);
              pdf.setDrawColor(209, 213, 219);
              pdf.setLineWidth(0.3);
              pdf.roundedRect(logoX, logoY, logoW, logoH, 6, 6, 'FD');
            }

            const pillX = contentMarginX - 5;
            const pillY = logoY + logoH + 5;
            // ESG labels板块卡片标题左侧色块改为偏紫（violet-300）以区别组织卡片
            pdf.setFillColor(196, 181, 253);
            pdf.roundedRect(pillX, pillY, 11, 8, 1, 1, 'F');

            const nameX = contentMarginX;
            const nameY = pillY + 6;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            const titleLink = (initiative.link || (parsed.elements?.find(e => e.type === 'link' && (e as any).url)?.url as string) || '').trim();
            pdf.setTextColor(17, 24, 39);
            pdf.text(titleText, nameX, nameY);
            const nameWidth = pdf.getTextWidth(titleText);
            if (titleLink) {
              pdf.link(nameX, nameY - 5, nameWidth, 8, { url: titleLink });
            }
          }

          // 正文块渲染（与组织卡片一致：粗体、列表、段落内联链接）
          let bodyY = currentY + headerH + cardPaddingTop;
          let nextPointer = pointer;
          for (let bi = pointer; bi < blocks.length; bi++) {
            const b = blocks[bi];
            if (bodyY + 6 > currentY + rectHeight) break;

            if (b.kind === 'bold') {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(17, 24, 39);
              const lines = pdf.splitTextToSize(b.content, contentWidth) as string[];
              lines.forEach((ln) => { pdf.text(ln, contentMarginX, bodyY); bodyY += 6; });
              continue;
            }

            if (b.kind === 'list') {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              const lines = pdf.splitTextToSize(`• ${b.content}`, contentWidth - (b.indent || 0)) as string[];
              pdf.setTextColor(75, 85, 99);
              lines.forEach((ln) => { pdf.text(ln, contentMarginX + (b.indent || 0), bodyY); bodyY += 6; });
              continue;
            }

            // 段落：行内渲染链接
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const lines = pdf.splitTextToSize(b.content, contentWidth) as string[];
            {
              let consumedAllParagraph = true;
              for (const ln of lines) {
                if (bodyY + 6 > currentY + rectHeight) { consumedAllParagraph = false; break; }
              let cursorX = contentMarginX + (b.indent || 0);
              const positions: Array<{ start: number; len: number; url: string }> = [];
              (b.links || []).forEach(l => { const idx = ln.indexOf(l.text); if (idx >= 0) positions.push({ start: idx, len: l.text.length, url: l.url }); });
              if (positions.length === 0) {
                pdf.setTextColor(75, 85, 99);
                pdf.text(ln, cursorX, bodyY);
              } else {
                positions.sort((a, b) => a.start - b.start);
                let from = 0;
                positions.forEach(p => {
                  const pre = ln.slice(from, p.start);
                  if (pre) { pdf.setTextColor(75, 85, 99); pdf.text(pre, cursorX, bodyY); cursorX += pdf.getTextWidth(pre); }
                  const mid = ln.slice(p.start, p.start + p.len);
                  if (mid) {
                    // 链接文本统一灰色
                    pdf.setTextColor(75, 85, 99);
                    pdf.text(mid, cursorX, bodyY);
                    const lw = pdf.getTextWidth(mid);
                    // 下划线使用灰色
                    pdf.setDrawColor(75, 85, 99);
                    pdf.line(cursorX, bodyY + 1, cursorX + lw, bodyY + 1);
                    pdf.link(cursorX, bodyY - 5, lw, 8, { url: p.url });
                    cursorX += lw;
                  }
                  from = p.start + p.len;
                });
                const tail = ln.slice(from);
                if (tail) { pdf.setTextColor(75, 85, 99); pdf.text(tail, cursorX, bodyY); }
              }
                bodyY += 6;
              }
              nextPointer = consumedAllParagraph ? bi + 1 : bi;
              if (!consumedAllParagraph) break;
            }
          }

          currentY = currentY + rectHeight;
          pointer = nextPointer;
          if (pointer < blocks.length) {
            addFooter();
            pdf.addPage();
            currentY = margin;
            firstPage = false;
          } else {
            currentY += 8; // 适当增大卡片间距
            break;
          }
        }
      };
        

      // 主题配色映射（近似网页主题色）
      const getSectionTheme = (title: string) => {
        const themes: Record<string, { titleBg: [number, number, number]; accent: [number, number, number]; cardBg: [number, number, number]; cardBorder: [number, number, number] }> = {
          'ESG Risk Analysis Report': { titleBg: [239, 246, 255], accent: [79, 70, 229], cardBg: [239, 246, 255], cardBorder: [219, 234, 254] }, // indigo/blue
          'Important to Consider': { titleBg: [255, 247, 237], accent: [245, 158, 11], cardBg: [255, 247, 237], cardBorder: [254, 215, 165] }, // amber/orange
          'Risk Analysis': { titleBg: [254, 242, 242], accent: [220, 38, 38], cardBg: [254, 242, 242], cardBorder: [254, 202, 202] }, // red
          'Relevant Organizations': { titleBg: [236, 253, 245], accent: [5, 150, 105], cardBg: [236, 253, 245], cardBorder: [209, 250, 229] }, // emerald/teal
          'ESG Labels & Supply Chain Initiatives Guidelines': { titleBg: [236, 254, 255], accent: [8, 145, 178], cardBg: [236, 254, 255], cardBorder: [207, 250, 254] }, // cyan/blue
          'Due Diligence': { titleBg: [240, 253, 250], accent: [13, 148, 136], cardBg: [240, 253, 250], cardBorder: [204, 251, 241] }, // teal
          'About Us': { titleBg: [245, 243, 255], accent: [147, 51, 234], cardBg: [245, 243, 255], cardBorder: [233, 213, 255] }, // purple/blue
          'Contact Information': { titleBg: [239, 246, 255], accent: [37, 99, 235], cardBg: [239, 246, 255], cardBorder: [219, 234, 254] }, // blue/cyan
          'Disclaimer': { titleBg: [249, 250, 251], accent: [245, 158, 11], cardBg: [249, 250, 251], cardBorder: [229, 231, 235] } // gray + orange accent
        };
        return themes[title] || { titleBg: [240, 248, 255], accent: [59, 130, 246], cardBg: [249, 250, 251], cardBorder: [229, 231, 235] };
      };

      // 渲染板块标题的函数（支持副标题并扩大背景高度，避免溢出）
      const renderSectionTitle = (title: string, subtitle?: string) => {
        const bgHeight = subtitle ? 26 : 18; // 压缩标题背景高度
        checkPageBreak(bgHeight + 10);
        const theme = getSectionTheme(title);
        
        // 背景块
        pdf.setFillColor(theme.titleBg[0], theme.titleBg[1], theme.titleBg[2]);
        pdf.rect(margin - 5, currentY - 5, pageWidth - margin * 2 + 10, bgHeight, 'F');
        
        // 左侧装饰线
        pdf.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2]);
        pdf.rect(margin - 5, currentY - 5, 3, bgHeight, 'F');
        
        // 标题
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        pdf.text(title, margin + 10, currentY + 8);
        
        // 副标题（统一灰色小字）
        if (subtitle) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(75, 85, 99);
          pdf.text(subtitle, margin + 10, currentY + 16);
        }
        
        currentY += bgHeight + 3; // 标题下方留白再压缩
      };

      // 专门的Introduction板块渲染函数
      const renderIntroductionSection = (content: string) => {
        // 为避免双列逻辑干扰，引言板块强制使用单列排版
        const prevSingleColumnMode = singleColumnMode;
        const prevCurrentColumn = currentColumn;
        const prevCategoryStartY = categoryStartY;
        singleColumnMode = true;
        currentColumn = 0;
        categoryStartY = currentY;
        // 1. 标题区域 - 按参考图重绘标题与副标题（含左侧图标）
        const headerH = 24;
        checkPageBreak(headerH + 10);
        // 左侧图标（不再添加方形背景）
        const iconBoxW = 16, iconBoxH = 16;
        drawIcon(introIcons.title, margin, currentY, 16, 16);
        // 标题与副标题
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(17, 24, 39);
        pdf.text('ESG Risk Analysis Report', margin + iconBoxW + 8, currentY + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Comprehensive risk assessment and recommendations', margin + iconBoxW + 8, currentY + 16);
        currentY += headerH + 5; // 标题与卡片之间更紧凑
        
        // 2. 两个概要卡片区域（垂直排列，尽量还原参考图的尺寸与样式）
        const cardWidthFull = pageWidth - margin * 2; // 满宽卡片
        const innerPadding = 10;   // 左右内边距（紧凑但保持可读）
        const topPadding = 6;      // 顶部内边距
        const bottomPadding = 6;  // 底部内边距
        const bulletIndent = 3;    // 圆点到文本的缩进
        const lineGap = 5;         // 换行间距

        // 文本换行：按照满宽卡片计算
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const maxLineWidth = cardWidthFull - innerPadding * 2 - bulletIndent - 2;
        const industryLines: string[] = (pdf.splitTextToSize(industryName, maxLineWidth) as string[]);
        const countryLines: string[] = (pdf.splitTextToSize(countryName, maxLineWidth) as string[]);

        // —— Industry Focus（卡片一，上） ——
        // 高度按实际绘制位置计算：最后一行的Y位置 + 底部内边距
        const indHeaderY = currentY + topPadding + 5;
        const indListY = indHeaderY + 14; // 列表整体下移，让副标题远离列表内容
        const indLastY = indListY + Math.max(industryLines.length - 1, 0) * lineGap;
        const indCardHeight = (indLastY - currentY) + bottomPadding;
        checkCardPageBreak(indCardHeight + 4);

        // 灰色卡片纯填充（去掉外边框），与“Important to Consider”统一
        pdf.setFillColor(247, 247, 247);
        pdf.setDrawColor(229, 231, 235); // 保留，但不描边
        pdf.setLineWidth(0.6);
        pdf.roundedRect(margin, currentY, cardWidthFull, indCardHeight, 5, 5, 'F');

        // 左侧图标圆形背景（浅绿）
        pdf.setFillColor(231, 245, 233);
        const indIconCX = margin + innerPadding; // 圆心X
        const indIconCY = currentY + topPadding + 6; // 圆心Y上移以贴近标题
        pdf.circle(indIconCX, indIconCY, 8, 'F');
        drawIcon(introIcons.industry, indIconCX - 5, indIconCY - 5, 10, 10);

        // 标题与副标题（靠左图标右侧，垂直对齐）
        const indTextStartX = margin + innerPadding + 14; // 标题更靠左
        // 标题与副标题（靠左图标右侧，垂直对齐）
        // 注：indHeaderY 已在上方定义用于高度计算
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(17, 24, 39);
        pdf.text('Industry Focus', indTextStartX, indHeaderY);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Target sectors analyzed', indTextStartX, indHeaderY + 6); // 更靠近主标题

        // 列表项，统一使用“•”文本圆点，圆点略大
        // 注：indListY 已在上方定义用于高度计算
        const indBulletSize = 13; // 圆点更大更明显
        pdf.setFontSize(indBulletSize);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(55, 65, 81);
        pdf.text('•', indTextStartX, indListY);

        // 列表正文
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(55, 65, 81);
        industryLines.forEach((line: string, idx: number) => {
          pdf.text(line, indTextStartX + bulletIndent, indListY + idx * lineGap);
        });

        currentY += indCardHeight + 5; // 进一步减小卡片间距

        // —— Geographic Scope（卡片二，下） ——
        const geoHeaderY = currentY + topPadding + 5;
        const geoListY = geoHeaderY + 14; // 列表整体下移
        const geoLastY = geoListY + Math.max(countryLines.length - 1, 0) * lineGap;
        const geoCardHeight = (geoLastY - currentY) + bottomPadding;
        checkCardPageBreak(geoCardHeight + 5);

        pdf.setFillColor(247, 247, 247);
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.6);
        pdf.roundedRect(margin, currentY, cardWidthFull, geoCardHeight, 5, 5, 'F');

        // 左侧图标圆形背景
        pdf.setFillColor(231, 245, 233);
        const geoIconCX = margin + innerPadding;
        const geoIconCY = currentY + topPadding + 6;
        pdf.circle(geoIconCX, geoIconCY, 8, 'F');
        drawIcon(introIcons.country, geoIconCX - 5, geoIconCY - 5, 10, 10);

        const geoTextStartX = margin + innerPadding + 14; // 标题更靠左
        // 标题与副标题（靠左图标右侧，垂直对齐）
        // 注：geoHeaderY 已在上方定义用于高度计算
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(17, 24, 39);
        pdf.text('Geographic Scope', geoTextStartX, geoHeaderY);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Markets under review', geoTextStartX, geoHeaderY + 6); // 更靠近主标题

        // 列表项，统一使用“•”文本圆点，圆点略大
        // 注：geoListY 已在上方定义用于高度计算
        const geoBulletSize = 13; // 圆点更大更明显
        pdf.setFontSize(geoBulletSize);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(55, 65, 81);
        pdf.text('•', geoTextStartX, geoListY);

        // 列表正文
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(55, 65, 81);
        countryLines.forEach((line: string, idx: number) => {
          pdf.text(line, geoTextStartX + bulletIndent, geoListY + idx * lineGap);
        });

        currentY += geoCardHeight + 5; // 进入下一块内容前的间距（更紧凑）

        // 3. 详细分析内容区域（卡片内边距更紧凑，卡片高度按内容动态计算）
        const introCleaned = stripHeadingByText(content, 'Introduction');
        const parsed = parseHtmlContent(introCleaned, 'general', countryName, industryName);

        // 自适应压缩参数（初始行距稍微增大）
        let dInner = 12;
        let dTop = 8;
        let dBottom = 8;
        let dLine = 4.4; // 适当增大 Detailed Analysis 行间距
        let bodyFont = 9;
        const detailHeaderHeight = 26; // 更接近参考图的标题占位

        const computeDetailHeight = (): { cardH: number; contentH: number; contentW: number } => {
          const contentW = cardWidthFull - dInner * 2;
          let contentH = 0;
          if (parsed.elements && parsed.elements.length > 0) {
            parsed.elements.forEach(el => {
              let lines: string[] = [];
              switch (el.type) {
                case 'list':
                  lines = pdf.splitTextToSize(`• ${el.content}`, contentW - bulletIndent) as string[];
                  break;
                default:
                  lines = pdf.splitTextToSize(el.content, contentW) as string[];
                  break;
              }
              contentH += lines.length * dLine + 2; // 末尾额外间隔 2
            });
          }
          const cardH = dTop + detailHeaderHeight + contentH + dBottom;
          return { cardH, contentH, contentW };
        };

        // 尝试在同一页压缩至剩余高度
        const remaining = pageHeight - margin - currentY - 6;
        let { cardH: detailCardHeight, contentW: detailContentWidth } = computeDetailHeight();
        if (detailCardHeight > remaining) {
          dLine = 3.8; bodyFont = 8; dTop = 6; dBottom = 8; ({ cardH: detailCardHeight, contentW: detailContentWidth } = computeDetailHeight());
        }
        if (detailCardHeight > remaining) {
          dInner = 10; ({ cardH: detailCardHeight, contentW: detailContentWidth } = computeDetailHeight());
        }
        if (detailCardHeight > remaining) {
          dLine = 3.5; dTop = 5; dBottom = 6; ({ cardH: detailCardHeight, contentW: detailContentWidth } = computeDetailHeight());
        }
        if (detailCardHeight > remaining) {
          dLine = 3.2; bodyFont = 7.8; dInner = 9; ({ cardH: detailCardHeight, contentW: detailContentWidth } = computeDetailHeight());
        }

        // 绘制卡片背景（浅灰，纯填充）
        pdf.setFillColor(247, 247, 247);
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, currentY, cardWidthFull, detailCardHeight, 5, 5, 'F');

        // 左侧图标圆形背景
        pdf.setFillColor(231, 245, 233);
        const dIconCX = margin + dInner;
        const dIconCY = currentY + dTop + 9;
        pdf.circle(dIconCX, dIconCY, 8, 'F');
        drawIcon(introIcons.detailed, dIconCX - 5.5, dIconCY - 5.5, 11, 11);

        // 标题
        const dTextStartX = margin + dInner + 14; // 标题进一步左移，与上方卡片对齐
        const dHeaderY = currentY + dTop + 7;
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(17, 24, 39);
        pdf.text('Detailed Analysis', dTextStartX, dHeaderY + 2);

        // 正文内容（同卡片内）
        let bodyY = currentY + dTop + detailHeaderHeight;
        if (parsed.elements && parsed.elements.length > 0) {
          parsed.elements.forEach(el => {
            switch (el.type) {
              case 'text': {
                pdf.setFontSize(bodyFont);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(55, 65, 81);
                const lines = pdf.splitTextToSize(el.content, detailContentWidth) as string[];
                lines.forEach(ln => { pdf.text(ln, margin + dInner, bodyY); bodyY += dLine; });
                bodyY += 2; break;
              }
              case 'bold': {
                pdf.setFontSize(bodyFont);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(55, 65, 81);
                const lines = pdf.splitTextToSize(el.content, detailContentWidth) as string[];
                lines.forEach(ln => { pdf.text(ln, margin + dInner, bodyY); bodyY += dLine; });
                bodyY += 2; break;
              }
              case 'list': {
                // 统一使用“•”文本圆点，并将圆点更大以增强辨识
                const bulletSize = bodyFont + 4;
                pdf.setFontSize(bulletSize);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(55, 65, 81);
                pdf.text('•', margin + dInner, bodyY);

                // 列表正文（不包含圆点），保持与其他正文一致的字体
                pdf.setFontSize(bodyFont);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(55, 65, 81);
                const lines = pdf.splitTextToSize(el.content, detailContentWidth - bulletIndent) as string[];
                lines.forEach(ln => { pdf.text(ln, margin + dInner + bulletIndent, bodyY); bodyY += dLine; });
                bodyY += 2; break;
              }
              case 'link': {
                pdf.setFontSize(bodyFont);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(75, 85, 99);
                const lines = pdf.splitTextToSize(el.content, detailContentWidth) as string[];
                lines.forEach(ln => { pdf.text(ln, margin + dInner, bodyY); bodyY += dLine; });
                if (el.url) {
                  const textWidth = pdf.getTextWidth(el.content);
                  pdf.setDrawColor(75, 85, 99);
                  pdf.line(margin + dInner, bodyY - dLine + 1, margin + dInner + textWidth, bodyY - dLine + 1);
                }
                bodyY += 2; break;
              }
            }
          });
        }

        // 移动到卡片底部，并留出与后续板块的间距
        currentY += detailCardHeight + 8;

        // 恢复之前的列模式设置（由外部控制后续板块的排版）
        singleColumnMode = prevSingleColumnMode;
        currentColumn = prevCurrentColumn;
        categoryStartY = prevCategoryStartY;
      };

      // 预加载 Important 区块标题图标（从 public/images/graphs）
  const importantTitleIcon = await toDataUrl('/images/graphs/important-title.png');
  const organizationsTitleIcon = await toDataUrl('/images/graphs/organizations-title.png');
  const labelsTitleIcon = await toDataUrl('/images/graphs/labels-title.png');
  const riskWarningIcon = await toDataUrl('/images/graphs/risk-exclamation.png');

      // 专门的Pay Attention板块渲染函数（尽量还原参考设计）
      const renderPayAttentionSection = (considerations: SectionData['considerations']) => {
        // 标题区：参考 Introduction 标题布局与位置（左侧小圆角容器+图标，右侧主副标题）
        const headerH = 24;
        checkPageBreak(headerH + 10);
        const iconBoxW = 16, iconBoxH = 16;
        // 不再添加图标背景容器
        drawIcon(importantTitleIcon, margin, currentY, 16, 16);
        // 标题与副标题文本（与 Intro 保持相同字号与对齐）
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(17, 24, 39);
        pdf.text('Important to Consider', margin + iconBoxW + 8, currentY + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Critical factors for your ESG risk assessment', margin + iconBoxW + 8, currentY + 16);
        // 标题与内容之间进一步收紧留白
        currentY += headerH + 4;

        const theme = getSectionTheme('Important to Consider');

        // 渲染每条提示为卡片
        considerations.forEach((c, idx) => {
          // 解析内容，识别标题与正文
          const parsed = parseHtmlContent(c.content_html || c.content, c.classification, countryName, industryName);
          let titleText = '';
          let bodyElements: typeof parsed.elements = [];
          if (parsed.elements && parsed.elements.length > 0) {
            const firstBoldIndex = parsed.elements.findIndex(e => e.type === 'bold');
            if (firstBoldIndex >= 0) {
              titleText = parsed.elements[firstBoldIndex].content;
              bodyElements = parsed.elements.slice(firstBoldIndex + 1);
            } else {
              titleText = parsed.elements[0].content;
              bodyElements = parsed.elements.slice(1);
            }
          }

          // 内边距与编号方块样式（缩小并靠近标题左侧，文字更紧凑）
          const innerPadding = 10;     // 左右内边距（进一步紧凑）
          const numberSize = 8;        // 更小的粉色方块
          const numberRadius = 3;      // 方块圆角
          const textIndent = numberSize + 6; // 标题/正文缩进更小
          const titleLineGap = 5.4;    // 标题行距保持
          const bodyLineGap = 5;     // 正文行距再略增，文本更舒展

          // 预估卡片高度（考虑左右内边距与缩进）
          const titleWidth = pageWidth - margin * 2 - innerPadding * 2 - textIndent;
          // 先设置标题字体再测量
          pdf.setFontSize(13);
          pdf.setFont('helvetica', 'normal');
          const titleLines: string[] = (pdf.splitTextToSize(titleText, titleWidth) as string[]);
          let bodyHeight = 0;
          // 先设置正文字体再测量
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          bodyElements.forEach(el => {
            const contentWidthBase = pageWidth - margin * 2 - innerPadding * 2;
            const width = el.type === 'list' ? (contentWidthBase - textIndent) : contentWidthBase - textIndent;
            const prefix = el.type === 'list' ? '' : '';
            const lines: string[] = (pdf.splitTextToSize(prefix + el.content, width) as string[]);
            bodyHeight += lines.length * bodyLineGap + 2;
          });
          const cardHeight = 12 + titleLines.length * titleLineGap + bodyHeight + 0; // 进一步减少上下留白
          checkCardPageBreak(cardHeight + 10);

          // 卡片背景
          // 灰色卡片背景与边框，贴近参考图
          // 更贴近参考图的灰色与边框
          // 参考设计：灰色卡片无外边框，仅填充圆角背景（圆角更小）
          pdf.setFillColor(247, 247, 247);
          pdf.setDrawColor(214, 214, 214); // 保留默认描边色，但不进行描边
          pdf.setLineWidth(0.4);
          pdf.roundedRect(margin, currentY, pageWidth - margin * 2, cardHeight, 5, 5, 'F');

          // 左侧小粉色方块序号（紧贴标题左侧，不霸占左侧空间）
          const numX = margin + innerPadding;
          const numY = currentY + 8; // 进一步减少卡片顶部留白
          // 粉色方块加深（tailwind rose-200 ≈ 254,205,211）
          pdf.setFillColor(254, 205, 211);
          pdf.setDrawColor(253, 164, 175); // 仅设置，不描边
          // 参考设计：序号方框无外边框，纯填充
          pdf.roundedRect(numX, numY, numberSize, numberSize, numberRadius, numberRadius, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9); // 较小字号更适配8px方框
          pdf.setTextColor(31, 41, 55);
          const numStr = String(idx + 1);
          const tw = pdf.getTextWidth(numStr);
          // 调整基线位置，使数字在方框内更居中（上移1px）
          pdf.text(numStr, numX + numberSize / 2 - tw / 2, numY + numberSize / 2 + 1);

          // 标题文本（与圆点对齐）
          pdf.setFontSize(13);
          pdf.setFont('helvetica', 'normal'); // 小标题不加粗
          pdf.setTextColor(17, 24, 39);
          const titleTextX = margin + innerPadding + textIndent;
          // 手动逐行渲染以确保与高度计算一致
          titleLines.forEach((line: string, i: number) => {
          // 与序号方框水平对齐：使用方框中心作为基线起点（整体上移2px）
          pdf.text(line, titleTextX, currentY + 12 + i * titleLineGap);
          });

          // 正文（统一字体与左右内边距）
          let bodyY = currentY + 12 + titleLines.length * titleLineGap + 5;
          bodyElements.forEach(el => {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', el.type === 'bold' ? 'bold' : 'normal');
            pdf.setTextColor(55, 65, 81);
            const contentWidthBase = pageWidth - margin * 2 - innerPadding * 2;
            const width = contentWidthBase - textIndent;
            const prefix = '';
            const lines: string[] = (pdf.splitTextToSize(prefix + el.content, width) as string[]);
            const textX = titleTextX; // 与标题左对齐
            // 逐行渲染，行距与测量保持一致
            lines.forEach((line: string, j: number) => {
              pdf.text(line, textX, bodyY + j * bodyLineGap);
            });
            bodyY += lines.length * bodyLineGap + 2;
          });

          currentY += cardHeight + 3; // 卡片间距更紧凑
        });
      };

      // 专门的Organizations板块标题渲染（左侧圆角图标 + 标题与副标题）
      const renderOrganizationsHeader = () => {
        const headerH = 24;
        checkPageBreak(headerH + 10);
        const iconBoxW = 16, iconBoxH = 16;
        // 去除图标背景容器
        drawIcon(organizationsTitleIcon, margin, currentY, 16, 16);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(17, 24, 39);
        pdf.text('Relevant organizations', margin + iconBoxW + 6, currentY + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Key organizations and standards in your industry', margin + iconBoxW + 6, currentY + 16);
        currentY += headerH + 3; // 减少标题下方的额外留白
      };
      const renderLabelsHeader = () => {
        const headerH = 24;
        checkPageBreak(headerH + 10);
        const iconBoxW = 16, iconBoxH = 16;
        drawIcon(labelsTitleIcon, margin, currentY, 16, 16);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(17, 24, 39);
        pdf.text('ESG labels & supply chain initiatives & guidelines', margin + iconBoxW + 6, currentY + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Standards, certifications, and initiatives', margin + iconBoxW + 6, currentY + 16);
        currentY += headerH + 3; // 减少标题下方的额外留白
      };

      // 专门的 Risk Analysis 标题渲染（左侧图标 + 标题 + 副标题）
      const renderRiskHeader = () => {
        const headerH = 24;
        checkPageBreak(headerH + 10);
        const iconBoxW = 16, iconBoxH = 16;
        drawIcon(riskTitleIcon, margin, currentY, 16, 16);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(17, 24, 39);
        pdf.text('Risk Analysis', margin + iconBoxW + 6, currentY + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Risk categories and detailed ESG evaluations', margin + iconBoxW + 6, currentY + 16);
        currentY += headerH + 3;
      };

      // 渲染板块内容的函数
      const renderSectionContent = (title: string, content: string, subtitle?: string) => {
        if (!content) return;
        
        // 使用新的标题渲染函数（带副标题）
        renderSectionTitle(title, subtitle);
        
        // 解析并渲染HTML内容（合并链接至段落，避免“链接单独成行”）
        const parsed = parseHtmlContent(content, 'general', countryName, industryName);
        if (parsed.elements && parsed.elements.length > 0) {
          const contentWidth = pageWidth - margin * 2;
          type Block = {
            kind: 'paragraph' | 'list' | 'bold' | 'tag' | 'sources';
            content: string;
            indent?: number;
            links?: Array<{ text: string; url: string }>;
            tagColor?: string;
          };
          const blocks: Block[] = [];
          let paraText = '';
          let paraLinks: Array<{ text: string; url: string }> = [];
          const flushPara = () => {
            if (paraText.trim()) {
              blocks.push({ kind: 'paragraph', content: normalizeText(paraText.trim()), indent: 0, links: paraLinks.slice() });
            }
            paraText = '';
            paraLinks = [];
          };

          parsed.elements.forEach((el) => {
            if (el.type === 'list') {
              flushPara();
              blocks.push({ kind: 'list', content: normalizeText(el.content), indent: 5 });
            } else if (el.type === 'bold') {
              flushPara();
              blocks.push({ kind: 'bold', content: normalizeText(el.content) });
            } else if (el.type === 'linebreak') {
              flushPara();
            } else if (el.type === 'link') {
              if (paraText && !/\s$/.test(paraText)) paraText += ' ';
              const norm = normalizeText(el.content);
              paraText += norm;
              const url = (el as any).url || '';
              if (url) paraLinks.push({ text: norm, url });
              paraText += ' ';
            } else if (el.type === 'tag') {
              flushPara();
              blocks.push({ kind: 'tag', content: el.content, tagColor: (el as any).tagColor });
            } else if (el.type === 'sources') {
              flushPara();
              blocks.push({ kind: 'sources', content: el.content });
            } else {
              if (paraText && !/\s$/.test(paraText)) paraText += ' ';
              paraText += normalizeText(el.content);
            }
          });
          flushPara();

          // 逐块渲染，段落内按行分段渲染链接文本
          blocks.forEach((b) => {
            checkPageBreak(10);
            switch (b.kind) {
              case 'bold': {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(colors.text);
                const lines = pdf.splitTextToSize(normalizeText(b.content), contentWidth) as string[];
                lines.forEach((ln) => {
                  pdf.text(ln, margin, currentY);
                  currentY += 5;
                });
                break;
              }
              case 'list': {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(colors.text);
                const lines = pdf.splitTextToSize(`• ${normalizeText(b.content)}`, contentWidth - (b.indent || 0)) as string[];
                lines.forEach((ln) => {
                  pdf.text(ln, margin + (b.indent || 0), currentY);
                  currentY += 5;
                });
                break;
              }
              case 'tag': {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                const tagWidth = pdf.getTextWidth(b.content) + 8;
                const tagHeight = 12;
                if (b.tagColor) {
                  const rgb = hexToRgb(b.tagColor);
                  if (rgb) pdf.setFillColor(rgb.r, rgb.g, rgb.b);
                } else {
                  pdf.setFillColor(107, 114, 128);
                }
                pdf.roundedRect(margin, currentY - 8, tagWidth, tagHeight, 2, 2, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.text(b.content, margin + 4, currentY - 1);
                currentY += 6; // 压缩标签行间距
                break;
              }
              case 'sources': {
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(colors.text);
                pdf.text(b.content, margin, currentY);
                currentY += 6; // 压缩来源标题行间距
                break;
              }
              case 'paragraph':
              default: {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                const lines = pdf.splitTextToSize(normalizeText(b.content), contentWidth) as string[];
                lines.forEach((ln) => {
                  let cursorX = margin + (b.indent || 0);
                  const positions: Array<{ start: number; len: number; url: string }> = [];
                  (b.links || []).forEach(l => {
                    const normText = normalizeText(l.text);
                    const idx = ln.indexOf(normText);
                    if (idx >= 0) positions.push({ start: idx, len: normText.length, url: l.url });
                  });
                  if (positions.length === 0) {
                    pdf.setTextColor(colors.text);
                    pdf.text(ln, cursorX, currentY);
                  } else {
                    positions.sort((a, c) => a.start - c.start);
                    let from = 0;
                    positions.forEach(p => {
                      const pre = ln.slice(from, p.start);
                      if (pre) {
                        pdf.setTextColor(colors.text);
                        pdf.text(pre, cursorX, currentY);
                        cursorX += pdf.getTextWidth(pre);
                      }
                      const mid = ln.slice(p.start, p.start + p.len);
                      if (mid) {
                        pdf.setTextColor(colors.text);
                        pdf.text(mid, cursorX, currentY);
                        const lw = pdf.getTextWidth(mid);
                        pdf.setDrawColor(75, 85, 99);
                        pdf.line(cursorX, currentY + 1, cursorX + lw, currentY + 1);
                        pdf.link(cursorX, currentY - 4, lw, 7, { url: p.url });
                        cursorX += lw;
                      }
                      from = p.start + p.len;
                    });
                    const tail = ln.slice(from);
                    if (tail) {
                      pdf.setTextColor(colors.text);
                      pdf.text(tail, cursorX, currentY);
                    }
                  }
                  currentY += 5;
                });
                break;
              }
            }
            currentY += 3; // 元素间距
          });
        } else {
          // 如果没有解析到元素，直接渲染纯文本
          const cleanedText = cleanText(content);
          if (cleanedText) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(colors.text);
            const lines = pdf.splitTextToSize(cleanedText, pageWidth - margin * 2);
            pdf.text(lines, margin, currentY);
            currentY += lines.length * 5;
          }
        }
        
        currentY += 8; // 板块间距（更紧凑）
      };

      // 渲染板块为「卡片式」的函数（仿照网页卡片样式）
      const renderSectionCardContent = (title: string, content: string, subtitle?: string) => {
        if (!content) return;

        // 标题区：统一板块标题风格 + 副标题
        renderSectionTitle(title, subtitle);
        const theme = getSectionTheme(title);

        // 解析HTML并构建块（与普通渲染保持一致，支持段落内联链接）
        const parsed = parseHtmlContent(content, 'general', countryName, industryName);
        type Block = {
          kind: 'paragraph' | 'list' | 'bold' | 'tag' | 'sources';
          content: string;
          indent?: number;
          links?: Array<{ text: string; url: string }>;
          tagColor?: string;
        };
        const blocks: Block[] = [];
        if (parsed.elements && parsed.elements.length > 0) {
          let paraText = '';
          let paraLinks: Array<{ text: string; url: string }> = [];
          const flushPara = () => {
            if (paraText.trim()) {
              blocks.push({ kind: 'paragraph', content: normalizeText(paraText.trim()), indent: 0, links: paraLinks.slice() });
            }
            paraText = '';
            paraLinks = [];
          };
          parsed.elements.forEach((el) => {
            if (el.type === 'list') {
              flushPara();
              blocks.push({ kind: 'list', content: normalizeText(el.content), indent: 10 });
            } else if (el.type === 'bold') {
              flushPara();
              blocks.push({ kind: 'bold', content: normalizeText(el.content) });
            } else if (el.type === 'linebreak') {
              flushPara();
            } else if (el.type === 'link') {
              if (paraText && !/\s$/.test(paraText)) paraText += ' ';
              const norm = normalizeText(el.content);
              paraText += norm;
              const url = (el as any).url || '';
              if (url) paraLinks.push({ text: norm, url });
              paraText += ' ';
            } else if (el.type === 'tag') {
              flushPara();
              blocks.push({ kind: 'tag', content: el.content, tagColor: (el as any).tagColor });
            } else if (el.type === 'sources') {
              flushPara();
              blocks.push({ kind: 'sources', content: el.content });
            } else {
              if (paraText && !/\s$/.test(paraText)) paraText += ' ';
              paraText += normalizeText(el.content);
            }
          });
          flushPara();
        } else {
          // 没有元素时，作为一个段落处理
          const cleanedText = cleanText(content);
          if (cleanedText) {
            blocks.push({ kind: 'paragraph', content: cleanedText });
          }
        }

        // 计算卡片高度
        const innerPadding = 18;
        const bulletIndent = 10;
        const bodyLineGap = 5;
        const contentWidthBase = pageWidth - margin * 2 - innerPadding * 2;
        let bodyHeight = 0;
        blocks.forEach((b) => {
          switch (b.kind) {
            case 'bold': {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              const lines = pdf.splitTextToSize(normalizeText(b.content), contentWidthBase) as string[];
              bodyHeight += lines.length * bodyLineGap + 3;
              break;
            }
            case 'list': {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              const lines = pdf.splitTextToSize(`• ${normalizeText(b.content)}`, contentWidthBase - (b.indent || bulletIndent)) as string[];
              bodyHeight += lines.length * bodyLineGap + 3;
              break;
            }
            case 'tag': {
              // 标签：固定高度估算
              bodyHeight += 12 + 3;
              break;
            }
            case 'sources': {
              // 来源标题：单行估算
              bodyHeight += 8 + 3;
              break;
            }
            case 'paragraph':
            default: {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              const lines = pdf.splitTextToSize(normalizeText(b.content), contentWidthBase) as string[];
              bodyHeight += lines.length * bodyLineGap + 3;
              break;
            }
          }
        });
        const cardHeight = 16 + bodyHeight + 14; // 顶部+正文+底部留白
        checkCardPageBreak(cardHeight + 10);

        // 卡片背景
        pdf.setFillColor(theme.cardBg[0], theme.cardBg[1], theme.cardBg[2]);
        pdf.setDrawColor(theme.cardBorder[0], theme.cardBorder[1], theme.cardBorder[2]);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, currentY, pageWidth - margin * 2, cardHeight, 6, 6, 'FD');

        // 卡片正文渲染（保持与普通渲染一致的文本/链接风格）
        let bodyY = currentY + 16;
        blocks.forEach((b) => {
          switch (b.kind) {
            case 'bold': {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(colors.text);
              const lines = pdf.splitTextToSize(normalizeText(b.content), contentWidthBase) as string[];
              lines.forEach((ln) => {
                pdf.text(ln, margin + innerPadding, bodyY);
                bodyY += bodyLineGap;
              });
              bodyY += 3;
              break;
            }
            case 'list': {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(colors.text);
              const lines = pdf.splitTextToSize(`• ${normalizeText(b.content)}`, contentWidthBase - (b.indent || bulletIndent)) as string[];
              lines.forEach((ln) => {
                pdf.text(ln, margin + innerPadding + (b.indent || bulletIndent), bodyY);
                bodyY += bodyLineGap;
              });
              bodyY += 3;
              break;
            }
            case 'tag': {
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'bold');
              const tagWidth = pdf.getTextWidth(b.content) + 8;
              const tagHeight = 12;
              if (b.tagColor) {
                const rgb = hexToRgb(b.tagColor);
                if (rgb) pdf.setFillColor(rgb.r, rgb.g, rgb.b);
              } else {
                pdf.setFillColor(107, 114, 128);
              }
              pdf.roundedRect(margin + innerPadding, bodyY - 8, tagWidth, tagHeight, 2, 2, 'F');
              pdf.setTextColor(255, 255, 255);
              pdf.text(b.content, margin + innerPadding + 4, bodyY - 1);
              bodyY += 8 + 3;
              break;
            }
            case 'sources': {
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(colors.text);
              pdf.text(b.content, margin + innerPadding, bodyY);
              bodyY += 8 + 3;
              break;
            }
            case 'paragraph':
            default: {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              const lines = pdf.splitTextToSize(normalizeText(b.content), contentWidthBase) as string[];
              lines.forEach((ln) => {
                let cursorX = margin + innerPadding + (b.indent || 0);
                const positions: Array<{ start: number; len: number; url: string }> = [];
                (b.links || []).forEach(l => {
                  const normText = normalizeText(l.text);
                  const idx = ln.indexOf(normText);
                  if (idx >= 0) positions.push({ start: idx, len: normText.length, url: l.url });
                });
                if (positions.length === 0) {
                  pdf.setTextColor(colors.text);
                  pdf.text(ln, cursorX, bodyY);
                } else {
                  positions.sort((a, c) => a.start - c.start);
                  let from = 0;
                  positions.forEach(p => {
                    const pre = ln.slice(from, p.start);
                    if (pre) {
                      pdf.setTextColor(colors.text);
                      pdf.text(pre, cursorX, bodyY);
                      cursorX += pdf.getTextWidth(pre);
                    }
                    const mid = ln.slice(p.start, p.start + p.len);
                    if (mid) {
                      pdf.setTextColor(colors.text);
                      pdf.text(mid, cursorX, bodyY);
                      const lw = pdf.getTextWidth(mid);
                      pdf.setDrawColor(75, 85, 99);
                      pdf.line(cursorX, bodyY + 1, cursorX + lw, bodyY + 1);
                      pdf.link(cursorX, bodyY - 4, lw, 7, { url: p.url });
                      cursorX += lw;
                    }
                    from = p.start + p.len;
                  });
                  const tail = ln.slice(from);
                  if (tail) {
                    pdf.setTextColor(colors.text);
                    pdf.text(tail, cursorX, bodyY);
                  }
                }
                bodyY += bodyLineGap;
              });
              bodyY += 3;
              break;
            }
          }
        });

        // 移动整体Y用于下一个板块或卡片
        currentY += cardHeight + 10;

      };

      // 渲染“About Us”板块为两个带logo的卡片（MSC 与 Future Vision）
      const renderAboutUsCards = async (aboutHtml: string) => {
        // 标题区
        renderSectionTitle('About Us', 'Who we are and what we do');

        // 拆分原始HTML到两个介绍块
        const paras = aboutHtml.match(/<p[\s\S]*?<\/p>/g) || [];
        const mscBlock = [paras[0] || '', paras[1] || ''].filter(Boolean).join('');
        const fvBlock = [paras[2] || '', paras[3] || ''].filter(Boolean).join('');
        const linksPara = paras[4] || '';
        const mscLinkMatch = linksPara.match(/href="([^"]*msc-world\.cn[^"]*)"/i);
        const fvLinkMatch = linksPara.match(/href="([^"]*mscfv\.com[^"]*)"/i);
        const mscLink = mscLinkMatch ? mscLinkMatch[1] : 'https://www.msc-world.cn/';
        const fvLink = fvLinkMatch ? fvLinkMatch[1] : 'https://mscfv.com/futureVision/';

        // 去掉尾部的链接段落，改为仅在标题上提供可点击链接
        const mscHtml = mscBlock;
        const fvHtml = fvBlock;

        // 预加载两个logo为 DataURL（填充到倡议logo映射）
        const toInfo = async (url: string) => {
          const dataUrl = await toDataUrl(url);
          if (!dataUrl) return null;
          let iw = 0, ih = 0;
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => { iw = img.naturalWidth || img.width || 140; ih = img.naturalHeight || img.height || 100; resolve(); };
            img.onerror = () => resolve();
            img.src = dataUrl;
          });
          return { dataUrl, w: iw || 140, h: ih || 100 } as { dataUrl: string; w: number; h: number };
        };
        const mscInfo = await toInfo('/src/images/msc-hk-logo.png');
        const fvInfo = await toInfo('/src/images/future-vision-logo.png');
        const MSC_ID = -1001;
        const FV_ID = -1002;
        if (mscInfo) (initiativeLogoInfoMap as any)[MSC_ID] = mscInfo;
        if (fvInfo) (initiativeLogoInfoMap as any)[FV_ID] = fvInfo;

        // 构造两个“倡议”对象以复用渲染函数（左侧logo + 标题 + 正文）
        const mscItem = {
          id: MSC_ID,
          name: 'Maker Sustainability Consulting',
          intro_html: mscHtml,
          logo: '/src/images/msc-hk-logo.png',
          link: mscLink,
          classification: 'general'
        };
        const fvItem = {
          id: FV_ID,
          name: 'Future Vision',
          intro_html: fvHtml,
          logo: '/src/images/future-vision-logo.png',
          link: fvLink,
          classification: 'general'
        };

        // 依次渲染两个卡片
        renderInitiativeCard(mscItem);
        renderInitiativeCard(fvItem);
      };

      // 渲染其他板块内容 - 按照网页顺序：Introduction -> Pay Attention -> Risk Analysis -> CSR -> CSR Labels -> Due Diligence -> About Us -> Contact -> Disclaimer
      if (sectionsData) {
        // 1. Introduction Section - 使用专门的渲染函数
        renderIntroductionSection(sectionsData.introSection.html);

        // 引言结束后强制新开一页，保证每个板块从新页开始
        addFooter();
        pdf.addPage();
        currentY = margin + 4;
        
        // 2. Pay Attention Section（卡片式渲染）
        if (sectionsData.considerations && sectionsData.considerations.length > 0) {
          renderPayAttentionSection(sectionsData.considerations);
        }
      }

      // 3. Risk Analysis Section - 添加新页面开始Risk Analysis
      addFooter();
      pdf.addPage();
      currentY = margin;
      currentColumn = 0;
      categoryStartY = margin;

                // 添加Risk Analysis板块标题（与其他板块一致的格式 + 左侧图标）
                renderRiskHeader();
      currentY += 5; // 标题与摘要卡片之间增加一点留白

      // 处理每个类别
      categories.forEach((category, categoryIndex) => {
        if (categoryIndex >= 4) return;
        
        // 每个议题新开一页（除了第一个）
        if (categoryIndex > 0) {
          addFooter();
          pdf.addPage();
          currentY = margin;
          // 重新设置正文字体，避免使用页脚字体
          pdf.setFontSize(8); // 统一为8号字体
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.text);
        }
        
        categoryStartY = currentY;
        currentColumn = 0;
        
        const cardEndY = drawCategorySummary(pdf, category, currentY, pageWidth, margin, colors, lineHeight, riskWarningIcon);
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
              
              pdf.setFontSize(8); // 统一为8号字体
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
                       pdf.setFontSize(8); // 缩小Sources标题字号从9到8
                       pdf.setFont('helvetica', 'bold');
                      pdf.setFontSize(8); // 设置粗体字号为8
                       pdf.setTextColor(colors.text);
                       
                       checkPageBreak(lineHeight);
                       // 在checkPageBreak后重新获取正确的X位置
                       const xPos = getColumnX();
                       pdf.text(element.content, xPos, currentY);
                       currentY += lineHeight * 1.0; // 增加标题下方间距
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
                         pdf.setFontSize(8); // 设置Sources链接字号为8
                         pdf.setTextColor(colors.text);
                         
                         // 优化bullet point间距：在bullet和文字之间添加适当空隙
                         let contentWithSpacing = element.content.replace('• ', '•  '); // 增加一个空格
                         
                         // 修复特殊连字符问题：将Unicode连字符（‑）替换为普通连字符（-）
                         contentWithSpacing = contentWithSpacing.replace(/‑/g, '-');
                         
                         // 使用splitTextToSize处理长文本自动换行
                         const listLines = pdf.splitTextToSize(contentWithSpacing, columnWidth - 10);
                         
                         // 计算bullet point的宽度，用于换行后的缩进对齐
                         const bulletWidth = pdf.getTextWidth('•  ');
                         
                         listLines.forEach((line: string, lineIndex: number) => {
                           checkPageBreak(lineHeight);
                           
                           // 渲染文本 - 换行后的内容与第一行文字对齐
                           const xPos = getColumnX() + (lineIndex === 0 ? 0 : bulletWidth);
                           pdf.text(line, xPos, currentY);
                           
                           // 为每一行都添加下划线（超链接效果），但排除bullet point
                           let underlineStartX = xPos;
                           let underlineText = line;
                           
                           // 如果是第一行且包含bullet point，跳过bullet point部分（包括额外空格）
                           if (lineIndex === 0 && line.startsWith('•  ')) {
                             const bulletWidth = pdf.getTextWidth('•  '); // 包括额外空格的宽度
                             underlineStartX = xPos + bulletWidth;
                             underlineText = line.substring(3); // 移除 '•  '
                           }
                           
                           const underlineWidth = pdf.getTextWidth(underlineText);
                           pdf.setDrawColor(colors.text);
                           pdf.setLineWidth(0.2);
                           pdf.line(underlineStartX, currentY + 1, underlineStartX + underlineWidth, currentY + 1);
                           
                           // 为每一行都添加可点击链接
                           if (element.url) {
                             pdf.link(xPos, currentY - 6, pdf.getTextWidth(line), 8, { url: element.url });
                           }
                           
                           currentY += lineHeight;
                         });
                         currentX = getColumnX(); // 重置X位置
                         
                         // 列表后间距
                         if (i < parsedContent.elements.length - 1) {
                           currentY += lineHeight * 0.1;
                         }
                       } else {
                         // 内联渲染超链接 - 优化布局，减少不必要的空行
                         pdf.setFont('helvetica', 'normal');
                         pdf.setFontSize(8); // 设置Sources链接字号为8
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
                         
                         // 更新X位置，包括超链接文本
                         currentX += textWidth;
                         
                         // 优化空格处理：只在必要时添加空格，避免多余的空行
                         if (i < parsedContent.elements.length - 1) {
                           const nextElement = parsedContent.elements[i + 1];
                           // 当下一个元素是文本、链接或其他内联元素时才添加空格
                           if (nextElement.type === 'text' || nextElement.type === 'link') {
                             pdf.text(' ', currentX, currentY);
                             currentX += spaceWidth;
                           } else {
                             // 如果下一个元素是块级元素（如tag、bold等），不添加额外空格
                             // 让块级元素自己处理换行和间距
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
                        pdf.setFontSize(8); // 设置粗体字号为8
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
                        pdf.setFontSize(8); // 缩小字体从9到8
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
                        pdf.setFontSize(8); // 缩小字体从9到8
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
                      
                      // 优化bullet point间距：在bullet和文字之间添加适当空隙
                      const listLines = pdf.splitTextToSize(`•  ${element.content}`, columnWidth - 10); // 增加一个空格
                      
                      // 计算bullet point的宽度，用于换行后的缩进对齐
                      const bulletWidth = pdf.getTextWidth('•  ');
                      
                      listLines.forEach((line: string, lineIndex: number) => {
                        checkPageBreak(lineHeight);
                        // 换行后的内容与第一行文字对齐
                        const xPos = getColumnX() + (lineIndex === 0 ? 0 : bulletWidth);
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
              
              pdf.setFontSize(8); // 统一为8号字体
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
                       pdf.setFontSize(8); // 缩小Sources标题字号从9到8
                       pdf.setFont('helvetica', 'bold');
                       pdf.setTextColor(colors.text);
                       
                       checkPageBreak(lineHeight);
                       // 在checkPageBreak后重新获取正确的X位置
                       const xPos = getColumnX();
                       pdf.text(element.content, xPos, currentY);
                       currentY += lineHeight * 1.0; // 增加标题下方间距
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
                         
                         // 优化bullet point间距：在bullet和文字之间添加适当空隙
                         let contentWithSpacing = element.content.replace('• ', '•  '); // 增加一个空格
                         
                         // 修复特殊连字符问题：将Unicode连字符（‑）替换为普通连字符（-）
                         contentWithSpacing = contentWithSpacing.replace(/‑/g, '-');
                         
                         // 使用splitTextToSize处理长文本自动换行
                         const listLines = pdf.splitTextToSize(contentWithSpacing, columnWidth - 10);
                         
                         // 计算bullet point的宽度，用于换行后的缩进对齐
                         const bulletWidth = pdf.getTextWidth('•  ');
                         
                         listLines.forEach((line: string, lineIndex: number) => {
                           checkPageBreak(lineHeight);
                           
                           // 渲染文本 - 换行后的内容与第一行文字对齐
                           const xPos = getColumnX() + (lineIndex === 0 ? 0 : bulletWidth);
                           pdf.text(line, xPos, currentY);
                           
                           // 为每一行都添加下划线（超链接效果），但排除bullet point
                           let underlineStartX = xPos;
                           let underlineText = line;
                           
                           // 如果是第一行且包含bullet point，跳过bullet point部分（包括额外空格）
                           if (lineIndex === 0 && line.startsWith('•  ')) {
                             const bulletWidth = pdf.getTextWidth('•  '); // 包括额外空格的宽度
                             underlineStartX = xPos + bulletWidth;
                             underlineText = line.substring(3); // 移除 '•  '
                           }
                           
                           const underlineWidth = pdf.getTextWidth(underlineText);
                           pdf.setDrawColor(colors.text);
                           pdf.setLineWidth(0.2);
                           pdf.line(underlineStartX, currentY + 1, underlineStartX + underlineWidth, currentY + 1);
                           
                           // 为每一行都添加可点击链接
                           if (element.url) {
                             pdf.link(xPos, currentY - 6, pdf.getTextWidth(line), 8, { url: element.url });
                           }
                           
                           currentY += lineHeight;
                         });
                         currentX = getColumnX(); // 重置X位置
                         
                         // 列表后间距
                         if (i < parsedContent.elements.length - 1) {
                           currentY += lineHeight * 0.1;
                         }
                       } else {
                         // 内联渲染超链接 - 优化布局，减少不必要的空行
                         pdf.setFont('helvetica', 'normal');
                         pdf.setFontSize(8); // 设置Sources链接字号为8
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
                         
                         // 更新X位置，包括超链接文本
                         currentX += textWidth;
                         
                         // 优化空格处理：只在必要时添加空格，避免多余的空行
                         if (i < parsedContent.elements.length - 1) {
                           const nextElement = parsedContent.elements[i + 1];
                           // 当下一个元素是文本、链接或其他内联元素时才添加空格
                           if (nextElement.type === 'text' || nextElement.type === 'link') {
                             pdf.text(' ', currentX, currentY);
                             currentX += spaceWidth;
                           } else {
                             // 如果下一个元素是块级元素（如tag、bold等），不添加额外空格
                             // 让块级元素自己处理换行和间距
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
                      pdf.setFontSize(8); // 缩小字体从9到8
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
                      pdf.setFontSize(8); // 缩小字体从9到8
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
                      
                      // 优化bullet point间距：在bullet和文字之间添加适当空隙
                      const listLines = pdf.splitTextToSize(`•  ${element.content}`, columnWidth - 10); // 增加一个空格
                      
                      // 计算bullet point的宽度，用于换行后的缩进对齐
                      const bulletWidth = pdf.getTextWidth('•  ');
                      
                      listLines.forEach((line: string, lineIndex: number) => {
                        checkPageBreak(lineHeight);
                        // 换行后的内容与第一行文字对齐
                        const xPos = getColumnX() + (lineIndex === 0 ? 0 : bulletWidth);
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
      
      // 4. 在Risk Analysis结束后添加剩余板块（切换为单列模式）
      if (sectionsData) {
        // 添加新页面开始其他板块
        addFooter();
        pdf.addPage();
        currentY = margin;
        singleColumnMode = true;
        currentColumn = 0;
        categoryStartY = margin;
        
        // 4. CSR Section (基于organizations数据)
        if (sectionsData.organizations && sectionsData.organizations.length > 0) {
          currentY = margin + 4; // 进一步上移章节标题，和其他板块一致
          currentColumn = 0;
          categoryStartY = margin + 4;
          renderOrganizationsHeader();
          
          const orgsSorted = sectionsData.organizations.slice().sort((a, b) => {
            const ai = orgLogoInfoMap[a.id];
            const bi = orgLogoInfoMap[b.id];
            const ahas = !!(ai && ai.dataUrl);
            const bhas = !!(bi && bi.dataUrl);
            if (ahas === bhas) return 0;
            return ahas ? -1 : 1; // 有logo的优先
          });
          orgsSorted.forEach(org => {
            renderOrganizationCard(org);
          });
        }
        
        // 5. CSR Labels Section (基于initiatives数据)
        if (sectionsData.initiatives && sectionsData.initiatives.length > 0) {
          pdf.addPage();
          currentY = margin + 4; // 进一步上移章节标题，和其他板块一致
          currentColumn = 0;
          categoryStartY = margin + 4;
          renderLabelsHeader();
          
          const initsSorted = sectionsData.initiatives.slice().sort((a, b) => {
            const ai = initiativeLogoInfoMap[a.id];
            const bi = initiativeLogoInfoMap[b.id];
            const ahas = !!(ai && ai.dataUrl);
            const bhas = !!(bi && bi.dataUrl);
            if (ahas === bhas) return 0;
            return ahas ? -1 : 1;
          });
          initsSorted.forEach(initiative => {
            renderInitiativeCard(initiative);
          });
        }
        
        // 6. Due Diligence Section（替换为静态PDF，故跳过动态渲染）
        // pdf.addPage();
        // currentY = margin + 20;
        // renderSectionCardContent('Due Diligence', sectionsData.dueDiligenceSection.html, 'Methodology and verification framework');
        
        // 7. About Us / Contact / Disclaimer 等尾部固定版块全部使用静态PDF，
        // 为避免出现空白页，这里不再新开页面。
        // 从 Due diligence 之后的固定内容改由静态 PDF 替换。
      }
      
      // 保存前合并静态页面（保留超链接）并添加尾页
      const fileName = `ESG_Risk_Report_${industryName}_${countryName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      try {
        // 1) 将当前 jsPDF 输出为字节
        const jsBytes = pdf.output('arraybuffer');
        // 2) 加载为可编辑的 PDF 文档
        const baseDoc = await PDFDocument.load(jsBytes);
        
        // 3) 载入静态页面 PDF（应放在 public/static_pages.pdf）
        const staticDoc = staticDocForMerge ? staticDocForMerge : await PDFDocument.load(await (await fetch('/static_pages.pdf')).arrayBuffer());
        
        // 4) 复制静态 PDF 的所有页面并追加到末尾（位于封面和动态内容之后、尾页之前）
        const staticPageIndices = staticDoc.getPageIndices();
        const copiedPages = await baseDoc.copyPages(staticDoc, staticPageIndices);
        const baseCountBeforeAppend = baseDoc.getPageCount();
        copiedPages.forEach(p => baseDoc.addPage(p));

        // 为追加的静态页面绘制页脚（左Logo、底中网址、右页码）
        try {
          // 使用标准字体
          const helvetica = await baseDoc.embedStandardFont(StandardFonts.Helvetica);
          // 准备Logo（从先前的 dataURL 转换为字节）
          let pngFooter;
          let pngAspect = 1;
          if (fvFooterLogoUrl) {
            const toBytes = (dataUrl: string): Uint8Array => {
              const comma = dataUrl.indexOf(',');
              const b64 = dataUrl.slice(comma + 1);
              const bin = atob(b64);
              const arr = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
              return arr;
            };
            try {
              const bytes = toBytes(fvFooterLogoUrl);
              pngFooter = await baseDoc.embedPng(bytes);
              const w = (pngFooter as any).width || 0;
              const h = (pngFooter as any).height || 1;
              pngAspect = w && h ? w / h : 1;
            } catch {}
          }
          // 统一与 jsPDF 页脚的视觉：将数值从 mm 换算为 pt
          const mmToPt = (mm: number) => mm / 0.352778;
          const footerBottomOffsetMm = Math.max(0, (margin as number) - 1.2); // jsPDF: footerY = pageHeight - margin + 1.2
          const textYpt = mmToPt(footerBottomOffsetMm); // 文字基线距离底部的 pt 值
          const logoHpt = mmToPt(13); // 动态页 Logo 高度 13mm 同步到静态页
          const urlText = 'www.mscfv.com';
          const fontSize = 8;
          const colorUrl = rgb(0.24, 0.24, 0.24);
          const colorPage = rgb(0.31, 0.31, 0.31);
          const totalAfterAppend = baseDoc.getPageCount();
          for (let pi = baseCountBeforeAppend; pi < totalAfterAppend; pi++) {
            const page = baseDoc.getPage(pi);
            const { width: pw, height: ph } = page.getSize();
            // 左下Logo（与动态页一致：logoTop = footerY - logoH + 5mm）
            if (pngFooter) {
              const logoWpt = Math.max(mmToPt(6), Math.round(logoHpt * pngAspect));
              const logoTopYpt = Math.max(mmToPt(1), textYpt - logoHpt + mmToPt(5));
              page.drawImage(pngFooter, {
                x: mmToPt(margin as number),
                y: logoTopYpt,
                width: logoWpt,
                height: logoHpt
              });
            }
            // 底部居中网址（y = 与动态页相同的基线高度）
            const urlWidth = helvetica.widthOfTextAtSize(urlText, fontSize);
            page.drawText(urlText, {
              x: pw / 2 - urlWidth / 2,
              y: textYpt,
              size: fontSize,
              font: helvetica,
              color: colorUrl
            });
            // 右下角页码（整体页码）
            const pageNumber = pi + 1; // PDF整体页码
            const pageText = String(pageNumber);
            const pageWidthText = helvetica.widthOfTextAtSize(pageText, fontSize);
            page.drawText(pageText, {
              x: pw - mmToPt(margin as number) - pageWidthText,
              y: textYpt,
              size: fontSize,
              font: helvetica,
              color: colorPage
            });
          }
        } catch (e) {
          console.warn('静态页面添加页脚失败，已跳过：', e);
        }
        
        // 5) 添加尾页图片（若可用）——尾页不绘制页脚
        try {
          const backImgRes = await fetch(backImageUrl);
          const backImgBytes = await backImgRes.arrayBuffer();
          const backPng = await baseDoc.embedPng(backImgBytes);
          const refSize = baseDoc.getPage(0).getSize();
          const backPage = baseDoc.addPage([refSize.width, refSize.height]);
          backPage.drawImage(backPng, { x: 0, y: 0, width: refSize.width, height: refSize.height });
        } catch (e) {
          console.warn('尾页图片加载失败（pdf-lib），跳过尾页');
        }
        
        // 6) 导出合并后的 PDF
        const mergedBytes = await baseDoc.save();
        // 复制到新的 Uint8Array，保证底层 buffer 是标准 ArrayBuffer
        const bytesCopy = new Uint8Array(mergedBytes.length);
        bytesCopy.set(mergedBytes);
        const blob = new Blob([bytesCopy.buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (mergeErr) {
        console.error('静态页面合并失败，回退为原始保存：', mergeErr);
        pdf.save(fileName);
      }
      
    } catch (error) {
      console.error('PDF生成失败:', error);
      alert('PDF生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
      // 还原数据库语言及连接
      const prev = (window as any).__fvPrevLangForPdf;
      if (prev) {
        (window as any).__fvLanguage = prev;
        try { await closeDatabase(); } catch {}
        delete (window as any).__fvPrevLangForPdf;
      }
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
          Download Report
        </>
      )}
    </button>
  );
};

export default PDFReportGenerator;