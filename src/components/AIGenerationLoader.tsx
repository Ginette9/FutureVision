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

  // 步骤文案：不把 formData 作为依赖触发重跑，而是每次“渲染”读取最新值
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
    const totalMs = 5600;
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

      // 目标（单调增），Lerp 平滑
      const target = linear01 * 100;
      const current = progressRef.current;
      const next = current + (target - current) * 0.22;

      // 单调递增保护：任何情况下都不允许下降
      const monotonic = Math.max(next, current, target < current ? current : next);
      const nextClamped = Math.min(100, Math.max(0, monotonic));

      if (nextClamped - current >= 0.05) {
        progressRef.current = nextClamped;
        setProgress(nextClamped);
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

      if (linear01 >= 1 && !isCompletedRef.current) {
        isCompletedRef.current = true;
        progressRef.current = 100;
        setProgress(100);
        setIsCompleted(true);
        // 结束前回调
        setTimeout(() => onCompleteRef.current?.(), 700);
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

  const percentText = Math.round(progress);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AI智能风险评估引擎</h1>
          <p className="text-gray-600 mb-4">正在为您生成专业的ESG风险评估报告</p>

          {formData && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="font-medium text-gray-700">目标行业</p>
                  <p className="text-blue-600 font-semibold">{formData?.industry?.name || '未选择'}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-700">目标国家</p>
                  <p className="text-blue-600 font-semibold">{formData?.country?.name || '未选择'}</p>
                </div>
                {formData?.name && (
                  <div className="text-left col-span-2">
                    <p className="font-medium text-gray-700">客户信息</p>
                    <p className="text-blue-600 font-semibold">
                      {formData.name} - {formData.organization}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 进度条（GPU transform + 单一数据源） */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>生成进度</span>
            <span>{percentText}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 origin-left will-change-transform"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
        </div>

        {/* 当前步骤 */}
        {currentStep < steps.length && (
          <div className="mb-8">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 relative overflow-hidden">
              <div className="text-3xl relative z-10">{steps[currentStep].icon}</div>
              <div className="flex-1 relative z-10">
                <h3 className="font-semibold text-gray-800 mb-1">{steps[currentStep].title}</h3>
                <p className="text-gray-600 text-sm">
                  {typedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>
              <div className="relative z-10">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 完成状态 */}
        {isCompleted && (
          <div className="mb-8">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 relative overflow-hidden">
              <div className="text-3xl animate-bounce relative z-10">🎉</div>
              <div className="flex-1 relative z-10">
                <h3 className="font-semibold text-green-800 mb-1">报告生成完成！</h3>
                <p className="text-green-600 text-sm">正在为您呈现专业的ESG风险评估报告...</p>
                <p className="text-green-500 text-xs mt-1">即将跳转到报告页面...</p>
              </div>
              <div className="relative z-10">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 步骤指示器 */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                index < currentStep
                  ? 'bg-green-50 border border-green-200'
                  : index === currentStep
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${index <= currentStep ? 'text-gray-800' : 'text-gray-500'}`}>{step.title}</p>
              </div>
              <div className="text-xl">{step.icon}</div>
            </div>
          ))}
        </div>

        {/* 实时处理消息与统计 */}
        {currentMessage && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-purple-700 font-medium">{currentMessage}</p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>请耐心等待，AI正在为您进行深度分析...</p>
          <p className="mt-1">报告生成时间约需 4-6 秒</p>

          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">实时处理数据</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="text-center">
                <p className="font-medium text-gray-700">已分析数据点</p>
                <p className="text-green-600 font-bold text-lg">{dataPoints.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-700">已处理项目</p>
                <p className="text-blue-600 font-bold text-lg">{processedItems.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="text-left">
                <p className="font-medium text-gray-700">分析引擎</p>
                <p className="text-gray-600">GPT-4 + 专业ESG模型</p>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700">数据源</p>
                <p className="text-gray-600">全球ESG数据库</p>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700">更新时间</p>
                <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700">报告版本</p>
                <p className="text-gray-600">v2.1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerationLoader;
