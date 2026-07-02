import React, { useState } from "react";
import { Sparkles, ArrowRight, BookOpen, Key, Mail, User, CheckCircle, Database, LogIn, AlertCircle } from "lucide-react";
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

  // Offline / Local Storage fallback submit
  const handleOfflineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setError("Please provide a name or nickname.");
      return;
    }
    onNameSubmitted(usernameInput.trim());
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
          setInfoMessage("Registration initiated! Please check your email for verification link (if required by your Supabase project) or proceed to sign in.");
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
          // Attempt to fetch profile
          const user = signInData.user;
          const userMeta = user.user_metadata || {};
          const uName = userMeta.username || user.email?.split("@")[0] || "Student";

          // Try loading user profile details
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
              // Try loading from fallback auth user metadata
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
    <div className="fixed inset-0 bg-[#FAFAFA] dark:bg-zinc-950 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5 select-none my-8"
      >
        <div className="flex flex-col items-center gap-2.5 text-center">
          <StudentIllustration className="w-24 h-24" />
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>{isSupabaseConfigured ? "Supabase Cloud Sync Mode" : "Offline / Dev Mode"}</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white mt-1">
              Welcome to Testify
            </h1>
            <p className="text-xs text-zinc-500 max-w-sm">
              Unlimited mock testing and mistake book engine powered by cloud synchronization.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-2xl flex items-start gap-2 border border-red-100 dark:border-red-950/40">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-2xl flex items-start gap-2 border border-emerald-100 dark:border-emerald-950/40">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* MODE SWITCHER */}
        {!useOffline && isSupabaseConfigured && (
          <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-850">
            <button
              onClick={() => { setIsSignUp(false); setError(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${!isSignUp ? "bg-white dark:bg-zinc-900 shadow text-blue-600 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isSignUp ? "bg-white dark:bg-zinc-900 shadow text-blue-600 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* SUPABASE AUTH FORM */}
        {!useOffline && isSupabaseConfigured ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-3.5">
              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-500" />
                    <span>Nickname / Display Name</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul, Sneha"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-500" />
                  <span>Email Address</span>
                </label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 flex items-center gap-1">
                  <Key className="w-3 h-3 text-blue-500" />
                  <span>Password</span>
                </label>
                <input 
                  type="password" 
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer"
            >
              <span>{loading ? "Authenticating..." : isSignUp ? "Create Cloud Account" : "Secure Sign In"}</span>
              <LogIn className="w-4 h-4" />
            </button>

            <div className="text-center">
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
          /* LOCAL STORAGE OFFLINE SIGN IN OR SUPABASE MISSING STATE */
          <div className="space-y-4">
            {!isSupabaseConfigured && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-950/40 space-y-2 text-left">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs">
                  <Database className="w-4 h-4" />
                  <span>Supabase Config Pending</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Supabase secrets are not set in Google AI Studio. Fill in your environment variables in your workspace settings / secrets menu to connect:
                </p>
                <div className="bg-zinc-900 text-zinc-300 p-2.5 rounded-xl font-mono text-[9px] select-text space-y-1">
                  <div>VITE_SUPABASE_URL=YOUR_SUPABASE_URL</div>
                  <div>VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY</div>
                </div>
                
                <div className="pt-1.5 text-center">
                  <button
                    onClick={() => setShowSqlSetup(!showSqlSetup)}
                    className="text-[9px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    {showSqlSetup ? "Hide SQL Table Script" : "Show SQL Setup Script for DB Sync"}
                  </button>
                </div>

                {showSqlSetup && (
                  <pre className="p-2.5 bg-zinc-900 text-zinc-300 rounded-xl font-mono text-[8px] overflow-x-auto max-h-36 select-text">
                    {SUPABASE_SQL_SETUP}
                  </pre>
                )}
              </div>
            )}

            <form onSubmit={handleOfflineSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">What should we call you?</label>
                <input 
                  type="text" 
                  placeholder="Enter offline nickname..."
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setError("");
                  }}
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
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

        <div className="border-t border-zinc-100 dark:border-zinc-850 pt-3.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-semibold font-mono uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Practice 2000-2026 PYQs Offline</span>
        </div>
      </motion.div>
    </div>
  );
}
