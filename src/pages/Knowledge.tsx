import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getAllGlobalNews, GlobalNewsItem } from '../data/globalNews';
import { getAllMustReads, MustReadItem } from '../data/mustReads';
import { getAllCourses, CourseResourceItem } from '../data/courseResources';
import { replaceKeywords } from '../lib/textTransform';
import { ZH_HK_REPLACEMENTS } from '../data/zhHKReplacements';
import { useLanguage } from '../contexts/LanguageContext';

interface KnowledgeItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: string;
  readTime: string;
  featured?: boolean;
}

export default function Knowledge() {
  const [activeCategory, setActiveCategory] = useState('weekly');
  const [news, setNews] = useState<GlobalNewsItem[]>([]);
  const [mustReads, setMustReads] = useState<MustReadItem[]>([]);
  const [courses, setCourses] = useState<CourseResourceItem[]>([]);
  const { language } = useLanguage();

  const categories = [
    { id: 'weekly', name: '全球要闻' },
    { id: 'industry', name: '必读报告' },
    { id: 'courses', name: '课程资源' }
  ];

  const knowledgeItems: Record<string, KnowledgeItem[]> = { weekly: [] } as any;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'zh-HK' ? 'zh-HK' : language;
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    setNews([...getAllGlobalNews()]);
    setMustReads([...getAllMustReads()]);
    setCourses([...getAllCourses()]);
    const onNews = () => setNews([...getAllGlobalNews()]);
    const onMust = () => setMustReads([...getAllMustReads()]);
    const onCourse = () => setCourses([...getAllCourses()]);
    window.addEventListener('global-news-updated', onNews);
    window.addEventListener('must-read-updated', onMust);
    window.addEventListener('course-updated', onCourse);
    return () => {
      window.removeEventListener('global-news-updated', onNews);
      window.removeEventListener('must-read-updated', onMust);
      window.removeEventListener('course-updated', onCourse);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16"
      >
        <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6">
          知识中心
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          及时资讯、行业洞察和专业课程，全方位提升您的ESG知识储备
        </p>
      </motion.div>

      {/* Category Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 font-medium transition-colors duration-300 ${
                activeCategory === category.id
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeCategory === 'weekly' ? (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-16 mb-16"
          >
            {([...news]
              .sort((a, b) => {
                const ta = new Date(a.date).getTime();
                const tb = new Date(b.date).getTime();
                if (!isFinite(ta) && !isFinite(tb)) return 0;
                if (!isFinite(ta)) return 1;
                if (!isFinite(tb)) return -1;
                return tb - ta;
              })
            ).map((n, index) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
              >
                <div className="overflow-hidden rounded-xl h-64 md:h-80">
                  {(() => {
                    const s = n.coverImage || '';
                    const cover = s.startsWith('/uploads/')
                      ? ((import.meta as any).env?.DEV ? `http://localhost:3001${s}` : s)
                      : s;
                    return <img src={cover} alt={n.titleZh} className="w-full h-full object-cover object-center" />;
                  })()}
                </div>
                <div className="flex flex-col justify-between h-64 md:h-80">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-black tracking-tight">
                      {(() => {
                        const base = (language === 'zh-CN' || language === 'zh-HK') ? n.titleZh : n.titleEn;
                        return language === 'zh-HK' ? replaceKeywords(base || '', ZH_HK_REPLACEMENTS) : (base || '');
                      })()}
                    </h3>
                    <time className="text-sm text-neutral-500">{formatDate(n.date)}</time>
                  </div>
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                    {(() => {
                      const base = (language === 'zh-CN' || language === 'zh-HK') ? n.summaryZh : n.summaryEn;
                      return language === 'zh-HK' ? replaceKeywords(base || '', ZH_HK_REPLACEMENTS) : (base || '');
                    })()}
                  </p>
                  <div className="flex gap-3">
                    {((n.linkZh || n.linkEn)) && (
                      <a
                        href={n.linkZh || n.linkEn}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-md bg-black text-white hover:bg-neutral-800"
                      >
                        {language === 'zh-CN' || language === 'zh-HK' ? '阅读原文' : 'Read Full'}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          activeCategory === 'courses' ? (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            >
              {[...courses]
                .sort((a: any, b: any) => {
                  const ta = new Date(a?.date).getTime();
                  const tb = new Date(b?.date).getTime();
                  if (!isFinite(ta) && !isFinite(tb)) return 0;
                  if (!isFinite(ta)) return 1;
                  if (!isFinite(tb)) return -1;
                  return tb - ta;
                })
                .map((item: any, index: number) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col gap-4"
                  >
                    <div className="w-full h-32 md:h-36 overflow-hidden rounded">
                      {(() => {
                        const s = String(item.coverImage || '');
                        const cover = s.startsWith('/uploads/')
                          ? ((import.meta as any).env?.DEV ? `http://localhost:3001${s}` : s)
                          : s;
                        return <img src={cover} alt={item.titleZh || item.titleEn} className="w-full h-full object-contain object-center" />;
                      })()}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-black tracking-tight">
                        {(() => {
                          const base = (language === 'zh-CN' || language === 'zh-HK') ? item.titleZh : item.titleEn;
                          return language === 'zh-HK' ? replaceKeywords(base || '', ZH_HK_REPLACEMENTS) : (base || '');
                        })()}
                      </h3>
                      <p className="text-sm text-neutral-700 leading-relaxed">
                        {(() => {
                          const base = (language === 'zh-CN' || language === 'zh-HK') ? item.summaryZh : item.summaryEn;
                          const txt = language === 'zh-HK' ? replaceKeywords(base || '', ZH_HK_REPLACEMENTS) : (base || '');
                          return txt.length > 120 ? (txt.slice(0, 120) + '…') : txt;
                        })()}
                      </p>
                    </div>
                    <div className="mt-auto">
                      {(item.linkZh || item.linkEn) && (
                        <a
                          href={item.linkZh || item.linkEn}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-4 py-2 rounded-md bg-black text-white hover:bg-neutral-800"
                        >
                          {(language === 'zh-CN' || language === 'zh-HK') ? '学习课程' : 'Start Learning'}
                        </a>
                      )}
                    </div>
                  </motion.article>
                ))}
            </motion.div>
          ) : (
            <motion.div
              key="industry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-16 mb-16"
            >
              {[...mustReads]
                .sort((a: any, b: any) => {
                  const ta = new Date(a?.date).getTime();
                  const tb = new Date(b?.date).getTime();
                  if (!isFinite(ta) && !isFinite(tb)) return 0;
                  if (!isFinite(ta)) return 1;
                  if (!isFinite(tb)) return -1;
                  return tb - ta;
                })
                .map((item: any, index: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
                  >
                    <div className="overflow-hidden rounded-xl h-64 md:h-80">
                      {(() => {
                        const s = String(item.coverImage || '');
                        const cover = s.startsWith('/uploads/')
                          ? ((import.meta as any).env?.DEV ? `http://localhost:3001${s}` : s)
                          : s;
                        return <img src={cover} alt={item.titleZh || item.titleEn} className="w-full h-full object-cover object-center" />;
                      })()}
                    </div>
                    <div className="flex flex-col justify-between h-64 md:h-80">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-black tracking-tight">
                          {(() => {
                            const base = (language === 'zh-CN' || language === 'zh-HK') ? item.titleZh : item.titleEn;
                            return language === 'zh-HK' ? replaceKeywords(base || '', ZH_HK_REPLACEMENTS) : (base || '');
                          })()}
                        </h3>
                        <time className="text-sm text-neutral-500">{formatDate(item.date)}</time>
                      </div>
                      <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                        {(() => {
                          const base = (language === 'zh-CN' || language === 'zh-HK') ? item.summaryZh : item.summaryEn;
                          return language === 'zh-HK' ? replaceKeywords(base || '', ZH_HK_REPLACEMENTS) : (base || '');
                        })()}
                      </p>
                      <div className="flex gap-3">
                        {(item.linkZh || item.linkEn) && (
                          <a
                            href={item.linkZh || item.linkEn}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-md bg-black text-white hover:bg-neutral-800"
                          >
                            {(language === 'zh-CN' || language === 'zh-HK') ? '阅读更多' : 'Read More'}
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          )
        )}

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center bg-gray-50 p-12"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            订阅知识更新
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            第一时间获取最新的要闻资讯、专业洞察和课程内容
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="输入您的邮箱地址"
              className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
            />
            <button className="px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300 font-medium">
              订阅
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
