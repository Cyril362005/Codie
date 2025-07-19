/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'

interface ToastMsg {
  id: number
  text: string
}

const ToastContext = createContext<(text: string) => void>(() => {})

export const useToast = () => useContext(ToastContext)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  const addToast = (text: string) => {
    const t = { id: Date.now(), text }
    setToasts((msgs) => [...msgs, t])
    setTimeout(() => setToasts((msgs) => msgs.filter((m) => m.id !== t.id)), 3000)
  }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="glass px-4 py-2 animate-slideUp">{t.text}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
