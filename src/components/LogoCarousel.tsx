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
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isAutoScrolling = useRef(true);
  
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 1.5; // 提高滚动速度
    
    const animate = () => {
      if (isAutoScrolling.current && !isDragging.current) {
        scrollPosition += scrollSpeed;
        
        // 当滚动到一半时重置位置，实现无缝循环
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    // 鼠标悬停时暂停滚动
    const handleMouseEnter = () => {
      isAutoScrolling.current = false;
    };
    
    const handleMouseLeave = () => {
      if (!isDragging.current) {
        isAutoScrolling.current = true;
      }
    };
    
    // 鼠标拖拽事件
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      isAutoScrolling.current = false;
      startX.current = e.pageX - scrollContainer.offsetLeft;
      scrollLeft.current = scrollContainer.scrollLeft;
      scrollContainer.style.cursor = 'grabbing';
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX.current) * 2; // 滚动速度倍数
      scrollContainer.scrollLeft = scrollLeft.current - walk;
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      scrollContainer.style.cursor = 'grab';
      // 延迟恢复自动滚动
      setTimeout(() => {
        if (!isDragging.current) {
          isAutoScrolling.current = true;
        }
      }, 2000);
    };
    
    // 触摸事件支持
    const handleTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      isAutoScrolling.current = false;
      startX.current = e.touches[0].pageX - scrollContainer.offsetLeft;
      scrollLeft.current = scrollContainer.scrollLeft;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const x = e.touches[0].pageX - scrollContainer.offsetLeft;
      const walk = (x - startX.current) * 2;
      scrollContainer.scrollLeft = scrollLeft.current - walk;
    };
    
    const handleTouchEnd = () => {
      isDragging.current = false;
      setTimeout(() => {
        if (!isDragging.current) {
          isAutoScrolling.current = true;
        }
      }, 2000);
    };
    
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('mousedown', handleMouseDown);
    scrollContainer.addEventListener('mousemove', handleMouseMove);
    scrollContainer.addEventListener('mouseup', handleMouseUp);
    scrollContainer.addEventListener('touchstart', handleTouchStart);
    scrollContainer.addEventListener('touchmove', handleTouchMove);
    scrollContainer.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('mousedown', handleMouseDown);
      scrollContainer.removeEventListener('mousemove', handleMouseMove);
      scrollContainer.removeEventListener('mouseup', handleMouseUp);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  // 创建双倍logo数组以实现无缝滚动
  const doubleLogos = [...logos, ...logos];
  
  return (
    <div className="w-full">
      <div 
         ref={scrollRef}
         className="flex gap-8 md:gap-12 overflow-hidden select-none"
         style={{ 
           scrollBehavior: 'auto',
           cursor: 'grab'
         }}
       >
        {doubleLogos.map((logo, index) => (
          <div
            key={`${logo.alt}-${index}`}
            className="flex-shrink-0 bg-white rounded-lg shadow-md p-4 flex items-center justify-center transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              minWidth: '140px',
              width: '140px',
              height: '90px',
            }}
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-all duration-300"
              style={{
                mixBlendMode: 'multiply',
                filter: 'contrast(1.1) brightness(0.9)'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoCarousel;