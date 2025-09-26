import React, { useMemo } from 'react';

type CardData = {
  title: string;
  html: string;
};

export const PayAttentionSection: React.FC<{ html: string }> = ({ html }) => {
  const { introParagraph, cards } = useMemo(() => {
    // 防止 SSR 环境报错
    if (typeof window === 'undefined' || !html) {
      return { introParagraph: '', cards: [] as CardData[] };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // ✅ 模块引言（取 #pay-attention 后的第一段）
    const introNode = doc.querySelector('#pay-attention')?.nextElementSibling;
    const introParagraphRaw =
      (introNode?.textContent || '').trim() || '';

    // ✅ 卡片节点集合（原结构：div.flex.gap-6.pt-4）
    const cardNodes = Array.from(
      doc.querySelectorAll<HTMLDivElement>('div.flex.gap-6.pt-4')
    );

    const sanitizedCards: CardData[] = cardNodes.map((node) => {
      // 取真正的标题：h3.pdf-text-block
      const h3 = node.querySelector<HTMLHeadingElement>('h3.pdf-text-block');
      const titleRaw = (h3?.textContent || 'Untitled').trim();

      // 克隆当前卡片并移除 h3，拿到纯正文 HTML
      const clone = node.cloneNode(true) as HTMLElement;
      clone.querySelector('h3.pdf-text-block')?.remove();

      // 一些站内常规替换：CSR → ESG（全局）
      const title = titleRaw.replace(/CSR/g, 'ESG');
      const bodyHTML = (clone.innerHTML || '').replace(/CSR/g, 'ESG').trim();

      return { title, html: bodyHTML };
    });

    return {
      introParagraph: introParagraphRaw.replace(/CSR/g, 'ESG'),
      cards: sanitizedCards,
    };
  }, [html]);

  // 没有数据时兜底
  if (!introParagraph && (!cards || cards.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">Important to Consider</h2>
          <p className="text-gray-600 mt-1">Critical factors for your ESG risk assessment</p>
        </div>
      </div>

      {/* 引言段落 */}
      {introParagraph && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 leading-relaxed font-medium">{introParagraph}</p>
          </div>
        </div>
      )}

      {/* 卡片列表 */}
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card, index) => (
          <div
            key={index}
            className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300"
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-sm font-semibold text-white">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-light text-gray-900 group-hover:text-gray-600 transition-colors">
                  {card.title}
                </h3>
              </div>
            </div>
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed ml-14"
              dangerouslySetInnerHTML={{ __html: card.html }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
