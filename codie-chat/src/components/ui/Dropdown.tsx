import React, { useState } from 'react'

interface DropdownProps {
  label: string
  children: React.ReactNode
}

const Dropdown: React.FC<DropdownProps> = ({ label, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen((o) => !o)} className="px-2 py-1 bg-white/10 rounded-lg">{label}</button>
      {open && (
        <div className="absolute mt-2 right-0 glass p-2 space-y-2 min-w-[8rem]" onMouseEnter={() => setOpen(true)}>
          {children}
        </div>
      )}
    </div>
  )
}

export default Dropdown
