
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchSurahs, fetchSurahDetail, fetchTafsirTabari, fetchTajweedData } from '../services/api';
import { Surah, Ayah } from '../types';
import { 
  Play, Pause, ChevronRight, Search, 
  BookOpen, Settings2, Minus, Plus, X, Sparkles, BookCheck,
  LayoutList, Square, Headphones, StickyNote, Save, ChevronUp
} from 'lucide-react';

interface AyahWithAudio extends Ayah {
  audio: string;
  audioSecondary: string[];
}

interface PlaybackState {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
}

const TAJWEED_COLORS: Record<string, { color: string; label: string; desc: string; codes: string[] }> = {
  madd: { color: '#ef4444', label: 'المدود', desc: 'إطالة الصوت بحرف المد (4-6 حركات)', codes: ['p'] },
  ghunnah: { color: '#059669', label: 'غنة/إخفاء', desc: 'صوت يخرج من الأنف (حركتان) في النون والميم', codes: ['h', 'i', 'k'] },
  qalqalah: { color: '#2563eb', label: 'قلقلة', desc: 'اضطراب في مخرج الحرف الساكن (قطب جد)', codes: ['s'] },
  iqlab: { color: '#9333ea', label: 'إقلاب', desc: 'قلب النون ميماً عند ملاقاتها للباء', codes: ['j'] }
};

