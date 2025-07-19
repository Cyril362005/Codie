import React, { useState } from 'react'

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false)
  return (
    <span className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && <span className="absolute bottom-full mb-1 glass px-2 py-1 text-xs whitespace-nowrap">{text}</span>}
    </span>
  )
}

export default Tooltip
