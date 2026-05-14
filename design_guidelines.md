{
  "brand": {
    "name": "Axovion.io",
    "attributes": [
      "dark luxury",
      "AI-native",
      "precise",
      "high-trust",
      "performance-first",
      "quietly aggressive (conversion-focused)"
    ],
    "tone": {
      "voice": "confident, concise, outcome-driven",
      "copy_rules": [
        "Prefer verbs + outcomes: 'Automate to Win', 'Cut cycle time', 'Recover margin'.",
        "Avoid hype words ('revolutionary', 'magic').",
        "Use numbers and constraints (weeks, %, $) wherever possible."
      ]
    }
  },

  "design_tokens": {
    "notes": [
      "Dark-only theme. Do NOT implement light mode.",
      "NEVER use transparent backgrounds for surfaces/cards. Use fixed palette colors.",
      "Use CSS variables in index.css to override shadcn defaults."
    ],

    "css_custom_properties": {
      "file": "/app/frontend/src/index.css",
      "implementation": "Replace :root and .dark tokens with Axovion tokens below. Keep Tailwind @layer structure.",
      "tokens": {
        "--ax-bg": "#0A0A0F",
        "--ax-surface": "#12121A",
        "--ax-surface-2": "#161622",
        "--ax-border": "rgba(255,255,255,0.08)",
        "--ax-border-strong": "rgba(255,255,255,0.14)",
        "--ax-text": "#C0C0C8",
        "--ax-heading": "#FFFFFF",
        "--ax-muted": "rgba(192,192,200,0.72)",
        "--ax-muted-2": "rgba(192,192,200,0.56)",
        "--ax-cyan": "#00D4FF",
        "--ax-blue": "#3B82F6",
        "--ax-orange": "#F97316",
        "--ax-amber": "#FBBF24",
        "--ax-success": "#10B981",
        "--ax-error": "#EF4444",

        "--background": "240 33% 5%",
        "--foreground": "240 10% 86%",
        "--card": "240 22% 9%",
        "--card-foreground": "240 10% 86%",
        "--popover": "240 22% 9%",
        "--popover-foreground": "240 10% 86%",
        "--primary": "0 0% 100%",
        "--primary-foreground": "240 33% 5%",
        "--secondary": "240 18% 12%",
        "--secondary-foreground": "240 10% 86%",
        "--muted": "240 18% 12%",
        "--muted-foreground": "240 6% 70%",
        "--accent": "240 18% 12%",
        "--accent-foreground": "0 0% 100%",
        "--destructive": "0 84% 60%",
        "--destructive-foreground": "0 0% 100%",
        "--border": "240 12% 18%",
        "--input": "240 12% 18%",
        "--ring": "195 100% 50%",

        "--radius": "16px",
        "--ax-btn-radius": "12px",
        "--ax-shadow-soft": "0 10px 30px rgba(0,0,0,0.45)",
        "--ax-shadow-glow-cyan": "0 0 0 1px rgba(0,212,255,0.22), 0 0 28px rgba(0,212,255,0.14)",
        "--ax-shadow-glow-orange": "0 0 0 1px rgba(249,115,22,0.22), 0 0 28px rgba(249,115,22,0.14)",
        "--ax-ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "--ax-ease-inout": "cubic-bezier(0.65, 0, 0.35, 1)",
        "--ax-duration-fast": "160ms",
        "--ax-duration": "240ms",
        "--ax-duration-slow": "420ms"
      }
    },

    "tailwind_semantic_classes": {
      "backgrounds": {
        "page": "bg-[#0A0A0F] text-[#C0C0C8]",
        "surface": "bg-[#12121A]",
        "surface2": "bg-[#161622]",
        "hairline_border": "border border-white/10",
        "hairline_border_strong": "border border-white/15"
      },
      "text": {
        "heading": "text-white",
        "body": "text-[#C0C0C8]",
        "muted": "text-[#C0C0C8]/70",
        "muted2": "text-[#C0C0C8]/55",
        "link": "text-[#3B82F6] hover:text-[#00D4FF]"
      },
      "glow": {
        "cyan_ring": "ring-1 ring-[#00D4FF]/25",
        "cyan_shadow": "shadow-[0_0_0_1px_rgba(0,212,255,0.22),0_0_28px_rgba(0,212,255,0.14)]",
        "orange_shadow": "shadow-[0_0_0_1px_rgba(249,115,22,0.22),0_0_28px_rgba(249,115,22,0.14)]"
      }
    }
  },

  "typography": {
    "fonts": {
      "headings": "Inter (700-800)",
      "body": "Inter (400-500)",
      "mono": "JetBrains Mono (400-600)",
      "implementation": {
        "google_fonts": [
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
          "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
        ],
        "tailwind": "Set font-sans to Inter and font-mono to JetBrains Mono in tailwind config if present; otherwise apply via className on root layout."
      }
    },
    "scale": {
      "hero_h1": {
        "desktop": "text-[72px] leading-[0.95] tracking-[-0.04em]",
        "mobile": "text-[40px] leading-[1.05] tracking-[-0.03em]"
      },
      "section_h2": {
        "desktop": "text-[48px] leading-[1.05] tracking-[-0.03em]",
        "mobile": "text-[32px] leading-[1.1] tracking-[-0.02em]"
      },
      "subheading": "text-base md:text-lg",
      "body": "text-sm md:text-base leading-relaxed",
      "small": "text-xs md:text-sm",
      "mono_label": "font-mono text-xs tracking-[0.18em] uppercase"
    },
    "rules": [
      "Headings always pure white (#FFF).",
      "Body text metallic silver (#C0C0C8) with 70% for secondary copy.",
      "Use mono labels for metrics, IDs, statuses, timestamps."
    ]
  },

  "layout": {
    "container": {
      "max_width": "max-w-[1280px]",
      "padding_x": "px-5 sm:px-6 lg:px-8",
      "section_padding": "py-20 md:py-[120px]",
      "section_padding_mobile": "py-20",
      "grid_gap": "gap-4 md:gap-6"
    },
    "page_structure": {
      "public": [
        "Sticky navbar",
        "Hero (aurora + split headline)",
        "Problem/Proof strip",
        "Services bento",
        "How it works (SVG flow)",
        "Testimonials + trust",
        "Final CTA",
        "Footer"
      ],
      "admin": [
        "Left rail sidebar",
        "Top bar with search + quick actions",
        "Content area with dense widgets",
        "Tables/kanban/charts"
      ]
    },
    "responsive_rules": [
      "Mobile-first: single column; bento collapses to stacked cards.",
      "Navbar links collapse into Sheet (shadcn) with large tap targets.",
      "Admin sidebar becomes Drawer on <lg."
    ]
  },

  "components": {
    "component_path": {
      "shadcn_primary": "/app/frontend/src/components/ui/",
      "use": [
        "button.jsx",
        "card.jsx",
        "sheet.jsx",
        "navigation-menu.jsx",
        "tabs.jsx",
        "table.jsx",
        "badge.jsx",
        "dialog.jsx",
        "drawer.jsx",
        "form.jsx",
        "input.jsx",
        "textarea.jsx",
        "select.jsx",
        "calendar.jsx",
        "skeleton.jsx",
        "scroll-area.jsx",
        "tooltip.jsx",
        "sonner.jsx"
      ]
    },

    "navbar": {
      "pattern": "Sticky, glassy (but NOT transparent surfaces). Use surface color with subtle border + glow on scroll.",
      "tailwind": {
        "wrapper": "sticky top-0 z-50 bg-[#0A0A0F] border-b border-white/10",
        "inner": "mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-8 h-16 flex items-center justify-between",
        "logo": "flex items-center gap-3",
        "links": "hidden lg:flex items-center gap-7 text-sm text-[#C0C0C8]/80",
        "cta": "hidden lg:flex items-center gap-3",
        "mobile_menu_button": "lg:hidden"
      },
      "mobile_nav": {
        "component": "Sheet",
        "sheet_content": "bg-[#12121A] border-l border-white/10",
        "link_style": "py-3 text-base text-white",
        "tap_targets": "min-h-[44px]"
      },
      "logo_usage": {
        "url": "https://customer-assets.emergentagent.com/job_137b2a28-eae0-47d2-9d98-373dabc9cc03/artifacts/hbqa2d49_logo.jpg",
        "sizes": "h-8 w-auto (navbar), h-10 (footer)"
      },
      "data_testids": {
        "navbar": "site-navbar",
        "mobile_menu_open": "mobile-nav-open-button",
        "primary_cta": "navbar-primary-cta-button"
      }
    },

    "buttons": {
      "radius": "rounded-[12px]",
      "variants": {
        "primary": {
          "use": "Primary actions (Book, Start Audit, Download PDF)",
          "classes": "rounded-[12px] bg-[#F97316] text-[#0A0A0F] hover:bg-[#FBBF24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 focus-visible:ring-offset-0",
          "motion": "hover: translateY(-1px) + glow; active: scale(0.98)",
          "data_testid_example": "data-testid=\"primary-action-button\""
        },
        "secondary": {
          "use": "Secondary CTA (View Services, See Results)",
          "classes": "rounded-[12px] bg-[#12121A] text-white border border-white/12 hover:border-[#00D4FF]/35 hover:shadow-[0_0_0_1px_rgba(0,212,255,0.22),0_0_28px_rgba(0,212,255,0.14)]",
          "motion": "hover: translateY(-1px)",
          "data_testid_example": "data-testid=\"secondary-action-button\""
        },
        "ghost": {
          "use": "Tertiary actions",
          "classes": "rounded-[12px] bg-transparent text-[#C0C0C8] hover:bg-[#161622] hover:text-white",
          "data_testid_example": "data-testid=\"tertiary-action-button\""
        }
      },
      "micro_interactions": {
        "no_transition_all": true,
        "recommended": "transition-colors duration-200 ease-out + transition-shadow duration-300",
        "snippet": "transition-colors duration-200 ease-out transition-shadow duration-300"
      }
    },

    "cards": {
      "base": "rounded-[16px] bg-[#12121A] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
      "hover": "hover:border-[#00D4FF]/30 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(0,212,255,0.22),0_0_28px_rgba(0,212,255,0.14)]",
      "motion": "transition-[color,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    },

    "badges_status": {
      "lead_scoring": {
        "hot": "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25",
        "warm": "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/25",
        "cold": "bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/25"
      },
      "audit_status": {
        "new": "bg-white/8 text-white border border-white/12",
        "in_review": "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20",
        "sent": "bg-[#10B981]/12 text-[#10B981] border border-[#10B981]/22"
      }
    }
  },

  "page_blueprints": {
    "home": {
      "hero": {
        "goal": "Immediate premium feel + clear dual CTA.",
        "layout": "Left-aligned copy, right-side 'signal' panel (mini dashboard preview) on desktop; stacked on mobile.",
        "tailwind": {
          "section": "relative overflow-hidden bg-[#0A0A0F]",
          "inner": "mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-20 md:pb-[120px]",
          "grid": "grid grid-cols-1 lg:grid-cols-12 gap-10 items-start",
          "copy_col": "lg:col-span-7",
          "panel_col": "lg:col-span-5"
        },
        "headline": {
          "split_text": true,
          "copy_example": "Automate revenue ops.\nShip AI workflows in weeks.",
          "classes": "font-sans font-extrabold text-white text-[40px] md:text-[72px] leading-[1.05] md:leading-[0.95] tracking-[-0.03em] md:tracking-[-0.04em]",
          "data_testid": "hero-headline"
        },
        "subcopy": {
          "classes": "mt-5 max-w-[52ch] text-[#C0C0C8]/75 text-base md:text-lg",
          "data_testid": "hero-subcopy"
        },
        "cta_row": {
          "classes": "mt-8 flex flex-col sm:flex-row gap-3",
          "primary": "Book a Strategy Call",
          "secondary": "Run the AI Audit",
          "data_testids": {
            "primary": "hero-primary-cta-button",
            "secondary": "hero-secondary-cta-button"
          }
        },
        "right_panel": {
          "concept": "A compact 'Audit Snapshot' card with 3 metrics + mini sparkline + lead score chip.",
          "classes": "rounded-[16px] bg-[#12121A] border border-white/10 p-5 md:p-6",
          "elements": [
            "Top row: 'Audit Snapshot' + status badge",
            "3 metric tiles (Cycle time, Cost leakage, Automation score)",
            "Mini chart placeholder (Recharts later)",
            "Lead score pill (Hot/Warm/Cold)"
          ],
          "data_testid": "hero-signal-panel"
        }
      },

      "services_bento": {
        "exact_layout": {
          "desktop_grid": "grid-cols-12 auto-rows-[96px] gap-6",
          "mobile": "grid-cols-1 auto-rows-auto gap-4",
          "cards": [
            {
              "id": "bento-1",
              "title": "AI Revenue Ops",
              "span": "col-span-12 md:col-span-7 row-span-3",
              "size": "2x2+ (hero card)",
              "content": "Short bullets + KPI chips"
            },
            {
              "id": "bento-2",
              "title": "Support Automation",
              "span": "col-span-12 md:col-span-5 row-span-2",
              "size": "medium",
              "content": "FAQ deflection + chatbot"
            },
            {
              "id": "bento-3",
              "title": "Lead Scoring",
              "span": "col-span-12 md:col-span-5 row-span-1",
              "size": "small",
              "content": "Hot/Warm/Cold + rules"
            },
            {
              "id": "bento-4",
              "title": "Workflow Orchestration",
              "span": "col-span-12 md:col-span-4 row-span-2",
              "size": "medium",
              "content": "Agents + tools"
            },
            {
              "id": "bento-5",
              "title": "AI Audit",
              "span": "col-span-12 md:col-span-4 row-span-2",
              "size": "medium",
              "content": "13-field intake"
            },
            {
              "id": "bento-6",
              "title": "Analytics",
              "span": "col-span-12 md:col-span-4 row-span-2",
              "size": "medium",
              "content": "Funnel + sources"
            }
          ],
          "implementation_note": "Use CSS grid with auto-rows to create consistent bento rhythm. Each row is 96px; row-span controls height. On mobile, stack cards with consistent padding."
        },
        "hover_effects": {
          "requirements": [
            "Cyan glow border",
            "4px lift",
            "Gradient rotation (subtle)",
            "300ms"
          ],
          "tailwind": {
            "card": "group relative overflow-hidden rounded-[16px] bg-[#12121A] border border-white/10 p-6 transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#00D4FF]/35 hover:shadow-[0_0_0_1px_rgba(0,212,255,0.22),0_0_28px_rgba(0,212,255,0.14)]",
            "gradient_overlay": "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(600px_circle_at_var(--mx,50%)_var(--my,50%),rgba(0,212,255,0.12),transparent_55%)]"
          },
          "js_mouse_tracking": "On mousemove set CSS vars --mx/--my on the card for radial highlight. Respect prefers-reduced-motion by disabling tracking."
        },
        "data_testids": {
          "section": "services-bento-section",
          "card_prefix": "services-bento-card"
        }
      },

      "how_it_works_svg_flow": {
        "concept": "3-step flow diagram with scroll-draw line animation (SVG path stroke-dashoffset).",
        "steps": [
          "Audit",
          "Build",
          "Operate"
        ],
        "visual": {
          "style": "Thin cyan line + subtle blue nodes; labels in white; supporting copy in silver.",
          "tailwind_wrapper": "rounded-[16px] bg-[#12121A] border border-white/10 p-6 md:p-10"
        },
        "animation": {
          "approach": "GSAP ScrollTrigger animating strokeDashoffset from full length to 0.",
          "timing": "scrub: 0.6, start: 'top 75%', end: 'bottom 35%'",
          "reduced_motion": "If prefers-reduced-motion, render line fully drawn."
        },
        "data_testid": "how-it-works-flow"
      },

      "testimonials": {
        "layout": "3 cards desktop, carousel mobile (shadcn carousel).",
        "card": "Use Card + Avatar + quote icon (lucide).",
        "data_testid": "testimonials-section"
      },

      "final_cta": {
        "glow_pulse": "CTA button has subtle orange glow pulse (keyframes) but only on hover/focus to avoid constant motion.",
        "data_testid": "final-cta-section"
      }
    },

    "audit": {
      "form": {
        "component": "shadcn Form + Input + Textarea + Select",
        "layout": "Two-column on lg, single column on mobile. Sticky right summary panel on desktop.",
        "fields": [
          "Company name",
          "Website",
          "Industry",
          "Monthly revenue range",
          "Team size",
          "Primary tools (CRM, helpdesk, etc)",
          "Biggest bottleneck",
          "Top 3 repetitive tasks",
          "Lead volume",
          "Support volume",
          "Sales cycle length",
          "Current automation level",
          "Budget range",
          "Timeline",
          "Contact email"
        ],
        "focus_state": "focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60",
        "data_testid_prefix": "audit-form"
      },
      "loading_states": {
        "rule": "Use Skeleton for report generation; avoid spinners for >800ms operations.",
        "skeleton": "Use shadcn skeleton blocks matching final layout (report header, KPI cards, chart areas).",
        "data_testid": "audit-loading-state"
      }
    },

    "audit_report": {
      "visual_hierarchy": {
        "top": "Report header with company + lead score + primary actions (Download PDF, Book Call).",
        "middle": "ROI calculator (interactive) + recommended agents/workflows.",
        "bottom": "Timeline + implementation plan + risks + next steps."
      },
      "roi_calculator": {
        "pattern": "Left inputs, right outputs. Outputs update live with subtle count-up animation.",
        "components": [
          "Tabs (Assumptions / Savings / Revenue lift)",
          "Slider for volumes",
          "Input for hourly cost",
          "Progress for confidence"
        ],
        "data_testid": "roi-calculator"
      },
      "download_pdf": {
        "button": "Primary button",
        "data_testid": "audit-report-download-pdf-button"
      }
    },

    "results": {
      "count_up": {
        "use": "Case study metrics banner + per-case cards.",
        "timing": "900ms duration, easeOutExpo",
        "reduced_motion": "Render final numbers immediately.",
        "data_testid": "results-metrics"
      }
    },

    "blog": {
      "layout": "Left category filter (collapsible on mobile) + grid of article cards.",
      "newsletter": "Card with email input + CTA.",
      "data_testid": "blog-page"
    },

    "team": {
      "founder_card": {
        "layout": "Large portrait left, bio right; stacked on mobile.",
        "image_style": "Rounded 16px, subtle cyan rim light via box-shadow.",
        "data_testid": "founder-card"
      }
    },

    "contact": {
      "calendly": {
        "rule": "Use placeholder embed container with fixed height and surface styling until integration.",
        "container": "rounded-[16px] bg-[#12121A] border border-white/10 p-4 md:p-6 min-h-[640px]",
        "data_testid": "calendly-placeholder"
      }
    }
  },

  "admin_design_language": {
    "principles": [
      "Same palette, more density.",
      "Use mono labels for IDs and timestamps.",
      "Tables first: fast scanning, strong row hover.",
      "Avoid heavy glows in admin; reserve glow for focus/selection states."
    ],
    "shell": {
      "sidebar": {
        "desktop": "w-64 bg-[#12121A] border-r border-white/10",
        "nav_item": "flex items-center gap-3 px-3 py-2 rounded-[12px] text-sm text-[#C0C0C8]/80 hover:bg-[#161622] hover:text-white",
        "active": "bg-[#161622] text-white ring-1 ring-[#00D4FF]/20",
        "data_testid": "admin-sidebar"
      },
      "topbar": {
        "classes": "h-14 bg-[#0A0A0F] border-b border-white/10 flex items-center justify-between px-4",
        "search": "Input with left icon; focus ring cyan",
        "data_testid": "admin-topbar"
      }
    },
    "tables": {
      "component": "shadcn Table",
      "row_hover": "hover:bg-white/3",
      "row_selected": "bg-[#00D4FF]/8",
      "filters": "Use Select + Input + Badge chips",
      "data_testid": "admin-table"
    },
    "kanban": {
      "columns": ["todo", "in-progress", "review", "done"],
      "card": "rounded-[16px] bg-[#12121A] border border-white/10 p-4 hover:border-white/15",
      "drag": "If implementing drag/drop, use @dnd-kit/core; add subtle scale on drag.",
      "data_testid": "admin-kanban"
    },
    "charts": {
      "library": "Recharts",
      "style": {
        "grid": "stroke: rgba(255,255,255,0.08)",
        "axis": "tick fill: rgba(192,192,200,0.7)",
        "line": "stroke: #00D4FF",
        "area_fill": "rgba(0,212,255,0.12)",
        "tooltip": "bg-[#12121A] border border-white/10"
      },
      "data_testid": "admin-analytics-charts"
    }
  },

  "animations": {
    "libraries": {
      "recommended": [
        "GSAP + ScrollTrigger (hero aurora, scroll reveals, SVG draw)",
        "Framer Motion (component-level hover/entrance, chatbot open/close)"
      ],
      "install": {
        "gsap": "npm i gsap",
        "framer_motion": "npm i framer-motion",
        "recharts": "npm i recharts",
        "countup": "npm i react-countup"
      }
    },
    "global_rules": [
      "All animations must respect prefers-reduced-motion.",
      "Avoid initial load flicker: set initial styles in CSS, then animate to final.",
      "Use transform + opacity for performance; avoid animating box-shadow continuously."
    ],
    "aurora_hero": {
      "premium_approach": {
        "recommendation": "Use 2-3 large blurred radial gradients as pseudo-elements, animated via background-position or transform translate/rotate at very low frequency. Keep it subtle; beams should feel like light leakage, not neon wallpaper.",
        "performance": [
          "Use will-change: transform on aurora layers.",
          "Prefer transform animations over filter animations.",
          "Cap blur radius; avoid huge box-shadows.",
          "Disable on reduced motion."
        ]
      },
      "tailwind_structure": {
        "wrapper": "relative overflow-hidden",
        "layer1": "absolute -inset-24 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,212,255,0.18),transparent_55%)]",
        "layer2": "absolute -inset-24 bg-[radial-gradient(800px_circle_at_80%_30%,rgba(59,130,246,0.14),transparent_55%)]",
        "layer3": "absolute -inset-24 bg-[radial-gradient(700px_circle_at_50%_80%,rgba(0,212,255,0.10),transparent_60%)]"
      },
      "fallback_image": {
        "use": "Only if needed for low-end devices; keep opacity low.",
        "url": "https://images.unsplash.com/photo-1563518839049-f44a5e423f12?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      }
    },
    "split_text": {
      "recommendation": "Avoid GSAP SplitText plugin (paid). Implement custom split by wrapping words/spans in JS and animating with GSAP stagger.",
      "timing": {
        "stagger": "0.035",
        "duration": "0.9",
        "ease": "power4.out"
      },
      "initial_state": "opacity:0; y:18px; filter: blur(6px) (optional, but keep subtle)",
      "data_testid": "splittext-hero"
    },
    "scroll_reveals": {
      "pattern": "Fade + slide up 16px with stagger for lists.",
      "timing": {
        "duration": "0.7",
        "ease": "power3.out",
        "stagger": "0.08"
      },
      "trigger": "start: 'top 80%'"
    },
    "cta_glow_pulse": {
      "rule": "Pulse only on hover/focus-visible to avoid constant motion.",
      "css_keyframes": "@keyframes axGlowPulse { 0%,100%{ box-shadow: 0 0 0 1px rgba(249,115,22,0.18), 0 0 18px rgba(249,115,22,0.10);} 50%{ box-shadow: 0 0 0 1px rgba(249,115,22,0.28), 0 0 26px rgba(249,115,22,0.16);} }"
    }
  },

  "chatbot_widget": {
    "position": "bottom-right fixed; hidden on /admin routes.",
    "closed_state": {
      "button": "Circular/squircle button with orange fill + subtle cyan rim.",
      "classes": "fixed bottom-5 right-5 h-12 w-12 rounded-[14px] bg-[#F97316] text-[#0A0A0F] shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:bg-[#FBBF24]",
      "data_testid": "chatbot-open-button"
    },
    "open_state": {
      "panel": "w-[360px] max-w-[calc(100vw-24px)] h-[520px] rounded-[16px] bg-[#12121A] border border-white/10",
      "header": "flex items-center justify-between px-4 py-3 border-b border-white/10",
      "messages": "ScrollArea",
      "composer": "Input + send button",
      "faq_chips": "Badge chips row (scrollable)"
    },
    "message_bubbles": {
      "user": "bg-[#161622] text-white border border-white/10",
      "assistant": "bg-[#0A0A0F] text-[#C0C0C8] border border-white/10",
      "meta": "timestamps in mono"
    },
    "motion": {
      "open_close": "Framer Motion scale(0.98->1) + opacity 0->1, 220ms easeOut",
      "reduced_motion": "No scale; opacity only"
    }
  },

  "images": {
    "image_urls": {
      "hero_background_fallback": [
        {
          "url": "https://images.unsplash.com/photo-1701633903451-3da2d0f39a85?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
          "description": "Abstract cyan beam texture; use at 10–18% opacity behind aurora layers.",
          "category": "hero"
        },
        {
          "url": "https://images.unsplash.com/photo-1563518839049-f44a5e423f12?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
          "description": "Soft cyan gradient lines; good for low-end fallback.",
          "category": "hero"
        }
      ],
      "noise_texture": [
        {
          "url": "https://images.unsplash.com/photo-1602475063211-3d98d60e3b1f?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
          "description": "Dark textile grain; overlay at 6–10% opacity across sections for premium tactility.",
          "category": "global"
        }
      ],
      "founder_placeholder": [
        {
          "url": "https://images.unsplash.com/photo-1710527304331-4186db4ee708?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
          "description": "Studio portrait on dark background; use as founder placeholder until real photo.",
          "category": "team"
        }
      ]
    }
  },

  "accessibility": {
    "requirements": [
      "Keyboard navigation for navbar, dialogs, sheets, chatbot.",
      "Visible focus ring: cyan ring-2 with adequate contrast.",
      "ARIA labels for icon-only buttons.",
      "Respect prefers-reduced-motion for all animations.",
      "Tap targets >= 44px on mobile."
    ],
    "focus_styles": {
      "tailwind": "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 focus-visible:ring-offset-0"
    }
  },

  "testing": {
    "data_testid_rules": [
      "All buttons, links, inputs, selects, tabs, table rows, status badges, and key metrics must include data-testid.",
      "Use kebab-case describing role, not appearance.",
      "Examples: 'audit-form-submit-button', 'admin-audits-filter-status-select', 'results-metric-total-saved'."
    ]
  },

  "instructions_to_main_agent": [
    "Update /app/frontend/src/index.css tokens to Axovion palette (dark-only). Remove default light tokens usage.",
    "Remove any centered layout defaults from App.css; do not use .App { text-align:center }.",
    "Implement hero aurora with 2-3 radial layers + optional low-opacity fallback image; keep gradient area under 20% viewport (hero only).",
    "Implement SplitText without paid plugins: wrap words/spans and GSAP stagger reveal.",
    "Build Services Bento using the exact 12-col grid + auto-rows[96px] + row/col spans specified.",
    "Use shadcn components from /src/components/ui (no raw HTML dropdowns/calendars/toasts).",
    "Use Sonner for toasts.",
    "Admin: keep glow minimal; use cyan ring for selection/focus only.",
    "Ensure all interactive elements include data-testid attributes.",
    "Respect prefers-reduced-motion across GSAP/Framer Motion; provide non-animated fallbacks.",
    "Avoid flicker: set initial CSS states and animate after mount; avoid layout shifts by reserving space for animated elements."
  ],

  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
