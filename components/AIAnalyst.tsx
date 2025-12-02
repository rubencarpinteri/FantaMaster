import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { Match, TeamStats } from '../types';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalystProps {
  campeonatoTable: TeamStats[];
  battleRoyaleTable: TeamStats[];
  matches: Match[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ campeonatoTable, battleRoyaleTable, matches }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your League Analyst. Ask me about the standings, form, or who is the unluckiest team in the Battle Royale!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getGeminiResponse(userMessage, campeonatoTable, battleRoyaleTable, matches);
      setMessages(prev => [...prev, { role: 'assistant', content: response || "No response received." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't analyze the data right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-white/80 dark:bg-[#1c1c1e]/80 p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 backdrop-blur-md sticky top-0 z-10">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Analyst AI</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Sparkles size={10} className="text-indigo-500"/> Powered by Gemini
            </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-black/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-[#2c2c2e] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
            }`}>
              <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl rounded-bl-none px-5 py-4 border border-gray-100 dark:border-gray-700 flex items-center gap-3 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Processing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-[#1c1c1e] border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about the league..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 outline-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white aspect-square rounded-xl flex items-center justify-center transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};