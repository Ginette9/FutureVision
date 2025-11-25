// 独家洞察报告数据结构
// 用于管理和展示独家洞察报告内容

import { getApiBaseUrl } from '@/lib/utils';

export interface InsightReport {
  id: string;
  title: string;
  titleEn?: string; // 英文标题（可选）
  summaryEn?: string; // 英文摘要（可选）
  industry: string; // 行业
  industryEn?: string; // 英文行业（可选）
  topic: string; // 议题
  topicEn?: string; // 英文议题（可选）
  pages: number; // 页数
  summary: string; // 摘要
  date: string; // 发布日期
  category: string; // 分类
  categoryEn?: string;
  source?: string; // 来源
  sourceEn?: string;
  keywords?: string[]; // 关键词（可选）
  keywordsEn?: string[];
  featured?: boolean; // 是否为精选报告

  // PDF来源与页面映射（可选）
  pdfUrl?: string; // 完整PDF的地址（建议保存在 /public/reports/ 下）
  coverPage?: number; // 封面页码（默认1）
  tocPages?: number[]; // 目录页码列表（可选）

  // 报告内容
  coverImage: string; // 封面图片
  // 封面裁剪（垂直偏移百分比，0=顶部，100=底部）
  coverCropY?: number;
  tocImageUrl?: string; // 目录截图（可选，便捷展示）
  tocImageUrls?: string[];
  tableOfContents: TableOfContentsItem[]; // 目录页
  // 已移除“示例页面”相关字段（统一用完整PDF在线查看）
  
