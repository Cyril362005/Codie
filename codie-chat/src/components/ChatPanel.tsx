import React, { useState, useRef, useEffect } from 'react';
import { FiCopy, FiThumbsUp, FiThumbsDown, FiCheck, FiEye, FiSend, FiMessageSquare } from 'react-icons/fi';
import CodePreview from './CodePreview';
import ReactDiffViewer from 'react-diff-viewer';
import { chatAPI, analysisAPI } from '../services/api';
import { useAuth } from '../contexts/useAuth';

interface Message {
  id: number;
  text: string;
  from: 'user' | 'ai';
  reactions?: {
    thumbsUp: number;
    thumbsDown: number;
  };
  code?: string;
  filePath?: string;
  originalCode?: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  code?: string;
  file_path?: string;
  original_code?: string;
}

interface ChatPanelProps {
  repoPath?: string;
  analysisData?: Record<string, unknown>;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ repoPath, analysisData }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Show me an example of a SQL injection vulnerability.", 
      from: 'user',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      text: "I found a critical SQL injection vulnerability in your login function. Here's the fix:",
      from: 'ai',
      code: `
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Use parameterized queries to prevent SQL injection
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.send('Login successful');
    } else {
      res.send('Invalid credentials');
    }
  });
});
      `,
      filePath: 'src/routes/auth.js',
      originalCode: `
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
      `,
      timestamp: new Date(Date.now() - 240000)
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showDiff, setShowDiff] = useState<number | null>(null);
  const [applyingFix, setApplyingFix] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { 
      id: Date.now(), 
      text: input, 
      from: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setTyping(true);
    
    try {
      // Send message to chat service
      const apiResponse = await chatAPI.sendMessage({
        message: input,
        chat_id: 'demo-chat-123',
        context: analysisData,
        token: token || undefined
      });
      
      const response = (apiResponse.data || {}) as ChatResponse;
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: response.message || 'This is a mock AI response demonstrating the AI assistant capabilities for code review and security analysis.',
        from: 'ai',
        timestamp: new Date(),
        code: response.code,
        filePath: response.file_path,
        originalCode: response.original_code
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add fallback AI response
      const fallbackMessage: Message = {
        id: Date.now() + 1,
        text: 'I apologize, but I encountered an error processing your request. Please try again.',
        from: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReaction = (id: number, reaction: 'thumbsUp' | 'thumbsDown') => {
    setMessages(messages.map(m =>
      m.id === id ? { 
        ...m, 
        reactions: { 
          thumbsUp: reaction === 'thumbsUp' ? (m.reactions?.thumbsUp || 0) + 1 : (m.reactions?.thumbsUp || 0),
          thumbsDown: reaction === 'thumbsDown' ? (m.reactions?.thumbsDown || 0) + 1 : (m.reactions?.thumbsDown || 0)
        } 
      } : m
    ));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const applyFix = async (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.code || !message.filePath || !repoPath) {
      console.error('Missing required data for applying fix');
      return;
    }

    setApplyingFix(messageId);
    try {
      const result = await analysisAPI.applyFix({
        repo_path: repoPath,
        file_path: message.filePath,
        new_code: message.code,
        token: token || undefined
      });
      
      console.log('Fix applied successfully:', result);
      
      // Update the message to show success
      setMessages(messages.map(m => 
        m.id === messageId 
          ? { ...m, text: m.text + '\n\n✅ Fix applied successfully!' }
          : m
      ));
    } catch (error) {
      console.error('Failed to apply fix:', error);
      // Update the message to show error
      setMessages(messages.map(m => 
        m.id === messageId 
          ? { ...m, text: m.text + '\n\n❌ Failed to apply fix. Please try again.' }
          : m
      ));
    } finally {
      setApplyingFix(null);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  

  return (
    <div className="flex flex-col h-full bg-gradient-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
            <FiMessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Code review and security analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="status-indicator status-online">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span>Online</span>
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl ${m.from === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`p-4 rounded-2xl shadow-sm ${
                m.from === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}>
                <p className={`${m.from === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'} leading-relaxed`}>
                  {m.text}
                </p>
                {m.code && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {m.filePath}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => copyToClipboard(m.code!)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          aria-label="Copy code"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                        {m.originalCode && (
                          <button 
                            onClick={() => setShowDiff(showDiff === m.id ? null : m.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            aria-label="Show diff"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <CodePreview code={m.code} language="javascript" />
                    {m.originalCode && showDiff === m.id && (
                      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code Changes</h4>
                        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <ReactDiffViewer
                            oldValue={m.originalCode}
                            newValue={m.code}
                            splitView={false}
                            useDarkTheme={true}
                            styles={{
                              diffContainer: {
                                pre: {
                                  backgroundColor: 'transparent',
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {m.filePath && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          File: {m.filePath}
                        </span>
                        <button
                          onClick={() => applyFix(m.id)}
                          disabled={applyingFix === m.id}
                          className="btn-success text-xs"
                        >
                          {applyingFix === m.id ? (
                            <>
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Applying...
                            </>
                          ) : (
                            <>
                              <FiCheck className="w-3 h-3 mr-1" />
                              Apply Fix
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Message Actions */}
              {m.from === 'ai' && (
                <div className="flex items-center space-x-4 mt-3 ml-4">
                  <button 
                    onClick={() => handleReaction(m.id, 'thumbsUp')} 
                    className="flex items-center space-x-1 text-gray-400 hover:text-success-500 transition-colors"
                    aria-label="Give thumbs up"
                  >
                    <FiThumbsUp className="w-4 h-4" />
                    <span className="text-xs">{m.reactions?.thumbsUp || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleReaction(m.id, 'thumbsDown')} 
                    className="flex items-center space-x-1 text-gray-400 hover:text-danger-500 transition-colors"
                    aria-label="Give thumbs down"
                  >
                    <FiThumbsDown className="w-4 h-4" />
                    <span className="text-xs">{m.reactions?.thumbsDown || 0}</span>
                  </button>
                  <span className="text-xs text-gray-400">
                    {formatTime(m.timestamp)}
                  </span>
                </div>
              )}
              
              {m.from === 'user' && (
                <div className="flex justify-end mt-3 mr-4">
                  <span className="text-xs text-gray-400">
                    {formatTime(m.timestamp)}
                  </span>
                </div>
              )}
            </div>

          </div>
        ))}
        
        {/* Typing Indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="max-w-2xl">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-bounce-delay-1"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-bounce-delay-2"></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">AI is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about code security, vulnerabilities, or request code improvements..."
              className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none chat-textarea"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              aria-label="Send message"
              className="absolute right-2 bottom-2 p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{input.length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
