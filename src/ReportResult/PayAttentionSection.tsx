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
    <section
      id="important-to-consider"
      aria-labelledby="important-to-consider-title"
      className="space-y-6 scroll-mt-28"
    >
      {/* 标题 + 紫色强调条 */}
      <div className="flex items-center gap-3">
        <h2
          id="important-to-consider-title"
          className="text-3xl font-black uppercase text-violet-800 tracking-wide scale-y-90"
          title="Important to consider"
        >
          Important to consider
        </h2>
      </div>

      {/* 引言（浅灰背景提示框） */}
      {!!introParagraph && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50/40 px-5 py-4 text-gray-800">
          <p className="text-[15px] leading-relaxed">
            {introParagraph}
          </p>
        </div>
      )}

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {cards.map((card, idx) => (
          <article
            key={idx}
            className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
          >
            {/* 卡片标题行 */}
            <div className="mb-2 flex items-start gap-2">
              <i
                className="fa-solid fa-circle-exclamation mt-0.5 text-violet-700/90"
                aria-hidden="true"
              />
              <h3
                className="text-[13px] font-extrabold uppercase tracking-wide text-violet-800"
                title={card.title}
              >
                {card.title}
              </h3>
            </div>

            {/* 正文内容（支持段落/列表/链接） */}
            <div
              className="prose prose-sm max-w-none text-[15px] leading-relaxed text-gray-800 [&_a]:underline [&_a:hover]:opacity-80 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5"
              // 注意：内容来自受信任的内部解析
              dangerouslySetInnerHTML={{ __html: card.html }}
            />
          </article>
        ))}
      </div>
    </section>
  );
};
