import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/marketing/Nav";
import { signIn } from "@/lib/auth-client";
import { Eye, EyeOff, Sparkles, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Invalid credentials");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate({ to: "/app" });
      }, 1000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("demo@tradeos.ai");
    setPassword("Demo@123");
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email: "demo@tradeos.ai",
        password: "Demo@123",
      });

      if (result.error) {
        setError("Demo account not set up yet. Please sign up first.");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate({ to: "/app" });
      }, 1000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0A0F1C] px-4 overflow-hidden">
      {/* Dynamic Floating Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] animate-float pointer-events-none" />
        <div className="absolute -bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[120px] animate-float pointer-events-none" style={{ animationDelay: "2s" }} />
      </div>
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo and Greeting */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <Logo size={36} />
            <div className="flex flex-col text-left">
              <div className="flex items-center font-display leading-none">
                <span className="text-lg font-extrabold tracking-wider text-white">TRADE</span>
                <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">OS</span>
                <span className="ml-1 rounded px-1 py-0.5 text-[8px] font-black bg-blue-500/10 border border-blue-500/30 text-blue-400 tracking-wider uppercase">AI</span>
              </div>
              <span className="text-[7.5px] font-bold tracking-[0.2em] text-muted-foreground/80 uppercase mt-0.5 whitespace-nowrap">
                TRADE SMART • INVEST BETTER
              </span>
            </div>
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your intelligent trading dashboard
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-strong p-8 rounded-2xl border border-border/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] glow relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Demo Account Quick Login */}
                <button
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="group mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08] px-4 py-3.5 text-sm font-semibold text-primary transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Try Demo Account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0A0F1C]/90 px-3 text-muted-foreground uppercase tracking-wider font-semibold">
                      or sign in with email
                    </span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-lg border border-border bg-card/40 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 input-glow"
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full rounded-lg border border-border bg-card/40 px-4 py-2.5 pr-10 text-sm outline-none transition-all placeholder:text-muted-foreground/60 input-glow"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_10px_40px_-5px_rgba(59,130,246,0.6)] active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success glow-success animate-bounce">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">Sign in Successful!</h2>
                <p className="mt-1 text-sm text-muted-foreground">Redirecting you to the TradeOS Dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-semibold">
            Create one free
          </Link>
        </p>

        <p className="mt-8 text-center text-[10px] leading-relaxed text-muted-foreground/60 max-w-xs mx-auto">
          Investments in securities are subject to market risk. Read all related
          documents carefully. TradeOS AI does not provide financial advice.
        </p>
      </motion.div>
    </div>
  );
}
