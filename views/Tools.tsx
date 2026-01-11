
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Moon, Sparkles, RefreshCw, 
  Bed, Shield, CheckCircle2, 
  Volume2, 
  Smartphone, BookOpen,
  Play, Pause, VolumeX, Minus, Plus, AlertCircle
} from 'lucide-react';

interface Thikr {
  id: string;
  text: string;
  count: number;
  description?: string;
}

const ATHKAR_DATA: Record<string, Thikr[]> = {
  morning: [
    { id: 'm1', text: "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1, description: "رواه مسلم" },
    { id: 'm2', text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.", count: 1 },
    { id: 'm3', text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.", count: 1 },
    { id: 'm4', text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.", count: 3 },
  ],
  evening: [
    { id: 'e1', text: "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ.", count: 1 },
    { id: 'e2', text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ المَصِيرُ.", count: 1 },
    { id: 'e3', text: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", count: 3 },
  ],
  sleep: [
    { id: 's1', text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا.", count: 1 },
    { id: 's2', text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.", count: 3 },
  ],
  after_prayer: [
    { id: 'a1', text: "أستغفر الله (3 مرات)، اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام.", count: 1 },
    { id: 'a2', text: "سُبْحَانَ اللَّهِ (33)، الْحَمْدُ لِلَّهِ (33)، اللَّهُ أَكْبَرُ (33).", count: 1 },
  ]
};

// روابط صوتية مباشرة للأذكار تدعم التشغيل في المتصفح بكفاءة
const CATEGORY_AUDIO: Record<string, string> = {
  morning: 'https://islamic-content.com/storage/adhkar/morning.mp3',
  evening: 'https://islamic-content.com/storage/adhkar/evening.mp3',
  sleep: 'https://islamic-content.com/storage/adhkar/sleep.mp3',
  after_prayer: 'https://islamic-content.com/storage/adhkar/morning.mp3'
};

const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'athkar' | 'tasbih'>('athkar');
  const [athkarType, setAthkarType] = useState<string>('morning');
  const [tasbihCount, setTasbihCount] = useState(0);
  const [thikrProgress, setThikrProgress] = useState<Record<string, number>>({});
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('byan_athkar_volume') || 0.7));
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('byan_athkar_volume', volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // إيقاف الصوت وتطهير المصدر عند تغيير التصنيف
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
      setAudioError(null);
    }
  }, [athkarType]);

  const toggleAudio = async () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      setAudioError(null);
      const source = CATEGORY_AUDIO[athkarType] || CATEGORY_AUDIO.morning;
      
      try {
        // نتحقق مما إذا كان المصدر قد تغير بالفعل قبل إعادة التحميل
        if (audioRef.current.src !== source) {
           audioRef.current.src = source;
           await audioRef.current.load();
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlayingAudio(true);
        }
      } catch (error) {
        // AbortError يحدث عادة عند تغيير المصدر بسرعة
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Audio playback error:", error);
          setAudioError("فشل تشغيل الصوت. قد يكون المصدر غير متاح حالياً.");
          setIsPlayingAudio(false);
        }
      }
    }
  };

  const handleThikrClick = (id: string, max: number) => {
    const current = thikrProgress[id] || 0;
    if (current < max) {
      setThikrProgress({ ...thikrProgress, [id]: current + 1 });
      if (navigator.vibrate) navigator.vibrate(40);
    }
  };

  const resetProgress = () => {
    setThikrProgress({});
  };

  const resetTasbih = () => {
    setTasbihCount(0);
  };

  const categories = [
    { id: 'morning', label: 'الصباح', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
    { id: 'evening', label: 'المساء', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
    { id: 'sleep', label: 'النوم', icon: Bed, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
    { id: 'after_prayer', label: 'بعد الصلاة', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  ];

  return (
    <div className="page-transition space-y-8 pb-24 max-w-4xl mx-auto">
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlayingAudio(false)} 
        onError={() => setAudioError("خطأ في تحميل ملف الصوت")}
        hidden 
      />
      
      {/* Tab Switcher */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl flex gap-2 border border-gray-100 dark:border-slate-700 shadow-sm max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('athkar')}
          className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'athkar' ? 'bg-emerald-islamic text-white shadow-lg' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <BookOpen size={18} /> الأذكار
        </button>
        <button
          onClick={() => setActiveTab('tasbih')}
          className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tasbih' ? 'bg-emerald-islamic text-white shadow-lg' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Smartphone size={18} /> المسبحة
        </button>
      </div>

      {activeTab === 'athkar' ? (
        <div className="space-y-8">
          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAthkarType(cat.id)}
                className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                  athkarType === cat.id 
                  ? 'bg-white dark:bg-slate-800 border-emerald-islamic shadow-xl scale-105' 
                  : 'bg-white dark:bg-slate-800 border-transparent text-gray-400'
                }`}
              >
                <div className={`p-3 rounded-2xl ${cat.bg} ${cat.color}`}>
                  <cat.icon size={24} />
                </div>
                <span className="font-black text-xs">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center px-4 gap-4 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
             <div className="flex items-center gap-4 w-full md:w-auto">
               <button 
                onClick={toggleAudio} 
                className={`p-5 rounded-2xl transition-all shadow-lg active:scale-95 ${
                  isPlayingAudio ? 'bg-amber-gold text-white' : 'bg-emerald-islamic text-white hover:bg-emerald-600'
                }`}
                title="تشغيل صوتي"
               >
                  {isPlayingAudio ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
               </button>
               <div>
                  <h3 className="font-black text-gray-800 dark:text-slate-100">{categories.find(c => c.id === athkarType)?.label}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">تلاوة صوتية مرشدة</p>
               </div>
             </div>
             
             <div className="flex items-center gap-4 w-full md:w-auto bg-gray-50 dark:bg-slate-900 px-6 py-3 rounded-2xl">
                <button onClick={() => setVolume(v => Math.max(0, v - 0.1))} className="text-gray-400 hover:text-emerald-islamic"><Minus size={14} /></button>
                <div className="flex items-center gap-2 min-w-[80px] justify-center">
                  <Volume2 size={16} className="text-emerald-islamic" />
                  <span className="text-xs font-black text-gray-500">{Math.round(volume * 100)}%</span>
                </div>
                <button onClick={() => setVolume(v => Math.min(1, v + 0.1))} className="text-gray-400 hover:text-emerald-islamic"><Plus size={14} /></button>
             </div>

             <button 
              onClick={resetProgress}
              className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-bold"
             >
               إعادة تعيين الأذكار <RefreshCw size={14} />
             </button>
          </div>

          {audioError && (
            <div className="mx-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold animate-in fade-in">
              <AlertCircle size={18} />
              <span>{audioError}</span>
            </div>
          )}

          {/* Athkar List */}
          <div className="space-y-6 px-1">
            {(ATHKAR_DATA[athkarType] || []).map((thikr) => {
              const current = thikrProgress[thikr.id] || 0;
              const isDone = current === thikr.count;
              
              return (
                <div 
                  key={thikr.id} 
                  onClick={() => handleThikrClick(thikr.id, thikr.count)}
                  className={`bg-white dark:bg-slate-800 p-8 rounded-[3rem] border transition-all cursor-pointer relative overflow-hidden group select-none shadow-sm ${
                    isDone 
                    ? 'border-emerald-islamic ring-4 ring-emerald-50 dark:ring-emerald-900/10' 
                    : 'border-gray-100 dark:border-slate-700 hover:border-emerald-islamic/30'
                  }`}
                >
                  <p className="font-amiri text-2xl md:text-3xl text-center leading-loose text-gray-800 dark:text-slate-100">
                    {thikr.text}
                  </p>
                  
                  {thikr.description && (
                    <p className="mt-4 text-[10px] text-gray-400 font-bold text-center italic">{thikr.description}</p>
                  )}

                  <div className="mt-8 flex justify-between items-center border-t border-gray-50 dark:border-slate-700/50 pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${isDone ? 'bg-emerald-islamic text-white' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-islamic'}`}>
                        {thikr.count - current}
                      </div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">المتبقي</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">العدد الكلي</span>
                       <span className="font-black text-emerald-islamic">{thikr.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Tasbih View */
        <div className="flex flex-col items-center justify-center py-12 gap-12 max-w-md mx-auto">
          <div className="w-72 h-72 rounded-full border-[12px] border-emerald-islamic/5 dark:border-emerald-950/20 flex items-center justify-center bg-white dark:bg-slate-800 shadow-2xl relative">
            <div className="text-center">
              <span className="text-7xl font-black text-emerald-islamic block leading-none">{tasbihCount}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 block">عدد التسبيحات</span>
            </div>
            <button 
              onClick={resetTasbih}
              className="absolute -top-4 right-8 bg-white dark:bg-slate-800 p-4 rounded-full shadow-xl text-gray-300 hover:text-red-500 transition-all border border-gray-100 dark:border-slate-700"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          <button 
            onClick={() => {
              setTasbihCount(prev => prev + 1);
              if (navigator.vibrate) navigator.vibrate(60);
            }}
            className="w-56 h-56 bg-emerald-islamic text-white rounded-full text-2xl font-black shadow-2xl shadow-emerald-200 dark:shadow-none active:scale-90 transition-all flex items-center justify-center select-none"
          >
            اضغط للتسبيح
          </button>
        </div>
      )}
    </div>
  );
};

export default Tools;
