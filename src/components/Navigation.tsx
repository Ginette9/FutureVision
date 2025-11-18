import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { language } = useLanguage();

  const labels = {
    services: language === 'en-US' ? 'Services' : language === 'zh-HK' ? '專業服務' : '专业服务',
    insights: language === 'en-US' ? 'Insights' : language === 'zh-HK' ? '獨家洞察' : '独家洞察',
    knowledge: language === 'en-US' ? 'Knowledge' : language === 'zh-HK' ? '知識中心' : '知识中心',
    cases: language === 'en-US' ? 'Cases' : language === 'zh-HK' ? '成功案例' : '成功案例',
    membership: language === 'en-US' ? 'Member Portal' : language === 'zh-HK' ? '會員入口' : '会员入口',
    about: language === 'en-US' ? 'About Us' : language === 'zh-HK' ? '關於我們' : '关于我们',
    logoTagline: language === 'en-US' ? 'Insight into Future Growth' : language === 'zh-HK' ? '洞悉未來商業增長' : '洞悉未来商业增长',
    mobileCta: language === 'en-US' ? 'Risk Analysis' : language === 'zh-HK' ? '風險分析' : '风险分析'
  };

  const navItems = [
    { name: labels.services, path: '/services' },
    { name: labels.insights, path: '/insights' },
    { name: labels.knowledge, path: '/knowledge' },
    { name: labels.cases, path: '/cases' },
    { name: labels.membership, href: 'https://mscfv.com/futureVision/' },
    { name: labels.about, path: '/about' },
  ] as Array<{ name: string; path?: string; href?: string }>;

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">
          {/* Logo - 左侧 */}
          <Link to="/" className="flex items-center space-x-3 mr-8">
            <img
              src="/images/future-vision-logo-graph.png"
              alt="Future Vision Logo"
              className="h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-2xl font-light text-gray-900 tracking-tight">Future Vision</h1>
              <p className="text-sm text-gray-500 font-light" style={{ letterSpacing: '0.08em' }}>{labels.logoTagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation - 中间 */}
          <div className="hidden md:flex items-center justify-center space-x-12 flex-1">
            {navItems.map((item) => {
              if (item.href) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative text-sm font-medium tracking-wide transition-colors duration-300 whitespace-nowrap text-gray-600 hover:text-gray-900"
                  >
                    {item.name}
                  </a>
                );
              }
              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={`relative text-sm font-medium tracking-wide transition-colors duration-300 whitespace-nowrap ${
                    isActive(item.path!)
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                  {isActive(item.path!) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-6 left-0 right-0 h-0.5 bg-gray-900"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-6 ml-auto">
            <LanguageSelector />
        

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {navItems.map((item) => {
                if (item.href) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2 text-base font-medium transition-colors duration-300 text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path!}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block py-2 text-base font-medium transition-colors duration-300 ${
                      isActive(item.path!)
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile CTA */}
              <Link
                to="/esg-voyant/intro"
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 px-6 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300 text-center mt-6"
              >
                {labels.mobileCta}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
