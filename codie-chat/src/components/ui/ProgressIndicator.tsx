import React from 'react'

const ProgressIndicator: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <div className="bg-blue-500 h-2" style={{ width: `${progress}%`, transition: 'width 0.3s ease' }} />
    </div>
  )
}

export default ProgressIndicator
