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
    <nav className="sticky top-20 py-6 pr-4 space-y-6 text-sm">
      <h2 className="text-xl font-black uppercase text-violet-800 tracking-wide">
        Table of Contents
      </h2>
      <ul className="space-y-5 pl-2 border-l-2 border-purple-200">
        {sections.map((sec) => {
          const isActive = sec.id === activeId;
          return (
            <li key={sec.id} className="relative pl-6">
              <span
                className={cn(
                  'absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full transition-colors duration-200',
                  isActive ? 'bg-purple-700' : 'bg-slate-300'
                )}
              />
              <a
                href={`#${sec.id}`}
                className={cn(
                  'transition-all duration-200 font-medium',
                  isActive
                    ? 'text-violet-800 font-bold'
                    : 'text-gray-500 hover:text-violet-800'
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
                {sec.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
