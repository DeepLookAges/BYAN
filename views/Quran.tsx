
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchSurahs, fetchSurahDetail, fetchTafsirTabari, fetchTajweedData } from '../services/api';
import { Surah, Ayah } from '../types';
import { 
  Play, Pause, Bookmark, Info, ChevronRight, Search, 
  BookOpen, Settings2, Minus, Plus, X, Sparkles, BookCheck, AlertCircle 
} from 'lucide-react';

interface AyahWithAudio extends Ayah {
  audio: string;
  audioSecondary: string[];
}

const TAJWEED_COLORS = {
  madd: '#ef4444',      // Red (p)
  ghunnah: '#059669',   // Emerald/Green (h, i, k)
  qalqalah: '#2563eb',  // Blue (s)
  iqlab: '#9333ea',     // Purple (j)
  normal: 'inherit'
};

const TAJWEED_LEGEND = [
  { color: TAJWEED_COLORS.madd, label: 'المدود', desc: 'إطالة الصوت بالحرف (4-6 حركات)' },
  { color: TAJWEED_COLORS.ghunnah, label: 'غنة/إخفاء', desc: 'صوت يخرج من الأنف (حركتان)' },
  { color: TAJWEED_COLORS.qalqalah, label: 'قلقلة', desc: 'اضطراب في الحرف الساكن (قطب جد)' },
  { color: TAJWEED_COLORS.iqlab, label: 'إقلاب', desc: 'قلب النون ميماً عند الباء' },
];

