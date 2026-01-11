
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Moon, Sparkles, RefreshCw, 
  Bed, Shield, CheckCircle2, 
  Volume2, 
  Smartphone, BookOpen,
  Play, Pause, VolumeX, Minus, Plus
} from 'lucide-react';

interface Thikr {
  id: string;
  text: string;
  count: number;
  description?: string;
  audio?: string;
}

const ATHKAR_DATA: Record<string, Thikr[]> = {
  morning: [
    { id: 'm1', text: "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1, description: "رواه مسلم" },
    { id: 'm2', text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.", count: 1 },
    { id: 'm3', text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.", count: 1 },
  ],
  evening: [
    { id: 'e1', text: "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ.", count: 1 },
    { id: 'e2', text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ المَصِيرُ.", count: 1 },
  ],
  // ... other categories
};

// Stable Athkar audio URLs
const CATEGORY_AUDIO: Record<string, string> = {
  morning: 'https://ia801004.us.archive.org/12/items/Adhkaar/Morning_Adhkaar.mp3',
  evening: 'https://ia801004.us.archive.org/12/items/Adhkaar/Evening_Adhkaar.mp3',
  sleep: 'https://ia801004.us.archive.org/12/items/Adhkaar/Morning_Adhkaar.mp3', // Placeholder
};

const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'athkar' | 'tasbih'>('athkar');
  const [athkarType, setAthkarType] = useState<string>('morning');
  const [tasbihCount, setTasbihCount] = useState(0);
  const [thikrProgress, setThikrProgress] = useState<Record<string, number>>({});
  
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('byan_athkar_volume') || 0.7));
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('byan_athkar_volume', volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.src = CATEGORY_AUDIO[athkarType] || CATEGORY_AUDIO.morning;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  };

  const handleThikrClick = (id: string, max: number) => {
    const current = thikrProgress[id] || 0;
    if (current < max) {
      setThikrProgress({ ...thikrProgress, [id]: current + 1 });
      if (navigator.vibrate) navigator.vibrate(40);
    }
  };

  const resetProgress = () => setThikrProgress({});
  const resetTasbih = () => setTasbihCount(0);

  const categories = [
    { id: 'morning', label: 'الصباح', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
    { id: 'evening', label: 'المساء', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
  ];

  return (
    <div className="page-transition space-y-8 pb-24">
      <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} hidden />
      
      <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl flex gap-2 border border-gray-100 dark:border-slate-700 shadow-sm max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('athkar')}
          className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'athkar' ? 'bg-emerald-islamic text-white shadow-lg' : 'text-gray-400'}`}
        >
          <BookOpen size={18} /> الأذكار
        </button>
        <button
          onClick={() => setActiveTab('tasbih')}
          className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'tasbih' ? 'bg-emerald-islamic text-white shadow-lg' : 'text-gray-400'}`}
        >
          <Smartphone size={18} /> المسبحة
        </button>
      </div>

      {activeTab === 'athkar' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setAthkarType(cat.id); setIsPlayingAudio(false); if(audioRef.current) audioRef.current.pause(); }}
                className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${athkarType === cat.id ? 'bg-white dark:bg-slate-800 border-emerald-islamic shadow-xl' : 'border-transparent text-gray-400'}`}
              >
                <div className={`p-3 rounded-2xl ${cat.bg} ${cat.color}`}><cat.icon size={24} /></div>
                <span className="font-black text-xs">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center px-4">
             <button onClick={toggleAudio} className={`p-4 rounded-2xl transition-all shadow-lg ${isPlayingAudio ? 'bg-amber-gold text-white' : 'bg-emerald-islamic text-white'}`}>
                {isPlayingAudio ? <Pause size={20} /> : <Play size={20} />}
             </button>
             
             <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-6 py-2.5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <button onClick={() => setVolume(v => Math.max(0, v - 0.1))}><Minus size={14} /></button>
                <Volume2 size={16} className="text-emerald-islamic" />
                <button onClick={() => setVolume(v => Math.min(1, v + 0.1))}><Plus size={14} /></button>
             </div>
          </div>

          <div className="space-y-6">
            {(ATHKAR_DATA[athkarType] || []).map((thikr) => {
              const current = thikrProgress[thikr.id] || 0;
              const isDone = current === thikr.count;
              return (
                <div key={thikr.id} onClick={() => handleThikrClick(thikr.id, thikr.count)} className={`bg-white dark:bg-slate-800 p-8 rounded-[3rem] border transition-all cursor-pointer ${isDone ? 'border-emerald-islamic bg-emerald-50/10' : 'border-gray-100 dark:border-slate-700'}`}>
                  <p className="font-amiri text-2xl text-center leading-loose">{thikr.text}</p>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-islamic text-white flex items-center justify-center font-black">{thikr.count - current}</div>
                    <span className="text-xs text-gray-400 font-bold">المتبقي</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 gap-12">
          <div className="w-64 h-64 rounded-full border-[12px] border-emerald-islamic/5 flex items-center justify-center bg-white dark:bg-slate-800 shadow-2xl">
            <span className="text-7xl font-black text-emerald-islamic">{tasbihCount}</span>
          </div>
          <button onClick={() => { setTasbihCount(prev => prev + 1); if (navigator.vibrate) navigator.vibrate(60); }} className="w-56 h-56 bg-emerald-islamic text-white rounded-full text-2xl font-black shadow-xl active:scale-95 transition-all">تسبيح</button>
          <button onClick={resetTasbih} className="text-gray-400 flex items-center gap-2"><RefreshCw size={18} /> إعادة التصفير</button>
        </div>
      )}
    </div>
  );
};

export default Tools;
