import React from 'react';

// ✅ 导入本地图片
import MscLogo from '@/images/msc-hk-logo.png';
import FutureVisionLogo from '@/images/future-vision-logo.png';

export const AboutMvoSection: React.FC = () => {
  const sectionTitle = 'About MSC HK';

  // 卡片内容数组
  const cards = [
    {
      title: 'MSC HK',
      logo: MscLogo, 
      html: `
        <p><strong>Maker Sustainability Consulting</strong> is a sustainability strategy firm rooted in China and oriented toward the world. We drive the transition to a sustainable economy through providing consulting services to our global enterprise clients.</p>
        <p>With a decade of experience, we integrate strategic thinking with practical execution, working alongside global enterprises to redefine growth—toward a future that is sustainable, intelligent, and globally connected, powered by Chinese insight.</p>
      `,
    },
    {
      title: 'Future Vision',
      logo: FutureVisionLogo,
      html: `
        <p><strong>Future Vision</strong> is an AI-powered business and sustainability intelligence assistant that helps entrepreneurs explore future business opportunities for sustainable growth.</p>
        <p>Through Future Vision, executives can monitor ESG risks, track competitor insights and global business updates in real time, and connect with global organizations and expert networks.</p>
        <p>Are you interested in our products or services? Visit <a href="https://www.msc-world.cn/" target="_blank"><strong>MSC website</strong></a> and <a href="https://mscfv.com/futureVision/" target="_blank"><strong>Future Vision</strong></a> to discover more about what we can do for you.</p>
      `,
    },
  ];

  return (
    <section id="about-msc-hk" className="space-y-6">
      <h2 className="text-3xl font-black uppercase text-violet-800 scale-y-[0.9] tracking-wide">{sectionTitle}</h2>
      <div className="flex flex-col gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="pdf-card flex flex-col gap-4 rounded-md p-6 md:flex-row md:items-start break-inside-avoid"
          >
            {/* 左侧 logo */}
            <div className="pdf-card__logo flex justify-center md:w-48 md:min-w-[12rem]">
              <img
                src={card.logo}
                alt={`${card.title} logo`}
                className="pdf-logo h-20 w-auto object-contain"
              />
            </div>

            {/* 右侧文字 */}
            <div className="pdf-card__body flex-1 space-y-2">
              <h3 className="text-base font-bold uppercase text-violet-900">{card.title}</h3>
              <div
                className="prose max-w-none text-[15px] leading-relaxed text-gray-800 prose-a:font-bold prose-a:underline"
                dangerouslySetInnerHTML={{ __html: card.html }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
