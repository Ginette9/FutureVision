'use client';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ReportSection } from './parseReportHtml';


export default function Toc({ sections }: { sections: ReportSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const isElementVisible = (el: Element | null) => {
      if (!el) return false;
      // 排除打印专用节点或隐藏节点
      const inPrintOnly = (el as HTMLElement).closest('.print-only');
      const htmlEl = el as HTMLElement;
      return !inPrintOnly && htmlEl.offsetParent !== null;
    };

    // 防抖函数，避免频繁更新
    let updateTimeout: number | null = null;
    const debouncedUpdate = (newActiveId: string) => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        setActiveId(newActiveId);
      }, 50); // 50ms防抖延迟
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // 如果正在进行点击跳转，暂时不更新activeId
        if (isScrolling) return;

        // 获取所有可见的板块
        const visibleSections = entries.filter((entry) => entry.isIntersecting);
        
        if (visibleSections.length === 0) return;

        // 如果只有一个可见板块，直接设置为活跃
        if (visibleSections.length === 1) {
          debouncedUpdate(visibleSections[0].target.id);
          return;
        }

        // 多个板块可见时，选择最合适的活跃板块
        const bestSection = visibleSections.reduce((best, current) => {
          const bestRect = best.boundingClientRect;
          const currentRect = current.boundingClientRect;
          
          // 优先选择顶部最接近视窗顶部的板块
          const bestDistance = Math.abs(bestRect.top);
          const currentDistance = Math.abs(currentRect.top);
          
          // 如果当前板块更接近顶部，或者相同距离但有更高的可见比例
          if (currentDistance < bestDistance || 
              (Math.abs(currentDistance - bestDistance) < 50 && current.intersectionRatio > best.intersectionRatio)) {
            return current;
          }
          
          return best;
        });

        debouncedUpdate(bestSection.target.id);
      },
      {
        rootMargin: '-10% 0% -60% 0%', // 优化检测区域：顶部10%，底部60%
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // 更密集的阈值检测
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

    return () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      observer.disconnect();
    };
  }, [sections, isScrolling]);

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
                    // 立即设置目标为活跃状态
                    setActiveId(sec.id);
                    setIsScrolling(true);
                    
                    // 计算目标位置，向下偏移以避免标题被遮挡
                    const targetRect = target.getBoundingClientRect();
                    const offsetTop = window.pageYOffset + targetRect.top - 100; // 向下偏移100px
                    
                    // 平滑滚动到调整后的位置
                    window.scrollTo({
                      top: offsetTop,
                      behavior: 'smooth'
                    });
                    
                    // 同步更新 URL hash（不触发默认跳转）
                    history.replaceState(null, '', `#${sec.id}`);
                    
                    // 延迟重新启用自动高亮检测
                    setTimeout(() => {
                      setIsScrolling(false);
                    }, 600); // 进一步减少延迟时间，提高响应速度
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
