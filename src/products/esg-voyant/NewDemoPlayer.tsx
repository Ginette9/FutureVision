import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Step {
  id: number
  title: string
  startTime: number
  endTime: number
}

const NewDemoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showCustomizeAd, setShowCustomizeAd] = useState(false)
  
  // 定义分步播放的步骤
  const steps: Step[] = [
    { id: 1, title: '选择行业和地区', startTime: 0, endTime: 6 },
    { id: 2, title: '输入信息生成报告', startTime: 6, endTime: 26 },
    { id: 3, title: 'AI智能分析中', startTime: 26, endTime: 46 },
    { id: 4, title: '查看完整报告', startTime: 46, endTime: 80 } // 假设视频总时长80秒
  ]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // 视频加载完成后自动播放
    const handleLoadedMetadata = () => {
      video.muted = true
      video.play()
      setIsPlaying(true)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      
      // 检查当前时间对应的步骤
      const stepIndex = steps.findIndex(step => 
        video.currentTime >= step.startTime && video.currentTime < step.endTime
      )
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex)
      }
      
      // 视频播放结束后显示广告
      if (video.currentTime >= video.duration) {
        video.pause()
        setIsPlaying(false)
        setShowCustomizeAd(true)
        
        // 广告显示5秒后重新播放视频
        setTimeout(() => {
          setShowCustomizeAd(false)
          video.currentTime = 0
          video.play()
          setIsPlaying(true)
        }, 5000)
      }
    }

    const handleEnded = () => {
      // 视频结束时循环播放
      if (video) {
        video.currentTime = 0
        video.play()
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [steps])

  // 点击步骤卡片跳转到对应时间
  const handleStepClick = (step: Step) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = step.startTime
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* 视频和步骤卡片水平布局 */}
      <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl shadow-lg overflow-hidden p-4">
        {/* 视频播放器 */}
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="w-full h-full aspect-video object-contain"
            src="/mock_demo_video.mov"
            loop
            muted
            playsInline
          />
          
          {/* 视频控制按钮（可选） */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-full px-4 py-2 flex items-center space-x-2">
            <button
              onClick={() => {
                const video = videoRef.current
                if (video) {
                  if (isPlaying) {
                    video.pause()
                  } else {
                    video.play()
                  }
                  setIsPlaying(!isPlaying)
                }
              }}
              className="text-white focus:outline-none"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <span className="text-white text-sm">
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* 分步卡片 - 垂直排列在右侧 */}
        <div className="w-full md:w-64 flex flex-col gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              onClick={() => handleStepClick(step)}
              className={`cursor-pointer rounded-xl p-6 text-center transition-all duration-300 ${index === currentStep ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${index === currentStep ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-600'}`}>
                <span className="font-medium">{step.id}</span>
              </div>
              <h3 className={`font-medium mb-2 ${index === currentStep ? 'text-white' : 'text-slate-900'}`}>Step {step.id}</h3>
              <p className={`text-sm ${index === currentStep ? 'text-slate-200' : 'text-slate-600'}`}>{step.title}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 第五步：定制报告广告 */}
      {showCustomizeAd && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center shadow-lg"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-block mb-4"
          >
            <svg className="w-16 h-16 text-purple-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </motion.div>
          <h3 className="text-2xl font-medium text-slate-900 mb-3">需要定制专属报告？</h3>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">
            我们的专业团队可以根据您的具体需求，为您量身定制ESG风险分析报告，提供更深入的洞察和建议。
          </p>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
            联系我们定制
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default NewDemoPlayer