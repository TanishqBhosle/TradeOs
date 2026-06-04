import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Newspaper, Telescope, LineChart as LineIcon, Wallet,
  Shield, GraduationCap, Sparkles, Bell, BookText, Settings, UserCircle2,
  Search, ChevronsLeft, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/marketing/Nav";
import { useSession, signOut } from "@/lib/auth-client";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

const nav = [
  { group: "Workspace", items: [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/app/market-brief", label: "Market Brief", icon: Newspaper },
    { to: "/app/scanner", label: "Scanner", icon: Telescope },
    { to: "/app/stock", label: "Stock Analysis", icon: LineIcon },
  ]},
  { group: "Portfolio", items: [
    { to: "/app/portfolio", label: "Portfolio", icon: Wallet },
    { to: "/app/risk", label: "Risk Guardian", icon: Shield },
    { to: "/app/journal", label: "Trade Journal", icon: BookText },
    { to: "/app/alerts", label: "Alerts", icon: Bell },
  ]},
  { group: "Learn", items: [
    { to: "/app/academy", label: "Academy", icon: GraduationCap },
    { to: "/app/coach", label: "AI Coach", icon: Sparkles },
  ]},
  { group: "Account", items: [
    { to: "/app/profile", label: "Profile", icon: UserCircle2 },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ]},
];

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: session, isPending } = useSession();

  // Show loading state while checking auth
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <span className="text-sm text-muted-foreground">Loading TradeOS...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to sign in to access the trading dashboard.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";
  const userPlan = (user as Record<string, unknown>).plan as string ?? "free";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const sidebarContent = (
    <>
      <div className="relative flex h-14 items-center justify-between gap-2 px-3">
        {/* Subtle glow behind logo */}
        <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 h-20 w-32 rounded-full bg-primary/5 blur-2xl" />
        <Link to="/" className="relative flex items-center gap-2.5 group">
          <Logo size={28} />
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col text-left"
            >
              <div className="flex items-center font-display leading-none">
                <span className="text-sm font-extrabold tracking-wider text-white">TRADE</span>
                <span className="text-sm font-extrabold tracking-wider text-primary">OS</span>
                <span className="ml-1 rounded px-1.5 py-0.5 text-[8px] font-bold bg-primary/10 border border-primary/20 text-primary tracking-wider">AI</span>
              </div>
              <span className="text-[6.5px] font-bold tracking-[0.18em] text-muted-foreground/70 uppercase mt-0.5 leading-none whitespace-nowrap">TRADE SMART • INVEST BETTER</span>
            </motion.div>
          )}
        </Link>
        <button onClick={() => setCollapsed((c) => !c)} className="hidden md:block rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <ChevronsLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
        </button>
        <button onClick={() => setMobileOpen(false)} className="md:hidden rounded-md p-1.5 text-muted-foreground hover:bg-secondary">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-y border-border px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-primary/20 transition-colors cursor-pointer">
          <Search className="h-3.5 w-3.5" />
          {!collapsed && <><span>Quick search…</span><span className="ml-auto rounded border border-border bg-secondary px-1 font-mono text-[10px]">⌘K</span></>}
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3 no-scrollbar">
        {nav.map((g) => (
          <div key={g.group}>
            {!collapsed && (
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
                {g.group}
              </div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200 ${
                        active
                          ? "bg-primary/[0.06] text-foreground font-medium"
                          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="navpill"
                          className="absolute inset-0 rounded-lg bg-primary/[0.06] border border-primary/10"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <it.icon className={`relative h-4 w-4 transition-colors ${active ? "text-primary" : ""}`} />
                      {!collapsed && <span className="relative">{it.label}</span>}
                      {active && !collapsed && (
                        <motion.div
                          layoutId="navdot"
                          className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-primary"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section with clean borders */}
      <div className="border-t border-border p-3">
        <div className={`flex items-center gap-2.5 rounded-xl p-2 ${!collapsed ? 'border border-border bg-card' : ''}`}>
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold shadow-lg shadow-primary/10">
            {initials}
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0 flex-1"
            >
              <div className="truncate text-xs font-medium">{user.name}</div>
              <div className="truncate text-[10px] text-muted-foreground capitalize">{userPlan} Plan</div>
            </motion.div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className={`sticky top-0 hidden h-screen shrink-0 border-r border-border bg-sidebar md:flex md:flex-col ${collapsed ? "w-[68px]" : "w-[248px]"} transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border bg-sidebar/95 backdrop-blur-lg px-4 py-3 md:hidden">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo size={28} />
          <div className="flex flex-col text-left">
            <div className="flex items-center font-display leading-none">
              <span className="text-sm font-extrabold tracking-wider text-white">TRADE</span>
              <span className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">OS</span>
              <span className="ml-1 rounded px-1 py-0.2 text-[8px] font-black bg-blue-500/10 border border-blue-500/30 text-blue-400 tracking-wider">AI</span>
            </div>
            <span className="text-[6.5px] font-bold tracking-[0.18em] text-muted-foreground/70 uppercase mt-0.5 leading-none whitespace-nowrap">TRADE SMART • INVEST BETTER</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-50 h-screen w-[260px] border-r border-border bg-sidebar flex flex-col md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="min-w-0 flex-1 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
