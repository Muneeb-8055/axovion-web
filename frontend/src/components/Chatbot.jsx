import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { publicApi } from '../lib/api';
import { getSessionId } from '../lib/hooks';
import { FAQ_CHIPS } from '../lib/content';

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi, I'm Axovion AI. Ask me about AI automation — or tap a question below.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const sessionId = useRef(getSessionId());
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 220);
    }
  }, [open]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);
    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    try {
      const res = await publicApi.sendChat({ sessionId: sessionId.current, message: content });
      setMessages((m) => [...m, { role: 'assistant', content: res.data.reply, timestamp: new Date().toISOString() }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble responding right now. Please try again, or submit our AI Audit at /audit for direct help.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating open button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        data-testid="chatbot-open-button"
        className={`fixed bottom-5 right-5 z-[60] h-14 w-14 rounded-[18px] inline-flex items-center justify-center transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.45)] ${
          open ? 'bg-[#12121A] border border-white/15 text-white' : 'bg-[#F97316] text-[#0A0A0F] hover:bg-[#FBBF24] ax-cta-pulse'
        }`}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-5 z-[59] w-[360px] max-w-[calc(100vw-24px)] h-[540px] max-h-[calc(100vh-120px)] rounded-[16px] bg-[#12121A] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
            data-testid="chatbot-panel"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0A0A0F]">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-[10px] bg-[#00D4FF]/12 border border-[#00D4FF]/25 inline-flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#00D4FF]" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Axovion AI</div>
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#C0C0C8]/55">Always on</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                data-testid="chatbot-close-button"
                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-[#C0C0C8] hover:bg-[#161622] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" data-testid="chatbot-messages">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-[12px] px-3 py-2 text-sm leading-relaxed border ${
                      m.role === 'user'
                        ? 'bg-[#161622] text-white border-white/10'
                        : 'bg-[#0A0A0F] text-[#C0C0C8] border-white/8'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[#0A0A0F] text-[#C0C0C8] border border-white/8 rounded-[12px] px-3 py-2 text-sm">
                    <span className="inline-flex gap-1 items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-pulse" style={{ animationDelay: '120ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-pulse" style={{ animationDelay: '240ms' }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-3 pt-2 pb-3 border-t border-white/10 bg-[#12121A]">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {FAQ_CHIPS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    data-testid={`chatbot-faq-chip-${q.slice(0, 14).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-[#0A0A0F] border border-white/10 text-[#C0C0C8] hover:text-white hover:border-[#00D4FF]/35 transition-colors duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about automation…"
                  aria-label="Message"
                  data-testid="chatbot-input"
                  className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-[10px] px-3 py-2 text-sm text-white placeholder:text-[#C0C0C8]/50 ax-focus-ring"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  aria-label="Send"
                  data-testid="chatbot-send-button"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-[10px] bg-[#F97316] text-[#0A0A0F] disabled:opacity-50 transition-colors duration-200 hover:bg-[#FBBF24]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
