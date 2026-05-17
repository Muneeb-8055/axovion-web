import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../lib/hooks';
import {
  Users, Clock, ShoppingCart, TrendingUp, MessageCircle,
  ArrowRight, Sparkles
} from 'lucide-react';

const Reveal = ({ children, delay = 0 }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="ax-reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Demo = () => {
  // Calculator state
  const [csCount, setCsCount] = useState(4);
  const [csSalary, setCsSalary] = useState(45000);
  const [responseTime, setResponseTime] = useState(8);
  const [dailyInquiries, setDailyInquiries] = useState(80);
  const [afterHoursPct, setAfterHoursPct] = useState(65);
  const [aov, setAov] = useState(15000);
  const [abandonRate, setAbandonRate] = useState(72);
  const [dailyVisitors, setDailyVisitors] = useState(2000);
  const [recoverablePct, setRecoverablePct] = useState(15);
  const [aiResolvePct, setAiResolvePct] = useState(80);
  const [liveLoss, setLiveLoss] = useState(0);
  const [results, setResults] = useState({});
  
  // Chatbot state
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "As-salamu alaykum! I'm Aisha, your AI assistant. I can help with:\n\n• Collections & new arrivals\n• Order tracking & delivery\n• Size & style recommendations\n• Exchange & return questions\n• Payment & shipping info\n\nWhat can I help you with?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Calculations
  useEffect(() => {
    const csMonthly = csCount * csSalary;
    const csAnnual = csMonthly * 12;
    const missedDaily = Math.round(dailyInquiries * (afterHoursPct / 100));
    const abandonedValue = Math.round(dailyVisitors * (abandonRate / 100)) * aov;
    const recoverableMonthly = Math.round(abandonedValue * (recoverablePct / 100) * 30);
    const recoverableAnnual = recoverableMonthly * 12;
    const usdEquivalent = Math.round(recoverableAnnual / 279);

    setResults({
      csMonthly,
      csAnnual,
      missedDaily,
      abandonedValue,
      recoverableMonthly,
      recoverableAnnual,
      usdEquivalent
    });
  }, [csCount, csSalary, responseTime, dailyInquiries, afterHoursPct, aov, abandonRate, dailyVisitors, recoverablePct, aiResolvePct]);

  // Live ticker
  useEffect(() => {
    const lossPerSecond = (2000 * 0.72 * 15000 * 0.15) / (24 * 3600);
    const interval = setInterval(() => {
      setLiveLoss(prev => prev + lossPerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement;
      const b = document.body;
      const pct = (h.scrollTop || b.scrollTop) / ((h.scrollHeight || b.scrollHeight) - h.clientHeight) * 100;
      const scrollBar = document.getElementById('scrollBar');
      if (scrollBar) scrollBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format currency
  const formatPKR = (n) => 'PKR ' + n.toLocaleString('en-PK');
  const formatShort = (n) => {
    if (n >= 1e6) return 'PKR ' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return 'PKR ' + (n / 1e3).toFixed(0) + 'K';
    return 'PKR ' + n;
  };

  // Chatbot functions
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    // Simulate AI response (you can replace this with actual API call)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'I apologize, but this is a demo environment. In production, this would connect to your AI backend. For now, please contact us directly at hello@axovion.io or try our main chatbot on the homepage.' 
      }]);
      setChatLoading(false);
    }, 1500);
  }, [chatInput, chatLoading]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <Helmet>
        <title>AI Support ROI Analysis | Axovion.io</title>
        <meta name="description" content="Calculate the hidden cost of delayed customer support and see how AI can recover lost revenue." />
      </Helmet>

      {/* Scroll Progress Bar */}
      <div 
        id="scrollBar" 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] z-[9999] transition-[width] duration-100"
        style={{ width: '0%' }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-32 pb-20" data-testid="demo-hero">
        <div className="max-w-[800px]">
          <div className="inline-flex items-center gap-2 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] px-5 py-2 rounded-full font-mono text-xs text-[#00D4FF] mb-8 tracking-[2px] uppercase">
            <span className="w-[6px] h-[6px] bg-[#10B981] rounded-full animate-pulse" />
            AI-Powered Analysis Engine
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            The Hidden Cost of <span className="bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] bg-clip-text text-transparent">Delayed Support</span>
          </h1>
          <p className="text-xl text-[#C0C0C8] max-w-[600px] mx-auto mb-10 leading-relaxed">
            What happens when your customers need help at 8 PM, on Sunday, or during peak season — and no one answers? This analysis reveals the truth.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#calculator" className="inline-flex items-center gap-2 px-8 py-4 bg-[#F97316] text-white rounded-xl font-semibold hover:bg-[#FBBF24] transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              <Sparkles className="h-5 w-5" /> Calculate Your Loss
            </a>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 border border-[rgba(0,212,255,0.4)] text-[#00D4FF] rounded-xl font-semibold hover:bg-[rgba(0,212,255,0.1)] transition-all">
              <ArrowRight className="h-5 w-5" /> See Live Demo
            </Link>
          </div>
          <div className="flex gap-12 justify-center mt-16 flex-wrap">
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-white">&lt;2<span className="text-[#00D4FF]">s</span></div>
              <div className="text-sm text-[#C0C0C8] mt-1 uppercase tracking-[1px]">AI Response</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-white">24<span className="text-[#00D4FF]">/7</span></div>
              <div className="text-sm text-[#C0C0C8] mt-1 uppercase tracking-[1px]">Availability</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-white"><span className="text-[#00D4FF]">80</span>%</div>
              <div className="text-sm text-[#C0C0C8] mt-1 uppercase tracking-[1px]">Auto-Resolved</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-white"><span className="text-[#00D4FF]">∞</span></div>
              <div className="text-sm text-[#C0C0C8] mt-1 uppercase tracking-[1px]">Concurrent</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <div className="sticky top-0 z-[999] bg-gradient-to-r from-[rgba(239,68,68,0.9)] to-[rgba(249,115,22,0.9)] py-3.5 text-center font-semibold text-white backdrop-blur-md border-b border-[rgba(255,255,255,0.1)]">
        <div className="ax-container">
          💸 Estimated revenue lost while viewing this page: <span className="font-mono text-xl font-bold ml-2">{formatPKR(Math.round(liveLoss))}</span>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <section className="ax-section" id="metrics-section">
        <div className="ax-container">
          <Reveal>
            <div className="font-mono text-xs tracking-[2px] uppercase text-[#00D4FF] mb-4">Real-Time Dashboard</div>
            <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-4">Key Performance Gaps</h2>
            <p className="text-[#C0C0C8] text-lg max-w-[600px] mb-16">These numbers update live as you adjust the calculator below.</p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <Reveal>
              <div className="bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-2xl p-8 text-center hover:border-[rgba(0,212,255,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,212,255,0.1)] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent" />
                <div className="text-2xl mb-3">⏱️</div>
                <div className="font-mono text-3xl font-bold text-white mb-1 text-[#EF4444]">{results.missedDaily || 52}</div>
                <div className="text-sm text-[#C0C0C8] uppercase tracking-[1px]">Missed Daily</div>
              </div>
            </Reveal>
            <Reveal>
              <div className="bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-2xl p-8 text-center hover:border-[rgba(0,212,255,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,212,255,0.1)] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent" />
                <div className="text-2xl mb-3">💸</div>
                <div className="font-mono text-3xl font-bold text-white mb-1 text-[#EF4444]">{formatShort(results.recoverableMonthly || 1944000)}</div>
                <div className="text-sm text-[#C0C0C8] uppercase tracking-[1px]">Monthly Loss</div>
              </div>
            </Reveal>
            <Reveal>
              <div className="bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-2xl p-8 text-center hover:border-[rgba(0,212,255,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,212,255,0.1)] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent" />
                <div className="text-2xl mb-3">📉</div>
                <div className="font-mono text-3xl font-bold text-white mb-1 text-[#EF4444]">{formatShort(results.recoverableAnnual || 23328000)}</div>
                <div className="text-sm text-[#C0C0C8] uppercase tracking-[1px]">Annual Leakage</div>
              </div>
            </Reveal>
            <Reveal>
              <div className="bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-2xl p-8 text-center hover:border-[rgba(0,212,255,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,212,255,0.1)] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent" />
                <div className="text-2xl mb-3">🚀</div>
                <div className="font-mono text-3xl font-bold text-white mb-1 text-[#10B981]">{formatShort(results.recoverableAnnual || 23328000)}</div>
                <div className="text-sm text-[#C0C0C8] uppercase tracking-[1px]">Recoverable</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="ax-section" id="calculator">
        <div className="ax-container">
          <Reveal>
            <div className="font-mono text-xs tracking-[2px] uppercase text-[#00D4FF] mb-4">ROI Calculator</div>
            <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-4">Calculate Your Support Costs</h2>
            <p className="text-[#C0C0C8] text-lg max-w-[600px] mb-16">All numbers are estimates. Click any number to adjust it to your actuals.</p>
          </Reveal>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 - Customer Support Team */}
            <Reveal>
              <div className="bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-2xl p-8 hover:border-[rgba(0,212,255,0.3)] hover:shadow-[0_4px_24px_rgba(0,212,255,0.06)] transition-all">
                <h3 className="text-white font-semibold flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.15)] flex items-center justify-center text-xl">👥</span>
                  Customer Support Team
                </h3>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    Number of CS reps <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={csCount} 
                    onChange={(e) => setCsCount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    Avg monthly salary per rep (PKR) <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={csSalary} 
                    onChange={(e) => setCsSalary(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="bg-[#1A1A25] rounded-xl p-5 mt-3 border-l-[3px] border-[#EF4444]">
                  <div className="text-sm text-[#C0C0C8] mb-1">Monthly CS payroll</div>
                  <div className="font-mono text-2xl font-bold text-[#EF4444]">{formatPKR(results.csMonthly || 180000)}</div>
                </div>
                <div className="bg-[#1A1A25] rounded-xl p-5 mt-3 border-l-[3px] border-[#EF4444]">
                  <div className="text-sm text-[#C0C0C8] mb-1">Annual CS payroll</div>
                  <div className="font-mono text-2xl font-bold text-[#EF4444]">{formatPKR(results.csAnnual || 2160000)}</div>
                </div>
              </div>
            </Reveal>

            {/* Card 2 - Response Time Impact */}
            <Reveal>
              <div className="bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-2xl p-8 hover:border-[rgba(0,212,255,0.3)] hover:shadow-[0_4px_24px_rgba(0,212,255,0.06)] transition-all">
                <h3 className="text-white font-semibold flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-[rgba(251,191,36,0.15)] flex items-center justify-center text-xl">⏱️</span>
                  Response Time Impact
                </h3>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    Avg response time (hours) <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={responseTime} 
                    onChange={(e) => setResponseTime(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    Daily inquiries (WhatsApp/IG/Email) <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={dailyInquiries} 
                    onChange={(e) => setDailyInquiries(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    % inquiries outside 9-6 Mon-Fri <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={afterHoursPct} 
                    onChange={(e) => setAfterHoursPct(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="bg-[#1A1A25] rounded-xl p-5 mt-3 border-l-[3px] border-[#EF4444]">
                  <div className="text-sm text-[#C0C0C8] mb-1">Inquiries missed/delayed daily</div>
                  <div className="font-mono text-2xl font-bold text-[#EF4444]">{results.missedDaily || 52}</div>
                </div>
              </div>
            </Reveal>

            {/* Card 3 - Cart Abandonment */}
            <Reveal>
              <div className="bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-2xl p-8 hover:border-[rgba(0,212,255,0.3)] hover:shadow-[0_4px_24px_rgba(0,212,255,0.06)] transition-all">
                <h3 className="text-white font-semibold flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-[rgba(59,130,246,0.15)] flex items-center justify-center text-xl">🛒</span>
                  Cart Abandonment
                </h3>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    Average order value (PKR) <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={aov} 
                    onChange={(e) => setAov(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    Cart abandonment rate % <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={abandonRate} 
                    onChange={(e) => setAbandonRate(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    Daily website visitors <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={dailyVisitors} 
                    onChange={(e) => setDailyVisitors(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="bg-[#1A1A25] rounded-xl p-5 mt-3 border-l-[3px] border-[#EF4444]">
                  <div className="text-sm text-[#C0C0C8] mb-1">Daily abandoned cart value</div>
                  <div className="font-mono text-2xl font-bold text-[#EF4444]">{formatPKR(results.abandonedValue || 432000)}</div>
                </div>
              </div>
            </Reveal>

            {/* Card 4 - Recovery with AI */}
            <Reveal>
              <div className="bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-2xl p-8 hover:border-[rgba(0,212,255,0.3)] hover:shadow-[0_4px_24px_rgba(0,212,255,0.06)] transition-all">
                <h3 className="text-white font-semibold flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.15)] flex items-center justify-center text-xl">💰</span>
                  Recovery with AI
                </h3>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    % abandoned carts recoverable with instant response <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={recoverablePct} 
                    onChange={(e) => setRecoverablePct(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-[#C0C0C8]">
                    % after-hours inquiries AI can resolve <span className="inline-block bg-[rgba(249,115,22,0.15)] text-[#F97316] px-2 py-0.5 rounded text-[0.65rem] font-semibold ml-2 font-mono tracking-[0.5px]">EST</span>
                  </label>
                  <input 
                    type="number" 
                    value={aiResolvePct} 
                    onChange={(e) => setAiResolvePct(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white font-mono focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                  />
                </div>
                <div className="bg-[#1A1A25] rounded-xl p-5 mt-3 border-l-[3px] border-[#10B981]">
                  <div className="text-sm text-[#C0C0C8] mb-1">Monthly recoverable revenue</div>
                  <div className="font-mono text-2xl font-bold text-[#10B981]">{formatPKR(results.recoverableMonthly || 1944000)}</div>
                </div>
                <div className="bg-[#1A1A25] rounded-xl p-5 mt-3 border-l-[3px] border-[#10B981]">
                  <div className="text-sm text-[#C0C0C8] mb-1">Annual recoverable revenue</div>
                  <div className="font-mono text-2xl font-bold text-[#10B981]">{formatPKR(results.recoverableAnnual || 23328000)}</div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Total Box */}
          <Reveal>
            <div className="bg-gradient-to-br from-[#12121A] to-[#1A1A25] border border-[rgba(0,212,255,0.15)] rounded-[20px] p-16 text-center my-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.05),transparent_70%)]" />
              <h2 className="text-3xl font-bold text-white mb-4 relative">Estimated Annual Revenue Leakage</h2>
              <div className="font-mono text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#F97316] to-[#FBBF24] bg-clip-text text-transparent my-4 relative">
                {formatPKR(results.recoverableAnnual || 23328000)}
              </div>
              <p className="text-white relative">
                That's <strong>~${results.usdEquivalent?.toLocaleString('en-US') || '83,700'} USD</strong> every year — from support gaps alone.
              </p>
              <p className="mt-3 text-sm text-[#C0C0C8] opacity-70 relative">
                This does NOT include: brand reputation damage, negative reviews, repeat purchase loss, or peak season overflow.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="ax-section" id="comparison">
        <div className="ax-container">
          <Reveal>
            <div className="font-mono text-xs tracking-[2px] uppercase text-[#00D4FF] mb-4">Side by Side</div>
            <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-4">Current vs. AI-Powered Support</h2>
            <p className="text-[#C0C0C8] text-lg max-w-[600px] mb-16">What changes when AI joins your team?</p>
          </Reveal>
          <Reveal>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-2xl overflow-hidden">
                <thead>
                  <tr>
                    <th className="bg-[#1A1A25] text-white p-5 text-left font-semibold text-sm uppercase tracking-[1px] border-b border-[rgba(0,212,255,0.15)]">Metric</th>
                    <th className="bg-[#1A1A25] text-white p-5 text-left font-semibold text-sm uppercase tracking-[1px] border-b border-[rgba(0,212,255,0.15)]">Current (Human Only)</th>
                    <th className="bg-[#1A1A25] text-white p-5 text-left font-semibold text-sm uppercase tracking-[1px] border-b border-[rgba(0,212,255,0.15)]">With AI Assistant</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Response Time', '4-8 hours (business hours only)', 'Under 2 seconds, 24/7/365', true],
                    ['Support Hours', 'Mon-Fri, 9 AM - 6 PM', '24/7 including holidays & weekends', true],
                    ['Languages', 'English + Urdu (if rep knows)', 'English, Urdu, Roman Urdu auto', true],
                    ['Concurrent Chats', '1-2 per rep', 'Unlimited — every customer at once', true],
                    ['Order Tracking', 'Manual email/call', 'Instant automated status', true],
                    ['Product Help', 'Wait for human', 'Instant recommendations from catalog', true],
                    ['Cart Recovery', 'No follow-up = lost sale', 'Auto follow-up within 30 min', true],
                    ['Monthly Cost', 'PKR 180,000+ (4 reps)', 'PKR 83,500 (AI + 1 supervisor)', true],
                  ].map(([metric, current, ai], i) => (
                    <tr key={i} className="hover:bg-[rgba(0,212,255,0.03)] transition-colors">
                      <td className="p-5 border-b border-[rgba(255,255,255,0.04)]">{metric}</td>
                      <td className="p-5 border-b border-[rgba(255,255,255,0.04)] text-[#EF4444] font-semibold">{current}</td>
                      <td className="p-5 border-b border-[rgba(255,255,255,0.04)] text-[#10B981] font-semibold">{ai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ax-section" id="cta">
        <div className="ax-container">
          <Reveal>
            <div className="bg-gradient-to-br from-[#12121A] to-[rgba(249,115,22,0.08)] border border-[rgba(249,115,22,0.2)] rounded-[20px] p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.1),transparent_60%)]" />
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 relative">See It In Action</h2>
              <p className="text-lg text-[#C0C0C8] mb-8 max-w-[500px] mx-auto relative">
                The chatbot in the bottom-right corner is a live demo. Try asking about products, orders, or policies:
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-8 relative">
                {['"What\'s your latest collection?"', '"Track my order"', '"Do you have this in medium?"', '"What\'s your return policy?"'].map((tag, i) => (
                  <span key={i} className="bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#00D4FF] px-4 py-1.5 rounded-full text-sm font-mono">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-[#C0C0C8] mb-8 relative">
                Then imagine this answering <strong className="text-white">every customer</strong> at <strong className="text-white">2 AM on peak night</strong>.
              </p>
              <div className="flex gap-4 justify-center flex-wrap relative">
                <a href="https://wa.me/923145600009" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-[#F97316] text-white rounded-xl font-semibold hover:bg-[#FBBF24] transition-all">
                  📱 WhatsApp Axovion
                </a>
                <a href="mailto:hammad@axovion.com" className="inline-flex items-center gap-2 px-8 py-4 border border-[rgba(0,212,255,0.4)] text-[#00D4FF] rounded-xl font-semibold hover:bg-[rgba(0,212,255,0.1)] transition-all">
                  📧 Email Us
                </a>
              </div>
              <p className="mt-6 text-sm text-[#C0C0C8] opacity-70 relative">
                15-minute demo. No commitment. See exactly what this looks like for your brand.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Chatbot */}
      <div className={`fixed bottom-6 right-6 w-[380px] max-h-[550px] bg-[#12121A] border border-[rgba(0,212,255,0.15)] rounded-[20px] flex flex-col overflow-hidden z-[1000] transition-all shadow-[0_8px_40px_rgba(0,0,0,0.4)] ${!chatOpen ? 'h-[60px] max-h-[60px]' : ''}`}>
        <div 
          className="bg-gradient-to-br from-[rgba(0,212,255,0.15)] to-[rgba(59,130,246,0.1)] px-5 py-3.5 flex items-center gap-3 cursor-pointer border-b border-[rgba(0,212,255,0.15)]"
          onClick={() => setChatOpen(!chatOpen)}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#3B82F6] flex items-center justify-center text-white font-bold">AI</div>
          <div>
            <h4 className="text-white font-semibold text-sm">Aisha</h4>
            <span className="text-[#10B981] text-xs">● Online</span>
          </div>
          <button className="ml-auto bg-none border-none text-[#C0C0C8] text-xl cursor-pointer">
            {chatOpen ? '−' : '+'}
          </button>
        </div>
        {chatOpen && (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 max-h-[350px]">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`max-w-[82%] p-3 px-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-[#00D4FF] to-[#3B82F6] text-white self-end rounded-br-md' 
                      : 'bg-[#1A1A25] text-[#C0C0C8] self-start rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className="bg-[#1A1A25] self-start rounded-bl-md rounded-2xl p-4 flex gap-1.5">
                  <div className="w-[7px] h-[7px] bg-[#C0C0C8] rounded-full animate-bounce" />
                  <div className="w-[7px] h-[7px] bg-[#C0C0C8] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-[7px] h-[7px] bg-[#C0C0C8] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 px-4 border-t border-[rgba(0,212,255,0.15)] flex gap-2.5">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask Aisha anything..." 
                className="flex-1 px-4 py-2.5 bg-[#1A1A25] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
              />
              <button 
                onClick={sendChatMessage}
                className="bg-[#F97316] text-white border-none px-5 py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-[#FBBF24] transition-all"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Demo;
