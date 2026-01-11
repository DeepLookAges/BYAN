
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import Layout from './components/Layout';
import Home from './views/Home';
import Quran from './views/Quran';
import Hifz from './views/Hifz';
import Tools from './views/Tools';
import Settings from './views/Settings';
import Tafsir from './views/Tafsir';
import Auth from './views/Auth';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSurah, setSelectedSurah] = useState<number | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('byan_theme') === 'dark';
  });

  useEffect(() => {
    // مراقبة الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('byan_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('byan_theme', 'light');
    }
  }, [isDarkMode]);

  const navigateToQuran = (surahNum?: number) => {
    setSelectedSurah(surahNum);
    setActiveTab('quran');
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home onOpenQuran={navigateToQuran} />;
      case 'quran': return <Quran initialSurah={selectedSurah} />;
      case 'tafsir': return <Tafsir onOpenQuran={navigateToQuran} />;
      case 'hifz': return <Hifz />;
      case 'tools': return <Tools />;
      case 'settings': return <Settings isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
      default: return <Home onOpenQuran={navigateToQuran} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FBFDF9] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-emerald-islamic animate-spin" />
        <p className="text-emerald-islamic font-black animate-pulse">جاري التحقق من الجلسة...</p>
      </div>
    );
  }

  // إذا لم يكن هناك جلسة، نعرض صفحة Auth
  if (!session) {
    return <Auth />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
