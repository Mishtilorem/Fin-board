'use client';

import { Moon, Sun } from 'lucide-react';
import useDashboardStore from '@/store/dashboardStore';

export default function ThemeToggle() {
  const theme = useDashboardStore((state) => state.theme);
  const setTheme = useDashboardStore((state) => state.setTheme);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 hover:from-cyan-200 hover:to-blue-200 dark:hover:from-cyan-800/50 dark:hover:to-blue-800/50 transition-all backdrop-blur-sm border-2 border-cyan-300/50 dark:border-cyan-700/50 shadow-md"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="text-amber-400 dark:text-amber-300" size={20} /> : <Moon className="text-cyan-700 dark:text-cyan-300" size={20} />}
    </button>
  );
}
