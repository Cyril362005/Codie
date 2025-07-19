import React, { useState } from 'react';
import { FiCopy, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import CodePreview from './CodePreview';

interface Message {
  id: number;
  text: string;
  from: 'user' | 'ai';
  reactions?: {
    thumbsUp: number;
    thumbsDown: number;
  };
  code?: string;
}

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Show me an example of a SQL injection vulnerability.", from: 'user' },
    {
      id: 2,
      text: "Certainly. Here is a classic example of a SQL injection vulnerability in a Node.js application:",
      from: 'ai',
      code: `
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
  db.query(query, (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.send('Login successful');
    } else {
      res.send('Invalid credentials');
    }
  });
});
      `
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const sendMessage = () => {
    if (!input) return;
    const msg: Message = { id: Date.now(), text: input, from: 'user' };
    setMessages([...messages, msg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now(), text: 'This is a mock AI response.', from: 'ai' }]);
      setTyping(false);
    }, 1000);
  };

  const handleReaction = (id: number, reaction: 'thumbsUp' | 'thumbsDown') => {
    setMessages(messages.map(m =>
      m.id === id ? { ...m, reactions: { ...m.reactions, [reaction]: (m.reactions?.[reaction] || 0) + 1 } } : m
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full p-lg">
      <div className="flex-1 overflow-y-auto space-y-lg pr-md">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-md rounded-lg max-w-xl glass-1 ${m.from === 'user' ? 'bg-accent/10' : ''}`}>
              <p>{m.text}</p>
              {m.code && (
                <div className="mt-md">
                  <CodePreview code={m.code} language="javascript" />
                </div>
              )}
            </div>
            {m.from === 'ai' && (
              <div className="flex items-center space-x-sm mt-sm">
                <button onClick={() => handleReaction(m.id, 'thumbsUp')} className="text-gray-400 hover:text-success"><FiThumbsUp /></button>
                <button onClick={() => handleReaction(m.id, 'thumbsDown')} className="text-gray-400 hover:text-danger"><FiThumbsDown /></button>
                {m.code && <button onClick={() => copyToClipboard(m.code!)} className="text-gray-400 hover:text-accent"><FiCopy /></button>}
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex items-start">
            <div className="p-md rounded-lg max-w-xl glass-1 flex items-center space-x-sm">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-200" />
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-400" />
            </div>
          </div>
        )}
      </div>
      <div className="pt-lg border-t border-white/10 flex space-x-sm">
        <input
          className="flex-1 bg-white/5 text-white px-md py-sm rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask Codie..."
        />
        <button onClick={sendMessage} className="px-md py-sm bg-accent rounded-md text-primary font-semibold hover:bg-accent/80 transition-colors">Send</button>
      </div>
    </div>
  );
};

export default ChatPanel;
