import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIGenerationLoaderProps {
  formData?: any;
  onComplete?: () => void;
  /** 显式控制何时重新开始动画；每次变更都会重置 */
  runKey?: string | number;
  /** 当组件不可见时是否暂停动画（默认 true） */
  pauseWhenHidden?: boolean;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const AIGenerationLoader: React.FC<AIGenerationLoaderProps> = ({
  formData,
  onComplete,
  runKey,
  pauseWhenHidden = true,
}) => {
  const { t } = useLanguage();

  // 进度（0~100）
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0); // 渲染外部使用
  const rafRef = useRef<number | null>(null);
  const startAtRef = useRef<number>(0);
  const stopRAFRef = useRef(false);
  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);
  const isCompletedRef = useRef(false);
  const completionCalledRef = useRef(false);
  const progressElRef = useRef<HTMLDivElement | null>(null);
  const progressTransitionDoneRef = useRef(false);
  const progressContainerRef = useRef<HTMLDivElement | null>(null);
  const percentElRef = useRef<HTMLSpanElement | null>(null);
  const scheduledRafRef = useRef(false);

  // 顶层：确保视觉进度条宽度达到100%且百分数字为100%后再跳转（通过测量 DOM 宽度与读取DOM文本）
  const ensureVisualCompleteAndNavigate = () => {
    if (completionCalledRef.current) return;
    const bar = progressElRef.current;
    const container = progressContainerRef.current;
    const percentNode = percentElRef.current;
    const percentOk = percentNode ? (() => {
      const t = (percentNode.textContent || '').trim();
      const n = parseInt(t.replace('%', ''), 10);
      return n === 100;
    })() : false;
    const progressOk = progressRef.current >= 100;
    if (bar && container && percentOk) {
      const barW = bar.getBoundingClientRect().width;
      const containerW = container.getBoundingClientRect().width;
      if (containerW > 0 && barW / containerW >= 0.999) {
        if (!progressOk) {
          // 等待进度状态也到100，避免状态与DOM视觉不同步
          requestAnimationFrame(ensureVisualCompleteAndNavigate);
          return;
        }
        const pt = percentNode ? (percentNode.textContent || '').trim() : '';
        console.debug('[Loader] visual check passed (frame 1)', {
          percentText: pt,
          progressState: progressRef.current,
          ratio: barW / containerW,
        });
         // 采用双 rAF，确保浏览器完成布局与绘制后再导航，并在第二帧再次重测确认条件仍成立
         if (!scheduledRafRef.current) {
           scheduledRafRef.current = true;
           requestAnimationFrame(() => {
             requestAnimationFrame(() => {
               scheduledRafRef.current = false;
               if (completionCalledRef.current) return;
               const barW2 = bar.getBoundingClientRect().width;
               const containerW2 = container.getBoundingClientRect().width;
               const percentOk2 = percentElRef.current ? (() => {
                 const t2 = (percentElRef.current!.textContent || '').trim();
                 const n2 = parseInt(t2.replace('%', ''), 10);
                 return n2 === 100;
               })() : false;
               const progressOk2 = progressRef.current >= 100;
               if (percentOk2 && containerW2 > 0 && barW2 / containerW2 >= 0.999) {
                 if (!progressOk2) {
                   // 第二帧复测进度仍未到100，则继续下一帧检查
                   requestAnimationFrame(ensureVisualCompleteAndNavigate);
                   return;
                 }
                 const pt2 = percentElRef.current ? (percentElRef.current.textContent || '').trim() : '';
                 console.debug('[Loader] visual check passed (frame 2)', {
                   percentText: pt2,
                   progressState: progressRef.current,
                   ratio: barW2 / containerW2,
                 });
                 completionCalledRef.current = true;
                 onCompleteRef.current?.();
                 return;
               }
               // 若第二帧复测未达标，继续下一帧检查
               requestAnimationFrame(ensureVisualCompleteAndNavigate);
             });
           });
         }
       }
     }
   };
  const [currentStep, setCurrentStep] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [dataPoints, setDataPoints] = useState(0);
  const [processedItems, setProcessedItems] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // 始终保持最新的 onComplete 引用
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 步骤文案：不把 formData 作为依赖触发重跑，而是每次"渲染"读取最新值
  const steps = useMemo(
    () => [
      { title: '正在连接AI分析引擎...', description: '初始化风险评估模型，加载深度学习算法', icon: '🤖' },
      { title: '抓取最新政策动态', description: `分析${formData?.country?.name || '目标国家'}相关ESG法规政策，获取最新监管要求`, icon: '📋' },
      { title: '收集全球资讯数据', description: '获取ESG相关新闻、行业动态和可持续发展趋势', icon: '🌍' },
      { title: '分析供应链风险', description: `评估${formData?.industry?.name || '目标行业'}供应链风险因素，识别潜在ESG风险点`, icon: '🔗' },
      { title: '计算风险评分', description: '基于多维度数据计算综合风险指数，生成风险评估矩阵', icon: '📊' },
      { title: '生成个性化报告', description: '为您量身定制ESG风险评估报告，包含针对性建议', icon: '📄' },
      { title: '报告生成完成', description: '正在为您呈现专业分析结果，报告已准备就绪', icon: '✅' },
    ],
    // 只依赖必要的基本类型，避免对象引用变化触发重建
    [formData?.country?.name, formData?.industry?.name]
  );

  const processingMessages = useMemo(
    () => [
      '正在分析环境法规变化...',
      '评估社会影响指标...',
      '计算治理风险系数...',
      '整合供应链数据...',
      '生成风险评估矩阵...',
      '优化报告结构...',
      '验证数据准确性...',
      '应用机器学习算法...',
      '生成可视化图表...',
      '完善风险建议...',
    ],
    []
  );

  // 简单打字器
  const runTyping = (text: string) => {
    setIsTyping(true);
    setTypedText('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTypedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setIsTyping(false);
      }
    }, 24);
    return () => clearInterval(id);
  };

  // 可见性与在屏检测（减少滚动导致的回弹/抖动）
  const pageHiddenRef = useRef(false);
  const inViewRef = useRef(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pauseWhenHidden) return;
    const onVis = () => {
      pageHiddenRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);

    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.target === containerRef.current) {
              inViewRef.current = e.isIntersecting;
            }
          }
        },
        { root: null, threshold: 0 } // 不在屏幕就暂停
      );
      if (containerRef.current) io.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (io && containerRef.current) io.unobserve(containerRef.current);
    };
  }, [pauseWhenHidden]);

  // 核心动画：只在挂载 & runKey 改变时重置
  useEffect(() => {
    // 统一重置
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopRAFRef.current = false;
    isCompletedRef.current = false;
    setIsCompleted(false);
    setProgress(0);
    progressRef.current = 0;
    setCurrentStep(0);
    startAtRef.current = performance.now();

    // 5.6 秒总时长
    // 缩短总时长以加速进度条
    const totalMs = 2600;
    const stepCount = steps.length;

    // 轻量的统计变化（单一 interval）
    const statsTimer = setInterval(() => {
      setDataPoints((p) => p + (20 + ((Math.random() * 40) | 0)));
      setProcessedItems((p) => p + (1 + ((Math.random() * 3) | 0)));
    }, 500);

    const msgTimer = setInterval(() => {
      const msg = processingMessages[(Math.random() * processingMessages.length) | 0];
      setCurrentMessage(msg);
    }, 1100);

    // 初始触发一次打字
    runTyping(steps[0].description);

    const tick = () => {
      if (stopRAFRef.current) return;

      // 不可见时暂停推进，但不回退
      if (pauseWhenHidden && (pageHiddenRef.current === true || inViewRef.current === false)) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const now = performance.now();
      const elapsed = now - startAtRef.current;
      const linear01 = clamp01(elapsed / totalMs);

      // 目标（单调增），使用更平滑的插值
      const target = linear01 * 100;
      const current = progressRef.current;
      
      // 减少插值系数，让进度条更稳定
      const next = current + (target - current) * 0.35;

      // 单调递增保护：任何情况下都不允许下降
      const monotonic = Math.max(next, current, target < current ? current : next);
      const nextClamped = Math.min(100, Math.max(0, monotonic));

      // 进度更新：按整数百分比（每变化1%即刷新），提高刷新频率
      progressRef.current = nextClamped;
      const nextRounded = Math.min(100, Math.max(0, Math.round(nextClamped)));
      if (nextRounded !== Math.round(current)) {
        setProgress(nextRounded);
      }

      // 与进度绑定的步骤（严格非回退）
      const calcIdx = Math.min(Math.floor(linear01 * stepCount), stepCount - 1);
      setCurrentStep((prev) => {
        if (calcIdx > prev) {
          runTyping(steps[calcIdx].description);
          return calcIdx;
        }
        return prev; // 不允许倒退
      });


      // 确保进度条真正到达100%后再触发完成逻辑
      if (linear01 >= 1 && progressRef.current >= 99.9 && !isCompletedRef.current) {
        isCompletedRef.current = true;
        progressRef.current = 100;
        setProgress(100);
        setIsCompleted(true);
      
        // 视觉达成后再跳转（测量DOM宽度 + 百分数字）
        ensureVisualCompleteAndNavigate();
      
        // Fallback：若视觉检查未能触发（极端情况下），延时再次执行视觉检查，而不是直接跳转
        setTimeout(() => {
          if (!completionCalledRef.current) {
            ensureVisualCompleteAndNavigate();
          }
        }, 1200);
        return; // 停止循环
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopRAFRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(statsTimer);
      clearInterval(msgTimer);
    };
    // 只受 runKey 控制重置；不要把 onComplete/steps 放进依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  const percentText = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8"
    >
      <div className="w-[480px]">
        {/* 头部 */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white border border-gray-200 flex items-center justify-center mx-auto mb-8">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-gray-900 mb-4">AI智能风险评估</h1>
          <p className="text-lg text-gray-600 mb-8">正在为您生成专业的ESG风险评估报告</p>

          {formData && (
            <div className="bg-white border border-gray-200 p-6 w-full break-words">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">目标行业</span>
                  <span className="text-gray-900 font-medium break-words break-all">{formData?.industry?.name || '未选择'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">目标国家</span>
                  <span className="text-gray-900 font-medium break-words break-all">{formData?.country?.name || '未选择'}</span>
                </div>
                {formData?.name && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">客户信息</span>
                      <span className="text-gray-900 font-medium break-words break-all">
                        {formData.name} - {formData.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 进度条 */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span className="font-medium">生成进度</span>
            <span className="font-medium text-gray-900 tabular-nums" ref={percentElRef}>{percentText}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 overflow-hidden" ref={progressContainerRef}>
            <div
              ref={progressElRef}
              className="bg-gray-900 h-2 transition-none"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                minWidth: progress > 0 ? '2px' : '0px'
              }}
            />
          </div>
        </div>

        {/* 当前步骤 */}
        {currentStep < steps.length && (
          <div className="mb-12">
            <div className="bg-white border border-gray-200 p-8 w-full break-words">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{steps[currentStep].icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{steps[currentStep].title}</h3>
                  <p className="text-gray-600 leading-relaxed break-words break-all">
                    {typedText}
                    {isTyping && <span className="animate-pulse text-gray-900 ml-1">|</span>}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.18}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 完成状态 */}
        {isCompleted && (
          <div className="mb-12">
            <div className="bg-white border border-gray-200 p-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">报告生成完成</h3>
                  <p className="text-gray-600">正在为您呈现专业的ESG风险评估报告...</p>
                  <p className="text-sm text-gray-500 mt-2">即将跳转到报告页面</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 步骤指示器 */}
        <div className="space-y-1 mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-4 border transition-all duration-300 ${
                index < currentStep
                  ? 'bg-gray-50 border-gray-200'
                  : index === currentStep
                  ? 'bg-white border-gray-300'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div
                className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${
                  index < currentStep
                    ? 'bg-gray-900 text-white'
                    : index === currentStep
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  index === currentStep ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
              </div>
            </div>
          ))}
        </div>

        {/* 实时处理消息 */}
        {currentMessage && (
          <div className="mb-8 p-4 bg-gray-100 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-700 font-medium">{currentMessage}</p>
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-6">请耐心等待，AI正在为您进行深度分析</p>

          <div className="bg-white border border-gray-200 p-6 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4 text-center">实时处理数据</h4>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="text-center">
                <p className="text-gray-500 mb-1">已分析数据点</p>
                <p className="text-gray-900 font-light text-2xl">{dataPoints.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 mb-1">已处理项目</p>
                <p className="text-gray-900 font-light text-2xl">{processedItems.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="text-left">
                <p className="font-medium text-gray-700">分析引擎</p>
                <p className="text-gray-500">GPT-4 + 专业ESG模型</p>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700">数据源</p>
                <p className="text-gray-500">全球ESG数据库</p>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700">更新时间</p>
                <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700">报告版本</p>
                <p className="text-gray-500">v2.1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerationLoader;
