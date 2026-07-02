import { createClient } from "@supabase/supabase-js";
import { TestResult, ActiveTestState } from "../types";

// Grab variables from Vite env safely
const rawUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || "").trim();
const rawKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "").trim();

// Clean up double quotes if the user entered them in AI Studio Secrets
const supabaseUrl = rawUrl.replace(/^["']|["']$/g, "").trim();
const supabaseAnonKey = rawKey.replace(/^["']|["']$/g, "").trim();

const isValidHttpUrl = (str: string) => {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  isValidHttpUrl(supabaseUrl)
);

// Initialize the Supabase client safely
const getSupabaseClient = () => {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Supabase client initialization failed:", e);
    return null;
  }
};

export const supabase = getSupabaseClient();

export interface SupabaseUserProfile {
  username: string;
  test_history: TestResult[];
  bookmarks: string[];
  mistake_notes: Record<string, string>;
  active_test_session: ActiveTestState | null;
}

/**
 * Fetch a user profile from Supabase.
 * Tries the 'testify_user_profiles' table first, falling back to auth user metadata.
 */
export async function fetchUserProfile(userId: string): Promise<SupabaseUserProfile | null> {
  if (!supabase) return null;

  // 1. Try reading from custom table
  try {
    const { data, error } = await supabase
      .from("testify_user_profiles")
      .select("username, test_history, bookmarks, mistake_notes, active_test_session")
      .eq("id", userId)
      .single();

    if (!error && data) {
      return {
        username: data.username || "Student",
        test_history: Array.isArray(data.test_history) ? data.test_history : [],
        bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : [],
        mistake_notes: typeof data.mistake_notes === "object" && data.mistake_notes !== null ? data.mistake_notes : {},
        active_test_session: data.active_test_session || null,
      };
    }
  } catch (e) {
    console.warn("Table testify_user_profiles fetch skipped or failed, falling back to User Metadata:", e);
  }

  // 2. Fallback: read from auth user metadata
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user && user.user_metadata?.user_data) {
      const meta = user.user_metadata.user_data;
      return {
        username: user.user_metadata.username || "Student",
        test_history: Array.isArray(meta.test_history) ? meta.test_history : [],
        bookmarks: Array.isArray(meta.bookmarks) ? meta.bookmarks : [],
        mistake_notes: typeof meta.mistake_notes === "object" && meta.mistake_notes !== null ? meta.mistake_notes : {},
        active_test_session: meta.active_test_session || null,
      };
    } else if (user) {
      // Return metadata-level username if metadata is present but user_data is empty
      return {
        username: user.user_metadata?.username || "Student",
        test_history: [],
        bookmarks: [],
        mistake_notes: {},
        active_test_session: null,
      };
    }
  } catch (e) {
    console.error("Failed to fetch from user metadata fallback:", e);
  }

  return null;
}

/**
 * Save user profile state to Supabase.
 * Saves to BOTH the custom table and Auth User Metadata for robust cloud backup.
 */
export async function saveUserProfile(userId: string, data: SupabaseUserProfile): Promise<boolean> {
  if (!supabase) return false;

  let success = false;

  // 1. Try custom table
  try {
    const { error } = await supabase
      .from("testify_user_profiles")
      .upsert({
        id: userId,
        username: data.username,
        test_history: data.test_history,
        bookmarks: data.bookmarks,
        mistake_notes: data.mistake_notes,
        active_test_session: data.active_test_session,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      success = true;
    }
  } catch (e) {
    console.warn("Table testify_user_profiles upsert skipped or failed:", e);
  }

  // 2. Save to User Metadata (as secure fallback and automatic syncing)
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        username: data.username,
        user_data: {
          test_history: data.test_history,
          bookmarks: data.bookmarks,
          mistake_notes: data.mistake_notes,
          active_test_session: data.active_test_session,
        }
      }
    });

    if (!error) {
      success = true;
    }
  } catch (e) {
    console.error("Failed to update user metadata fallback:", e);
  }

  return success;
}

// SQL Script description for copy-pasting into Supabase SQL editor
export const SUPABASE_SQL_SETUP = `
-- Run this SQL query in your Supabase SQL Editor to create the profiles table with RLS rules:

CREATE TABLE IF NOT EXISTS public.testify_user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  test_history JSONB DEFAULT '[]'::jsonb,
  bookmarks JSONB DEFAULT '[]'::jsonb,
  mistake_notes JSONB DEFAULT '{}'::jsonb,
  active_test_session JSONB DEFAULT 'null'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.testify_user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for Users to view & modify their own data
CREATE POLICY "Users can view own profile" 
  ON public.testify_user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.testify_user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.testify_user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
`;
