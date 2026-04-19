import React, { useState, useRef, useEffect, UIEvent } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, User, Sparkles, MessageCircle, Trash2, Copy, Check, RefreshCw, Moon, Sun } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_PROMPT = `You are Mini Jack by MK, a smart, friendly, and highly capable AI chatbot created by Mong Kul (មង្គល) specially for Khmer people.
Your name is Mini Jack by MK. You are designed to be the ultimate helpful, fun, and intelligent AI companion for Cambodian users — combining professionalism with a playful personality.

Core Abilities:
- You are an expert in the Khmer language. You write, read, and communicate perfectly — with accurate spelling, natural grammar, proper politeness levels, and authentic Cambodian style.
- You are fully bilingual (Khmer + English).
- If the user writes in Khmer, you always reply in natural, fluent Khmer.
- If the user writes in English, you can reply in English or naturally mix both languages.
- You have deep understanding of Cambodian culture, daily life, local slang, humor, traditions, food, current events, and the real needs of people in Phnom Penh and across Cambodia.

Personality:
- You are professional, reliable, and trustworthy, yet warm, playful, and fun.
- You are patient, positive, encouraging, and always supportive.
- You love making learning and problem-solving enjoyable while still delivering high-quality, professional results.

Special Abilities:
- Exam & Study Help: Help students prepare for exams (Grade 12, university entrance, IELTS, TOEIC, etc.) with explanations, practice questions, and revision tips in Khmer or English.
- Coding & Tech Help: Assist with programming, building websites, apps, and explaining technical concepts simply.
- Business & Entrepreneurship: Help generate business ideas, marketing strategies, business plans, social media content, and advice for small businesses in Cambodia.
- Content Creation: Write professional emails, letters, reports, essays, social media posts, and scripts in perfect Khmer or English.
- Translation: Provide natural and accurate translations between Khmer and English.

Rules:
- IMPORTANT: NEVER surround your name in brackets like <Mini Jack>. HTML parsers hide text in brackets. Always write your name purely as text: "Mini Jack by MK".
- At the beginning of every new conversation, warmly introduce yourself as "សួស្តី! ខ្ញុំឈ្មោះ Mini Jack by MK បង្កើតឡើងដោយលោក មង្គល" (or in English if the first message is in English).
- Keep your tone professional yet friendly, colorful, and playful.
- Always be clear, fast, and highly accurate.
- Be honest if you don't know something and offer the best possible help.`;