  // 详细内容（展开后显示）
  detailedSummary?: string; // 详细摘要
  detailedSummaryEn?: string; // 英文详细摘要
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
    id: 'global-esg-conflicts-2025',
    title: '企业出海非常规风险：全球ESG冲突事件洞察（全球篇）',
    titleEn: 'Unconventional Risks in Overseas Expansion: Global Insights on ESG Conflict Events (Global Edition)',
    industry: '泛行业',
    industryEn: 'Cross-Industry',
    topic: 'ESG',
    topicEn: 'ESG',
    pages: 144,
    summary:
      '综合分析2005-2024年全球企业在海外投资与经营中的ESG冲突事件，呈现全球图景与对中国企业的影响，揭示风险分布不均与行业差异，为企业出海提供关键情报与策略建议。',
    summaryEn:
      'Analyzes 2005–2024 global ESG conflict events in overseas investment and operations, presents global patterns and impacts on Chinese enterprises, reveals uneven risk distribution and industry differences, and offers key intelligence and strategic recommendations.',
    detailedSummary:
      `本报告综合分析了2005至2024年间全球企业在海外投资和经营过程中遭遇的社会与环境冲突事件（ESG冲突事件），并探讨了这些事件的全球图景和对中国企业的影响。报告指出，全球对外直接投资（FDI Outward）存量增长与ESG冲突事件数量呈正相关，且增长速度远超投资存量增速。报告通过数据分析发现，不同国家和行业的企业在出海过程中遭遇的ESG风险存在显著差异，且这些风险并非均匀分布。工业、非必需消费品和原材料行业面临的ESG冲突事件数量最多，而医疗健康、通信和公用事业等行业相对较少。

报告强调，中国企业在全球化进程中面临的ESG风险不容忽视。中国企业在出海前对目标国家的社会、环境与治理风险普遍预计不足，缺少预案，导致在处理冲突事件时表现不佳。此外，中国企业在海外遭遇的社会与环境冲突事件数量与全球对外直接投资总额呈正相关，并未显示出因是中国企业而受到普遍歧视的现象。

报告还分析了各大洲企业出海遭遇的社会与环境冲突事件概况，发现亚洲地区发生的ESG冲突事件数量最多，其次是欧洲和大洋洲、拉丁美洲和加勒比地区、中东和北非、非洲其他地区和北美。不同地区的企业在面对ESG冲突事件时的回应率也有所不同，欧洲和大洋洲企业的回应率最高，而亚洲和中东和北非地区的企业回应率最低。

最后，报告总结了全球各地企业面对社会与环境冲突事件的回应率，并指出企业回应率反映了不同国家、不同行业出海企业对于非常规风险的重视程度。报告旨在为中国企业出海提供非常规风险关键情报和对策建议，助力企业顺利出海，实现可持续发展。`,
    detailedSummaryEn:
      `This report provides a comprehensive analysis of social and environmental conflict events (ESG conflict events) encountered by global enterprises during overseas investment and operations from 2005 to 2024, and examines the global landscape of these events and their impact on Chinese enterprises. The report indicates that the growth of global outward foreign direct investment (FDI) stock is positively correlated with the number of ESG conflict events, with the growth rate far exceeding that of investment stock. Through data analysis, the report finds significant differences in ESG risks faced by enterprises from different countries and industries during their overseas expansion, and these risks are not evenly distributed. The industrial, consumer discretionary, and raw materials sectors face the most ESG conflict events, while healthcare, telecommunications, and utilities sectors experience relatively fewer incidents.

The report emphasizes that ESG risks faced by Chinese enterprises in the globalization process cannot be ignored. Chinese enterprises generally lack sufficient understanding and preparation for social, environmental, and governance risks in target countries before expanding overseas, resulting in poor performance when handling conflict incidents. Additionally, the number of social and environmental conflict events encountered by Chinese enterprises overseas is positively correlated with total global outward foreign direct investment, showing no evidence of widespread discrimination against Chinese enterprises.

The report also analyzes the overview of social and environmental conflict events encountered by enterprises from different continents during their overseas expansion. It finds that Asia has the highest number of ESG conflict events, followed by Europe and Oceania, Latin America and the Caribbean, Middle East and North Africa, other parts of Africa, and North America. Response rates to ESG conflict events vary across different regions, with European and Oceanian enterprises showing the highest response rates, while Asian and Middle Eastern/North African enterprises showing the lowest.

Finally, the report summarizes global enterprise response rates to social and environmental conflict events and notes that these response rates reflect the importance placed on unconventional risks by enterprises from different countries and industries. The report aims to provide critical intelligence and strategic recommendations on unconventional risks for Chinese enterprises going global, helping them successfully expand overseas and achieve sustainable development.`,
  date: '2025-10-01',
  category: '独家洞察',
  categoryEn: 'Exclusive Insights',
  source: 'Future Vision',
  sourceEn: 'Future Vision',
  coverImage: '/images/insights/unconventional-cover.png',
  tableOfContents: [],
  isPurchasable: true,
  currency: 'CNY'
  },
  {
    id: 'msci-esg-china-2025',
    title: '中国企业ESG评级跃迁指南：2024年MSCI ESG评级洞察报告',
    titleEn: 'Chinese Enterprises ESG Rating Leap Guide: 2024 MSCI ESG Rating Insights Report',
    industry: '泛行业',
    topic: 'ESG',
    pages: 99,
    summary:
      '基于近2,500家企业截至2024年的MSCI ESG评级数据，解析全球与中国企业评级变化趋势及行业领先实践，提供评级跃升路径与策略建议。',
    summaryEn:
      'Based on ~2,500 enterprises’ MSCI ESG ratings as of 2024, analyzes global and China rating trends and leading practices, and provides improvement pathways and recommendations.',
    detailedSummary:
      '在2025年2月，我们搜集、研究了全球近2,500家MSCI ESG评级企业截止2024年年底的相关数据。从2024年全球企业MSCI ESG评级趋势的变化及行业领先企业的实践中，我们看到中国企业正在金融、信息技术、通信服务等现代服务业，以及房地产、能源、工业这些传统行业上全面追赶全球竞争对手。即便是在面对全球贸易保护主义高墙、地缘政治博弈加剧、供应链重构压力增加等多重挑战下，中国企业在可持续发展竞争力领域的赶超趋势仍然势不可挡。\n\n在ESG评级这个不进则退的游戏中，您的企业ESG竞争力掉队了吗？还在发愁如何逆袭吗？\n\n2024年全球企业MSCI ESG评级洞察报告显示：\n✓ 在全球，金融、信息技术、通信服务三个行业可持续发展竞争力提升最快\n✓ 中国企业整体可持续发展竞争力水平落后，但评级提升趋势强劲，在几乎所有行业迎头赶上\n✓ 2025年超过30%的中国企业实现ESG评级提升，远超全球平均水平\n✓ 全球MSCI ESG评级跳级提升的企业中，中国内地企业占一半以上\n✓ 全球包括中国内地企业ESG评级落后集中体现在公司治理和企业行为两个议题\n✓ 评级表现优异的企业普遍开展可持续发展/ESG赋能商业的探索，头部企业已经构筑ESG护城河\n\n报告核心价值：\n✓ 可持续发展趋势解码：全球及主要国家可持续发展竞争力格局有何变化？哪些行业的企业更容易实现ESG评级跃升？MSCI ESG评级方法有哪些调整，企业应如何应对？\n✓ 评级跃升方法与路径：全球35家实现了评级跳级跃升的企业做对了什么？如何快速高效提升MSCI ESG评级？如何避坑？\n✓ 可持续发展战略：如何在可持续发展中找到商业机会，实现第二增长曲线？',
    detailedSummaryEn:
      'In February 2025, we collected and studied relevant data from nearly 2,500 MSCI ESG-rated enterprises worldwide as of the end of 2024. From the changes in global enterprise MSCI ESG rating trends in 2024 and the practices of industry-leading companies, we can see that Chinese enterprises are comprehensively catching up with global competitors in modern service industries such as finance, information technology, and telecommunications services, as well as in traditional industries including real estate, energy, and industrials. Even when facing multiple challenges such as rising global trade protectionism, intensifying geopolitical games, and increasing supply chain restructuring pressures, the catching-up trend of Chinese enterprises in sustainable development competitiveness remains unstoppable.\n\nIn the ESG rating game where you either advance or fall behind, has your companys ESG competitiveness fallen behind? Still worried about how to make a comeback?\n\nThe 2024 Global Enterprise MSCI ESG Rating Insights Report shows:\n✓ Globally, three industries - finance, information technology, and telecommunications services - have the fastest improvement in sustainable development competitiveness\n✓ Chinese enterprises overall lag in sustainable development competitiveness, but show strong rating improvement trends, catching up in almost all industries\n✓ Over 30% of Chinese enterprises achieved ESG rating improvements in 2025, far exceeding the global average\n✓ Among enterprises worldwide that achieved leapfrog ESG rating improvements, more than half are from mainland China\n✓ Global enterprises, including those from mainland China, lag in ESG ratings mainly in corporate governance and corporate behavior topics\n✓ Enterprises with excellent rating performance generally explore sustainable development/ESG-enabled business opportunities, with leading companies already building ESG moats\n\nCore report value:\n✓ Sustainable development trend decoding: What changes have occurred in the global sustainable development competitiveness landscape? Which industries enterprises are more likely to achieve ESG rating leaps? What adjustments have been made to MSCI ESG rating methodologies, and how should enterprises respond?\n✓ Rating improvement methods and pathways: What did 35 global enterprises that achieved leapfrog rating improvements do right? How to quickly and efficiently improve MSCI ESG ratings? How to avoid pitfalls?\n✓ Sustainable development strategy: How to find business opportunities in sustainable development and achieve second growth curve?',
  date: '2025-02-01',
  category: '独家洞察',
  categoryEn: 'Exclusive Insights',
  source: 'Future Vision独家发布',
  sourceEn: 'Future Vision Exclusive Release',
  keywords: ['MSCI', 'ESG', '评级'],
  keywordsEn: ['MSCI', 'ESG', 'Rating'],
  coverImage: '/images/insights/msci-cover.png',
  tableOfContents: [],
  isPurchasable: true,
  currency: 'CNY'
  },
  {
    id: 'unseen-unconventional-risks-2024',
    title: '未被察觉的致命风险——中企出海面临的新型非常规风险洞察报告',
    titleEn: 'Unseen Critical Risks — New Unconventional Risks Facing Chinese Enterprises Going Overseas',
    industry: '泛行业',
    topic: '企业环境影响评估与信息披露',
    pages: 72,
    summary:
      '基于2013-2022年数据的典型案例研究，系统梳理中企出海常被忽视的六大非常规风险，并提出可执行的应对策略与建议。',
    summaryEn:
      'Based on 2013–2022 typical case studies, systematically outlines six often-overlooked unconventional risks for Chinese enterprises overseas and offers actionable strategies and recommendations.',
    detailedSummary:
      '本报告根据2013至2022年中企出海所产生的环境与社会相关的矛盾冲突事件的详实统计数据，深入剖析了中企在出海过程中，由于受到国内经营管理惯性和习惯的影响，经常被忽视的六大非常规风险。\n数据显示，中企出海几乎都会遭遇到这些非常规风险，但我们的企业往往没有在出海之前进行充分的调查与了解，也未能在思想和应对上提前做好预案，导致风险发生时不能及时作出适当的应对，最终付出惨重的代价。\n报告通过超过30个实际案例，对中企出海的主要行业、热门目的地进行了客观详实的风险分析，并总结出可执行落地的应对策略与建议，力求帮助出海中企能够重视这些非常规风险，并在理解风险成因的基础上采取切实可行的行动以规避和解决上述风险，最终得以在海外成功立足、进一步获得发展。',
    detailedSummaryEn:
      'Based on detailed statistical data of environmental and social conflict events related to Chinese enterprises going overseas from 2013 to 2022, this report provides an in-depth analysis of six unconventional risks that are often overlooked by Chinese enterprises in their overseas expansion process, due to the influence of domestic management inertia and habits.\n\nData shows that Chinese enterprises going overseas almost always encounter these unconventional risks, but our enterprises often fail to conduct sufficient investigation and understanding before going overseas, and are unable to prepare contingency plans in advance in terms of mindset and response. This results in the inability to make appropriate responses in a timely manner when risks occur, ultimately paying a heavy price.\n\nThrough more than 30 actual cases, the report provides objective and detailed risk analysis of major industries and popular destinations for Chinese enterprises going overseas, and summarizes actionable and implementable response strategies and recommendations. It aims to help overseas Chinese enterprises pay attention to these unconventional risks, and take practical and feasible actions to avoid and resolve the above risks based on understanding the causes of risks, ultimately enabling them to successfully establish themselves overseas and further achieve development.',
  date: '2024-01-01',
  category: '独家洞察',
  categoryEn: 'Exclusive Insights',
  source: 'MSC独家发布',
  sourceEn: 'MSC Exclusive Release',
  keywords: ['劳工权益', '冲突矿产', '生物多样性', '社区矛盾', '种族与文化冲突', '野生动物保护', '环保问题'],
  keywordsEn: ['Labor Rights', 'Conflict Minerals', 'Biodiversity', 'Community Conflicts', 'Racial and Cultural Conflicts', 'Wildlife Protection', 'Environmental Issues'],
  coverImage: '/images/insights/africa-cover.jpeg',
  tableOfContents: [],
  isPurchasable: true,
  currency: 'CNY'
  }
];

