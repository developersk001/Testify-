import React, { useState } from "react";
import { 
  User, 
  Settings, 
  Trash2, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  RefreshCw, 
  Check, 
  AlertTriangle,
  LogOut,
  Mail
} from "lucide-react";

interface SettingsPageProps {
  username: string;
  onUpdateUsername: (name: string) => void;
  onResetApp: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isSupabaseUser?: boolean;
  supabaseEmail?: string;
  onSignOut?: () => void;
}

export default function SettingsPage({
  username,
  onUpdateUsername,
  onResetApp,
  darkMode,
  onToggleDarkMode,
  isSupabaseUser = false,
  supabaseEmail,
  onSignOut
}: SettingsPageProps) {
  
  const [nameInput, setNameInput] = useState(username);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; msg?: string }>({});

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateUsername(nameInput.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Full backup exporter
  const handleExportData = () => {
    try {
      const backup: Record<string, string | null> = {};
      const keysToBackup = [
        "testify_username",
        "testify_user_profile",
        "testify_test_history",
        "testify_bookmarks",
        "testify_mistake_notes",
        "testify_imported_questions"
      ];

      keysToBackup.forEach(k => {
        backup[k] = localStorage.getItem(k);
      });

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "Testify_SaaS_Backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (e) {
      console.error("Backup failed:", e);
    }
  };

  // Import parser
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (typeof json !== "object") throw new Error("Invalid structure");

        Object.entries(json).forEach(([key, val]) => {
          if (val && typeof val === "string") {
            localStorage.setItem(key, val);
          }
        });

        setImportStatus({ success: true, msg: "Data backup restored successfully! Reloading..." });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setImportStatus({ success: false, msg: "Invalid backup file configuration." });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 text-zinc-900 dark:text-zinc-100">
      
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-sm text-zinc-500">Configure profile, import mock databases, or manage local backup repositories.</p>
      </div>

      <div className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-50 dark:border-zinc-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm">Student Profile</h3>
            </div>
            {isSupabaseUser && onSignOut && (
              <button 
                onClick={onSignOut}
                className="px-3 py-1.5 border border-red-200 dark:border-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out from Cloud</span>
              </button>
            )}
          </div>

          {isSupabaseUser && supabaseEmail && (
            <div className="flex items-center gap-2 text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200/45 dark:border-zinc-850 max-w-lg">
              <Mail className="w-4 h-4 text-blue-500" />
              <div className="space-y-0.5">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Cloud Connected Account</div>
                <div className="font-semibold text-zinc-700 dark:text-zinc-300">{supabaseEmail}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row items-end gap-3 max-w-lg">
            <div className="flex-1 space-y-1 text-left w-full">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-1">Change Display Name</label>
              <input 
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Edit nickname..."
                className="w-full border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-4 py-2.5 rounded-2xl text-xs font-semibold outline-none focus:border-blue-500 text-zinc-900 dark:text-white"
                maxLength={20}
              />
            </div>
            <button 
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{saveSuccess ? "Saved!" : "Save Changes"}</span>
            </button>
          </form>
        </div>

        {/* Visual Theming */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-50 dark:border-zinc-800">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm">Application Interface</h3>
          </div>

          <div className="flex items-center justify-between max-w-md">
            <div>
              <h4 className="font-bold text-xs">Visual Dark Theme</h4>
              <p className="text-[10px] text-zinc-500">Enable comfortable nighttime viewing controls.</p>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Data backup / Restore */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-50 dark:border-zinc-800">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm">Backup & Restore</h3>
          </div>

          <div className="space-y-4 max-w-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleExportData}
                className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-zinc-500" />
                <span>Export Profile Backup</span>
              </button>

              <label className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4 text-zinc-500" />
                <span>Restore Profile Backup</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportData} 
                  className="hidden" 
                />
              </label>
            </div>

            {importStatus.msg && (
              <p className={`text-[10px] font-bold ${importStatus.success ? "text-emerald-600" : "text-red-500"}`}>
                {importStatus.msg}
              </p>
            )}
          </div>
        </div>

        {/* Factory Reset */}
        <div className="bg-red-500/5 border border-red-100 dark:border-red-950/25 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-red-200/30">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-sm text-red-700 dark:text-red-400">Danger Zone</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
              Resetting deletes all local activity statistics, mock reports, bookmarks, custom questions, and streaks. This is irreversible.
            </p>

            {showResetConfirm ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Are you completely sure?
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={onResetApp}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                  >
                    Yes, Hard Reset
                  </button>
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl text-red-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hard Reset Application</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