// Initialize the SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a'; // slate-900
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc'; // slate-50
    }
  }, [isDarkMode]);
  
  // Header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Action states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initChat = (history?: { role: string; parts: { text: string }[] }[]) => {
    chatRef.current = ai.chats.create({
      model: "gemini-3-flash-preview", 
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.95,
      },
      history: history || [],
    });
  };

  useEffect(() => {
    initChat();
  }, []);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > 60 && currentScrollY > lastScrollY) {
      setShowHeader(false); // Scrolling down
    } else if (currentScrollY < lastScrollY) {
      setShowHeader(true); // Scrolling up
    }
    setLastScrollY(currentScrollY);
  };

  const handleClearChat = () => {
    if (messages.length === 0) {
      initChat();
      setShowHeader(true);
      return;
    }
    
    if (isConfirmingClear) {
      setMessages([]);
      initChat();
      setShowHeader(true);
      setIsConfirmingClear(false);
    } else {
      setIsConfirmingClear(true);
      setTimeout(() => setIsConfirmingClear(false), 3000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchModelResponse = async (userText: string, customModelId: string) => {
    try {
      if (!chatRef.current) initChat();
      
      const streamResponse = await chatRef.current.sendMessageStream({
        message: userText
      });

      let accumulatedText = "";
      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          accumulatedText += c.text;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === customModelId
                ? { ...msg, content: accumulatedText }
                : msg
            )
          );
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === customModelId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      console.error('Error generating content:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === customModelId
            ? { ...msg, content: "អធ្យាស្រ័យ មានការរអាក់រអួលបន្តិចបន្តួច។ សូមព្យាយាមម្តងទៀត! (Sorry, I encountered an error. Please try again.)", isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowHeader(false); // Hide header on new message to maximize space

    const modelMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: modelMessageId, role: 'model', content: '', isStreaming: true },
    ]);

    await fetchModelResponse(userText, modelMessageId);
  };

  const handleRegenerate = async () => {
    if (isTyping) return;
    
    // Find last user message
    const lastUserIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserIndex === -1) return;
    
    const lastUserMsg = messages[lastUserIndex];
    
    // Slice history up to the message BEFORE the last user message
    const previousMessages = messages.slice(0, lastUserIndex);
    const history = previousMessages.map(m => ({
      role: m.role, // 'user' or 'model'
      parts: [{ text: m.content }]
    }));
    
    // Re-initialize the chat with this history
    initChat(history);
    
    // Update state to remove all messages after the last user message
    setMessages(messages.slice(0, lastUserIndex + 1));
    setIsTyping(true);

    const modelMessageId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: modelMessageId, role: 'model', content: '', isStreaming: true },
    ]);

    await fetchModelResponse(lastUserMsg.content, modelMessageId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      {/* Modern Colorful Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-fuchsia-400/[0.12] via-purple-400/[0.1] to-blue-400/[0.15] dark:from-fuchsia-600/[0.15] dark:via-purple-600/[0.1] dark:to-blue-600/[0.2] blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-cyan-400/[0.15] via-teal-400/[0.1] to-blue-400/[0.12] dark:from-cyan-600/[0.15] dark:via-teal-600/[0.1] dark:to-blue-600/[0.2] blur-[100px] pointer-events-none z-0" />

      {/* Scrollable / Hideable Header */}
      <AnimatePresence>
        {showHeader && (
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3 }}
            className="shrink-0 w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/50 dark:border-slate-800/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] z-50 transition-colors"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600 shadow-md shadow-violet-500/20 text-white">
                  <Sparkles size={20} className="fill-white/20" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 dark:from-fuchsia-400 dark:via-violet-400 dark:to-indigo-400 flex flex-wrap items-center gap-1.5 sm:gap-2 leading-tight">
                    Mini Jack
                    <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 dark:from-violet-900/40 dark:to-indigo-900/40 dark:text-violet-300 border border-violet-200/50 dark:border-violet-700/50 shadow-sm mt-0.5 sm:mt-0">
                      by MK
                    </span>
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 sm:p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg sm:rounded-xl transition-all duration-300 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm"
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  onClick={handleClearChat}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-sm border",
                    isConfirmingClear 
                      ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600 shadow-rose-500/25" 
                      : "text-rose-500 dark:text-rose-400 hover:text-white dark:hover:text-white hover:bg-rose-500 dark:hover:bg-rose-600 border-rose-100 dark:border-rose-900/50 bg-white/60 dark:bg-slate-800/60"
                  )}
                  title="Clear current chat"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">
                    {isConfirmingClear ? "Sure?" : "Clear Chat"}
                  </span>
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Chat Area - Scrollable */}
      <main 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto w-full z-10 scroll-smooth px-2 sm:px-4"
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8 py-6 sm:py-8">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center justify-center min-h-[55vh] text-center px-2"
              >
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-cyan-500 blur-2xl opacity-20 rounded-full animate-pulse" />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30 flex items-center justify-center text-white ring-4 ring-white">
                    <MessageCircle size={36} className="fill-white/10 sm:w-11 sm:h-11" />
                  </div>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 tracking-tight leading-tight transition-colors">
                  សួស្តី! <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600 dark:from-fuchsia-400 dark:to-indigo-400">I'm Mini Jack.</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed transition-colors">
                  The ultimate smart, friendly, and fun AI companion by <b className="dark:text-slate-200">Mong Kul (មង្គល)</b>. I'm ready to learn, help, and chat in both Khmer & English!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl">
                  {[
                    { text: "Can you help me prepare for my Grade 12 exams?", emoji: "🎓" },
                    { text: "តើអ្នកអាចបកប្រែពាក្យនេះទៅជាភាសាអង់គ្លេសបានទេ?", emoji: "🌍" },
                    { text: "Help me write a professional email in English.", emoji: "✉️" },
                    { text: "Can you assist me with marketing ideas?", emoji: "💡" }
                  ].map((suggestion, i) => (
                    <motion.button
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      key={i}
                      onClick={() => {
                        setInput(suggestion.text);
                        setTimeout(() => handleSend(), 50);
                      }}
                      className="flex items-start gap-3 p-4 sm:p-5 text-left border border-white/60 dark:border-slate-700/60 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-violet-200 dark:hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 text-slate-700 dark:text-slate-200 text-sm sm:text-[15px] leading-relaxed group shadow-sm z-10"
                    >
                      <span className="text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform">{suggestion.emoji}</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{suggestion.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                    key={msg.id}
                    className={cn(
                      "flex gap-2 sm:gap-4 w-full",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === 'model' && (
                      <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 ring-2 ring-white z-10 mt-1 sm:mt-0">
                        <Sparkles size={16} className="fill-white/20 sm:w-[18px] sm:h-[18px]" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex flex-col gap-1.5",
                      msg.role === 'user' ? "items-end max-w-[85%] sm:max-w-[75%]" : "items-start max-w-[90%] sm:max-w-[80%]"
                    )}>
                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "px-4 py-3 sm:px-6 sm:py-4 rounded-3xl shadow-sm relative",
                          msg.role === 'user' 
                            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm shadow-indigo-500/20 font-medium text-sm sm:text-[15px]" 
                            : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 rounded-tl-sm prose-slate"
                        )}
                      >
                        {msg.role === 'model' ? (
                          <div className="prose prose-sm sm:prose-base prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-indigo-900 dark:prose-headings:text-indigo-300 prose-a:text-violet-600 dark:prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline break-words">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content || (msg.isStreaming ? '•••' : '')}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</div>
                        )}
                      </div>

                      {/* Action Bar */}
                      {!msg.isStreaming && msg.content && (
                         <div className={cn(
                           "flex items-center gap-1 sm:gap-2 px-2", 
                           msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                         )}>
                            <button
                               onClick={() => copyToClipboard(msg.content, msg.id)}
                               className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-md transition-colors flex items-center gap-1"
                               title="Copy message"
                            >
                               {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                            
                            {msg.role === 'model' && isLast && (
                               <button
                                 onClick={handleRegenerate}
                                 className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-md transition-colors flex items-center gap-1"
                                 title="Regenerate response"
                               >
                                 <RefreshCw size={14} />
                               </button>
                            )}
                         </div>
                      )}
                    </div>
                    
                    {msg.role === 'user' && (
                      <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-500 shadow-sm ring-2 ring-white dark:ring-slate-900 z-10 mt-1 sm:mt-0">
                        <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </main>

      {/* Modern Floating Input Area */}
      <footer className="shrink-0 w-full p-2 sm:p-4 bg-transparent z-20 pb-4 sm:pb-6">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="relative flex items-end gap-2 sm:gap-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-[24px] sm:rounded-3xl border border-white dark:border-slate-700/50 shadow-sm p-1.5 sm:p-2 pl-4 sm:pl-5 focus-within:ring-4 focus-within:ring-violet-500/20 focus-within:border-violet-300 dark:focus-within:border-violet-500/50 transition-all duration-300 mx-2 sm:mx-0">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="សួរសំណួររបស់អ្នកនៅទីនេះ..."
              className="flex-1 max-h-[120px] sm:max-h-48 min-h-[44px] sm:min-h-[52px] py-3 sm:py-3.5 bg-transparent border-none outline-none resize-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base font-medium leading-relaxed"
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="shrink-0 mb-0.5 sm:mb-1 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-[18px] sm:rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {isTyping ? (
                <div className="flex gap-1">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <Send size={18} className="translate-x-0.5 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
