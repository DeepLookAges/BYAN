
import React, { useState, useEffect } from 'react';
import { fetchSurahs, fetchTafsirTabari } from '../services/api';
import { Surah } from '../types';
import { Search, BookCheck, ChevronLeft, ChevronRight, Hash, PlaySquare, ArrowLeft } from 'lucide-react';

interface TafsirProps {
  onOpenQuran: (surah: number) => void;
}

const Tafsir: React.FC<TafsirProps> = ({ onOpenQuran }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [tafsirData, setTafsirData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSurahs().then(setSurahs);
  }, []);

  const loadTafsir = async (surahNum: number, ayahNum: number) => {
    setLoading(true);
    try {
      const data = await fetchTafsirTabari(surahNum, ayahNum);
      setTafsirData(data.text);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      alert("عذراً، حدث خطأ في جلب التفسير.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSurah) {
      loadTafsir(selectedSurah.number, selectedAyah);
    }
  }, [selectedSurah, selectedAyah]);

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !tafsirData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-islamic border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-emerald-islamic font-bold">جاري تحميل جامع البيان...</p>
      </div>
    );
  }

  return (
    <div className="page-transition space-y-6 pb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-islamic/10 p-3 rounded-2xl text-emerald-islamic">
          <BookCheck size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">المكتبة (تفسير الطبري)</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">جامع البيان عن تأويل آي القرآن</p>
        </div>
      </div>

      {!selectedSurah ? (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="اختر السورة للبحث في تفسيرها..." 
              className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-islamic/20 focus:outline-none shadow-sm font-medium text-right transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => setSelectedSurah(surah)}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:border-emerald-islamic hover:shadow-md transition-all flex items-center justify-between text-right group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-islamic font-bold text-sm">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 group-hover:text-emerald-islamic transition-colors">{surah.name}</h3>
                    <p className="text-[10px] text-gray-400">{surah.numberOfAyahs} آية</p>
                  </div>
                </div>
                <ChevronLeft className="text-gray-300 group-hover:text-emerald-islamic transition-colors" size={18} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <button 
              onClick={() => { setSelectedSurah(null); setTafsirData(null); }}
              className="flex items-center gap-2 text-gray-500 hover:text-emerald-islamic font-bold transition-colors"
            >
              <ArrowLeft size={18} /> العودة للفهرس
            </button>

            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-emerald-islamic font-amiri">{selectedSurah.name}</h3>
              <div className="h-6 w-px bg-gray-100 dark:bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-500">الآية</span>
                <select 
                  className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-1 font-bold text-emerald-islamic focus:outline-none"
                  value={selectedAyah}
                  onChange={(e) => setSelectedAyah(Number(e.target.value))}
                >
                  {Array.from({ length: selectedSurah.numberOfAyahs }).map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={() => onOpenQuran(selectedSurah.number)}
              className="bg-emerald-islamic text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none hover:scale-105 transition-all"
            >
              <PlaySquare size={18} /> عرض في المصحف
            </button>
          </div>

          {/* Tafsir Content Card */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button 
                  disabled={selectedAyah === 1}
                  onClick={() => setSelectedAyah(prev => prev - 1)}
                  className="p-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:text-emerald-islamic transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <span className="font-bold text-gray-400 text-xs">التنقل بين الآيات</span>
                <button 
                  disabled={selectedAyah === selectedSurah.numberOfAyahs}
                  onClick={() => setSelectedAyah(prev => prev + 1)}
                  className="p-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:text-emerald-islamic transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">مجلد جامع البيان</div>
            </div>

            <div className="p-8 md:p-14 text-right dir-rtl">
              {loading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-3 border-emerald-islamic border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div 
                  className="prose prose-emerald dark:prose-invert max-w-none text-gray-700 dark:text-slate-200 leading-loose font-medium text-xl md:text-2xl font-amiri space-y-6 tafsir-rich-text"
                  dangerouslySetInnerHTML={{ __html: tafsirData || '' }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tafsir-rich-text p {
          margin-bottom: 2rem;
          text-align: justify;
        }
        .tafsir-rich-text h3 {
          color: #047857;
          font-weight: bold;
          font-size: 1.5rem;
          margin-top: 3rem;
          border-right: 4px solid #047857;
          padding-right: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Tafsir;
