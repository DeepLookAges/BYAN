
import React from 'react';
import { Home, BookOpen, Trophy, Compass, Settings, BookCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'quran', icon: BookOpen, label: 'القرآن' },
    { id: 'tafsir', icon: BookCheck, label: 'التفسير' },
    { id: 'hifz', icon: Trophy, label: 'الحفظ' },
    { id: 'tools', icon: Compass, label: 'الأذكار' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFDF9] dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-islamic p-1.5 rounded-lg shadow-sm">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-emerald-islamic tracking-wider">بَيَان</h1>
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-12 md:pr-64 max-w-7xl mx-auto w-full px-4 pt-6 text-gray-800 dark:text-slate-200">
        {children}
      </main>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col fixed right-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-l border-gray-100 dark:border-slate-700 pt-20 transition-colors">
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-islamic text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon size={20} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex justify-around items-center p-2 z-50 transition-colors">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              activeTab === item.id ? 'text-emerald-islamic' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 py-6 px-4 text-center transition-colors">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          جميع الحقوق محفوظة &copy; 2026
        </p>
        <p className="mt-1 font-medium">
          <span className="text-gray-500 dark:text-gray-400">تم التطوير والتصميم بواسطة </span>
          <a 
            href="https://hamzahub.shop" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-islamic hover:text-amber-gold transition-colors font-bold"
          >
            HAMZA Hilal
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Layout;
