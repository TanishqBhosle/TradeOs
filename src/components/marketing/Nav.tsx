import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function MarketingNav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo size={32} />
            <div className="flex flex-col text-left">
              <div className="flex items-center font-display leading-none">
                <span className="text-sm font-extrabold tracking-wider text-white">TRADE</span>
                <span className="text-sm font-extrabold tracking-wider text-primary">OS</span>
                <span className="ml-1 rounded px-1.5 py-0.5 text-[8px] font-bold leading-none bg-primary/10 border border-primary/20 text-primary tracking-widest uppercase">AI</span>
              </div>
              <span className="text-[7.5px] font-bold tracking-[0.2em] text-muted-foreground/80 uppercase leading-none mt-0.5 whitespace-nowrap">
                TRADE SMART • INVEST BETTER
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Academy", href: "#academy" },
              { label: "FAQ", href: "#faq" },
            ].map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/app" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline">Sign in</Link>
            <Link
              to="/app"
              className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export function Logo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.12)] transition-all duration-300 hover:scale-105 ${className}`}
    >
      <defs>
        {/* T-Logo metallic silver gradient */}
        <linearGradient id="tGradient" x1="5" y1="16" x2="50" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Outer Circular arrow blue gradient */}
        <linearGradient id="blueLoopGradient" x1="15" y1="90" x2="85" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />       {/* Deep sky blue */}
          <stop offset="45%" stopColor="#0EA5E9" />      {/* Sky blue */}
          <stop offset="75%" stopColor="#38BDF8" />      {/* Light blue */}
          <stop offset="100%" stopColor="#60A5FA" />     {/* Brightest accent blue */}
        </linearGradient>

        {/* Candlestick Gradients */}
        <linearGradient id="candleBlue" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="candleDarkBlue" x1="0" y1="0" x2="0" y2="1" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Subtle drop shadow/glow for the arrow */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* LAYER 1: Blue sweeping ring arrow */}
      <path
        d="M 23,62 
           C 16,70 17,80 27,85 
           C 40,92 58,90 70,80 
           C 80,70 85,55 83,40 
           L 89,37 
           L 81,11 
           L 65,25 
           L 71,28 
           C 73,38 71,48 64,56 
           C 56,64 45,67 35,63 
           C 31,61 28,58 26,55"
        fill="url(#blueLoopGradient)"
        filter="url(#glow)"
        strokeLinejoin="round"
      />

      {/* LAYER 2: Candlesticks nestled inside the loop */}
      {/* Candle 1 (Left, White/Silver) */}
      <line x1="43.5" y1="36" x2="43.5" y2="70" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      <rect x="40.5" y="46" width="6" height="15" rx="1.2" fill="url(#tGradient)" stroke="#FFFFFF" strokeWidth="0.5" />

      {/* Candle 2 (Middle, Light Blue) */}
      <line x1="54.5" y1="28" x2="54.5" y2="62" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <rect x="51.5" y="38" width="6" height="14" rx="1.2" fill="url(#candleBlue)" stroke="#38BDF8" strokeWidth="0.5" />

      {/* Candle 3 (Right, Dark Blue / White Accent) */}
      <line x1="65.5" y1="20" x2="65.5" y2="54" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <rect x="62.5" y="28" width="6" height="16" rx="1.2" fill="url(#candleDarkBlue)" stroke="#60A5FA" strokeWidth="0.5" />

      {/* LAYER 3: Futuristic "T" on the left, overlapping the blue ring */}
      <path
        d="M 5,19 
           H 68 
           L 60,30 
           H 31 
           Q 22,57 7,85 
           Q 18,52 24,30 
           H 15 
           Z"
        fill="url(#tGradient)"
        stroke="#FFFFFF"
        strokeWidth="0.5"
      />
    </svg>
  );
}
