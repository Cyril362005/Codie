import React, { useState } from 'react'

const commands = ['Open project', 'Run scan', 'Show help']

const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [query, setQuery] = useState('')
  if (!open) return null
  const results = commands.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="glass w-80 p-4" onClick={(e) => e.stopPropagation()}>
        <input className="w-full mb-2 bg-transparent outline-none" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a command..." />
        <ul className="space-y-1">
          {results.map((r) => (
            <li key={r} className="px-2 py-1 hover:bg-white/10 rounded cursor-pointer" onClick={() => { onClose(); }}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CommandPalette
