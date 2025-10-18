// 本地报告数据结构
// 用于替换从API抓取的动态内容

export interface LocalRiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface LocalTheme {
  id: string;
  title: string;
  description?: string;
  risks: LocalRiskItem[];
}

export interface LocalRiskCategory {
  id: string;
  title: string;
  description?: string;
  themes: LocalTheme[];
}

export interface LocalCard {
  id: string;
  title: string;
  content: string;
  logoUrl?: string;
}

export interface LocalReportSection {
  id: string;
  title: string;
  description?: string;
  html?: string;
  cards?: LocalCard[];
  categories?: LocalRiskCategory[];
}

export interface LocalReportData {
  industry: string;
  country: string;
  introHtml?: string;
  sections: {
    introduction?: LocalReportSection;
    payAttention?: LocalReportSection;
    riskAnalysis?: LocalReportSection;
    csr?: LocalReportSection;
    csrLabels?: LocalReportSection;
    dueDiligence?: LocalReportSection;
    aboutMvo?: LocalReportSection;
    contact?: LocalReportSection;
    disclaimer?: LocalReportSection;
  };
}

// 示例数据结构 - 纺织品 + 中国
export const sampleReportData: LocalReportData = {
  industry: "Textiles",
  country: "China",
  introHtml: `
    <div class="intro-content">
      <h3>Industry Analysis: Textiles in China</h3>
      <p>China is the world's largest textile producer and exporter, accounting for over 50% of global textile production. The industry faces significant ESG challenges including labor conditions, environmental impact, and supply chain transparency.</p>
    </div>
  `,
  sections: {
    introduction: {
      id: "introduction",
      title: "Introduction",
      description: "Overview of ESG risks in the textile industry in China"
    },
    payAttention: {
      id: "pay-attention",
      title: "Important to Consider",
      description: "Key ESG considerations for textile operations in China",
      cards: [
        {
          id: "labor-conditions",
          title: "Labor Conditions",
          content: "Ensure fair wages, safe working conditions, and compliance with labor laws. Monitor working hours and overtime practices."
        },
        {
          id: "environmental-impact",
          title: "Environmental Impact",
          content: "Address water pollution, chemical usage, and waste management. Implement sustainable production practices."
        },
        {
          id: "supply-chain",
          title: "Supply Chain Transparency",
          content: "Maintain visibility across the entire supply chain. Ensure suppliers meet ESG standards and compliance requirements."
        }
      ]
    },
    riskAnalysis: {
      id: "risk-analysis",
      title: "Risk Analysis",
      description: "Comprehensive ESG risk assessment for textile operations in China",
      categories: [
        {
          id: "environmental-risks",
          title: "Environmental Risks",
          description: "Environmental compliance and sustainability risks",
          themes: [
            {
              id: "water-pollution",
              title: "Water Pollution",
              description: "Risks related to textile dyeing and finishing processes",
              risks: [
                {
                  id: "chemical-discharge",
                  title: "Chemical Discharge",
                  description: "Improper discharge of chemicals and dyes into water systems",
                  severity: "high",
                  recommendations: [
                    "Implement advanced wastewater treatment systems",
                    "Use eco-friendly dyes and chemicals",
                    "Regular monitoring of discharge quality"
                  ]
                }
              ]
            }
          ]
        },
        {
          id: "social-risks",
          title: "Social Risks",
          description: "Labor and community-related risks",
          themes: [
            {
              id: "worker-safety",
              title: "Worker Safety",
              description: "Occupational health and safety risks in textile manufacturing",
              risks: [
                {
                  id: "workplace-accidents",
                  title: "Workplace Accidents",
                  description: "Risk of injuries from machinery and chemical exposure",
                  severity: "medium",
                  recommendations: [
                    "Implement comprehensive safety training programs",
                    "Regular safety equipment maintenance",
                    "Establish emergency response procedures"
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    csr: {
      id: "csr",
      title: "Relevant Organizations",
      description: "Key organizations and initiatives relevant to textile ESG in China",
      cards: [
        {
          id: "better-cotton",
          title: "Better Cotton Initiative",
          content: "Global sustainability initiative promoting better cotton farming practices",
          logoUrl: "/images/better-cotton-logo.png"
        },
        {
          id: "oeko-tex",
          title: "OEKO-TEX",
          content: "International testing and certification system for textiles",
          logoUrl: "/images/oeko-tex-logo.png"
        }
      ]
    },
    csrLabels: {
      id: "csr-labels",
      title: "ESG Labels & Guidelines",
      description: "Relevant ESG labels, certifications, and supply chain initiatives",
      cards: [
        {
          id: "gots",
          title: "Global Organic Textile Standard (GOTS)",
          content: "Leading standard for organic fiber textiles with environmental and social criteria",
          logoUrl: "/images/gots-logo.png"
        },
        {
          id: "cradle-to-cradle",
          title: "Cradle to Cradle Certified",
          content: "Multi-attribute certification program for safe, circular, and responsible products",
          logoUrl: "/images/c2c-logo.png"
        }
      ]
    }
  }
};

// 数据获取函数
export function getLocalReportData(industry: string, country: string): LocalReportData | null {
  // 目前只有示例数据，后续可以扩展为支持多个行业和国家的组合
  if (industry.toLowerCase().includes('textile') && country.toLowerCase().includes('china')) {
    return sampleReportData;
  }
  
  // 如果没有匹配的本地数据，返回null，继续使用API数据
  return null;
}

// 将本地数据转换为现有组件期望的格式
export function convertLocalDataToApiFormat(localData: LocalReportData) {
  return {
    industry: { name: localData.industry },
    country: { name: localData.country },
    sections: Object.values(localData.sections).filter(Boolean),
    introHtml: localData.introHtml
  };
}