const Quran: React.FC<{ initialSurah?: number }> = ({ initialSurah }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(initialSurah || null);
  const [surahContent, setSurahContent] = useState<{ surah: Surah; ayahs: AyahWithAudio[] } | null>(null);
  const [tajweedAyahs, setTajweedAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tafsir, setTafsir] = useState<{ text: string; ayah: number; surahName: string } | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [activeAyahId, setActiveAyahId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('byan_quran_font_size');
    return saved ? parseInt(saved) : 34;
  });
  const [lineHeight, setLineHeight] = useState(() => {
    const saved = localStorage.getItem('byan_quran_line_height');
    return saved ? parseFloat(saved) : 2.5;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSurahs().then(setSurahs);
  }, []);

  useEffect(() => {
    localStorage.setItem('byan_quran_font_size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    if (selectedSurah) {
      loadSurah(selectedSurah);
    }
  }, [selectedSurah]);

  const loadSurah = async (num: number) => {
    setLoading(true);
    setAudioError(null);
    try {
      const [detail, tajweed] = await Promise.all([
        fetchSurahDetail(num),
        fetchTajweedData(num)
      ]);
      setSurahContent({ surah: detail, ayahs: detail.ayahs });
      setTajweedAyahs(tajweed);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Load Surah error:", err);
    } finally {
      setLoading(false);
    }
  };

  const pages = useMemo(() => {
    if (!surahContent) return [];
    const grouped: Record<number, AyahWithAudio[]> = {};
    surahContent.ayahs.forEach(ayah => {
      if (!grouped[ayah.page]) grouped[ayah.page] = [];
      grouped[ayah.page].push(ayah);
    });
    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
  }, [surahContent]);

  const activeAyahData = useMemo(() => {
    if (!surahContent || activeAyahId === null) return null;
    return surahContent.ayahs.find(a => a.number === activeAyahId);
  }, [surahContent, activeAyahId]);

  const showTafsir = async (ayah: Ayah) => {
    if (!selectedSurah || !surahContent) return;
    try {
      setLoading(true);
      const data = await fetchTafsirTabari(selectedSurah, ayah.numberInSurah);
      setTafsir({ 
        text: data.text, 
        ayah: ayah.numberInSurah, 
        surahName: surahContent.surah.name 
      });
      setActiveAyahId(ayah.number); // Highlight in reading view
    } catch (error) {
      console.error("Tafsir error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = (ayah: AyahWithAudio) => {
    if (!audioRef.current) return;
    setAudioError(null);

    if (playingAyah === ayah.number) {
      audioRef.current.pause();
      setPlayingAyah(null);
    } else {
      if (!ayah.audio) {
        setAudioError("رابط الصوت غير متوفر لهذه الآية.");
        return;
      }
      
      audioRef.current.pause();
      audioRef.current.src = ayah.audio;
      audioRef.current.load();
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingAyah(ayah.number);
            setActiveAyahId(ayah.number);
          })
          .catch(err => {
            console.error("Ayah play error:", err);
            setAudioError("حدث خطأ أثناء تحميل الصوت. قد يكون المصدر غير متاح.");
            setPlayingAyah(null);
          });
      }
    }
  };

  const onAudioEnded = () => {
    if (!surahContent || playingAyah === null) return;
    const currentIndex = surahContent.ayahs.findIndex(a => a.number === playingAyah);
    if (currentIndex !== -1 && currentIndex < surahContent.ayahs.length - 1) {
      toggleAudio(surahContent.ayahs[currentIndex + 1]);
    } else {
      setPlayingAyah(null);
    }
  };

  const renderColoredAyahText = (ayah: AyahWithAudio) => {
    const tajweedData = tajweedAyahs.find(a => a.numberInSurah === ayah.numberInSurah);
    if (!tajweedData) return <span>{ayah.text}</span>;

    let textToProcess = tajweedData.text;
    if (ayah.numberInSurah === 1 && selectedSurah !== 1 && selectedSurah !== 9) {
      const basmala = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
      if (textToProcess.startsWith(basmala)) textToProcess = textToProcess.replace(basmala, "").trim();
    }

    const parts = textToProcess.split(/(\[.:\d+\])/g);
    let currentColor = TAJWEED_COLORS.normal;

    return parts.map((part: string, i: number) => {
      const markerMatch = part.match(/\[(h|i|j|k|p|s|n):(\d+)\]/);
      if (markerMatch) {
        const code = markerMatch[1];
        if (code === 'p') currentColor = TAJWEED_COLORS.madd;
        else if (['h', 'i', 'k'].includes(code)) currentColor = TAJWEED_COLORS.ghunnah;
        else if (code === 's') currentColor = TAJWEED_COLORS.qalqalah;
        else if (code === 'j') currentColor = TAJWEED_COLORS.iqlab;
        else currentColor = TAJWEED_COLORS.normal;
        return null;
      }
      if (!part) return null;
      return (
        <span key={i} style={{ 
          color: currentColor !== TAJWEED_COLORS.normal ? currentColor : undefined,
          fontWeight: currentColor !== TAJWEED_COLORS.normal ? 'bold' : 'normal'
        }}>
          {part}
        </span>
      );
    });
  };

  if (loading && !selectedSurah) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-islamic border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-emerald-islamic font-bold">جاري تحميل السورة بالأحكام والتفسير...</p>
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen pb-20">
      <audio 
        ref={audioRef} 
        onEnded={onAudioEnded} 
        onError={() => setAudioError("خطأ في تحميل مصدر الصوت.")}
        hidden 
      />
      
      {!selectedSurah ? (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن سورة..." 
              className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl py-5 pr-12 pl-4 focus:ring-4 focus:ring-emerald-islamic/10 focus:outline-none shadow-sm font-bold text-right transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {surahs.filter(s => s.name.includes(search)).map((surah) => (
              <button
                key={surah.number}
                onClick={() => setSelectedSurah(surah.number)}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:border-emerald-islamic hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between text-right group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-islamic font-black text-sm group-hover:bg-emerald-islamic group-hover:text-white transition-colors">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">{surah.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية</p>
                  </div>
                </div>
                <ChevronRight className="text-emerald-islamic opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-islamic text-white sticky top-0 z-30 shadow-lg flex flex-col transition-all">
            <div className="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedSurah(null)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-2xl transition-all active:scale-90"><ChevronRight size={20} /></button>
                <button onClick={() => setShowLegend(!showLegend)} className={`p-2.5 rounded-2xl transition-all ${showLegend ? 'bg-white text-emerald-islamic' : 'bg-white/10'}`}><Sparkles size={20} /></button>
              </div>
              <h2 className="text-2xl font-bold font-amiri tracking-wide">{surahContent?.surah.name}</h2>
              <button onClick={() => setShowSettings(!showSettings)} className={`p-2.5 rounded-2xl transition-all ${showSettings ? 'bg-white text-emerald-islamic' : 'bg-white/10'}`}><Settings2 size={20} /></button>
            </div>

            {(activeAyahId && activeAyahData) || audioError ? (
              <div className="w-full bg-black/10 px-6 py-3 flex items-center justify-between border-t border-white/5 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
                  {audioError ? (
                    <div className="flex items-center gap-2 text-amber-gold font-bold text-xs bg-amber-50/10 px-4 py-2 rounded-xl">
                      <AlertCircle size={14} /> {audioError}
                    </div>
                  ) : activeAyahData ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-black">آية {activeAyahData.numberInSurah}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => showTafsir(activeAyahData)} className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-islamic rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-50 transition-colors">
                          <BookCheck size={16} /> تفسير الطبري
                        </button>
                        <button onClick={() => toggleAudio(activeAyahData)} className={`p-2 rounded-xl transition-all ${playingAyah === activeAyahData.number ? 'bg-amber-gold' : 'bg-white/20 hover:bg-white/30'}`}>
                          {playingAyah === activeAyahData.number ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button onClick={() => {setActiveAyahId(null); setAudioError(null);}} className="p-2 bg-white/10 rounded-xl hover:bg-white/20"><X size={18} /></button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {showLegend && (
            <div className="max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-top-4">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-slate-700 shadow-xl">
                <h4 className="font-black text-emerald-islamic mb-6 flex items-center gap-2 uppercase tracking-widest text-sm"><Sparkles size={18} /> دليل أحكام التجويد الملونة</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {TAJWEED_LEGEND.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10">
                      <div className="w-6 h-6 rounded-full shadow-inner ring-4 ring-white dark:ring-slate-800" style={{ backgroundColor: rule.color }}></div>
                      <div>
                        <p className="text-sm font-black text-gray-700 dark:text-slate-200">{rule.label}</p>
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{rule.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-12 px-4">
            {pages.map(([pageNum, ayahs]) => (
              <div key={pageNum} className="bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden relative group transition-all hover:shadow-2xl">
                <div className="bg-gray-50/50 dark:bg-slate-900/50 px-10 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><BookOpen size={12} /> الجزء {ayahs[0].juz}</span>
                  <span>صفحة {pageNum}</span>
                </div>
                <div className="p-12 md:p-20">
                  {ayahs.some(a => a.numberInSurah === 1) && selectedSurah !== 1 && selectedSurah !== 9 && (
                    <div className="text-center font-amiri text-5xl text-gray-800 dark:text-slate-100 mb-16 py-6 border-b border-emerald-50 dark:border-slate-700/50">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                  )}
                  <div className="text-right font-amiri text-gray-800 dark:text-slate-200 text-justify dir-rtl" style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}>
                    {ayahs.map((ayah) => (
                      <span 
                        key={ayah.number} 
                        id={`ayah-${ayah.number}`}
                        onClick={() => {
                          setActiveAyahId(prev => prev === ayah.number ? null : ayah.number);
                          setAudioError(null);
                        }}
                        className={`cursor-pointer transition-all rounded-[1.5rem] px-2 py-1.5 inline group/ayah relative
                          ${playingAyah === ayah.number ? 'bg-amber-50 dark:bg-amber-900/20 ring-4 ring-amber-100 dark:ring-amber-900/10' : 'hover:bg-emerald-50 dark:hover:bg-slate-700/50'}
                          ${activeAyahId === ayah.number ? 'bg-emerald-islamic/20 dark:bg-emerald-islamic/40 shadow-inner' : ''}
                        `}
                      >
                        {renderColoredAyahText(ayah)}
                        <span className={`inline-flex items-center justify-center rounded-full border-2 font-sans font-black mx-3 relative top-[-3px] transition-all
                          ${playingAyah === ayah.number ? 'bg-amber-gold text-white border-amber-gold scale-110 shadow-lg' : 'border-emerald-islamic/20 text-emerald-islamic/40 group-hover/ayah:border-emerald-islamic group-hover/ayah:text-emerald-islamic'}
                          ${activeAyahId === ayah.number ? 'border-emerald-islamic text-emerald-islamic scale-110 shadow-sm' : ''}
                        `}
                          style={{ width: `${fontSize * 0.85}px`, height: `${fontSize * 0.85}px`, fontSize: `${fontSize * 0.4}px` }}>
                          {ayah.numberInSurah}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-islamic/10 px-4 py-1.5 rounded-full pointer-events-none">
                   <p className="text-[10px] font-black text-emerald-islamic uppercase tracking-widest">اضغط على الآية للتفسير أو الاستماع</p>
                </div>
              </div>
            ))}
          </div>

          {tafsir && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300">
              <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(4,120,87,0.2)] animate-in zoom-in duration-300">
                <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-4 text-right">
                    <div className="bg-emerald-islamic p-3 rounded-2xl text-white shadow-lg shadow-emerald-200 dark:shadow-none"><BookCheck size={24} /></div>
                    <div>
                      <h4 className="font-black text-emerald-islamic text-lg">{tafsir.surahName} - الآية {tafsir.ayah}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">تفسير الطبري - جامع البيان</p>
                    </div>
                  </div>
                  <button onClick={() => setTafsir(null)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"><X size={28} /></button>
                </div>
                <div className="p-10 md:p-16 overflow-y-auto text-right dir-rtl font-amiri text-2xl leading-[2.2] text-gray-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: tafsir.text }} />
              </div>
            </div>
          )}

          {showSettings && (
            <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-40 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-700 w-full max-w-xs animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-black text-gray-700 dark:text-slate-200 uppercase tracking-widest text-sm">إعدادات المصحف</h4>
                <button onClick={() => setShowSettings(false)} className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-all"><X size={20} /></button>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-4"><span className="text-xs font-black text-gray-400 uppercase tracking-widest">حجم الخط</span><span className="text-sm font-black text-emerald-islamic bg-emerald-50 px-3 py-1 rounded-lg">{fontSize}px</span></div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setFontSize(s => Math.max(s - 2, 20))} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-90"><Minus size={18} /></button>
                    <input type="range" min="20" max="64" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="flex-1 accent-emerald-islamic h-2 rounded-full" />
                    <button onClick={() => setFontSize(s => Math.min(s + 2, 64))} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all active:scale-90"><Plus size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quran;
