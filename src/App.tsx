import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import Home from "./pages/Home";
import ESGRiskAnalysis from "./products/esg-voyant/ESGRiskAnalysis";
import ESGRiskAnalysisNew from "./products/esg-voyant/ESGRiskAnalysisNew";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Insights from "./pages/Insights";
import Knowledge from "./pages/Knowledge";
import Cases from "./pages/Cases";
import About from "./pages/About";
import AdminInsights from "./pages/AdminInsights";
import AdminNews from "./pages/AdminKnowledge";
import AdminKnowledge from "./pages/AdminKnowledge";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminInviteCodes from "./pages/AdminInviteCodes";
import ReportResult from "./products/esg-voyant/ReportResult";
import ReportResultNew from "./products/esg-voyant/ReportResultNew";
import Pay from "./products/esg-voyant/Pay";
import Navigation from './components/Navigation';
import RouteGuard from './components/RouteGuard';
import { AuthContext } from './contexts/authContext';
import { useLanguage } from './contexts/LanguageContext';
import { convertToTraditional } from './locales/zh-HK';
import { prefetchAllDatabases } from '@/lib/database';
import { apiGet } from '@/lib/utils';

/* 使用 src/images 中的本地图，确保打包后地址正确 */
// 已移除封面/尾页资源

/* =========================
   PDF 导出配置（可通过 window.__fvPdfConfig 覆盖）
========================= */
type PdfConfig = {
  cover?: {
    title?: string;            // 封面主标题
    subtitle?: string;         // 副标题（如客户名/选品/选国）
    clientName?: string;       // 客户名（可选，单独一行）
    dateText?: string;         // 生成时间（默认：今天）
    extraNote?: string;        // 额外说明（可选）
  };
  back?: {
    headline?: string;         // 尾页大标题
    email?: string;
    phone?: string;
    website?: string;
    address?: string;          // 可选：地址一行
    qrImageUrl?: string;       // 二维码图片地址（http(s) 或本地路径），自动转 DataURL
    qrCaption?: string;        // 二维码下方说明
    copyrightOwner?: string;   // 版权归属名（默认 GlobalRisk）
  };
  footer?: {
    includeCover?: boolean;    // 封面是否绘制页脚（默认 false）
    includeBack?: boolean;     // 封底是否绘制页脚（默认 false）
    numberCover?: boolean;     // 封面是否计入页码（默认 false）
    numberBack?: boolean;      // 封底是否计入页码（默认 false）
  };
  enableCover?: boolean;       // 是否添加封面（默认 true）
  enableBack?: boolean;        // 是否添加封底（默认 true）
};

// 移除全局 Window 声明，避免类型冲突

/* =========================
   通用工具
========================= */

// 已移除资源转 DataURL 的函数

// 已移除 PDF 页面辅助函数

/* =========================
   已删除封面/封底实现
========================= */

/* =========================
   页脚绘制（Logo + 页码）
========================= */

// 已移除页脚配置类型

// 已移除页脚绘制（Logo + 页码）

/* =========================
   兜底导出钩子：插入封面/封底 + 绘制页脚
   使用方式：
   html2pdf().from(root).set(...).toPdf().get('pdf').then(async pdf => {
     await window.__fvAddPdfFooter?.(pdf);
     pdf.save('Report.pdf');
   })

   运行时可配置（示例）：
   window.__fvPdfConfig = {
     enableCover: true,
     enableBack: true,
     cover: {
       title: "Future Vision · ESG 风险报告",
       subtitle: "Selected Products / Countries",
       clientName: "Client: Xiamen C&D Group",
       dateText: "Generated on 2025-08-22",
       extraNote: "Confidential · For internal use only"
     },
     back: {
       email: "service@futurevision.ai",
       phone: "+852 1234 5678",
       website: "https://futurevision.ai",
       address: "Room 1234, Science Park, Hong Kong",
       qrImageUrl: "/images/contact-qr.png",     // 或 https://.... 皆可
       qrCaption: "Follow us / Contact support",
       copyrightOwner: "Future Vision Limited"
     },
     footer: {
       includeCover: false,
       includeBack: false,
       numberCover: false,
       numberBack: false
     }
   }
========================= */

