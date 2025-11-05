// 独家洞察报告数据结构
// 用于管理和展示独家洞察报告内容

export interface InsightReport {
  id: string;
  title: string;
  industry: string; // 行业
  topic: string; // 议题
  pages: number; // 页数
  summary: string; // 摘要
  date: string; // 发布日期
  category: string; // 分类
  readTime: string; // 阅读时间
  featured?: boolean; // 是否为精选报告
  
  // 报告内容
  coverImage: string; // 封面图片
  tableOfContents: TableOfContentsItem[]; // 目录页
  samplePages: SamplePage[]; // 示例页面
  
  // 详细内容（展开后显示）
  detailedSummary?: string; // 详细摘要
  keyFindings?: string[]; // 主要发现
  methodology?: string; // 研究方法
  targetAudience?: string; // 目标受众
  
  // 购买信息
  isPurchasable: boolean; // 是否可购买
  price?: number; // 价格（如果可购买）
  currency?: string; // 货币单位
  contactInfo?: ContactInfo; // 联系信息
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  pageNumber: number;
  level: number; // 1为一级标题，2为二级标题等
  children?: TableOfContentsItem[];
}

export interface SamplePage {
  id: string;
  pageNumber: number;
  title: string;
  content: string; // 页面内容摘要
  imageUrl?: string; // 页面截图
  type: 'text' | 'chart' | 'table' | 'infographic'; // 页面类型
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  wechat?: string;
  contactPerson?: string;
  department?: string;
}

