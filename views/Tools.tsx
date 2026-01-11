
import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Sparkles, RefreshCw, 
  Bed, Shield, CheckCircle2, 
  ChevronRight, ArrowLeft, Volume2, 
  Smartphone, BellRing, BookOpen
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
    { id: 'm3', text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.", count: 1, description: "من قاله حين يصبح وحين يمسي كفتاه" },
    { id: 'm4', text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.", count: 3 },
    { id: 'm5', text: "اللَّهُمَّ عافِني في بَدَني، اللَّهُمَّ عافِني في سَمْعي، اللَّهُمَّ عافِني في بَصَري، لا إلهَ إلَّا أنتَ.", count: 3 },
    { id: 'm6', text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ.", count: 100, description: "حطت خطاياه وإن كانت مثل زبد البحر" },
  ],
  evening: [
    { id: 'e1', text: "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ.", count: 1 },
    { id: 'e2', text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ المَصِيرُ.", count: 1 },
    { id: 'e3', text: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", count: 3, description: "لم تضره حمة تلك الليلة" },
    { id: 'e4', text: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة.", count: 1 },
  ],
  sleep: [
    { id: 's1', text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.", count: 1 },
    { id: 's2', text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.", count: 3 },
    { id: 's3', text: "سُبْحَانَ اللَّهِ (33)، الْحَمْدُ لِلَّهِ (33)، اللَّهُ أَكْبَرُ (34).", count: 1, description: "من قالها قبل النوم كفتاه" },
  ],
  after_prayer: [
    { id: 'a1', text: "أستغفر الله (3 مرات)، اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام.", count: 1 },
    { id: 'a2', text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.", count: 1 },
    { id: 'a3', text: "سُبْحَانَ اللَّهِ.", count: 33 },
    { id: 'a4', text: "الْحَمْدُ لِلَّهِ.", count: 33 },
    { id: 'a5', text: "اللَّهُ أَكْبَرُ.", count: 33 },
  ]
};

const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'athkar' | 'tasbih'>('athkar');
  const [athkarType, setAthkarType] = useState<string>('morning');
  const [tasbihCount, setTasbihCount] = useState(0);
  const [thikrProgress, setThikrProgress] = useState<Record<string, number>>({});

  const handleThikrClick = (id: string, max: number) => {
    const current = thikrProgress[id] || 0;
    if (current < max) {
      setThikrProgress({ ...thikrProgress, [id]: current + 1 });
      if (navigator.vibrate) navigator.vibrate(40);
      
      // If just finished
      if (current + 1 === max) {
        // Optional: Play subtle sound
      }
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
    <div className="page-transition space-y-8 pb-24">
      {/* Premium Tab Switcher */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl flex gap-2 border border-gray-100 dark:border-slate-700 shadow-sm max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('athkar')}
          className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'athkar' 
            ? 'bg-emerald-islamic text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
            : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <BookOpen size={18} /> الأذكار اليومية
        </button>
        <button
          onClick={() => setActiveTab('tasbih')}
          className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tasbih' 
            ? 'bg-emerald-islamic text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
            : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <Smartphone size={18} /> المسبحة الإلكترونية
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
                  ? `bg-white dark:bg-slate-800 border-emerald-islamic shadow-xl shadow-emerald-50 dark:shadow-none scale-105` 
                  : `bg-white dark:bg-slate-800 border-transparent hover:border-gray-100 dark:hover:border-slate-700 text-gray-400`
                }`}
              >
                <div className={`p-3 rounded-2xl ${cat.bg} ${cat.color}`}>
                  <cat.icon size={24} />
                </div>
                <span className="font-black text-xs">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center px-4">
             <h3 className="font-black text-emerald-islamic flex items-center gap-2">
               <Sparkles size={18} /> {categories.find(c => c.id === athkarType)?.label}
             </h3>
             <button 
              onClick={resetProgress}
              className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-bold"
             >
               إعادة تعيين الكل <RefreshCw size={14} />
             </button>
          </div>

          <div className="space-y-6 px-1">
            {ATHKAR_DATA[athkarType].map((thikr) => {
              const current = thikrProgress[thikr.id] || 0;
              const isDone = current === thikr.count;
              const progress = (current / thikr.count) * 100;

              return (
                <div 
                  key={thikr.id} 
                  onClick={() => handleThikrClick(thikr.id, thikr.count)}
                  className={`bg-white dark:bg-slate-800 p-8 rounded-[3rem] border transition-all cursor-pointer relative overflow-hidden group select-none shadow-sm hover:shadow-md ${
                    isDone 
                    ? 'border-emerald-islamic ring-4 ring-emerald-50 dark:ring-emerald-900/10' 
                    : 'border-gray-100 dark:border-slate-700 active:scale-[0.98]'
                  }`}
                >
                  {/* Progress Background */}
                  <div 
                    className="absolute bottom-0 right-0 h-1.5 bg-emerald-islamic/20 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>

                  <div className="flex flex-col gap-6 text-center">
                    <div className="relative">
                      <p className="font-amiri text-2xl md:text-3xl leading-[2] text-gray-800 dark:text-slate-100">
                        {thikr.text}
                      </p>
                      {isDone && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-islamic/10 opacity-40">
                          <CheckCircle2 size={120} />
                        </div>
                      )}
                    </div>

                    {thikr.description && (
                      <p className="text-[10px] text-gray-400 font-bold bg-gray-50 dark:bg-slate-900/50 py-2 px-4 rounded-xl self-center border border-gray-100 dark:border-slate-700">
                        {thikr.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDone ? 'bg-emerald-islamic text-white' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-islamic'}`}>
                            {isDone ? <CheckCircle2 size={24} /> : <span className="font-black text-xl">{thikr.count - current}</span>}
                         </div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المتبقي</span>
                      </div>
                      
                      <div className="text-right">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">الإجمالي</span>
                         <span className="font-black text-emerald-islamic">{thikr.count} مرّات</span>
                      </div>
                    </div>
                  </div>

                  {/* Ripple Effect Indicator */}
                  {!isDone && (
                    <div className="absolute top-4 left-4 text-emerald-islamic opacity-0 group-hover:opacity-20 transition-opacity">
                      <Volume2 size={24} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Tasbih View */
        <div className="flex flex-col items-center justify-center py-12 gap-12 max-w-md mx-auto">
          <div className="text-center space-y-4">
             <h3 className="text-3xl font-black text-gray-800 dark:text-slate-100">المسبحة</h3>
             <p className="text-gray-400 font-bold text-sm">"ألا بذكر الله تطمئن القلوب"</p>
          </div>

          <div className="relative group">
            <div className="w-72 h-72 rounded-full border-[12px] border-emerald-islamic/5 dark:border-emerald-900/10 flex items-center justify-center relative bg-white dark:bg-slate-800 shadow-2xl transition-all">
              <div className="text-center">
                <span className="text-7xl font-black text-emerald-islamic block leading-none">{tasbihCount}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-4 block">ذكرت الله</span>
              </div>
              
              <div className="absolute inset-6 rounded-full border-2 border-dashed border-emerald-islamic/20 animate-[spin_30s_linear_infinite]"></div>
              
              {/* Reset inside ring */}
              <button 
                onClick={resetTasbih}
                className="absolute -top-4 right-8 bg-white dark:bg-slate-800 p-4 rounded-full shadow-xl text-gray-300 hover:text-red-500 transition-all active:scale-90 border border-gray-100 dark:border-slate-700"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          </div>

          <button 
            onClick={() => {
              setTasbihCount(prev => prev + 1);
              if (navigator.vibrate) navigator.vibrate(60);
            }}
            className="w-56 h-56 bg-emerald-islamic text-white rounded-full text-2xl font-black shadow-[0_20px_50px_rgba(4,120,87,0.3)] flex flex-col items-center justify-center active:scale-90 transition-all select-none group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
            <Smartphone size={32} className="mb-3 opacity-60" />
            <span>تسبيح</span>
          </button>
          
          <div className="grid grid-cols-3 gap-4 w-full px-4">
             {[33, 99, 1000].map(val => (
               <button 
                key={val}
                onClick={() => setTasbihCount(val)}
                className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl text-xs font-black text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-islamic transition-all"
               >
                 {val}
               </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
