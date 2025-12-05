import React, { useEffect, useRef } from 'react';

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

const defaultLogos = [
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

type Direction = 'right' | 'left';
type InputLogo = string | { src: string; alt?: string };

interface LogoCarouselProps {
  logos?: InputLogo[];
  directions?: [Direction, Direction];
  variant?: 'card' | 'plain';
  itemWidth?: number;
  itemHeight?: number;
  gapClassName?: string;
  imageClassName?: string;
  speed?: number;
  boxed?: boolean;
  syncRows?: boolean;
}

const LogoCarousel: React.FC<LogoCarouselProps> = ({  logos,  directions = ['right', 'left'],  variant = 'card',  itemWidth = 80,  itemHeight = 50,  gapClassName = 'gap-3 sm:gap-4 md:gap-5',  imageClassName = 'max-w-full max-h-full object-contain',  speed = 1.0,  boxed = false,  syncRows = false,}) => {
  const firstRowRef = useRef<HTMLDivElement>(null);
  const secondRowRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationId: number;
    let firstRowPosition = 0;
    let secondRowPosition = 0;
    let sharedPosition = 0;
    const scrollSpeed = speed;
    
    const animate = () => {
      const firstRow = firstRowRef.current;
      const secondRow = secondRowRef.current;
      
      if (firstRow) {
        if (syncRows) {
          sharedPosition += scrollSpeed;
          const maxScroll = firstRow.scrollWidth - firstRow.clientWidth;
          if (maxScroll > 0) {
            const pos = sharedPosition % maxScroll;
            firstRow.scrollLeft = directions[0] === 'right' ? (maxScroll - pos) : pos;
          }
        } else {
          firstRowPosition += scrollSpeed;
          const maxScroll = firstRow.scrollWidth - firstRow.clientWidth;
          if (maxScroll > 0) {
            if (firstRowPosition >= maxScroll) {
              firstRowPosition = 0;
            }
            firstRow.scrollLeft = directions[0] === 'right' ? (maxScroll - firstRowPosition) : firstRowPosition;
          }
        }
      }
      
      if (secondRow) {
        if (syncRows) {
          const maxScrollSecond = secondRow.scrollWidth - secondRow.clientWidth;
          if (maxScrollSecond > 0) {
            const pos = sharedPosition % maxScrollSecond;
            secondRow.scrollLeft = directions[1] === 'right' ? (maxScrollSecond - pos) : pos;
          }
        } else {
          secondRowPosition += scrollSpeed;
          const maxScrollSecond = secondRow.scrollWidth - secondRow.clientWidth;
          if (maxScrollSecond > 0) {
            if (secondRowPosition >= maxScrollSecond) {
              secondRowPosition = 0;
            }
            secondRow.scrollLeft = directions[1] === 'right' ? (maxScrollSecond - secondRowPosition) : secondRowPosition;
          }
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    // 延迟启动，确保DOM完全渲染
    const timer = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  const resolvedLogos = (logos && logos.length > 0 ? logos : defaultLogos).map(l =>
    typeof l === 'string' ? { src: l, alt: '' } : { src: l.src, alt: l.alt ?? '' }
  );
  const firstRowLogos = resolvedLogos.slice(0, Math.ceil(resolvedLogos.length / 2));
  const secondRowLogos = resolvedLogos.slice(Math.ceil(resolvedLogos.length / 2));
  
  // 创建双倍数组以实现无缝滚动
  const doubleFirstRow = [...firstRowLogos, ...firstRowLogos];
  const doubleSecondRow = [...secondRowLogos, ...secondRowLogos];
  
  const LogoRow = ({ logos: rowLogos, scrollRef }: {
    logos: typeof doubleFirstRow,
    scrollRef: React.RefObject<HTMLDivElement>
  }) => (
    <div
      ref={scrollRef}
      className={`flex ${gapClassName} overflow-x-scroll scrollbar-hide`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {rowLogos.map((logo, index) => (
        <div
          key={`${logo.src}-${index}`}
          className={
            variant === 'card'
              ? `flex-shrink-0 bg-white ${boxed ? 'border border-gray-200' : ''} rounded-lg shadow-sm p-3 flex items-center justify-center`
              : 'flex-shrink-0 flex items-center justify-center'
          }
          style={            variant === 'card'              ? { minWidth: `${itemWidth}px`, width: `${itemWidth}px`, height: `${itemHeight}px` }              : { minWidth: `${itemWidth}px`, height: `${itemHeight}px` }          }
        >
          <img
            src={logo.src}
            alt={logo.alt}
            className={imageClassName}
            style={undefined}
          />
        </div>
      ))}
    </div>
  );
  
  return (    <div className="w-full space-y-3 px-2 sm:px-4">      <LogoRow logos={doubleFirstRow} scrollRef={firstRowRef} />      <LogoRow logos={doubleSecondRow} scrollRef={secondRowRef} />    </div>  );
};

export default LogoCarousel;
