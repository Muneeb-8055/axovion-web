import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles, Lock } from 'lucide-react';
import { useCustomerAuth } from '../lib/hooks';

const Audit = () => {
  const navigate = useNavigate();
  const { isAuthed } = useCustomerAuth();

  useEffect(() => {
    // Audit submission is login-gated. Route users to the right place.
    if (isAuthed) {
      navigate('/dashboard/audit', { replace: true });
    }
  }, [isAuthed, navigate]);

  return (
    <>
      <Helmet>
        <title>Free AI Business Audit | Axovion.io</title>
        <meta name="description" content="Free AI Audit — our AI analyzes your business and builds a custom automation report with ROI estimates in minutes." />
      </Helmet>

      <section className="relative ax-section bg-[#0A0A0F] min-h-[80vh] flex items-center" data-testid="audit-gate">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -inset-24 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(0,212,255,0.10),transparent_60%)]" />
        </div>
        <div className="relative ax-container">
          <div className="max-w-2xl">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00D4FF] mb-4">Free AI Audit</div>
            <h1 className="text-white text-[40px] md:text-[64px] leading-[1.05] tracking-[-0.03em] font-extrabold">Your business, audited by AI</h1>
            <p className="mt-5 text-[#C0C0C8]/80 text-lg">
              Create a free account to run your AI audit. Our AI analyzes your workflows and instantly builds a custom automation report with ROI estimates — one free audit per account.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge>3 min to complete</Badge>
              <Badge>Instant AI analysis</Badge>
              <Badge>Custom report</Badge>
              <Badge>No credit card</Badge>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/signup')} className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F97316] text-[#0A0A0F] px-7 py-4 text-base font-bold transition-colors duration-200 hover:bg-[#FBBF24]">
                Create free account <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('/login')} className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#12121A] border border-white/12 text-white px-7 py-4 text-base font-bold transition-colors duration-200 hover:border-[#00D4FF]/35">
                <Lock className="h-4 w-4" /> Sign in
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#12121A] border border-white/10 text-[#C0C0C8]">
    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" /> {children}
  </span>
);

export default Audit;
