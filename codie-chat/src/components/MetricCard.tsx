import React, { useEffect, useState } from 'react'
import ProgressRing from './ui/ProgressRing'

interface MetricCardProps {
  label: string
  value: number
  icon: React.ReactNode
  colorClass?: string
  progress?: number
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, colorClass = 'text-blue-400', progress }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let frame: number
    const duration = 800
    const start = performance.now()
    const animate = (t: number) => {
      const progress = Math.min((t - start) / duration, 1)
      setDisplayValue(Math.floor(progress * value))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <div className="glass p-6 hover:-translate-y-1 transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        {progress !== undefined ? (
          <ProgressRing progress={progress}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 ${colorClass}`}>{icon}</div>
          </ProgressRing>
        ) : (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 ${colorClass}`}>{icon}</div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{displayValue}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}

export default MetricCard
