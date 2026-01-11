
import React, { useState } from 'react';
import { Sun, Moon, Sparkles, RefreshCw } from 'lucide-react';

const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'athkar' | 'tasbih'>('athkar');
  const [athkarType, setAthkarType] = useState<'morning' | 'evening'>('morning');
  const [count, setCount] = useState(0);

  const morningAthkar = [
    { text: "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", count: 1 },
    { text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.", count: 1 },
    { text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.", count: 1 },
    { text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ.", count: 100 },
  ];

  const eveningAthkar = [
    { text: "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ.", count: 1 },
    { text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ المَصِيرُ.", count: 1 },
    { text: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", count: 3 },
  ];

  const handleTasbih = () => {
    setCount(prev => prev + 1);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="page-transition space-y-6">
      {/* Tab Switcher */}
      <div className="bg-white p-1.5 rounded-2xl flex gap-1 border border-gray-100 shadow-sm max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('athkar')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'athkar' ? 'bg-emerald-islamic text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          الأذكار
        </button>
        <button
          onClick={() => setActiveTab('tasbih')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'tasbih' ? 'bg-emerald-islamic text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          المسبحة
        </button>
      </div>

      {activeTab === 'athkar' ? (
        <div className="space-y-6">
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setAthkarType('morning')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold border transition-all ${
                athkarType === 'morning' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              <Sun size={20} /> أذكار الصباح
            </button>
            <button 
              onClick={() => setAthkarType('evening')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold border transition-all ${
                athkarType === 'evening' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              <Moon size={20} /> أذكار المساء
            </button>
          </div>

          <div className="space-y-4">
            {(athkarType === 'morning' ? morningAthkar : eveningAthkar).map((thikr, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <p className="font-amiri text-2xl leading-relaxed text-gray-800 text-center">
                  {thikr.text}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-emerald-islamic font-bold bg-emerald-50 px-3 py-1 rounded-lg text-sm">التكرار: {thikr.count}</span>
                  <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-islamic hover:border-emerald-islamic transition-colors">
                    <Sparkles size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-12">
          <div className="relative">
            <div className="w-64 h-64 rounded-full border-8 border-emerald-islamic/10 flex items-center justify-center relative bg-white shadow-inner">
              <span className="text-6xl font-bold text-gray-800">{count}</span>
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-emerald-islamic/20 animate-[spin_20s_linear_infinite]"></div>
            </div>
            
            {/* Action Buttons Around */}
            <button 
              onClick={() => setCount(0)}
              className="absolute -top-4 -right-4 bg-white p-4 rounded-full shadow-lg text-gray-400 hover:text-red-500 transition-colors"
            >
              <RefreshCw size={24} />
            </button>
          </div>

          <button 
            onClick={handleTasbih}
            className="w-48 h-48 bg-emerald-islamic text-white rounded-full text-2xl font-bold shadow-2xl shadow-emerald-200 flex items-center justify-center active:scale-95 transition-transform select-none"
          >
            اضغط للتسبيح
          </button>
          
          <div className="text-center text-gray-400 font-medium">
            <p>"ألا بذكر الله تطمئن القلوب"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
