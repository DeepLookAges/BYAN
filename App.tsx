
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './views/Home';
import Quran from './views/Quran';
import Hifz from './views/Hifz';
import Tools from './views/Tools';
import Settings from './views/Settings';
import Tafsir from './views/Tafsir';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSurah, setSelectedSurah] = useState<number | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('byan_theme') === 'dark';
  });

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

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
