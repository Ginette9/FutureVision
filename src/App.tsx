import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import Home from "@/pages/Home";
import ReportResult from "@/pages/ReportResult";
import Pay from "@/pages/Pay";
import LanguageSelector from '@/components/LanguageSelector';
import { AuthContext } from '@/contexts/authContext';

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
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="no-print-only fixed top-0 left-0 right-0 z-40 w-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="https://lf-code-agent.coze.cn/obj/x-ai-cn/238114214402/attachment/白字透明logo_20250728174823.png"
                alt="Logo"
                className="h-8 mr-2"
              />
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </motion.header>

      {/* 主内容 */}
      <main className="pt-20 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportResult />} />
          <Route path="/pay" element={<Pay />} />
        </Routes>
      </main>

      {/* 屏幕端页脚（打印隐藏）——原样保留 */}
      <footer className="no-print-only bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img
                  src="https://lf-code-agent.coze.cn/obj/x-ai-cn/238114214402/attachment/白字透明logo_20250728174823.png"
                  alt="Logo"
                  className="h-8 mr-2"
                />
              </div>
              <p className="text-slate-400 text-sm">
                提供专业的企业出海风险评估与分析服务，助力企业成功开拓国际市场。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">服务</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">风险评估</a></li>
                <li><a href="#" className="hover:text-white transition-colors">市场分析</a></li>
                <li><a href="#" className="hover:text-white transition-colors">合规咨询</a></li>
                <li><a href="#" className="hover:text-white transition-colors">战略规划</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">关于我们</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">公司简介</a></li>
                <li><a href="#" className="hover:text-white transition-colors">专家团队</a></li>
                <li><a href="#" className="hover:text-white transition-colors">客户案例</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">联系方式</h3>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center">
                  <i className="fa-solid fa-envelope mr-2 text-blue-400"></i>
                  <a href="mailto:contact@globalrisk.com" className="hover:text-white transition-colors">jinxia@mscfv.com</a>
                </li>
                <li className="flex items-center">
                  <i className="fa-solid fa-phone mr-2 text-blue-400"></i>
                  <a href="tel:+8610123456789" className="hover:text-white transition-colors">+86 18989485442</a>
                </li>
              </ul>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fa-brands fa-twitter"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fa-brands fa-facebook"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} GlobalRisk. 保留所有权利。</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">隐私政策</a>
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">服务条款</a>
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Cookie政策</a>
            </div>
          </div>
        </div>
      </footer>
    </AuthContext.Provider>
  );
}