async function injectPdfFooter(_: any) { return; }

/* 暴露到 window，供导出流程调用 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const { language } = useLanguage();

  // 页面跳转时自动滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    (async () => {
      try {
        const ref = typeof document !== 'undefined' ? document.referrer || '' : '';
        await apiGet('/api/visit', { path: location.pathname, referrer: ref, lang: String(language) });
      } catch {}
    })();
  }, [location.pathname, language]);

  // 应用启动时预取三个语言数据库，减少后续页面首次等待
  useEffect(() => {
    void prefetchAllDatabases();
  }, []);

  // 屏幕端：滚动时隐藏/显示顶部导航
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(!(currentScrollY > 50 && currentScrollY > lastScrollY));
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // 挂载导出兜底
  useEffect(() => {
    // 不再向 window 暴露导出钩子
  }, []);

  // 不再监听支付状态

  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout }}>
      {/* 顶部导航（打印隐藏） */}
      <div className="no-print">
        <Navigation />
      </div>

      {/* 主内容 */}
      <main className="min-h-screen">
        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/products" element={<Products />} />
              <Route path="/esg-voyant/form" element={<RouteGuard><ESGRiskAnalysis /></RouteGuard>} />
              <Route path="/esg-voyant" element={<ESGRiskAnalysisNew />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/admin/insights" element={<AdminInsights />} />
              <Route path="/admin/news" element={<AdminKnowledge />} />
              <Route path="/admin/knowledge" element={<AdminKnowledge />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/invite-codes" element={<AdminInviteCodes />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/about" element={<About />} />
              <Route path="/report/api" element={<RouteGuard><ReportResult /></RouteGuard>} />
              <Route path="/esg-voyant/report" element={<RouteGuard><ReportResultNew /></RouteGuard>} />
              <Route path="/pay" element={<Pay />} />
            </Routes>
      </main>

      {/* 页脚 */}
        <footer className="no-print bg-slate-900 text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 md:gap-6">
              <div className="w-full md:w-[29.17%]" style={{letterSpacing: '-0.03em'}}>
                <div className="flex items-center mb-6 md:mb-10"></div>
                <h3 className="font-semibold mb-4" style={{fontSize: '14px', letterSpacing: '-0.01em'}}>
                  {language === 'en-US' ? 'About Future Vision' : language === 'zh-HK' ? '關於 Future Vision' : '关于 Future Vision'}
                </h3>
                <p className="text-slate-400 mb-3" style={{fontSize: '13px', letterSpacing: '-0.01em'}}>
                  {language === 'en-US' ? 'Your 1st Intelligent Consultant' : language === 'zh-HK' ? '您的第一位智能顧問' : '您的第一位智能顾问'}
                </p>
                <p className="text-slate-400 mb-4" style={{fontSize: '13px', letterSpacing: '-0.01em'}}>
                  {language === 'en-US' ? 'For Global Business Sustainable Growth' : language === 'zh-HK' ? '助力全球業務的可持續增長' : '助力全球业务的可持续增长'}
                </p>
                <ul className="space-y-2 text-slate-400" style={{fontSize: '13px', letterSpacing: '-0.01em'}}>
                  <li>- {language === 'en-US' ? 'International Market Expansion' : language === 'zh-HK' ? '國際市場拓展' : '国际市场拓展'}</li>
                  <li>- {language === 'en-US' ? 'Global ESG Risk Management' : language === 'zh-HK' ? '全球ESG風險管理' : '全球ESG风险管理'}</li>
                  <li>- {language === 'en-US' ? 'Sustainable Development Strategy' : language === 'zh-HK' ? '可持續發展戰略' : '可持续发展战略'}</li>
                  <li>- {language === 'en-US' ? 'ESG Rating Enhancement' : language === 'zh-HK' ? 'ESG評級提升' : 'ESG评级提升'}</li>
                </ul>
              </div>

              <div className="w-full md:w-[58.97%]" style={{fontSize: '1px', letterSpacing: '-0.03em'}}>
                <div className="flex items-center mb-6 md:mb-10"></div>
                <h3 className="font-semibold mb-4" style={{fontSize: '14px', letterSpacing: '-0.01em'}}>
                  {language === 'en-US' ? 'Locations' : language === 'zh-HK' ? '辦公地點' : '办公地点'}
                </h3>
                {(() => {
                  const items = [
                    {
                      cityZh: '香港', cityEn: 'Hongkong:',
                      zh: '香港新界沙田安耀街3号汇达大厦2605室',
                      en: 'Room 1318-19, Hollywood Plaza 610 Nathan Road, Mong Kok, Kowloon'
                    },
                    {
                      cityZh: '北京', cityEn: 'Beijing:',
                      zh: '北京市海淀区上地信息路12号中关村发展大厦 511 室',
                      en: 'Room 511, Zhongguancun Building, No. 12 Shangdi Information Road, Haidian District, Beijing'
                    },
                    {
                      cityZh: '上海', cityEn: 'Shanghai:',
                      zh: '上海市虹口区东大名路501号白玉兰广场42层',
                      en: '42/F, Magnolia Plaza, 501 East Da Ming Road, Hongkou District'
                    },
                    {
                      cityZh: '杭州', cityEn: 'Hangzhou:',
                      zh: '杭州市萧山区鸿宁路广孚联合国际中心2402室',
                      en: 'Room 2402, Guangfu International Center Hongning Road, Xiaoshan District'
                    },
                    {
                      cityZh: '沈阳', cityEn: 'Shenyang:',
                      zh: '沈阳市沈抚新区彰武路李石经济区管委会大楼3层',
                      en: '3/F, Li Shi Economic Zone Committee Bldg Zhangwu Road, Shenfu New District'
                    }
                  ];
                  return (
                    <ul className="space-y-4 text-slate-400 leading-tight" style={{fontSize: '13px', letterSpacing: '-0.02em'}}>
                      {items.map((it, idx) => (
                        <li key={idx} className="py-1">
                          {language === 'en-US' ? (
                            <div className="space-y-1">
                              <strong className="text-slate-300 block" style={{fontSize: '13px'}}>{it.cityEn}</strong>
                              <span className="block">{it.en}</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <strong className="text-slate-300" style={{fontSize: '13px'}}>
                                {language === 'zh-HK' ? convertToTraditional(it.cityZh) + '：' : it.cityZh + '：'}
                              </strong>
                              <span className="block">{language === 'zh-HK' ? convertToTraditional(it.zh) : it.zh}</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>

              <div className="w-full md:w-[16.67%]">
                <div className="flex items-center mb-6 md:mb-10"></div>
                <h3 className="font-semibold mb-4" style={{fontSize: '14px', letterSpacing: '-0.01em'}}>
                  {language === 'en-US' ? 'Contacts' : language === 'zh-HK' ? '聯繫方式' : '联系方式'}
                </h3>
                <ul className="space-y-3 text-slate-400" style={{fontSize: '13px', letterSpacing: '-0.01em'}}>
                  <li className="flex items-start pt-1">
                    <i className="fa-solid fa-envelope mr-2 text-blue-400 mt-1 flex-shrink-0"></i>
                    <span>jinxia@mscfv.com</span>
                  </li>
                  <li className="flex items-start pt-1">
                    <i className="fa-solid fa-phone mr-2 text-blue-400 mt-1 flex-shrink-0"></i>
                    <span>+86 189 8948 5442</span>
                  </li>
                  <li className="flex items-start pt-1">
                    <i className="fa-brands fa-whatsapp mr-2 text-blue-400 mt-1 flex-shrink-0"></i>
                    <span>+852 4609 1687</span>
                  </li>
                  <li className="flex items-start pt-1">
                    <i className="fa-brands fa-weixin mr-2 text-blue-400 mt-1 flex-shrink-0"></i>
                    <span>kickufo</span>
                  </li>
                </ul>
                <div className="flex space-x-5 mt-6">
                <a href="https://www.linkedin.com/in/xia-jin-25267620" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-lg">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
                <a href="https://www.facebook.com/jin.xia.452318" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-lg">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="https://x.com/kickufo" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-lg">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 text-center">
            <p className="text-slate-500 text-sm md:text-sm">MSC HK © 2024</p>
          </div>
        </div>
      </footer>
    </AuthContext.Provider>
  );
}
