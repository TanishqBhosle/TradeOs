import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/marketing/Nav";
import { signUp } from "@/lib/auth-client";
import { Eye, EyeOff, Check } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordChecks = [
    { label: "At least 6 characters", ok: password.length >= 6 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains uppercase", ok: /[A-Z]/.test(password) },
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Sign up failed");
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
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Start trading smarter — free forever
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-strong p-8 rounded-2xl border border-border/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] glow relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="signup-form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Sign Up Form */}
                <form onSubmit={handleSignUp} className="space-y-4">
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
                      htmlFor="name"
                      className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aarav Mehta"
                      required
                      className="w-full rounded-lg border border-border bg-card/40 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 input-glow"
                    />
                  </div>

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
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Password
                    </label>
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
                    {password && (
                      <div className="mt-2.5 space-y-1">
                        {passwordChecks.map((c) => (
                          <div
                            key={c.label}
                            className={`flex items-center gap-1.5 text-xs ${c.ok ? "text-success" : "text-muted-foreground"}`}
                          >
                            <Check className={`h-3 w-3 ${c.ok ? "" : "opacity-30"}`} />
                            {c.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || password.length < 6}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_10px_40px_-5px_rgba(59,130,246,0.6)] active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Creating account...
                      </span>
                    ) : (
                      "Create Account"
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
                <h2 className="mt-4 text-xl font-semibold">Account Created!</h2>
                <p className="mt-1 text-sm text-muted-foreground">Redirecting you to the TradeOS Dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </p>

        <p className="mt-8 text-center text-[10px] leading-relaxed text-muted-foreground/60 max-w-xs mx-auto">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy. TradeOS AI does not provide financial advice.
        </p>
      </motion.div>
    </div>
  );
}
