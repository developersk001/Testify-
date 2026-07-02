import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Key, 
  Mail, 
  User, 
  CheckCircle, 
  Database, 
  LogIn, 
  AlertCircle,
  Copy,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from "lucide-react";
import { motion } from "motion/react";
import { StudentIllustration } from "./Illustrations";
import { supabase, isSupabaseConfigured, SUPABASE_SQL_SETUP } from "../lib/supabase";

interface WelcomePageProps {
  onNameSubmitted: (name: string) => void;
  onSupabaseAuthSuccess: (user: any, profile: { username: string; test_history: any[]; bookmarks: any[]; mistake_notes: any; active_test_session: any }) => void;
}

export default function WelcomePage({ onNameSubmitted, onSupabaseAuthSuccess }: WelcomePageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [useOffline, setUseOffline] = useState(!isSupabaseConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showSqlSetup, setShowSqlSetup] = useState(false);
  const [copied, setCopied] = useState(false);

  // Offline / Local Storage fallback submit
  const handleOfflineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setError("Please provide a name or nickname.");
      return;
    }
    onNameSubmitted(usernameInput.trim());
  };

  // Copy SQL snippet
  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Supabase Auth Email/Password Sign Up or Sign In
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!supabase) {
      setError("Supabase client is not initialized.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all email and password fields.");
      return;
    }

    if (isSignUp && !usernameInput.trim()) {
      setError("Please provide a nickname for registration.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              username: usernameInput.trim(),
            },
          },
        });

        if (signUpError) throw signUpError;

        if (signUpData?.user) {
          // If auto-logged in or confirmation email not mandatory
          setInfoMessage("Registration successful! You can now log in. If you have email confirmation enabled on Supabase, please click the link sent to your email first.");
          setIsSignUp(false);
        }
      } else {
        // Sign In Flow
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (signInError) throw signInError;

        if (signInData?.user) {
          const user = signInData.user;
          const userMeta = user.user_metadata || {};
          const uName = userMeta.username || user.email?.split("@")[0] || "Student";

          let profile = {
            username: uName,
            test_history: [],
            bookmarks: [],
            mistake_notes: {},
            active_test_session: null,
          };

          try {
            const { data: profData, error: profError } = await supabase
              .from("testify_user_profiles")
              .select("username, test_history, bookmarks, mistake_notes, active_test_session")
              .eq("id", user.id)
              .single();

            if (!profError && profData) {
              profile = {
                username: profData.username || uName,
                test_history: Array.isArray(profData.test_history) ? profData.test_history : [],
                bookmarks: Array.isArray(profData.bookmarks) ? profData.bookmarks : [],
                mistake_notes: typeof profData.mistake_notes === "object" && profData.mistake_notes !== null ? profData.mistake_notes : {},
                active_test_session: profData.active_test_session || null,
              };
            } else if (userMeta.user_data) {
              profile = {
                username: uName,
                test_history: Array.isArray(userMeta.user_data.test_history) ? userMeta.user_data.test_history : [],
                bookmarks: Array.isArray(userMeta.user_data.bookmarks) ? userMeta.user_data.bookmarks : [],
                mistake_notes: typeof userMeta.user_data.mistake_notes === "object" ? userMeta.user_data.mistake_notes : {},
                active_test_session: userMeta.user_data.active_test_session || null,
              };
            }
          } catch (e) {
            console.warn("Table profile fetch error, continuing with fallback:", e);
          }

          onSupabaseAuthSuccess(user, profile);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] dark:bg-zinc-950 z-[100] flex items-stretch select-none overflow-hidden">
      
      {/* LEFT COLUMN: BRANDING & EXQUISITE VECTOR GRAPHIC */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 dark:bg-blue-950/35 relative p-12 flex-col justify-between overflow-hidden">
        {/* Background gradient flares */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-white text-base tracking-tighter border border-white/20">
            T
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">Testify</span>
          <span className="text-[9px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full font-mono">SaaS</span>
        </div>

        {/* Central Graphic Focus */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-8 my-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md aspect-square bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center relative group"
          >
            <img 
              src="/auth_illustration.jpg" 
              alt="Testify Learning Illustration" 
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Inline SVG fallback just in case image is missing
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>

          <div className="text-center space-y-2.5 max-w-sm">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Unleash Perfect Performance
            </h2>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              Synchronize your mock test histories, bookmark complex questions, and curate your personalized mistake book securely in the cloud.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-blue-200/60 font-semibold font-mono tracking-wider uppercase">
          <BookOpen className="w-4 h-4 text-blue-300" />
          <span>Real-time DB Sync & Backup enabled</span>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE AUTH FORM & SETUP FROM SCRATCH GUIDE */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 md:p-16 overflow-y-auto bg-white dark:bg-zinc-950">
        
        <div className="max-w-md w-full mx-auto space-y-6">
          
          {/* Mobile brand header (hidden on desktop) */}
          <div className="flex lg:hidden items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm tracking-tighter">
                T
              </div>
              <span className="font-extrabold text-base tracking-tight text-zinc-950 dark:text-white">Testify</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{isSupabaseConfigured ? "Supabase Cloud" : "Offline"}</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5 text-left">
            <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>{isSupabaseConfigured ? "Supabase Cloud Sync Mode" : "Offline / Local Mode"}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
              {useOffline ? "Get Started Offline" : isSignUp ? "Create Cloud Account" : "Secure Sign In"}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {useOffline 
                ? "Enter your display name to track progress using local browser storage."
                : "Log in to synchronize your progress across all your modern devices."}
            </p>
          </div>

          {/* Error and Alert Messages */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-2xl flex items-start gap-2 border border-red-100/80 dark:border-red-950/40">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-2xl flex items-start gap-2 border border-emerald-100/80 dark:border-emerald-950/40">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* MODE SWITCHER */}
          {!useOffline && isSupabaseConfigured && (
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-850">
              <button
                onClick={() => { setIsSignUp(false); setError(""); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${!isSignUp ? "bg-white dark:bg-zinc-850 shadow-sm text-blue-600 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsSignUp(true); setError(""); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isSignUp ? "bg-white dark:bg-zinc-850 shadow-sm text-blue-600 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* MAIN FORM */}
          {!useOffline && isSupabaseConfigured ? (
            /* SUPABASE FORM */
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-3.5 text-left">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>Nickname / Display Name</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul, Sneha"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>Email Address</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-blue-500" />
                    <span>Password</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer mt-1"
              >
                <span>{loading ? "Authenticating..." : isSignUp ? "Create Cloud Account" : "Secure Sign In"}</span>
                <LogIn className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setUseOffline(true); setError(""); }}
                  className="text-[10px] font-bold text-zinc-400 hover:text-blue-500 hover:underline tracking-wider uppercase"
                >
                  Or Continue with Local Storage (Offline Mode)
                </button>
              </div>
            </form>
          ) : (
            /* LOCAL STORAGE OFFLINE OR SUPABASE NOT CONFIGURED GUIDE */
            <div className="space-y-5">
              
              {!isSupabaseConfigured && (
                /* IN-DEPTH SET UP SUPABASE FROM SCRATCH GUIDE */
                <div className="border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl p-4 sm:p-5 text-left space-y-3.5">
                  <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-400 font-extrabold text-sm">
                    <Database className="w-5 h-5 text-amber-600" />
                    <span>Set up Supabase from Scratch</span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    You deleted your previous Supabase project. Don't worry! Follow these simple steps to build a fresh synchronized backend in 2 minutes:
                  </p>

                  {/* STEP BY STEP EXPANDED GUIDE */}
                  <div className="space-y-3 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">1</div>
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-850 dark:text-zinc-200">Create a New Supabase Project</span>
                        <p className="text-zinc-500">Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> and spin up a new free project.</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">2</div>
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-850 dark:text-zinc-200">Copy credentials & set in AI Studio Secrets</span>
                        <p className="text-zinc-500">Open your Supabase **Project Settings → API** and copy your **Project URL** and **anon public key**. Set them in **Google AI Studio Settings Secrets** panel as:</p>
                        <div className="bg-zinc-900 text-zinc-300 p-2 rounded-xl font-mono text-[9px] select-text mt-1 space-y-1 border border-zinc-800">
                          <div>VITE_SUPABASE_URL = "your_project_url"</div>
                          <div>VITE_SUPABASE_ANON_KEY = "your_anon_key"</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">3</div>
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-850 dark:text-zinc-200">Deploy user profiles table</span>
                        <p className="text-zinc-500">Open **SQL Editor** in Supabase sidebar, create a new query, paste the script below and run it:</p>
                        
                        <div className="pt-1 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowSqlSetup(!showSqlSetup)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold hover:underline inline-flex items-center gap-1"
                          >
                            <Info className="w-3.5 h-3.5" />
                            <span>{showSqlSetup ? "Hide SQL Script" : "Show SQL Table Setup script"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={copySql}
                            className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold hover:text-blue-500 inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? "Copied!" : "Copy SQL"}</span>
                          </button>
                        </div>

                        {showSqlSetup && (
                          <pre className="p-2 bg-zinc-900 text-zinc-300 rounded-xl font-mono text-[8px] overflow-x-auto max-h-36 select-text border border-zinc-800 mt-1.5 leading-normal">
                            {SUPABASE_SQL_SETUP}
                          </pre>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">4</div>
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-850 dark:text-zinc-200">Recommended testing option</span>
                        <p className="text-zinc-500">Go to **Authentication → Providers → Email** and disable *Confirm email* so you can instantly log in right after sign up!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OFFLINE FORM */}
              <form onSubmit={handleOfflineSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                    Enter display name to proceed offline:
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter offline nickname..."
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setError("");
                    }}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                    maxLength={24}
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {isSupabaseConfigured && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setUseOffline(false); setError(""); }}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline tracking-wider uppercase"
                    >
                      Back to Supabase Sign In
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Bottom stats badge */}
          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-semibold font-mono uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice 2000-2026 PYQs Offline</span>
          </div>

        </div>

      </div>

    </div>
  );
}