const Quran: React.FC<{ initialSurah?: number }> = ({ initialSurah }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(initialSurah || null);
  const [surahContent, setSurahContent] = useState<{ surah: Surah; ayahs: AyahWithAudio[] } | null>(null);
  const [tajweedAyahs, setTajweedAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tafsir, setTafsir] = useState<{ text: string; ayah: number; surahName: string; ayahText: string } | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [activeAyahId, setActiveAyahId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [highlightedRule, setHighlightedRule] = useState<string | null>(null);
  const [showQuickSwitch, setShowQuickSwitch] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [volume, setVolume] = useState(1);
  const [lastPlayback, setLastPlayback] = useState<PlaybackState | null>(null);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [notes, setNotes] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('byan_ayah_notes');
    return saved ? JSON.parse(saved) : {};
  });
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

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
    const saved = localStorage.getItem('byan_last_playback');
    if (saved) setLastPlayback(JSON.parse(saved));

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('byan_ayah_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (selectedSurah) loadSurah(selectedSurah);
  }, [selectedSurah]);

  const loadSurah = async (num: number) => {
    setLoading(true);
    try {
      const [detail, tajweed] = await Promise.all([
        fetchSurahDetail(num),
        fetchTajweedData(num)
      ]);
      setSurahContent({ surah: detail, ayahs: detail.ayahs });
      setTajweedAyahs(tajweed);
      
      if (autoPlayNext && detail.ayahs.length > 0) {
        setAutoPlayNext(false);
        setTimeout(() => toggleAudio(detail.ayahs[0]), 100);
      } else if (lastPlayback && lastPlayback.surahNumber === num) {
        setTimeout(() => {
          const el = document.getElementById(`ayah-${lastPlayback.ayahNumber}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setActiveAyahId(lastPlayback.ayahNumber);
        }, 600);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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

  const toggleAudio = (ayah: AyahWithAudio) => {
    if (!audioRef.current) return;
    if (playingAyah === ayah.number) {
      audioRef.current.pause();
      setPlayingAyah(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = ayah.audio;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setPlayingAyah(ayah.number);
        setActiveAyahId(ayah.number);
        const el = document.getElementById(`ayah-${ayah.number}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).catch(err => console.error("Playback error:", err));
    }
  };

  const onAudioEnded = () => {
    if (!surahContent || playingAyah === null) return;
    const currentIndex = surahContent.ayahs.findIndex(a => a.number === playingAyah);
    if (currentIndex !== -1 && currentIndex < surahContent.ayahs.length - 1) {
      toggleAudio(surahContent.ayahs[currentIndex + 1]);
    } else {
      if (selectedSurah && selectedSurah < 114) {
        setAutoPlayNext(true);
        setSelectedSurah(selectedSurah + 1);
      } else {
        setPlayingAyah(null);
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingAyah(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNoteEditor = () => {
    if (activeAyahId !== null) {
      setCurrentNote(notes[activeAyahId] || '');
      setShowNoteEditor(true);
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
    let currentColor: string | null = null;
    let currentRuleKey: string | null = null;
    return parts.map((part: string, i: number) => {
      const markerMatch = part.match(/\[(h|i|j|k|p|s|n):(\d+)\]/);
      if (markerMatch) {
        const code = markerMatch[1];
        const ruleEntry = Object.entries(TAJWEED_COLORS).find(([_, r]) => r.codes.includes(code));
        if (ruleEntry) { currentColor = ruleEntry[1].color; currentRuleKey = ruleEntry[0]; }
        else { currentColor = null; currentRuleKey = null; }
        return null;
      }
      if (!part) return null;
      const isHighlighted = highlightedRule && currentRuleKey === highlightedRule;
      return <span key={i} style={{ color: currentColor || 'inherit', fontWeight: currentColor ? 'bold' : 'normal', textShadow: isHighlighted ? `0 0 12px ${currentColor}` : 'none' }}>{part}</span>;
    });
  };

  return (
    <div className="page-transition min-h-screen">
      <audio ref={audioRef} onEnded={onAudioEnded} hidden />
      
      {!selectedSurah ? (
        <div className="space-y-6 max-w-5xl mx-auto pb-32">
          {lastPlayback && (
            <div className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-800 border border-amber-100 dark:border-amber-900/20 p-6 rounded-[2.5rem] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-gold/20 flex items-center justify-center text-amber-gold"><Headphones size={28} /></div>
                <div>
                  <h4 className="font-black text-amber-gold text-xs uppercase tracking-[0.2em] mb-1">مواصلة التلاوة</h4>
                  <p className="font-bold text-gray-800 dark:text-slate-100 text-lg">سورة {lastPlayback.surahName} - آية {lastPlayback.ayahNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSurah(lastPlayback.surahNumber)} className="bg-amber-gold text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-amber-600 transition-all">استماع الآن</button>
            </div>
          )}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="ابحث عن سورة بالاسم أو الرقم..." className="w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl py-5 pr-12 pl-4 focus:outline-none font-bold text-right" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {surahs.filter(s => s.name.includes(search) || s.number.toString().includes(search)).map((surah) => (
              <button key={surah.number} onClick={() => setSelectedSurah(surah.number)} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:border-emerald-islamic hover:-translate-y-1 transition-all flex items-center justify-between text-right group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-islamic font-black text-sm group-hover:bg-emerald-islamic group-hover:text-white transition-colors">{surah.number}</div>
                  <div><h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">{surah.name}</h3><p className="text-[10px] text-gray-400 font-bold uppercase">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية</p></div>
                </div>
                <ChevronRight className="text-emerald-islamic opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="sticky top-0 z-50 bg-emerald-islamic text-white shadow-xl">
            <div className="w-full max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <button onClick={() => setShowSettings(!showSettings)} className={`p-2.5 rounded-2xl transition-all ${showSettings ? 'bg-white text-emerald-islamic' : 'bg-white/10 hover:bg-white/20'}`}><Settings2 size={24} /></button>
              <div className="flex items-center gap-4 bg-black/20 px-6 py-2.5 rounded-[2rem] border border-white/5 shadow-inner">
                 <div className="flex items-center gap-1.5 bg-white/10 rounded-[1.5rem] px-3 py-2">
                    <button onClick={() => setVolume(v => Math.min(1, v + 0.1))} className="hover:text-amber-gold transition-colors"><Plus size={14} /></button>
                    <span className="text-[11px] font-black min-w-[35px] text-center">{Math.round(volume * 100)}%</span>
                    <button onClick={() => setVolume(v => Math.max(0, v - 0.1))} className="hover:text-amber-gold transition-colors"><Minus size={14} /></button>
                 </div>
                 <button onClick={stopAudio} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Square size={18} fill="currentColor" /></button>
                 <button onClick={() => { if(playingAyah) stopAudio(); else { if (surahContent) toggleAudio(surahContent.ayahs[0]) } }} className="w-11 h-11 flex items-center justify-center rounded-full transition-all bg-amber-gold text-white shadow-lg active:scale-95">
                    {playingAyah ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="mr-0.5" />}
                 </button>
                 <div className="h-6 w-px bg-white/20 mx-2"></div>
                 <h2 className="text-xl md:text-2xl font-bold font-amiri tracking-wide whitespace-nowrap">سورة {surahContent?.surah.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowLegend(!showLegend)} className={`p-2.5 rounded-2xl transition-all ${showLegend ? 'bg-white text-emerald-islamic' : 'bg-white/10 hover:bg-white/20'}`}><Sparkles size={24} /></button>
                <button onClick={() => setShowQuickSwitch(!showQuickSwitch)} className={`p-2.5 rounded-2xl transition-all ${showQuickSwitch ? 'bg-white text-emerald-islamic' : 'bg-white/10 hover:bg-white/20'}`}><LayoutList size={24} /></button>
                <button onClick={() => setSelectedSurah(null)} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-2xl transition-all"><ChevronRight size={24} /></button>
              </div>
            </div>
            {activeAyahId && activeAyahData && (
              <div className="w-full bg-black/10 px-6 py-2 border-t border-white/5 animate-in slide-in-from-top-1">
                <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveAyahId(null)} className="p-2 bg-white/10 rounded-2xl hover:bg-white/20"><X size={18} /></button>
                    <button onClick={() => toggleAudio(activeAyahData)} className={`w-10 h-10 flex items-center justify-center rounded-full border-2 border-white shadow-md transition-all ${playingAyah === activeAyahData.number ? 'bg-amber-gold' : 'bg-white text-emerald-islamic'}`}>
                      {playingAyah === activeAyahData.number ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>
                    <button onClick={openNoteEditor} className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-[11px] font-black shadow-sm transition-all ${notes[activeAyahId] ? 'bg-amber-gold text-white' : 'bg-white text-emerald-islamic'}`}>
                      <StickyNote size={16} /> ملاحظة
                    </button>
                    <button onClick={async () => { if (!selectedSurah) return; const data = await fetchTafsirTabari(selectedSurah, activeAyahData.numberInSurah); setTafsir({ text: data.text, ayah: activeAyahData.numberInSurah, surahName: surahContent?.surah.name || '', ayahText: activeAyahData.text }); }} className="flex items-center gap-2 px-5 py-2 bg-white text-emerald-islamic rounded-2xl text-[11px] font-black shadow-sm">
                      <BookCheck size={16} /> تفسير
                    </button>
                  </div>
                  <span className="bg-white/10 px-4 py-1.5 rounded-xl text-[11px] font-black">آية {activeAyahData.numberInSurah}</span>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-4xl mx-auto space-y-12 px-4 py-12 pb-48">
            {pages.map(([pageNum, ayahs]) => (
              <div key={pageNum} className="bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden group transition-all">
                <div className="bg-gray-50/50 dark:bg-slate-900/50 px-10 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center text-[10px] text-gray-400 font-black tracking-[0.2em]">
                  <span className="flex items-center gap-2"><BookOpen size={12} /> الجزء {ayahs[0].juz}</span>
                  <span>صفحة {pageNum}</span>
                </div>
                <div className="p-12 md:p-20">
                  {ayahs.some(a => a.numberInSurah === 1) && selectedSurah !== 1 && selectedSurah !== 9 && (
                    <div className="text-center font-amiri text-5xl text-gray-800 dark:text-slate-100 mb-16 py-6 border-b border-emerald-50 dark:border-slate-700/50">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                  )}
                  <div className="text-right font-amiri text-gray-800 dark:text-slate-200 text-justify dir-rtl" style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}>
                    {ayahs.map((ayah) => (
                      <span key={ayah.number} id={`ayah-${ayah.number}`} onClick={() => setActiveAyahId(ayah.number)} className={`cursor-pointer transition-all rounded-2xl px-2 py-1.5 inline relative ${playingAyah === ayah.number ? 'bg-amber-50 dark:bg-amber-900/20 ring-4 ring-amber-100' : ''} ${activeAyahId === ayah.number ? 'bg-emerald-islamic/20 shadow-inner' : 'hover:bg-emerald-50'}`}>
                        {renderColoredAyahText(ayah)}
                        <span className="relative inline-flex items-center">
                          <span className={`inline-flex items-center justify-center rounded-full border-2 font-sans font-black mx-3 transition-all ${playingAyah === ayah.number ? 'bg-amber-gold text-white border-amber-gold scale-110 shadow-lg' : 'border-emerald-islamic/20 text-emerald-islamic/40'} ${activeAyahId === ayah.number ? 'border-emerald-islamic text-emerald-islamic scale-110' : ''}`} style={{ width: `${fontSize * 0.85}px`, height: `${fontSize * 0.85}px`, fontSize: `${fontSize * 0.4}px` }}>{ayah.numberInSurah}</span>
                          {notes[ayah.number] && <div className="absolute -top-4 right-0 text-amber-gold animate-bounce"><StickyNote size={12} fill="currentColor" /></div>}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button 
              onClick={scrollToTop}
              className="fixed bottom-28 left-6 z-[60] bg-emerald-islamic text-white p-4 rounded-2xl shadow-2xl hover:bg-emerald-600 transition-all active:scale-90 animate-in slide-in-from-bottom-4"
              title="العودة للأعلى"
            >
              <ChevronUp size={24} />
            </button>
          )}

          {tafsir && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in">
                <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-4 text-right">
                    <div className="bg-emerald-islamic p-3 rounded-2xl text-white shadow-lg"><BookCheck size={24} /></div>
                    <div><h4 className="font-black text-emerald-islamic text-lg">{tafsir.surahName} - {tafsir.ayah}</h4><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">تفسير الطبري</p></div>
                  </div>
                  <button onClick={() => setTafsir(null)} className="p-3 text-gray-400 hover:text-red-500 rounded-2xl transition-all"><X size={28} /></button>
                </div>
                <div className="bg-emerald-50/30 p-8 text-center border-b border-gray-100"><p className="font-amiri text-3xl text-gray-800 leading-relaxed font-bold">{tafsir.ayahText}</p></div>
                <div className="p-10 md:p-16 overflow-y-auto text-right dir-rtl font-amiri text-2xl leading-[2.2] text-gray-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: tafsir.text }} />
              </div>
            </div>
          )}

          {showNoteEditor && activeAyahData && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[101] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3"><div className="bg-amber-gold p-2.5 rounded-xl text-white shadow-lg"><StickyNote size={20} /></div><h4 className="font-black text-gray-800 dark:text-slate-100">ملاحظاتي الشخصية</h4></div>
                  <button onClick={() => setShowNoteEditor(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                </div>
                <textarea className="w-full h-40 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl p-5 focus:outline-none font-medium text-right text-gray-700 dark:text-slate-200" placeholder="اكتب تأملاتك أو ملاحظاتك حول هذه الآية..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} dir="rtl" />
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { if (activeAyahId !== null) { if (currentNote.trim() === '') { const n = { ...notes }; delete n[activeAyahId]; setNotes(n); } else { setNotes({ ...notes, [activeAyahId]: currentNote }); } setShowNoteEditor(false); } }} className="flex-1 bg-emerald-islamic text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 transition-all"><Save size={18} /> حفظ الملاحظة</button>
                  <button onClick={() => setShowNoteEditor(false)} className="px-6 py-4 bg-gray-100 dark:bg-slate-700 text-gray-500 rounded-2xl font-bold text-sm">إلغاء</button>
                </div>
              </div>
            </div>
          )}

          {showQuickSwitch && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in">
                <div className="p-6 border-b border-gray-100 bg-gray-50 dark:bg-slate-900/50 flex flex-col gap-4">
                  <div className="flex justify-between items-center"><h3 className="font-black text-emerald-islamic uppercase tracking-widest text-xs">الانتقال السريع للسور</h3><button onClick={() => setShowQuickSwitch(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button></div>
                  <input type="text" placeholder="ابحث عن سورة..." className="w-full bg-white dark:bg-slate-800 border border-gray-100 rounded-2xl py-3 pr-10 pl-4 focus:outline-none font-bold text-sm text-right" value={quickSearch} onChange={(e) => setQuickSearch(e.target.value)} autoFocus />
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2">
                  {surahs.filter(s => s.name.includes(quickSearch)).map((s) => (
                    <button key={s.number} onClick={() => { setSelectedSurah(s.number); setShowQuickSwitch(false); }} className={`flex items-center justify-between p-4 rounded-2xl text-right transition-all border ${selectedSurah === s.number ? 'bg-emerald-islamic text-white' : 'bg-white dark:bg-slate-800 hover:bg-emerald-50'}`}>
                      <span className="text-xs font-bold opacity-60">#{s.number}</span><span className="font-bold text-lg font-amiri">{s.name}</span>
                    </button>
                  ))}
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
