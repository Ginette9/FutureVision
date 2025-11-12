// 独家洞察报告数据结构
// 用于管理和展示独家洞察报告内容

export interface InsightReport {
  id: string;
  title: string;
  titleEn?: string; // 英文标题（可选）
  industry: string; // 行业
  topic: string; // 议题
  pages: number; // 页数
  summary: string; // 摘要
  date: string; // 发布日期
  category: string; // 分类
  source?: string; // 来源
  keywords?: string[]; // 关键词（可选）
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
  tableOfContents: TableOfContentsItem[]; // 目录页
  // 已移除“示例页面”相关字段（统一用完整PDF在线查看）
  
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
    industry: '泛行业',
    topic: 'ESG',
    pages: 144,
    summary:
      '综合分析2005-2024年全球企业在海外投资与经营中的ESG冲突事件，呈现全球图景与对中国企业的影响，揭示风险分布不均与行业差异，为企业出海提供关键情报与策略建议。',
    detailedSummary:
      `本报告综合分析了2005至2024年间全球企业在海外投资和经营过程中遭遇的社会与环境冲突事件（ESG冲突事件），并探讨了这些事件的全球图景和对中国企业的影响。报告指出，全球对外直接投资（FDI Outward）存量增长与ESG冲突事件数量呈正相关，且增长速度远超投资存量增速。报告通过数据分析发现，不同国家和行业的企业在出海过程中遭遇的ESG风险存在显著差异，且这些风险并非均匀分布。工业、非必需消费品和原材料行业面临的ESG冲突事件数量最多，而医疗健康、通信和公用事业等行业相对较少。

报告强调，中国企业在全球化进程中面临的ESG风险不容忽视。中国企业在出海前对目标国家的社会、环境与治理风险普遍预计不足，缺少预案，导致在处理冲突事件时表现不佳。此外，中国企业在海外遭遇的社会与环境冲突事件数量与全球对外直接投资总额呈正相关，并未显示出因是中国企业而受到普遍歧视的现象。

报告还分析了各大洲企业出海遭遇的社会与环境冲突事件概况，发现亚洲地区发生的ESG冲突事件数量最多，其次是欧洲和大洋洲、拉丁美洲和加勒比地区、中东和北非、非洲其他地区和北美。不同地区的企业在面对ESG冲突事件时的回应率也有所不同，欧洲和大洋洲企业的回应率最高，而亚洲和中东和北非地区的企业回应率最低。

最后，报告总结了全球各地企业面对社会与环境冲突事件的回应率，并指出企业回应率反映了不同国家、不同行业出海企业对于非常规风险的重视程度。报告旨在为中国企业出海提供非常规风险关键情报和对策建议，助力企业顺利出海，实现可持续发展。`,
  date: '2025-10-01',
  category: '独家洞察',
  source: 'Future Vision',
  coverImage: '/images/pdf-cover.png',
  tableOfContents: [],
  isPurchasable: true,
  currency: 'CNY'
  },
  {
    id: 'msci-esg-china-2025',
    title: '中国企业ESG评级跃迁指南：2024年MSCI ESG评级洞察报告',
    industry: '泛行业',
    topic: 'ESG',
    pages: 99,
    summary:
      '基于近2,500家企业截至2024年的MSCI ESG评级数据，解析全球与中国企业评级变化趋势及行业领先实践，提供评级跃升路径与策略建议。',
    detailedSummary:
      '在2025年2月，我们搜集、研究了全球近2,500家MSCI ESG评级企业截止2024年年底的相关数据。从2024年全球企业MSCI ESG评级趋势的变化及行业领先企业的实践中，我们看到中国企业正在金融、信息技术、通信服务等现代服务业，以及房地产、能源、工业这些传统行业上全面追赶全球竞争对手。即便是在面对全球贸易保护主义高墙、地缘政治博弈加剧、供应链重构压力增加等多重挑战下，中国企业在可持续发展竞争力领域的赶超趋势仍然势不可挡。\n\n在ESG评级这个不进则退的游戏中，您的企业ESG竞争力掉队了吗？还在发愁如何逆袭吗？\n\n2024年全球企业MSCI ESG评级洞察报告显示：\n✓ 在全球，金融、信息技术、通信服务三个行业可持续发展竞争力提升最快\n✓ 中国企业整体可持续发展竞争力水平落后，但评级提升趋势强劲，在几乎所有行业迎头赶上\n✓ 2025年超过30%的中国企业实现ESG评级提升，远超全球平均水平\n✓ 全球MSCI ESG评级跳级提升的企业中，中国内地企业占一半以上\n✓ 全球包括中国内地企业ESG评级落后集中体现在公司治理和企业行为两个议题\n✓ 评级表现优异的企业普遍开展可持续发展/ESG赋能商业的探索，头部企业已经构筑ESG护城河\n\n报告核心价值：\n✓ 可持续发展趋势解码：全球及主要国家可持续发展竞争力格局有何变化？哪些行业的企业更容易实现ESG评级跃升？MSCI ESG评级方法有哪些调整，企业应如何应对？\n✓ 评级跃升方法与路径：全球35家实现了评级跳级跃升的企业做对了什么？如何快速高效提升MSCI ESG评级？如何避坑？\n✓ 可持续发展战略：如何在可持续发展中找到商业机会，实现第二增长曲线？',
  date: '2025-02-01',
  category: '独家洞察',
  source: 'Future Vision独家发布',
  keywords: ['MSCI', 'ESG', '评级'],
  coverImage: '/images/pdf-cover.png',
  tableOfContents: [],
  isPurchasable: true,
  currency: 'CNY'
  },
  {
    id: 'unseen-unconventional-risks-2024',
    title: '未被察觉的致命风险——中企出海面临的新型非常规风险洞察报告',
    industry: '泛行业',
    topic: '企业环境影响评估与信息披露',
    pages: 72,
    summary:
      '基于2013-2022年数据的典型案例研究，系统梳理中企出海常被忽视的六大非常规风险，并提出可执行的应对策略与建议。',
    detailedSummary:
      '本报告根据2013至2022年中企出海所产生的环境与社会相关的矛盾冲突事件的详实统计数据，深入剖析了中企在出海过程中，由于受到国内经营管理惯性和习惯的影响，经常被忽视的六大非常规风险。\n数据显示，中企出海几乎都会遭遇到这些非常规风险，但我们的企业往往没有在出海之前进行充分的调查与了解，也未能在思想和应对上提前做好预案，导致风险发生时不能及时作出适当的应对，最终付出惨重的代价。\n报告通过超过30个实际案例，对中企出海的主要行业、热门目的地进行了客观详实的风险分析，并总结出可执行落地的应对策略与建议，力求帮助出海中企能够重视这些非常规风险，并在理解风险成因的基础上采取切实可行的行动以规避和解决上述风险，最终得以在海外成功立足、进一步获得发展。',
  date: '2024-01-01',
  category: '独家洞察',
  source: 'MSC独家发布',
  keywords: ['劳工权益', '冲突矿产', '生物多样性', '社区矛盾', '种族与文化冲突', '野生动物保护', '环保问题'],
  coverImage: '/images/pdf-cover.png',
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

async function saveToServerIfAvailable() {
  try {
    if (typeof window === 'undefined') return;
    // 同源API；失败则尝试本地开发端口（3002）
    const payload = { items: insightReports };
    const tryUrls = ['/api/insights', 'http://localhost:3002/api/insights'];
    for (const url of tryUrls) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
    // 同步到服务端（若可用），并通知前端刷新
    // 不阻塞：异步触发，忽略错误
    void saveToServerIfAvailable();
    dispatchUpdateEvent();
  } catch {}
}
bootstrapStore();

// 首次加载（localStorage为空）时尝试从服务端拉取并覆盖内存与本地存储
async function bootstrapFromServerIfEmpty() {
  try {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return; // 已有本地存储则不覆盖
    // 依次尝试同源与本地开发端口
    const urls = ['/api/insights', 'http://localhost:3002/api/insights'];
    let data: any = null;
    for (const url of urls) {
      try {
        const resp = await fetch(url);
        if (resp.ok) { data = await resp.json(); break; }
      } catch {}
    }
    if (!data) return;
    const arr = Array.isArray(data?.items) ? data.items : [];
    if (Array.isArray(arr) && arr.length > 0) {
      insightReports.splice(0, insightReports.length, ...arr);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(insightReports));
      dispatchUpdateEvent();
    }
  } catch {}
}
void bootstrapFromServerIfEmpty();

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