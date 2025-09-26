import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import Home from "./pages/Home";
import ESGRiskAnalysis from "./products/esg-risk-analysis/ESGRiskAnalysis";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Insights from "./pages/Insights";
import Cases from "./pages/Cases";
import About from "./pages/About";
import ReportResult from "./products/esg-risk-analysis/ReportResult";
import Pay from "./products/esg-risk-analysis/Pay";
import Navigation from './components/Navigation';
import { AuthContext } from './contexts/authContext';

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
      <Navigation />

      {/* 主内容 */}
      <main className="min-h-screen">
        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/products" element={<Products />} />
              <Route path="/esg-risk-analysis" element={<ESGRiskAnalysis />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/about" element={<About />} />
              <Route path="/report" element={<ReportResult />} />
              <Route path="/pay" element={<Pay />} />
            </Routes>
      </main>

      {/* 页脚 */}
        <footer className="no-print bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* 第一列：About Future Vision - 3.5列宽度 */}
              <div className="md:w-[29.17%]" style={{letterSpacing: '-0.03em'}}>
                <div className="flex items-center mb-10"></div>
                <h3 className="font-semibold mb-4" style={{fontSize: '13px', letterSpacing: '-0.01em'}}>About Future Vision</h3>
                <p className="text-slate-400 mb-3" style={{fontSize: '12px', letterSpacing: '-0.01em'}}>Your 1st Intelligent Consultant</p>
                <p className="text-slate-400 mb-4" style={{fontSize: '12px', letterSpacing: '-0.01em'}}>For Global Business Sustainable Growth</p>
                <ul className="space-y-2 text-slate-400" style={{fontSize: '12px', letterSpacing: '-0.01em'}}>
                  <li>- International Market Expansion</li>
                  <li>- Global ESG Risk Management</li>
                  <li>- Sustainable Development Strategy</li>
                  <li>- ESG Rating Enhancement</li>
                </ul>
              </div>

              {/* 第二列：Locations - 6.5列宽度 */}
              <div className="md:w-[58.97%]" style={{fontSize: '1px', letterSpacing: '-0.03em'}}>
                <div className="flex items-center mb-10"></div>
                <h3 className="font-semibold mb-4" style={{fontSize: '13px', letterSpacing: '-0.01em'}}>Locations</h3>
                <ul className="space-y-3 text-slate-400 leading-tight" style={{fontSize: '12px', letterSpacing: '-0.02em'}}>
                  <li>
                    <strong className="text-slate-300" style={{fontSize: '12px'}}>Hongkong:</strong><br />
                    Room 1318-19, Hollywood Plaza 610 Nathan Road, Mong Kok, Kowloon
                  </li>
                  <li>
                    <strong className="text-slate-300" style={{fontSize: '12px'}}>Beijing:</strong><br />
                    Room 1805, Capital Mansion 6 Xinyuan South Road, Chaoyang District
                  </li>
                  <li>
                    <strong className="text-slate-300" style={{fontSize: '12px'}}>Shanghai:</strong><br />
                    42/F, Magnolia Plaza, 501 East Da Ming Road, Hongkou District
                  </li>
                  <li>
                    <strong className="text-slate-300" style={{fontSize: '12px'}}>Hangzhou:</strong><br />
                    Room 2402, Guangfu International Center Hongning Road, Xiaoshan District
                  </li>
                  <li>
                    <strong className="text-slate-300" style={{fontSize: '12px'}}>Shenyang:</strong><br />
                    3/F, Li Shi Economic Zone Committee Bldg Zhangwu Road, Shenfu New District
                  </li>
                </ul>
              </div>

              {/* 第三列：联系方式 - 2列宽度 */}
              <div className="md:w-[16.67%]">
                <div className="flex items-center mb-10"></div>
                <h3 className="font-semibold mb-4" style={{fontSize: '13px', letterSpacing: '-0.01em'}}>Contacts</h3>
                <ul className="space-y-2 text-slate-400" style={{fontSize: '12px', letterSpacing: '-0.01em'}}>
                  <li className="flex items-center">
                    <i className="fa-solid fa-envelope mr-2 text-blue-400"></i>
                    jinxia@mscfv.com
                  </li>
                  <li className="flex items-center">
                    <i className="fa-solid fa-phone mr-2 text-blue-400"></i>
                    +86 189 8948 5442
                  </li>
                  <li className="flex items-center">
                    <i className="fa-brands fa-whatsapp mr-2 text-blue-400"></i>
                    +852 4609 1687
                  </li>
                  <li className="flex items-center">
                    <i className="fa-brands fa-weixin mr-2 text-blue-400"></i>
                    kickufo
                  </li>
                </ul>
                <div className="flex space-x-4 mt-4">
                <a href="https://www.linkedin.com/in/xia-jin-25267620" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
                <a href="https://www.facebook.com/jin.xia.452318" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="https://x.com/kickufo" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-500 text-sm">MSC HK © 2024</p>
          </div>
        </div>
      </footer>
    </AuthContext.Provider>
  );
}