// 示例报告数据
export const insightReports: InsightReport[] = [
  {
    id: 'esg-trends-2024',
    title: '2024年全球ESG监管趋势报告',
    industry: '跨行业',
    topic: 'ESG监管政策',
    pages: 45,
    summary: '深度分析全球主要经济体ESG监管政策变化趋势，为企业合规提供前瞻性指导',
    date: '2024-01-20',
    category: '政策解读',
    readTime: '15分钟',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    
    tableOfContents: [
      {
        id: 'toc-1',
        title: '执行摘要',
        pageNumber: 3,
        level: 1
      },
      {
        id: 'toc-2',
        title: '全球ESG监管概览',
        pageNumber: 5,
        level: 1,
        children: [
          {
            id: 'toc-2-1',
            title: '欧盟CSRD指令解读',
            pageNumber: 7,
            level: 2
          },
          {
            id: 'toc-2-2',
            title: '美国SEC气候披露规则',
            pageNumber: 12,
            level: 2
          }
        ]
      },
      {
        id: 'toc-3',
        title: '亚太地区ESG政策动态',
        pageNumber: 18,
        level: 1
      },
      {
        id: 'toc-4',
        title: '企业应对策略建议',
        pageNumber: 35,
        level: 1
      }
    ],
    
    samplePages: [
      {
        id: 'sample-1',
        pageNumber: 3,
        title: '执行摘要',
        content: '2024年全球ESG监管呈现加速收紧趋势，欧盟CSRD、美国SEC新规等重磅政策相继落地...',
        type: 'text'
      },
      {
        id: 'sample-2',
        pageNumber: 15,
        title: '全球ESG监管时间线',
        content: '展示2024-2026年全球主要ESG监管政策实施时间表',
        imageUrl: '/images/reports/esg-timeline-chart.png',
        type: 'chart'
      },
      {
        id: 'sample-3',
        pageNumber: 28,
        title: '行业影响分析矩阵',
        content: '不同行业受ESG监管影响程度的量化分析表格',
        type: 'table'
      }
    ],
    
    detailedSummary: '本报告基于对全球50+个国家和地区ESG监管政策的深度研究，结合500+家企业的实践案例，系统分析了2024年ESG监管的五大趋势：强制性披露要求扩大、供应链尽职调查加强、气候风险评估标准化、社会责任指标细化、以及数字化监管工具普及。报告为不同规模和行业的企业提供了具体的合规路径和风险防控建议。',
    
    keyFindings: [
      '全球已有32个国家和地区实施或计划实施强制性ESG披露要求',
      '供应链ESG尽职调查将成为2024年监管重点，影响80%的跨国企业',
      '中小企业ESG合规成本预计增长35%，但可通过数字化工具有效降低',
      '亚太地区ESG监管政策趋向与欧美标准接轨，为企业提供更统一的合规框架'
    ],
    
    methodology: '本研究采用定量与定性相结合的研究方法，包括政策文本分析、专家访谈、企业调研和案例研究。数据来源包括各国监管机构官方文件、国际组织报告、企业年报和第三方ESG评级数据。',
    
    targetAudience: '企业ESG负责人、合规官员、可持续发展经理、投资机构ESG分析师、政策制定者',
    
    isPurchasable: true,
    price: 2980,
    currency: 'CNY',
    contactInfo: {
      email: 'reports@futurevision.com',
      phone: '+86-400-123-4567',
      wechat: 'FV_ESG_Reports',
      contactPerson: '李经理',
      department: '研究咨询部'
    }
  },
  
  {
    id: 'sme-overseas-compliance-2024',
    title: '中小企业出海ESG合规指南',
    industry: '制造业',
    topic: '出海合规',
    pages: 32,
    summary: '针对中小企业的实用ESG合规操作手册，提供可落地的合规方案和成本控制策略',
    date: '2024-01-18',
    category: '实操指南',
    readTime: '12分钟',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
    
    tableOfContents: [
      {
        id: 'sme-toc-1',
        title: '中小企业出海ESG挑战',
        pageNumber: 2,
        level: 1
      },
      {
        id: 'sme-toc-2',
        title: '分阶段合规实施路径',
        pageNumber: 8,
        level: 1
      },
      {
        id: 'sme-toc-3',
        title: '成本控制与资源优化',
        pageNumber: 18,
        level: 1
      },
      {
        id: 'sme-toc-4',
        title: '实用工具与模板',
        pageNumber: 25,
        level: 1
      }
    ],
    
    samplePages: [
      {
        id: 'sme-sample-1',
        pageNumber: 5,
        title: 'ESG合规成本分析',
        content: '中小企业ESG合规的典型成本构成和预算规划建议',
        type: 'chart'
      },
      {
        id: 'sme-sample-2',
        pageNumber: 12,
        title: '三阶段实施计划',
        content: '基础合规→标准化管理→持续改进的渐进式实施方案',
        type: 'infographic'
      }
    ],
    
    detailedSummary: '专为年营收1-10亿元的中小制造企业设计的ESG合规实操指南。基于100+家成功出海中小企业的实践经验，提供从合规评估、体系建设到持续改进的全流程解决方案。特别关注成本控制和资源配置优化，帮助中小企业以最小投入实现合规要求。',
    
    keyFindings: [
      '中小企业ESG合规可通过分阶段实施降低60%的初期投入',
      '数字化ESG管理工具可为中小企业节省40%的人力成本',
      '供应商协同管理是中小企业ESG合规的关键成功因素',
      '政府补贴和税收优惠可覆盖中小企业ESG投入的30-50%'
    ],
    
    isPurchasable: true,
    price: 1680,
    currency: 'CNY',
    contactInfo: {
      email: 'sme@futurevision.com',
      phone: '+86-400-123-4567',
      wechat: 'FV_SME_Support',
      contactPerson: '王顾问',
      department: '中小企业服务部'
    }
  },
  
  {
    id: 'supply-chain-transparency-2024',
    title: '供应链透明度最佳实践研究',
    industry: '消费品',
    topic: '供应链管理',
    pages: 38,
    summary: '全球领先企业供应链透明度管理案例分析，提供可复制的实施框架和技术解决方案',
    date: '2024-01-15',
    category: '案例研究',
    readTime: '18分钟',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    
    tableOfContents: [
      {
        id: 'supply-toc-1',
        title: '供应链透明度发展趋势',
        pageNumber: 3,
        level: 1
      },
      {
        id: 'supply-toc-2',
        title: '领先企业案例分析',
        pageNumber: 10,
        level: 1
      },
      {
        id: 'supply-toc-3',
        title: '技术解决方案对比',
        pageNumber: 22,
        level: 1
      },
      {
        id: 'supply-toc-4',
        title: '实施路径与建议',
        pageNumber: 30,
        level: 1
      }
    ],
    
    samplePages: [
      {
        id: 'supply-sample-1',
        pageNumber: 8,
        title: '透明度成熟度模型',
        content: '供应链透明度的五个发展阶段和评估标准',
        type: 'infographic'
      },
      {
        id: 'supply-sample-2',
        pageNumber: 16,
        title: 'Patagonia案例深度解析',
        content: 'Patagonia供应链透明度管理的创新实践和经验总结',
        type: 'text'
      }
    ],
    
    detailedSummary: '深入研究Nike、Patagonia、Unilever等20家全球领先企业的供应链透明度管理实践，总结出供应链透明度建设的核心要素、实施路径和技术工具。报告特别关注区块链、物联网、AI等新技术在供应链透明度提升中的应用，为企业提供前瞻性的解决方案。',
    
    keyFindings: [
      '供应链透明度已成为消费者购买决策的重要因素，影响65%的消费者选择',
      '区块链技术可将供应链追溯效率提升80%，但实施成本仍然较高',
      '供应商协同是透明度建设的最大挑战，需要建立激励机制',
      '透明度投资的ROI通常在18-24个月内显现，主要体现在品牌价值提升'
    ],
    
    isPurchasable: true,
    price: 2280,
    currency: 'CNY',
    contactInfo: {
      email: 'supply@futurevision.com',
      phone: '+86-400-123-4567',
      wechat: 'FV_Supply_Chain',
      contactPerson: '张专家',
      department: '供应链研究中心'
    }
  }
];

