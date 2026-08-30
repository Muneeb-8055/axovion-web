import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from 'react';
import { MessageCircle, X, Send, Bot, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { publicApi } from '../lib/api';
import { getSessionId } from '../lib/hooks';
import { FAQ_CHIPS } from '../lib/content';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';

/* ------------------------------------------------------------------ */
/*  Typing indicator                                                    */
/* ------------------------------------------------------------------ */

function TypingDots() {
  return (
    <span
      aria-hidden="true"
      style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}
    >
      {[0, 120, 240].map((delay) => (
        <span
          key={delay}
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '9999px',
            background: 'var(--ax-accent)',
            animation: 'ax-chat-pulse 1.2s ease-in-out infinite',
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi, I'm Axovion AI. Ask me about AI automation, or tap a question below.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastFailedText, setLastFailedText] = useState(null);

  const sessionId = useRef(getSessionId());
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const panelRef = useRef(null);
  const headingId = useId();

  /* ---- scroll to bottom on new messages ---- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  /* ---- focus management ---- */
  useEffect(() => {
    if (open) {
      /* Move focus into the panel on open */
      const raf = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    } else {
      /* Return focus to launcher on close */
      launcherRef.current?.focus();
    }
  }, [open]);

  /* ---- focus trap ---- */
  const handleKeyDown = useCallback(
    (e) => {
      if (!open) return;

      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        return;
      }

      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [open]
  );

  /* ---- send ---- */
  const sendMessage = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput('');
    setLastFailedText(null);
    setSending(true);
    const userMsg = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    try {
      const res = await publicApi.sendChat({
        sessionId: sessionId.current,
        message: content,
      });
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setLastFailedText(content);
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: null, // sentinel: render as error bubble
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const retry = () => {
    if (!lastFailedText) return;
    const text = lastFailedText;
    setLastFailedText(null);
    // remove the error bubble
    setMessages((m) => m.slice(0, -1));
    sendMessage(text);
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* Keyframe for typing dots */}
      <style>{`
        @keyframes ax-chat-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40%            { opacity: 1;    transform: scale(1); }
        }
      `}</style>

      {/* ---- Launcher button ---- */}
      <button
        ref={launcherRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Axovion AI chat' : 'Open Axovion AI chat'}
        aria-expanded={open}
        aria-haspopup="dialog"
        data-testid="chatbot-open-button"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 60,
          height: 52,
          width: 52,
          borderRadius: 'var(--ax-radius-panel)',
          border: open
            ? '1px solid var(--ax-border-strong)'
            : '1px solid transparent',
          background: open
            ? 'var(--ax-surface-2)'
            : 'var(--ax-accent)',
          color: open ? 'var(--ax-text)' : 'var(--ax-on-accent)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: open
            ? 'none'
            : '0 8px 24px rgba(0,212,255,0.28), 0 2px 8px rgba(0,0,0,0.4)',
          transition:
            'background var(--ax-duration) var(--ax-ease-out), box-shadow var(--ax-duration) var(--ax-ease-out), border-color var(--ax-duration) var(--ax-ease-out)',
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'var(--ax-accent-dim)';
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'var(--ax-accent)';
          }
        }}
      >
        {open ? (
          <X strokeWidth={1.5} style={{ width: 20, height: 20 }} />
        ) : (
          <MessageCircle strokeWidth={1.5} style={{ width: 22, height: 22 }} />
        )}
      </button>

      {/* ---- Panel ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            onKeyDown={handleKeyDown}
            data-testid="chatbot-panel"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: 'fixed',
              bottom: 84,
              right: 20,
              zIndex: 59,
              width: 360,
              maxWidth: 'calc(100vw - 24px)',
              height: 540,
              maxHeight: 'calc(100dvh - 112px)',
              borderRadius: 'var(--ax-radius-panel)',
              background: 'var(--ax-surface)',
              border: '1px solid var(--ax-border-strong)',
              boxShadow:
                '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ---- Panel header ---- */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--ax-border)',
                background: 'var(--ax-bg)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.22)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot
                    strokeWidth={1.5}
                    style={{
                      width: 16,
                      height: 16,
                      color: 'var(--ax-accent)',
                    }}
                  />
                </div>
                <div>
                  <h2
                    id={headingId}
                    style={{
                      margin: 0,
                      color: 'var(--ax-heading)',
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    Axovion AI
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--ax-muted-2)',
                      lineHeight: 1.3,
                    }}
                  >
                    Always on
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                data-testid="chatbot-close-button"
                style={{
                  width: 44,
                  height: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--ax-radius-control)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ax-muted)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background var(--ax-duration-fast) var(--ax-ease-out), color var(--ax-duration-fast) var(--ax-ease-out)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--ax-surface-2)';
                  e.currentTarget.style.color = 'var(--ax-heading)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--ax-muted)';
                }}
              >
                <X strokeWidth={1.5} style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* ---- Message thread ---- */}
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
              data-testid="chatbot-messages"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {messages.map((m, i) => {
                const isUser = m.role === 'user';
                if (m.isError) {
                  return (
                    <div
                      key={i}
                      style={{ display: 'flex', justifyContent: 'flex-start' }}
                    >
                      <div
                        style={{
                          maxWidth: '82%',
                          borderRadius: 'var(--ax-radius-control)',
                          padding: '8px 12px',
                          border: '1px solid rgba(239,68,68,0.3)',
                          background: 'rgba(239,68,68,0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            color: 'var(--ax-error)',
                            fontSize: 13,
                            lineHeight: 1.5,
                          }}
                        >
                          Send failed. Check your connection.
                        </p>
                        <button
                          onClick={retry}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            alignSelf: 'flex-start',
                            background: 'none',
                            border: 'none',
                            padding: '4px 0',
                            cursor: 'pointer',
                            color: 'var(--ax-accent)',
                            fontSize: 12,
                            fontWeight: 500,
                            minHeight: 44,
                          }}
                        >
                          <RotateCcw
                            strokeWidth={1.5}
                            style={{ width: 12, height: 12 }}
                          />
                          Retry
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Screen-reader role label for non-user messages */}
                    {!isUser && (
                      <span className="sr-only">Axovion AI:</span>
                    )}
                    <div
                      style={{
                        maxWidth: '82%',
                        borderRadius: 'var(--ax-radius-control)',
                        padding: '8px 12px',
                        fontSize: 13,
                        lineHeight: 1.55,
                        border: '1px solid var(--ax-border)',
                        background: isUser
                          ? 'var(--ax-surface-2)'
                          : 'var(--ax-bg)',
                        color: isUser
                          ? 'var(--ax-heading)'
                          : 'var(--ax-text)',
                        /* Non-color distinction: user messages are right-aligned
                           and slightly stronger background; assistant messages are
                           left-aligned with a left-border accent stripe */
                        borderLeft: isUser
                          ? '1px solid var(--ax-border)'
                          : '2px solid rgba(0,212,255,0.22)',
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {sending && (
                <div
                  style={{ display: 'flex', justifyContent: 'flex-start' }}
                  aria-label="Axovion AI is typing"
                >
                  <div
                    style={{
                      borderRadius: 'var(--ax-radius-control)',
                      padding: '10px 14px',
                      border: '1px solid var(--ax-border)',
                      borderLeft: '2px solid rgba(0,212,255,0.22)',
                      background: 'var(--ax-bg)',
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}

              {/* Empty state: only the initial greeting shown, no user messages */}
              {messages.length === 1 && !sending && (
                <p
                  style={{
                    margin: '8px 0 0',
                    color: 'var(--ax-muted)',
                    fontSize: 12,
                    textAlign: 'center',
                  }}
                >
                  Your conversation stays private and is not stored.
                </p>
              )}
            </div>

            {/* ---- Composer area ---- */}
            <div
              style={{
                padding: '10px 12px 12px',
                borderTop: '1px solid var(--ax-border)',
                background: 'var(--ax-surface)',
                flexShrink: 0,
              }}
            >
              {/* Quick-reply chips */}
              <div
                role="group"
                aria-label="Quick questions"
                style={{
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  paddingBottom: 8,
                  scrollbarWidth: 'none',
                }}
              >
                {FAQ_CHIPS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    data-testid={`chatbot-faq-chip-${q
                      .slice(0, 14)
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')}`}
                    style={{
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      fontSize: 11,
                      padding: '5px 10px',
                      minHeight: 30,
                      borderRadius: 'var(--ax-radius-pill)',
                      background: 'var(--ax-bg)',
                      border: '1px solid var(--ax-border)',
                      color: 'var(--ax-muted)',
                      cursor: 'pointer',
                      transition:
                        'border-color var(--ax-duration-fast) var(--ax-ease-out), color var(--ax-duration-fast) var(--ax-ease-out)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        'rgba(0,212,255,0.35)';
                      e.currentTarget.style.color = 'var(--ax-heading)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--ax-border)';
                      e.currentTarget.style.color = 'var(--ax-muted)';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <label
                  htmlFor="chatbot-input-field"
                  className="sr-only"
                >
                  Message Axovion AI
                </label>
                <input
                  ref={inputRef}
                  id="chatbot-input-field"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about automation..."
                  data-testid="chatbot-input"
                  style={{
                    flex: 1,
                    height: 40,
                    background: 'var(--ax-bg)',
                    border: '1px solid var(--ax-border)',
                    borderRadius: 'var(--ax-radius-control)',
                    padding: '0 12px',
                    fontSize: 13,
                    color: 'var(--ax-heading)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color var(--ax-duration-fast) var(--ax-ease-out)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(0,212,255,0.45)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--ax-border)';
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  aria-label="Send message"
                  data-testid="chatbot-send-button"
                  style={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--ax-radius-control)',
                    background: 'var(--ax-accent)',
                    color: 'var(--ax-on-accent)',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: !input.trim() || sending ? 0.45 : 1,
                    transition:
                      'opacity var(--ax-duration-fast) var(--ax-ease-out), background var(--ax-duration-fast) var(--ax-ease-out)',
                  }}
                  onMouseEnter={(e) => {
                    if (!(!input.trim() || sending)) {
                      e.currentTarget.style.background = 'var(--ax-accent-dim)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--ax-accent)';
                  }}
                >
                  <Send strokeWidth={1.5} style={{ width: 15, height: 15 }} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
