import React, { useState } from 'react'

interface Message {
  id: number
  text: string
  from: 'user' | 'ai'
}

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)

  const sendMessage = () => {
    if (!input) return
    const msg: Message = { id: Date.now(), text: input, from: 'user' }
    setMessages([...messages, msg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now(), text: 'AI response...', from: 'ai' }])
      setTyping(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m) => (
          <div key={m.id} className={`p-3 rounded-lg max-w-sm ${m.from === 'user' ? 'bg-blue-500/20 self-end' : 'bg-white/10'}`}>{m.text}</div>
        ))}
        {typing && <div className="w-16 h-8 bg-white/10 rounded-lg flex items-center justify-center"><span className="animate-bounce">...</span></div>}
      </div>
      <div className="p-4 border-t border-white/10 flex space-x-2">
        <input className="flex-1 bg-transparent outline-none" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask Codie..." />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 rounded-lg">Send</button>
      </div>
    </div>
  )
}

export default ChatPanel