// 获取所有报告
export function getAllInsightReports(): InsightReport[] {
  return insightReports;
}

// 根据ID获取特定报告
export function getInsightReportById(id: string): InsightReport | undefined {
  return insightReports.find(report => report.id === id);
}

// 获取精选报告
export function getFeaturedInsightReports(): InsightReport[] {
  return insightReports.filter(report => report.featured);
}

// 根据行业筛选报告
export function getInsightReportsByIndustry(industry: string): InsightReport[] {
  return insightReports.filter(report => 
    report.industry === industry || report.industry === '跨行业'
  );
}

// 根据分类筛选报告
export function getInsightReportsByCategory(category: string): InsightReport[] {
  return insightReports.filter(report => report.category === category);
}

// 获取最新报告
export function getLatestInsightReports(limit: number = 3): InsightReport[] {
  return insightReports
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// 搜索报告
export function searchInsightReports(query: string): InsightReport[] {
  const lowercaseQuery = query.toLowerCase();
  return insightReports.filter(report =>
    report.title.toLowerCase().includes(lowercaseQuery) ||
    report.summary.toLowerCase().includes(lowercaseQuery) ||
    report.industry.toLowerCase().includes(lowercaseQuery) ||
    report.topic.toLowerCase().includes(lowercaseQuery) ||
    report.category.toLowerCase().includes(lowercaseQuery)
  );
}

// 添加新报告（用于后续管理功能）
export function addInsightReport(report: InsightReport): void {
  insightReports.push(report);
}

// 更新报告（用于后续管理功能）
export function updateInsightReport(id: string, updatedReport: Partial<InsightReport>): boolean {
  const index = insightReports.findIndex(report => report.id === id);
  if (index !== -1) {
    insightReports[index] = { ...insightReports[index], ...updatedReport };
    return true;
  }
  return false;
}

// 删除报告（用于后续管理功能）
export function deleteInsightReport(id: string): boolean {
  const index = insightReports.findIndex(report => report.id === id);
  if (index !== -1) {
    insightReports.splice(index, 1);
    return true;
  }
  return false;
}