// 本地持久化（仅在浏览器运行时生效）
const STORAGE_KEY = 'insightReportsStore';
const UPDATE_EVENT = 'insights-store-updated';

function dispatchUpdateEvent() {
  try {
    if (typeof window === 'undefined') return;
    const ev = new Event(UPDATE_EVENT);
    window.dispatchEvent(ev);
  } catch {}
}

// 运行时服务端同步开关：默认仅在开发环境启用；如需线上启用，请设置 VITE_ENABLE_SERVER_INSIGHTS=true
const ENABLE_SERVER_SYNC = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (((import.meta as any).env.DEV === true) || ((import.meta as any).env.VITE_ENABLE_SERVER_INSIGHTS === 'true'))
  : false;

async function saveToServerIfAvailable() {
  try {
    if (typeof window === 'undefined') return;
    // 同源API；失败则尝试本地开发端口（3002）
    const payload = { items: insightReports };
    const base = getApiBaseUrl();
    const tryUrls = [`${base}/api/insights`, 'http://localhost:3001/api/insights', 'http://localhost:3002/api/insights'];
    for (const url of tryUrls) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(typeof window !== 'undefined' && window.localStorage.getItem('adminToken') 
              ? { 'X-Admin-Token': String(window.localStorage.getItem('adminToken')) } 
              : {})
          },
          body: JSON.stringify(payload)
        });
        if (resp.ok) break;
      } catch {}
    }
  } catch {}
}
function bootstrapStore() {
  try {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      // 统一移除旧数据中的阅读时长字段
      for (const r of arr) {
        if (r && typeof r === 'object' && 'readTime' in r) {
          delete r.readTime;
        }
        // 同步移除示例页旧字段
        if (r && typeof r === 'object' && 'samplePages' in r) {
          delete r.samplePages;
        }
        if (r && typeof r === 'object' && 'samplePageNumbers' in r) {
          delete r.samplePageNumbers;
        }
      }
      insightReports.splice(0, insightReports.length, ...arr);
    }
  } catch (e) {
    console.warn('Failed to bootstrap insight reports store:', (e as Error).message);
  }
}
function saveStore() {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(insightReports));
    if (ENABLE_SERVER_SYNC) {
      void saveToServerIfAvailable();
    }
    dispatchUpdateEvent();
  } catch {}
}
bootstrapStore();

