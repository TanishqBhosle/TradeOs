import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Stat, Pill } from "@/components/app/Primitives";
import {
  BookOpen, Play, Award, CheckCircle2, Lock, Sparkles, HelpCircle,
  TrendingUp, ArrowRight, Brain, FileText, ChevronRight, MessageSquare,
  X, RefreshCw, Trophy, AlertTriangle, PlayCircle, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAcademyProgress, updateAcademyProgress } from "@/functions/academy.functions";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/academy")({
  component: Academy,
});

// Detailed structure of our 12 levels
interface Lesson {
  id: string;
  name: string;
  category: string;
  content: string;
  stockExample?: string;
  flashcards: { front: string; back: string }[];
  quiz: {
    q: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
}

interface Module {
  id: string;
  name: string;
  lessons: Lesson[];
}

interface Level {
  id: number;
  name: string;
  goal: string;
  certName: string;
  modules: Module[];
}

const levelsData: Level[] = [
  {
    id: 0,
    name: "Financial Literacy",
    goal: "Understand the core concepts of money, inflation, and wealth before placing your first trade.",
    certName: "Financial Literacy Foundation",
    modules: [
      {
        id: "m0.1",
        name: "Module 0.1 — Personal Finance Basics",
        lessons: [
          {
            id: "l0.1.1",
            name: "What is Money?",
            category: "Finance Basics",
            content: "Money is a medium of exchange, a unit of account, and a store of value. It solved the barter system's 'double coincidence of wants' problem. Today, money is fiat—backed by government trust rather than physical gold. Understanding currency purchasing power is the absolute cornerstone of all investment strategies.",
            stockExample: "Indian Rupee (INR) purchasing power has declined historically due to money supply changes, driving the need for inflation-beating equity assets.",
            flashcards: [
              { front: "Barter System Problem", back: "Barter requires a double coincidence of wants; money eliminates this by serving as a common medium of exchange." },
              { front: "Fiat Money", back: "Currency backed by government decree and trust rather than physical gold or silver." }
            ],
            quiz: [
              {
                q: "What is the primary function of money that solves the barter system's main limitation?",
                options: ["Medium of Exchange", "A high yield interest compounder", "Backing by physical gold", "A system of digital checks"],
                answer: 0,
                explanation: "Serving as a Medium of Exchange allows goods and services to be traded smoothly without requiring both parties to want each other's specific items."
              },
              {
                q: "What does 'Fiat Money' refer to?",
                options: ["Money made of copper coins", "Currency backed solely by government decree and public trust", "Currency tied to the price of Italian sport cars", "Money backed by physical reserves in bank vaults"],
                answer: 1,
                explanation: "Fiat money has no intrinsic value and is backed by the stability and trust of the issuing government."
              }
            ]
          },
          {
            id: "l0.1.2",
            name: "Income vs Expenses",
            category: "Finance Basics",
            content: "Wealth is not determined by how much you earn, but by how much you keep. Income can be active (labor-based) or passive (asset-based). Expenses fall into two categories: Needs (essential costs like housing) and Wants (non-essential lifestyle inflation). To invest, you must generate a surplus by keeping expenses below income.",
            stockExample: "Just like companies need free cash flow (Surplus) to expand, individuals need a cash surplus to acquire capital-appreciating shares.",
            flashcards: [
              { front: "Active Income", back: "Money earned from direct active labor, like salary." },
              { front: "Passive Income", back: "Money generated continuously by owned assets without active daily labor." }
            ],
            quiz: [
              {
                q: "Which metric is most critical for both individuals and companies before committing to investments?",
                options: ["Total Gross Revenue", "Free cash surplus (Income minus Expenses)", "Total credit limit", "Gross salary grade"],
                answer: 1,
                explanation: "Cash surplus represents the actual investable capital. Having high income is useless if expenses consume it completely."
              }
            ]
          },
          {
            id: "l0.1.3",
            name: "Saving vs Investing",
            category: "Finance Basics",
            content: "Saving is setting money aside in liquid, low-risk accounts for short-term safety. Investing is committing capital to productive assets (like stocks, real estate, or mutual funds) with the expectation of generating higher compounding returns over the long term, accepting relative volatility.",
            stockExample: "Leaving ₹10,000 in a savings account pays ~3% interest. Investing ₹10,000 in an index fund tracking top Indian corporate equities historically targets 12-14% CAGR over long horizons.",
            flashcards: [
              { front: "Saving", back: "Capital preservation in safe, highly liquid accounts for short-term usage." },
              { front: "Investing", back: "Capital allocation to productive assets to generate compounding wealth over long horizons." }
            ],
            quiz: [
              {
                q: "What is the primary trade-off when moving capital from savings to investments?",
                options: ["Accepting short-term volatility in exchange for higher long-term compounding growth", "Guaranteed higher interest payouts in 30 days", "Complete loss of demat access", "Higher capital taxation credits"],
                answer: 0,
                explanation: "Investing involves volatility and risk, but offers the compounding potential to expand purchasing power against inflation over time."
              }
            ]
          }
        ]
      },
      {
        id: "m0.2",
        name: "Module 0.2 — Wealth Creation",
        lessons: [
          {
            id: "l0.2.1",
            name: "Compounding",
            category: "Wealth Creation",
            content: "Compounding is the process where asset earnings are reinvested to generate their own earnings. Albert Einstein famously called compounding the 'Eighth Wonder of the World.' The formula relies heavily on time (n) and the rate of return (r). Small, consistent allocations compounded over decades create substantial wealth cascades.",
            stockExample: "A monthly investment of ₹10,000 at a conservative 12% CAGR over 30 years grows to a massive ₹3.5 Crore, where 90% of the final wealth is generated solely by compounded interests!",
            flashcards: [
              { front: "Compounding Interest", back: "Earning interest on principal + accumulated interest. Capital snowball effect." },
              { front: "Eighth Wonder", back: "Einstein's reference to the powerful mathematics of compounding return timelines." }
            ],
            quiz: [
              {
                q: "Which variable has the absolute largest impact on the final outcome of a compounding portfolio?",
                options: ["The specific stock brokerage firm used", "Time (duration of compounding)", "Getting high intraday leverage lines", "The month of the year the account is opened"],
                answer: 1,
                explanation: "Time is exponential in the compounding formula (P*(1+r)^n). Extending the timeline by a few years can double or triple the final wealth size."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 1,
    name: "Stock Market Foundations",
    goal: "Learn how public stock markets operate, the roles of stock exchanges, and demystify standard order placements.",
    certName: "Stock Market Foundations Certification",
    modules: [
      {
        id: "m1.1",
        name: "Module 1.1 — Stock Market Basics",
        lessons: [
          {
            id: "l1.1.1",
            name: "What is a Stock?",
            category: "Market Basics",
            content: "A stock (or share) represents fractional ownership in a corporation. When you buy a share of a company, you own a tiny piece of its physical assets, trademarks, and future earnings. Companies issue stocks to raise equity capital from investors to build factories, hire workers, and expand their operations.",
            stockExample: "If HDFC Bank has 1,000 shares outstanding and you purchase 10 shares, you own exactly 1% of the bank's equity, net assets, and dividend payouts.",
            flashcards: [
              { front: "Stock/Share", back: "Fractional unit of equity ownership in a listed corporation." },
              { front: "Equity Capital", back: "Non-debt funding raised by businesses in exchange for giving up equity ownership." }
            ],
            quiz: [
              {
                q: "What does buying a stock represent?",
                options: ["A loan you give to the company that they must pay back with interest", "Fractional ownership in the corporation's assets and earnings", "An insurance policy on the company's retail products", "Guaranteed voting rights for retail day trading"],
                answer: 1,
                explanation: "Stocks represent actual equity ownership. You share in the company's upside and downside without debt guarantees."
              }
            ]
          },
          {
            id: "l1.1.2",
            name: "Why Companies List?",
            category: "Market Basics",
            content: "Companies list on stock exchanges through an Initial Public Offering (IPO) for three primary reasons: 1. To raise large-scale growth capital without debt interest payments. 2. To provide liquidity for early founders and venture capital backers. 3. To build brand prestige and use listed stock to acquire other businesses.",
            stockExample: "Tata Motors listed on exchanges to secure the capital resources necessary to scale passenger vehicle manufacturing globally.",
            flashcards: [
              { front: "IPO", back: "Initial Public Offering. The transition of a private company to a publicly traded corporation on exchanges." },
              { front: "Liquidity", back: "The ease of converting physical assets or equity into immediate cash without price penalties." }
            ],
            quiz: [
              {
                q: "What is the primary benefit of raising growth capital through an IPO rather than a bank loan?",
                options: ["Equities do not carry fixed interest payment obligations, freeing up cash flow for growth", "Equities guarantee SEBI tax shelters", "IPO capital requires zero financial reporting", "The company gets to set fixed share prices forever"],
                answer: 0,
                explanation: "Unlike debt which requires fixed interest payments regardless of business performance, equity capital shares the risk with investors without fixed interest burdens."
              }
            ]
          }
        ]
      },
      {
        id: "m1.2",
        name: "Module 1.2 — Order Types & Execution",
        lessons: [
          {
            id: "l1.2.1",
            name: "Market vs Limit Orders",
            category: "Trading Setup",
            content: "A Market Order instructs your broker to execute the trade immediately at the best available current price. It guarantees execution speed but NOT price precision. A Limit Order instructs the broker to buy or sell *only* at a specific price or better. It guarantees price control but does NOT guarantee immediate execution if the market never reaches your price.",
            stockExample: "If Reliance is trading at ₹2,500, a Market Order executes instantly at market price. A Limit Buy Order set at ₹2,480 will only trigger if sellers push the price down to exactly ₹2,480.",
            flashcards: [
              { front: "Market Order", back: "Order executed instantly at the prevailing market price. Guarantees speed." },
              { front: "Limit Order", back: "Order executed only at a specified price or better. Guarantees price precision." }
            ],
            quiz: [
              {
                q: "If you want to buy HDFC Bank stock but want to ensure you do not pay more than ₹1,650 per share, which order type should you use?",
                options: ["Market Order", "Limit Order at ₹1,650", "GTT Order at market price", "Stop Loss Market Order"],
                answer: 1,
                explanation: "A Limit Order guarantees you pay your specified price (₹1,650) or less, protecting you from sudden market spikes."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Beginner Investor",
    goal: "Understand live stock price matrices, Large vs Small Cap properties, and sector cycles.",
    certName: "Beginner Investor Track Certificate",
    modules: [
      {
        id: "m2.1",
        name: "Module 2.1 — Market Capitalization",
        lessons: [
          {
            id: "l2.1.1",
            name: "Large, Mid & Small Cap Properties",
            category: "Equity Structure",
            content: "Market Cap divides companies into safety and volatility profiles: Large Caps (> ₹20,000 Cr) are stable market leaders with solid balance sheets (low risk, moderate growth). Mid Caps (₹5,000 - ₹20,000 Cr) represent expanding enterprises with high growth potentials but elevated swings. Small/Micro Caps (< ₹5,000 Cr) are highly speculative, carrying extreme growth opportunities alongside severe bankruptcy and liquidity risks.",
            stockExample: "Reliance Industries (Large Cap) represents low-volatility safety; whereas a tiny renewable energy micro-cap represents volatile high-risk/high-reward swing assets.",
            flashcards: [
              { front: "Large Cap", back: "Well-established industry leaders, market cap over ₹20,000 Cr." },
              { front: "Small Cap", back: " Speculative, fast-growing companies with market caps under ₹5,000 Cr." }
            ],
            quiz: [
              {
                q: "Which asset category would be most suitable for a highly conservative investor seeking capital preservation?",
                options: ["Micro Cap technology startups", "Large Cap blue-chip conglomerates", "Small Cap biotech laboratories", "High leverage options contracts"],
                answer: 1,
                explanation: "Large Caps are market leaders with substantial reserves, making them highly resilient during market sell-offs compared to volatile small caps."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Fundamental Analysis",
    goal: "Learn how to read corporate financial statements, examine profitability metrics, and evaluate valuation ratios.",
    certName: "Certified Fundamental Research Analyst",
    modules: [
      {
        id: "m3.1",
        name: "Module 3.1 — Statement Mastery",
        lessons: [
          {
            id: "l3.1.1",
            name: "Balance Sheet Breakdown",
            category: "Financials",
            content: "The Balance Sheet is a financial snapshot of a company at a specific moment in time. It follows the accounting equation: Assets = Liabilities + Shareholders' Equity. Assets are what the company owns (cash, inventory, property). Liabilities are what it owes (debts, payables). Equity represents the true net value belonging to the shareholders.",
            stockExample: "Reliance Industries has extensive tangible assets (refineries, telecom towers) balanced by long-term debt liabilities and massive accumulated shareholder reserves.",
            flashcards: [
              { front: "Accounting Equation", back: "Assets = Liabilities + Shareholder Equity. Both sides must always balance." },
              { front: "Assets", back: "Resources owned by the company that hold economic value." }
            ],
            quiz: [
              {
                q: "If a company has ₹10,000 Cr in total assets and ₹4,000 Cr in total debt/liabilities, what is its net Shareholder Equity?",
                options: ["₹14,000 Cr", "₹6,000 Cr", "₹4,000 Cr", "₹10,000 Cr"],
                answer: 1,
                explanation: "Assets (10,000) minus Liabilities (4,000) equals Equity (6,000)."
              }
            ]
          }
        ]
      }
    ]
  }
];

// Complete 12 Level titles list for roadmap navigation
const allLevelsList = [
  "Level 0 → Financial Literacy",
  "Level 1 → Stock Market Foundations",
  "Level 2 → Beginner Investor",
  "Level 3 → Fundamental Analysis",
  "Level 4 → Technical Analysis Foundations",
  "Level 5 → Intermediate Trading",
  "Level 6 → Risk Management & Psychology",
  "Level 7 → Advanced Investing",
  "Level 8 → Advanced Trading",
  "Level 9 → Derivatives & Options",
  "Level 10 → Portfolio Management",
  "Level 11 → Quantitative Analysis",
  "Level 12 → Professional Trader Track"
];

function Academy() {
  const queryClient = useQueryClient();

  // Navigation states
  const [activeLevelId, setActiveLevelId] = useState<number>(0);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Lesson view tabs states
  const [lessonTab, setLessonTab] = useState<"content" | "flashcards" | "quiz" | "mentor">("content");
  
  // Interactive Quiz state
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);

  // Interactive Explainer modes
  const [explainerMode, setExplainerMode] = useState<"standard" | "eli15" | "simplify">("standard");

  // Local active flashcard index
  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);

  // Developer mode: Unlock all levels bypass
  const [unlockAllBypass, setUnlockAllBypass] = useState<boolean>(false);

  // AI Mentor Chat states
  const [mentorInput, setMentorInput] = useState<string>("");
  const [mentorChatHistory, setMentorChatHistory] = useState<{ sender: "user" | "mentor"; text: string }[]>([
    { sender: "mentor", text: "Welcome to your active TradeOS neural session. I'm your AI Quant Mentor. Ask me any question about this lesson's metrics or real-world trading logic!" }
  ]);
  const [isTypingMentor, setIsTypingMentor] = useState<boolean>(false);

  // Load progress from database
  const { data: progressData } = useQuery({
    queryKey: ["academy-progress"],
    queryFn: () => getAcademyProgress(),
  });

  const progressRecords = progressData?.data ?? [];
  
  // Custom progress maps
  const completedLessons = new Set<string>();
  progressRecords.forEach((rec) => {
    if (rec.progress >= 100) {
      completedLessons.add(rec.moduleId);
    }
  });

  const updateMut = useMutation({
    mutationFn: (data: { moduleId: string; moduleTitle?: string; progress: number }) =>
      updateAcademyProgress({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-progress"] });
    },
  });

  const markLessonComplete = (lessonId: string, lessonName: string) => {
    updateMut.mutate({ moduleId: lessonId, moduleTitle: lessonName, progress: 100 });
    toast.success(`Completed lesson: ${lessonName}! Progress synced.`);
  };

  // Helper check: Is a level unlocked?
  const isLevelUnlocked = (lvlId: number): boolean => {
    if (lvlId === 0 || unlockAllBypass) return true;
    
    // Check if previous level is fully completed
    const prevLvl = levelsData[lvlId - 1];
    if (!prevLvl) return true; // fallback

    const allPrevCompleted = prevLvl.modules.every((m) =>
      m.lessons.every((les) => completedLessons.has(les.id))
    );
    return allPrevCompleted;
  };

  // Helper to open lesson and reset modal states
  const openLessonModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonTab("content");
    setExplainerMode("standard");
    setActiveQuestionIdx(0);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    setCorrectAnswersCount(0);
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
    setMentorChatHistory([
      { sender: "mentor", text: `Welcome to the '${lesson.name}' learning module. I am ready to clarify any formulas, charts, or core financial risks. Ask away!` }
    ]);
  };

  // AI Mentor chat reply trigger
  const handleSendMentorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorInput.trim()) return;

    const userMsg = mentorInput.trim();
    setMentorChatHistory((prev) => [...prev, { sender: "user", text: userMsg }]);
    setMentorInput("");
    setIsTypingMentor(true);

    // Dynamic Fintech AI reply logic based on query & active lesson
    let mentorReply = "";
    setTimeout(() => {
      const qLower = userMsg.toLowerCase();
      if (qLower.includes("risk") || qLower.includes("loss")) {
        mentorReply = `🎯 [Risk Scan] As a trader, managing capital is priority #1. In '${selectedLesson?.name}', we see that risk is a direct function of position sizing. Never risk more than 1-2% of total trading equity on a single trade. If your stop loss triggers, you preserve 98% of your funds to fight another session.`;
      } else if (qLower.includes("why") || qLower.includes("example") || qLower.includes("real")) {
        mentorReply = `📈 [Real Trade Analysis] In ${selectedLesson?.name}, applying this concepts protects your portfolio. Take ${selectedLesson?.stockExample || "NIFTY Index"} as a prime example—institutional traders accumulate holdings using structural limit floors to hide their bulk size from retail panic.`;
      } else if (qLower.includes("formula") || qLower.includes("calculate") || qLower.includes("math")) {
        mentorReply = `🔢 [Quant Formula breakdown] Let's look at the math! The primary equation relies on strict input parameters. Unlike speculative gambling, quant models require structured variables (like historical CAGR or asset volatility coefficients) to solve for optimal capital efficiency weights.`;
      } else {
        mentorReply = `💡 [AI Mentor feedback] Excellent query regarding '${selectedLesson?.name}'. In professional finance, this represents a major structural edge. By framing this through a systematic rule-based trading model rather than emotion, you align your strategy with FII/DII accumulation footprints. What specific segment should we simplify next?`;
      }

      setMentorChatHistory((prev) => [...prev, { sender: "mentor", text: mentorReply }]);
      setIsTypingMentor(false);
    }, 1000);
  };

  // Generate dynamic levels/modules for remaining levels 4 to 12
  const getLevelDisplayInfo = (lvlId: number): Level => {
    const defined = levelsData.find((l) => l.id === lvlId);
    if (defined) return defined;

    const levelName = allLevelsList[lvlId].split("→ ")[1] || "Advanced Track";
    return {
      id: lvlId,
      name: levelName,
      goal: `Master professional-grade principles of ${levelName} to gain a definitive mathematical edge.`,
      certName: `TradeOS Certified ${levelName} Practitioner`,
      modules: [
        {
          id: `m${lvlId}.1`,
          name: `Module ${lvlId}.1 — Advanced Concepts`,
          lessons: [
            {
              id: `l${lvlId}.1.1`,
              name: `Intro to ${levelName}`,
              category: "Quant Theory",
              content: `This lesson details advanced frameworks of ${levelName}. Understanding this is critical for high-density capital compounding and structuring custom systematic risk parameters.`,
              stockExample: `Reliance Industries options implied range maps show high pricing alignment with ${levelName} thresholds.`,
              flashcards: [
                { front: `${levelName} Basics`, back: `The foundation of rule-based trading strategies inside TradeOS.` }
              ],
              quiz: [
                {
                  q: `What is the primary objective of mastering ${levelName}?`,
                  options: ["To maximize emotional biases", "To implement rule-based quantitative parameters", "To secure SEBI insurance waivers", "To ignore position sizing metrics"],
                  answer: 1,
                  explanation: `Mastering advanced parameters enables systematic rule-based execution, removing retail fear and greed.`
                }
              ]
            }
          ]
        }
      ]
    };
  };

  const activeLevel = getLevelDisplayInfo(activeLevelId);

  // Quiz submission helper
  const handleSelectQuizOption = (optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizOption(optIdx);
  };

  const handleSubmitQuiz = () => {
    if (selectedQuizOption === null || quizSubmitted) return;
    setQuizSubmitted(true);
    const correct = selectedLesson?.quiz[activeQuestionIdx].answer === selectedQuizOption;
    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1);
      toast.success("Correct answer! Stellar analysis.");
    } else {
      toast.error("Incorrect answer. Check the AI explanation below.");
    }
  };

  const handleNextQuizQuestion = () => {
    if (!selectedLesson) return;
    if (activeQuestionIdx < selectedLesson.quiz.length - 1) {
      setActiveQuestionIdx((prev) => prev + 1);
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
    } else {
      markLessonComplete(selectedLesson.id, selectedLesson.name);
      setSelectedLesson(null);
    }
  };

  // Compute stats for progress summary
  const completedCount = completedLessons.size;
  const totalLessonsInDB = 6; 
  const percentageProgress = Math.min(Math.round((completedCount / totalLessonsInDB) * 100), 100);

  return (
    <div>
      <PageHeader
        title="TradeOS Career Academy"
        subtitle="A complete career progression system taking you from 'What is a stock?' to professional systematic trader."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setUnlockAllBypass(!unlockAllBypass);
                toast.success(unlockAllBypass ? "Default locks restored." : "Developer bypass: All 12 levels unlocked!");
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                unlockAllBypass
                  ? "bg-primary/25 text-primary border-primary/40 glow-primary"
                  : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {unlockAllBypass ? "All Levels Unlocked" : "Unlock All levels (Bypass)"}
            </button>
          </div>
        }
      />

      <div className="p-6 grid grid-cols-12 gap-6">
        {/* TOP LEVEL OVERVIEW BENTO STATS */}
        <Card className="col-span-12 bg-primary/[0.01] border-primary/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-secondary/40 p-4 rounded-xl border border-border/30">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Career Progression Status</span>
              <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                <Trophy className="h-5 w-5 text-yellow-500 animate-bounce" />
                {completedCount >= 4 ? "Intermediate Trader" : "Beginner Track"}
              </div>
            </div>

            <div className="bg-secondary/40 p-4 rounded-xl border border-border/30">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Lessons Mastered</span>
              <div className="text-xl font-black text-white mt-1">{completedCount} <span className="text-xs text-muted-foreground font-normal">lessons</span></div>
            </div>

            <div className="bg-secondary/40 p-4 rounded-xl border border-border/30">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Global Progress Rank</span>
              <div className="text-xl font-black text-primary mt-1">Top 12% <span className="text-xs text-muted-foreground font-normal">of students</span></div>
            </div>

            <div className="bg-secondary/40 p-4 rounded-xl border border-border/30">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Academy Roadmap Completion</span>
              <div className="mt-2.5">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1 font-semibold">
                  <span>Compounding Milestones</span>
                  <span>{percentageProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percentageProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* LEFT COLUMN: DUOLINGO PROGRESSION ROADMAP TIMELINE */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card className="bg-card/45" title="Roadmap Milestones Tracker" action={<Pill tone="info">12 Levels</Pill>}>
            <p className="text-xs text-muted-foreground mb-4 font-semibold">
              Unlock Levels sequentially by mastering all underlying modules. Click any level node to view lessons.
            </p>

            <div className="relative border-l-2 border-border/60 pl-6 ml-3 space-y-5 py-2">
              {allLevelsList.map((lvlStr, index) => {
                const lvlName = lvlStr.split("→ ")[1];
                const active = activeLevelId === index;
                const unlocked = isLevelUnlocked(index);

                return (
                  <div key={index} className="relative group select-none">
                    {/* Visual Node */}
                    <div
                      onClick={() => {
                        if (unlocked) {
                          setActiveLevelId(index);
                          toast.info(`Switched to Level ${index}: ${lvlName}`);
                        } else {
                          toast.error(`Level ${index} is locked! Complete all preceding lessons to unlock.`);
                        }
                      }}
                      className={`absolute -left-[35px] top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        active
                          ? "bg-primary border-primary scale-125 glow-primary animate-pulse text-white"
                          : unlocked
                          ? "bg-success/20 border-success text-success"
                          : "bg-secondary border-border text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {unlocked ? (
                        <Check className="h-3 w-3 text-success font-extrabold" />
                      ) : (
                        <Lock className="h-2.5 w-2.5" />
                      )}
                    </div>

                    {/* Node Details text */}
                    <div className="pl-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          onClick={() => {
                            if (unlocked) setActiveLevelId(index);
                          }}
                          className={`text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? "text-primary font-black scale-102"
                              : unlocked
                              ? "text-white hover:text-primary"
                              : "text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          Level {index}: {lvlName}
                        </span>
                        {!unlocked && <Lock className="h-3 w-3 text-muted-foreground/60" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                        {index === 0 ? "Compounding, savings & asset allocations" : index === 1 ? "Order books, Demats & SEBI framework" : `Advanced quantitative mechanics of ${lvlName}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: DETAILED LEVEL BENTO MODULE CARD VIEW */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card
            className="border-primary/20 bg-primary/[0.01]"
            title={`Active: Level ${activeLevelId} — ${activeLevel.name}`}
            action={
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-medium">Goal Focused:</span>
                <Pill tone="info">{activeLevel.certName}</Pill>
              </div>
            }
          >
            <div className="p-4 rounded-xl bg-secondary/35 border border-border/30 text-xs mb-6">
              <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-primary animate-pulse" /> Focus Milestone Goal
              </h4>
              <p className="text-muted-foreground leading-relaxed font-semibold">{activeLevel.goal}</p>
            </div>

            <div className="space-y-6">
              {activeLevel.modules.map((mod) => (
                <div key={mod.id} className="space-y-3">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider pl-1">{mod.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mod.lessons.map((les) => {
                      const completed = completedLessons.has(les.id);
                      return (
                        <div
                          key={les.id}
                          onClick={() => openLessonModal(les)}
                          className="bg-card border border-border/80 hover:border-primary/40 hover:bg-secondary/30 rounded-xl p-4.5 transition-all cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {les.category}
                              </span>
                              {completed ? (
                                <CheckCircle2 className="h-4.5 w-4.5 text-success fill-success/15 shrink-0" />
                              ) : (
                                <PlayCircle className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white mt-3 group-hover:text-primary transition-colors">{les.name}</h4>
                            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                              {les.content}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center text-[10px] text-muted-foreground">
                            <span>Ready for certification</span>
                            <span className="flex items-center gap-1 text-primary group-hover:underline">
                              Start Study <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications Card Panel */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="bg-gradient-to-r from-secondary/50 to-primary/[0.03] p-5 rounded-2xl border border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                <div className="space-y-1 text-center md:text-left">
                  <div className="text-[10px] text-primary uppercase font-extrabold tracking-widest">Level Certification</div>
                  <h4 className="text-base font-black text-white">{activeLevel.certName}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Complete all modules in this roadmap track to auto-generate your verifiable certificate.
                  </p>
                </div>
                <button
                  disabled={!activeLevel.modules.every((m) => m.lessons.every((les) => completedLessons.has(les.id)))}
                  className="rounded-lg bg-primary hover:opacity-90 px-4 py-2 font-bold text-xs text-white transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0 animate-pulse"
                >
                  <Award className="h-4 w-4" /> Earn Certificate
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* FULL SCREEN STUDY LESSON OVERLAY WITH AI FEATURES */}
      <AnimatePresence>
        {selectedLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLesson(null)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />

            {/* Study Container */}
            <motion.div
              initial={{ y: 20, opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0.8 }}
              className="relative w-full max-w-4xl h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-border/40 bg-secondary/30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded">
                    Active Study Node
                  </span>
                  <h3 className="text-base font-black text-white">{selectedLesson.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-white hover:bg-secondary/40 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tabs selector */}
              <div className="px-6 border-b border-border/30 bg-sidebar/20 flex gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: "content", label: "Study Material", icon: BookOpen },
                  { id: "flashcards", label: "Interactive Flashcards", icon: FileText },
                  { id: "quiz", label: "Challenge Quiz", icon: HelpCircle },
                  { id: "mentor", label: "AI Mentor Chat Session", icon: Sparkles }
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setLessonTab(t.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        lessonTab === t.id
                          ? "border-primary text-primary bg-primary/[0.02]"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Canvas */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* TAB 1: STUDY MATERIAL */}
                {lessonTab === "content" && (
                  <div className="space-y-6 text-xs">
                    {/* Explainer controllers */}
                    <div className="flex justify-between items-center bg-secondary/35 p-3 rounded-xl border border-border/30">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Brain className="h-4 w-4 text-primary animate-pulse" /> Customize explain style on-the-fly:
                      </span>
                      <div className="flex gap-1">
                        {[
                          { id: "standard", label: "Standard" },
                          { id: "eli15", label: "Explain Like I'm 15" },
                          { id: "simplify", label: "Simplify Bullet points" }
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setExplainerMode(m.id as any);
                              toast.success(`Aptitude mode changed to: ${m.label}`);
                            }}
                            className={`rounded px-2.5 py-1 text-[10px] font-bold border transition-all cursor-pointer ${
                              explainerMode === m.id
                                ? "bg-primary/10 text-primary border-primary/30 font-bold"
                                : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lesson Main text */}
                    <div className="p-5 rounded-2xl bg-secondary/20 border border-border/30 text-sm leading-relaxed text-muted-foreground">
                      {explainerMode === "standard" && (
                        <p className="font-semibold">{selectedLesson.content}</p>
                      )}
                      {explainerMode === "eli15" && (
                        <div className="space-y-3">
                          <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider flex items-center gap-1 font-bold">
                            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> ELI15 Visual Analogy
                          </span>
                          <p className="font-semibold text-white">
                            {selectedLesson.id === "l0.1.1"
                              ? "Imagine you are in a school cafeteria trading items. If you have an apple but want a cookie, and the cookie owner wants a sandwich, you are stuck! Money is like a universal 'Cafeteria Coupon' that everyone accepts. Fiat money is basically a cafeteria coupon issued and signed by the principal, which everyone trusts because of the principal's signature."
                              : selectedLesson.id === "l0.1.2"
                              ? "Think of your cash flow as a bucket of water. Income is the faucet pouring water in, and Expenses are leaks at the bottom. Saving is just catching the left-over water in a jar. Investing is like using that left-over water to plant a fruit tree that grows and eventually produces its own new water without you touching the faucet!"
                              : selectedLesson.id === "l1.1.1"
                              ? "Imagine a massive pizza cut into millions of tiny slices. Buying a stock is like buying one tiny slice of that corporate pizza. If the pizza size grows or tastes better (the company makes higher profits), your single slice becomes worth way more and gets more expensive on the public market."
                              : "Imagine you want to buy a limited edition video game. A Market Order is running into the store and shouting 'give me the game now at whatever price is on the tag!' A Limit Order is telling your friend 'hey, buy this game for me only if you find it on sale for ₹2,000 or cheaper, otherwise don't buy it at all.'"}
                          </p>
                        </div>
                      )}
                      {explainerMode === "simplify" && (
                        <div className="space-y-3">
                          <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider flex items-center gap-1 font-bold">
                            <Brain className="h-3.5 w-3.5" /> High-Density Bullet summaries
                          </span>
                          <ul className="list-disc pl-5 space-y-2 font-semibold text-white">
                            {selectedLesson.id === "l0.1.1" ? (
                              <>
                                <li>Money eliminates barter limitations by acting as a universal medium of exchange.</li>
                                <li>Fiat currencies are backed by regulatory trust, not physical metals.</li>
                                <li>Inflation erodes raw cash values, making equity investment essential.</li>
                              </>
                            ) : selectedLesson.id === "l0.1.2" ? (
                              <>
                                <li>Surplus capital is the absolute fuel source for portfolio wealth.</li>
                                <li>Active income requires active hourly labor inputs; passive income does not.</li>
                                <li>Control wants to prevent lifestyle inflation from consuming investable margins.</li>
                              </>
                            ) : (
                              <>
                                <li>Stocks represent fractional tangible equity holdings in listed companies.</li>
                                <li>IPO listings raise growth capital without fixed interest burdens.</li>
                                <li>Market Orders guarantee immediate fill speeds; Limit Orders guarantee precise pricing.</li>
                              </>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Real stock showcase */}
                    {selectedLesson.stockExample && (
                      <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                        <span className="text-[10px] text-success font-extrabold uppercase tracking-wider flex items-center gap-1 font-bold">
                          <TrendingUp className="h-4 w-4" /> Live Market Case Study
                        </span>
                        <p className="text-muted-foreground mt-2 leading-relaxed font-semibold">{selectedLesson.stockExample}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: INTERACTIVE FLASHCARDS */}
                {lessonTab === "flashcards" && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-6 text-xs">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Card {flashcardIdx + 1} of {selectedLesson.flashcards.length} · Tap Card to Flip
                    </span>

                    {/* Card container */}
                    <div
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className="w-full max-w-sm h-48 rounded-2xl border border-border/80 bg-secondary/30 hover:border-primary/40 transition-all flex items-center justify-center p-6 text-center cursor-pointer select-none relative shadow-xl"
                    >
                      <div className="absolute top-3 right-4 text-[9px] uppercase tracking-wider text-muted-foreground font-extrabold">
                        {flashcardFlipped ? "Answer Side" : "Concept Side"}
                      </div>
                      <p className={`text-base font-extrabold ${flashcardFlipped ? "text-primary" : "text-white"}`}>
                        {flashcardFlipped
                          ? selectedLesson.flashcards[flashcardIdx]?.back
                          : selectedLesson.flashcards[flashcardIdx]?.front}
                      </p>
                    </div>

                    {/* Pagination controllers */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFlashcardIdx((prev) => Math.max(prev - 1, 0));
                          setFlashcardFlipped(false);
                        }}
                        disabled={flashcardIdx === 0}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-white disabled:opacity-40 cursor-pointer font-bold"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => {
                          setFlashcardIdx((prev) => Math.min(prev + 1, selectedLesson.flashcards.length - 1));
                          setFlashcardFlipped(false);
                        }}
                        disabled={flashcardIdx === selectedLesson.flashcards.length - 1}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-white disabled:opacity-40 cursor-pointer font-bold"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: CHALLENGE QUIZ */}
                {lessonTab === "quiz" && (
                  <div className="space-y-6 text-xs max-w-xl mx-auto">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block text-center">
                      Question {activeQuestionIdx + 1} of {selectedLesson.quiz.length}
                    </span>

                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                      <h4 className="text-sm font-bold text-white leading-relaxed">
                        {selectedLesson.quiz[activeQuestionIdx]?.q}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {selectedLesson.quiz[activeQuestionIdx]?.options.map((opt, oIdx) => {
                        const isSelected = selectedQuizOption === oIdx;
                        const isAnswer = selectedLesson.quiz[activeQuestionIdx].answer === oIdx;
                        
                        let optionStyle = "bg-secondary/20 border-border/50 text-white hover:bg-secondary/40";
                        if (quizSubmitted) {
                          if (isAnswer) {
                            optionStyle = "bg-success/15 border-success text-success font-bold";
                          } else if (isSelected) {
                            optionStyle = "bg-danger/15 border-danger text-danger font-bold";
                          } else {
                            optionStyle = "bg-secondary/10 border-border/20 text-muted-foreground opacity-55";
                          }
                        } else if (isSelected) {
                          optionStyle = "bg-primary/10 border-primary text-primary font-bold";
                        }

                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectQuizOption(oIdx)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${optionStyle}`}
                          >
                            <span className="font-semibold">{opt}</span>
                            {quizSubmitted && isAnswer && <CheckCircle2 className="h-4.5 w-4.5 text-success" />}
                            {quizSubmitted && isSelected && !isAnswer && <X className="h-4.5 w-4.5 text-danger" />}
                          </div>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-4 rounded-xl bg-primary/[0.02] border border-primary/20 leading-relaxed font-semibold text-muted-foreground">
                        <strong className="text-white font-extrabold block mb-1">AI Explanation:</strong>
                        {selectedLesson.quiz[activeQuestionIdx].explanation}
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      {!quizSubmitted ? (
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={selectedQuizOption === null}
                          className="rounded-lg bg-primary px-4 py-2 font-semibold text-xs text-white hover:opacity-90 disabled:opacity-40 cursor-pointer"
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuizQuestion}
                          className="rounded-lg bg-success px-4 py-2 font-semibold text-xs text-white hover:opacity-90 cursor-pointer flex items-center gap-1 font-bold"
                        >
                          {activeQuestionIdx < selectedLesson.quiz.length - 1 ? "Next Question" : "Complete Lesson Study"} <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: AI MENTOR CHAT */}
                {lessonTab === "mentor" && (
                  <div className="h-96 flex flex-col justify-between border border-border/30 rounded-2xl overflow-hidden bg-sidebar/20 text-xs">
                    {/* Chat log */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                      {mentorChatHistory.map((chat, cIdx) => (
                        <div
                          key={cIdx}
                          className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-md rounded-xl p-3.5 leading-relaxed font-semibold ${
                              chat.sender === "user"
                                ? "bg-primary text-white font-bold"
                                : "bg-secondary/40 text-muted-foreground border border-border/30"
                            }`}
                          >
                            {chat.text}
                          </div>
                        </div>
                      ))}

                      {isTypingMentor && (
                        <div className="flex justify-start">
                          <div className="bg-secondary/30 text-muted-foreground rounded-xl p-3 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                            <span className="text-[10px] text-muted-foreground">Quant Mentor is calculating response...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input form */}
                    <form onSubmit={handleSendMentorMessage} className="p-3 border-t border-border/30 bg-secondary/25 flex gap-2">
                      <input
                        value={mentorInput}
                        onChange={(e) => setMentorInput(e.target.value)}
                        placeholder="Ask AI Mentor (e.g. 'Can you explain the formula?')"
                        className="flex-1 bg-card rounded-lg border border-border px-3.5 py-2 outline-none focus:border-primary text-foreground text-xs font-semibold"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Ask Mentor
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-border/40 bg-secondary/30 flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Status: Learning Session Active</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="rounded-lg border border-border px-4 py-2 font-semibold text-muted-foreground hover:text-white hover:bg-secondary/40 cursor-pointer"
                  >
                    Close Lesson
                  </button>
                  <button
                    onClick={() => {
                      markLessonComplete(selectedLesson.id, selectedLesson.name);
                      setSelectedLesson(null);
                    }}
                    className="rounded-lg bg-success px-4 py-2 font-semibold text-white hover:opacity-90 cursor-pointer font-bold animate-pulse"
                  >
                    Fast-Track Complete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
