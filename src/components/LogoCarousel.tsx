import React, { useEffect, useRef, useState } from 'react';

// 导入所有logo图片
import logoBMW from '@/images/logo-BMW.png';
import logoBoC from '@/images/logo-BoC.png';
import logoCMG from '@/images/logo-CMG.png';
import logoCSCEC from '@/images/logo-CSCEC.png';
import logoHuaWei from '@/images/logo-HuaWei.png';
import logoPG from '@/images/logo-P&G.png';
import logoAlibaba from '@/images/logo-alibaba.png';
import logoChanel from '@/images/logo-chanel.png';
import logoCocaCola from '@/images/logo-cocacola.png';
import logoGoogle from '@/images/logo-google.jpg';
import logoTencent from '@/images/logo-tencent.png';

const logos = [
  { src: logoBMW, alt: 'BMW' },
  { src: logoBoC, alt: 'Bank of China' },
  { src: logoCMG, alt: 'CMG' },
  { src: logoCSCEC, alt: 'CSCEC' },
  { src: logoHuaWei, alt: 'Huawei' },
  { src: logoPG, alt: 'P&G' },
  { src: logoAlibaba, alt: 'Alibaba' },
  { src: logoChanel, alt: 'Chanel' },
  { src: logoCocaCola, alt: 'Coca Cola' },
  { src: logoGoogle, alt: 'Google' },
  { src: logoTencent, alt: 'Tencent' },
];

const LogoCarousel: React.FC = () => {
  const firstRowRef = useRef<HTMLDivElement>(null);
  const secondRowRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const firstRow = firstRowRef.current;
    const secondRow = secondRowRef.current;
    if (!firstRow || !secondRow) return;
    
    let animationId: number;
    let firstRowPosition = 0;
    let secondRowPosition = 0;
    const scrollSpeed = 1.2;
    
    const animate = () => {
      // 第一排向右滑动
      firstRowPosition += scrollSpeed;
      if (firstRowPosition >= firstRow.scrollWidth / 2) {
        firstRowPosition = 0;
      }
      firstRow.scrollLeft = firstRowPosition;
      
      // 第二排反向滑动（从右向左）
      secondRowPosition += scrollSpeed;
      if (secondRowPosition >= secondRow.scrollWidth / 2) {
        secondRowPosition = 0;
      }
      // 反向滚动：从最大值开始减去当前位置
      secondRow.scrollLeft = secondRow.scrollWidth / 2 - secondRowPosition;
      
      animationId = requestAnimationFrame(animate);
    };
    
    // 添加短暂延迟确保DOM完全渲染后开始动画
    const startAnimation = () => {
      animationId = requestAnimationFrame(animate);
    };
    
    const timeoutId = setTimeout(startAnimation, 100);
    
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  // 将logo分成两组
  const firstRowLogos = logos.slice(0, Math.ceil(logos.length / 2));
  const secondRowLogos = logos.slice(Math.ceil(logos.length / 2));
  
  // 创建双倍数组以实现无缝滚动
  const doubleFirstRow = [...firstRowLogos, ...firstRowLogos];
  const doubleSecondRow = [...secondRowLogos, ...secondRowLogos];
  
  const LogoRow = ({ logos: rowLogos, scrollRef }: { 
    logos: typeof doubleFirstRow, 
    scrollRef: React.RefObject<HTMLDivElement>
  }) => (
    <div 
      ref={scrollRef}
      className="flex gap-6 md:gap-8 overflow-hidden"
    >
      {rowLogos.map((logo, index) => (
        <div
          key={`${logo.alt}-${index}`}
          className="flex-shrink-0 bg-white rounded-lg shadow-md p-3 flex items-center justify-center"
          style={{
            minWidth: '120px',
            width: '120px',
            height: '80px',
          }}
        >
          <img
            src={logo.src}
            alt={logo.alt}
            className="max-w-full max-h-full object-contain opacity-90"
            style={{
              mixBlendMode: 'multiply',
              filter: 'contrast(1.1) brightness(0.9)'
            }}
          />
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="w-full space-y-4">
      <LogoRow 
        logos={doubleFirstRow} 
        scrollRef={firstRowRef}
      />
      <LogoRow 
        logos={doubleSecondRow} 
        scrollRef={secondRowRef}
      />
    </div>
  );
};

export default LogoCarousel;