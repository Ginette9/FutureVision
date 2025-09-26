'use client';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ReportSection } from './parseReportHtml';


export default function Toc({ sections }: { sections: ReportSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const isElementVisible = (el: Element | null) => {
      if (!el) return false;
      // 排除打印专用节点或隐藏节点
      const inPrintOnly = (el as HTMLElement).closest('.print-only');
      const htmlEl = el as HTMLElement;
      return !inPrintOnly && htmlEl.offsetParent !== null;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio); // prioritize deeper visibility

        if (visibleSections.length > 0) {
          const topMost = visibleSections[0];
          setActiveId(topMost.target.id);
        }
      },
      {
        rootMargin: '0% 0% -60% 0%', // 提前触发，调整体验
        threshold: 0.1,
      }
    );

    const targets = sections
      .map((s) => {
        // 可能存在同名 id（打印与屏幕各一份），优先选择可见的那个
        const all = Array.from(document.querySelectorAll(`#${CSS.escape(s.id)}`));
        const visible = all.find(isElementVisible);
        return visible || all[0] || null;
      })
      .filter(Boolean) as Element[];
    targets.forEach((el) => observer.observe(el!));

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="space-y-3">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Navigation</span>
      </div>
      
      <ul className="space-y-2">
        {sections.map((sec, index) => {
          const isActive = sec.id === activeId;
          return (
            <li key={sec.id}>
              <a
                href={`#${sec.id}`}
                className={cn(
                  'group flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-300 border',
                  isActive
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold border-gray-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-200 hover:shadow-sm'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const all = Array.from(document.querySelectorAll(`#${CSS.escape(sec.id)}`));
                  const target = all.find((el) => {
                    const inPrintOnly = (el as HTMLElement).closest('.print-only');
                    const htmlEl = el as HTMLElement;
                    return !inPrintOnly && htmlEl.offsetParent !== null;
                  }) as HTMLElement | undefined;
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // 立即更新 activeId，避免短暂未高亮
                    setActiveId(sec.id);
                    // 同步更新 URL hash（不触发默认跳转）
                    history.replaceState(null, '', `#${sec.id}`);
                  }
                }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors',
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  )}>
                    {index + 1}
                  </div>
                  <span className="flex-1 leading-tight">{sec.title}</span>
                </div>
                
                {isActive && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0"></div>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
