// 特殊标题替换映射表
const specialTitleMap: Record<string, string> = {
  'Important to know': 'Important to consider',
  'CSR labels, supply chain initiatives & guidelines': 'ESG labels, supply chain initiatives & guidelines',
  'CSR organizations': 'Relevant organizations',
  'About MVO Nederland': 'About MSC HK',
  // 如有更多特殊替换可继续添加
};

export interface RiskItem {
  riskTitle: string;
  riskDescription: string;
  sources?: string[];
  rawHtml?: string;
}

export interface RecommendationItem {
  recommendationText: string;
  rawHtml?: string;
}

export interface ThemeEntry {
  themeName: string;
  risks: RiskItem[];
  recommendations: RecommendationItem[];
  riskCount?: number;
  recommendationCount?: number;
}

export interface RiskCategory {
  categoryTitle: string;
  themes: ThemeEntry[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'risk';
  html?: string;
  categories?: RiskCategory[];
}

export function parseReportHtml(html: string): ReportSection[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const container = doc.querySelector('div.csr-risk-results');
  if (!container) return [];

  const blocks = Array.from(container.querySelectorAll('div.mb-16.flex.w-full.flex-col'));
  const result: ReportSection[] = [];

  const categoryMapping: Record<string, string> = {
    'theme-taxation': 'Fair business practices',
    'theme-corruption': 'Fair business practices',
    'theme-market-distortion-competition': 'Fair business practices',

    'theme-government-influence': 'Human rights & ethics',
    'theme-conflicts-security': 'Human rights & ethics',
    'theme-land-use-property-rights': 'Human rights & ethics',
    'theme-community-impact': 'Human rights & ethics',
    'theme-animal-welfare': 'Human rights & ethics',
    'theme-consumer-interests-product-safety': 'Human rights & ethics',

    'theme-biodiversity-deforestation': 'Environment',
    'theme-climate-energy': 'Environment',
    'theme-water-use-water-availability': 'Environment',
    'theme-air-pollution': 'Environment',
    'theme-soil-groundwater-contamination': 'Environment',
    'theme-environment-waste-general': 'Environment',

    'theme-freedom-of-association': 'Labour rights',
    'theme-labour-conditions-contracts-working-hours': 'Labour rights',
    'theme-forced-labour-human-trafficking': 'Labour rights',
    'theme-child-labour': 'Labour rights',
    'theme-discrimination-gender': 'Labour rights',
    'theme-wage-remuneration': 'Labour rights',
    'theme-health-safety-at-work': 'Labour rights',
  };

  for (const block of blocks) {
    const header = block.querySelector('h2,h3');
    // 替换title逻辑
    let title = header?.textContent?.trim() || 'Untitled';

    // 优先使用特殊标题映射表进行替换
    if (specialTitleMap[title]) {
      title = specialTitleMap[title];
    } else {
      // 否则进行普通替换
      title = title.replace(/CSR/g, 'ESG');
    }

    const section = block.querySelector('article,section');
    const id =
      section?.id ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

    const isRiskSection = title.toLowerCase().includes('risk analysis') || id.includes('risk-analysis');

    if (isRiskSection) {
      const grids = Array.from(block.querySelectorAll('div[x-data="{ riskOpen: false, adviceOpen: false }"]'));
      const categoryMap: Record<string, RiskCategory> = {};

      for (const grid of grids) {
        const themeDiv = grid.querySelector('div[id]');
        const themeId = themeDiv?.id || '';
        const categoryTitle = categoryMapping[themeId] || 'Uncategorized';
        const themeTitle = themeDiv?.querySelector('h3')?.textContent?.trim() || themeId;

        const risks: RiskItem[] = [];
        const recommendations: RecommendationItem[] = [];

        // ✅ Parse risks
        const riskWrapper = grid.querySelector('div[x-show="riskOpen"]');
        const riskBlock = riskWrapper?.querySelector('div.risk');

        if (riskBlock) {
          const riskModules = Array.from(riskBlock.querySelectorAll('div.bg-white.p-4'));

          for (const module of riskModules) {
            const lines: string[] = [];

            const prose = module.querySelector('div.prose');
            if (prose) {
              const contentElements = Array.from(prose.querySelectorAll('p, ol, ul, li'));
              for (const el of contentElements) {
                const text = el.textContent?.trim();
                if (text) lines.push(text);
              }
            }

            const sourceLinks = Array.from(module.querySelectorAll('ul li a')).map((a) =>
              a.textContent?.trim() || ''
            );

            if (lines.length > 0) {
              risks.push({
                riskTitle: themeTitle,
                riskDescription: lines.join('\n'),
                sources: sourceLinks,
                rawHtml: module.outerHTML
                  .replace('text-red"', 'text-purple-900"')
                  .replace(/text-blue-700/g, 'text-purple-900')
                  .replace(/\bbg-green\b/g, 'bg-sky-600') // Country标签 背景色
                  .replace(/\bbg-beige-700\b/g, 'bg-cyan-600') // Product标签 背景色
                  .replace(/\bbg-gray\b/g, 'bg-gray-500') // General标签 背景色
                  .replace(/<span class="([^"]*\bh-6\b[^"]*)">/g, '<span class="$1 flex items-center">'),
              });
            }
          }
        }

        // ✅ Parse recommendations
        const recWrapper = grid.querySelector('div[x-show="adviceOpen"]');
        const recBlock = recWrapper?.querySelector('div.risk');

        if (recBlock) {
          const recommendationModules = Array.from(recBlock.querySelectorAll('div.bg-white.px-4.py-8'));

          for (const module of recommendationModules) {
            const lines: string[] = [];

            const prose = module.querySelector('div.prose');
            if (prose) {
              const contentElements = Array.from(prose.querySelectorAll('p, ol, ul, li'));
              for (const el of contentElements) {
                const text = el.textContent?.trim();
                if (text) lines.push(text);
              }
            }

            if (lines.length > 0) {
              recommendations.push({
                recommendationText: lines.join('\n'),
                rawHtml: module.outerHTML
                  .replace(/\bbg-green\b/g, 'bg-sky-600') // Country标签 背景色
                  .replace(/\bbg-beige-700\b/g, 'bg-cyan-600') // Product标签 背景色
                  .replace(/\bbg-gray\b/g, 'bg-gray-500') // General标签 背景色
                  .replace(/<span class="([^"]*\bh-6\b[^"]*)">/g, '<span class="$1 flex items-center">'),
              });
            }
          }
        }

        if (!categoryMap[categoryTitle]) {
          categoryMap[categoryTitle] = { categoryTitle, themes: [] };
        }

        categoryMap[categoryTitle].themes.push({
          themeName: themeTitle,
          risks,
          recommendations,
          riskCount: risks.length,
          recommendationCount: recommendations.length,
        });
      }

      result.push({
        id,
        title,
        type: 'risk',
        categories: Object.values(categoryMap),
      });
    } else {
      result.push({
        id,
        title,
        type: 'text',
        html: block.outerHTML,
      });
    }
  }

  return result;
}