async function bootstrapFromPublicJson() {
  try {
    if (typeof window === 'undefined') return;
    const resp = await fetch('/data/insights.json');
    if (!resp.ok) return;
    const arr = await resp.json();
    if (Array.isArray(arr) && arr.length > 0) {
      insightReports.splice(0, insightReports.length, ...arr as InsightReport[]);
      saveStore();
    }
  } catch {}
}
void bootstrapFromPublicJson();

// 获取所有报告
export function getAllInsightReports(): InsightReport[] {
  return insightReports;
}

// 覆盖式替换整个列表（导入JSON使用）
export function replaceInsightReports(items: InsightReport[]): void {
  if (Array.isArray(items)) {
    insightReports.splice(0, insightReports.length, ...items);
    saveStore();
  }
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
  // 新增报告置顶显示：插入到数组头部
  insightReports.unshift(report);
  saveStore();
}

// 更新报告（用于后续管理功能）
export function updateInsightReport(id: string, updatedReport: Partial<InsightReport>): boolean {
  const index = insightReports.findIndex(report => report.id === id);
  if (index !== -1) {
    insightReports[index] = { ...insightReports[index], ...updatedReport };
    saveStore();
    return true;
  }
  return false;
}

// 删除报告（用于后续管理功能）
export function deleteInsightReport(id: string): boolean {
  const index = insightReports.findIndex(report => report.id === id);
  if (index !== -1) {
    insightReports.splice(index, 1);
    saveStore();
    return true;
  }
  return false;
}

// 调整报告顺序：上移/下移（持久化）
export function moveInsightReportUp(id: string): boolean {
  const index = insightReports.findIndex(r => r.id === id);
  if (index > 0) {
    const [item] = insightReports.splice(index, 1);
    insightReports.splice(index - 1, 0, item);
    saveStore();
    return true;
  }
  return false;
}

export function moveInsightReportDown(id: string): boolean {
  const index = insightReports.findIndex(r => r.id === id);
  if (index !== -1 && index < insightReports.length - 1) {
    const [item] = insightReports.splice(index, 1);
    insightReports.splice(index + 1, 0, item);
    saveStore();
    return true;
  }
  return false;
}

// 将报告置顶
export function moveInsightReportToTop(id: string): boolean {
  const index = insightReports.findIndex(r => r.id === id);
  if (index > 0) {
    const [item] = insightReports.splice(index, 1);
    insightReports.unshift(item);
    saveStore();
    return true;
  }
  return false;
}
