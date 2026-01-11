
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Navigation, Bookmark, BookOpen, BellRing, Bell, BellOff, Volume2, Loader2 } from 'lucide-react';
import { fetchPrayerTimes } from '../services/api';
import { PrayerTimes, Bookmark as BookmarkType, IqamaOffsets } from '../types';

const DEFAULT_OFFSETS: IqamaOffsets = {
  Fajr: 20,
  Dhuhr: 15,
  Asr: 15,
  Maghrib: 10,
  Isha: 15,
};

// Fixed stable audio sources
const ADHAN_VOICES_MAP: Record<string, string> = {
  makkah: 'https://ia800705.us.archive.org/19/items/AdhanMakkah/Adhan-Makkah.mp3',
  madinah: 'https://ia800508.us.archive.org/29/items/AdhanMadinah/Adhan-Madinah.mp3',
  abdulbasit: 'https://ia801407.us.archive.org/15/items/AzanAbdulBasit/Azan-AbdulBasit.mp3',
  egypt: 'https://ia801407.us.archive.org/15/items/AzanEgypt/Azan-Egypt.mp3',
  mustafa: 'https://ia801407.us.archive.org/15/items/AzanEgypt/Azan-Egypt.mp3',
};

const Home: React.FC<{ onOpenQuran: (surah: number) => void }> = ({ onOpenQuran }) => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [offsets, setOffsets] = useState<IqamaOffsets>(DEFAULT_OFFSETS);
  const [nextEvent, setNextEvent] = useState<{ name: string; key: string; type: 'Adhan' | 'Iqama'; time: string; diff: string } | null>(null);
  const [bookmark, setBookmark] = useState<BookmarkType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  
  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isAdhanEnabled, setIsAdhanEnabled] = useState(() => {
    const saved = localStorage.getItem('byan_adhan_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('byan_adhan_enabled', JSON.stringify(isAdhanEnabled));
  }, [isAdhanEnabled]);

  useEffect(() => {
    const savedOffsets = localStorage.getItem('byan_iqama_offsets');
    if (savedOffsets) setOffsets(JSON.parse(savedOffsets));

    const loadData = async () => {
      try {
        const lat = 30.0444;
        const lng = 31.2357;
        const pt = await fetchPrayerTimes(lat, lng);
        setTimes(pt);
      } catch (err) {
        console.error("Failed to fetch prayer times", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const saved = localStorage.getItem('byan_bookmark');
    if (saved) setBookmark(JSON.parse(saved));

    return () => {
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
        adhanAudioRef.current = null;
      }
    };
  }, []);

  const playAdhan = () => {
    if (!isAdhanEnabled) return;
    
    const preferredVoice = localStorage.getItem('byan_adhan_voice') || 'makkah';
    const adhanUrl = ADHAN_VOICES_MAP[preferredVoice];
    
    if (adhanUrl) {
      if (!adhanAudioRef.current) {
        adhanAudioRef.current = new Audio();
        adhanAudioRef.current.onended = () => setIsPlayingAdhan(false);
      }
      
      adhanAudioRef.current.src = adhanUrl;
      adhanAudioRef.current.load();
      
      const playPromise = adhanAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlayingAdhan(true))
          .catch(e => {
            console.error("Adhan playback error:", e);
            setIsPlayingAdhan(false);
          });
      }
    }
  };

  const addMinutes = (timeStr: string, mins: number) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + mins, 0);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!times) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentTimeInMins = currentHours * 60 + currentMinutes;

      const prayers = [
        { name: 'الفجر', key: 'Fajr', adhan: times.Fajr },
        { name: 'الظهر', key: 'Dhuhr', adhan: times.Dhuhr },
        { name: 'العصر', key: 'Asr', adhan: times.Asr },
        { name: 'المغرب', key: 'Maghrib', adhan: times.Maghrib },
        { name: 'العشاء', key: 'Isha', adhan: times.Isha },
      ];

      prayers.forEach(p => {
        const [h, m] = p.adhan.split(':').map(Number);
        if (h === currentHours && m === currentMinutes && currentSeconds === 0 && !isPlayingAdhan) {
          playAdhan();
        }
      });

      let found = null;
      for (const p of prayers) {
        const [h, m] = p.adhan.split(':').map(Number);
        const adhanMins = h * 60 + m;
        const iqamaMins = adhanMins + (offsets as any)[p.key];

        if (adhanMins > currentTimeInMins) {
          const diff = adhanMins - currentTimeInMins;
          found = {
            name: p.name,
            key: p.key,
            type: 'Adhan' as const,
            time: p.adhan,
            diff: `${Math.floor(diff / 60)} ساعة و ${diff % 60} دقيقة`
          };
          break;
        }
        
        if (iqamaMins > currentTimeInMins) {
          const diff = iqamaMins - currentTimeInMins;
          found = {
            name: p.name,
            key: p.key,
            type: 'Iqama' as const,
            time: addMinutes(p.adhan, (offsets as any)[p.key]),
            diff: `${diff} دقيقة`
          };
          break;
        }
      }

      if (!found) {
        const [h, m] = prayers[0].adhan.split(':').map(Number);
        const pMins = (h + 24) * 60 + m;
        const diff = pMins - currentTimeInMins;
        found = {
          name: 'الفجر',
          key: 'Fajr',
          type: 'Adhan' as const,
          time: prayers[0].adhan,
          diff: `${Math.floor(diff / 60)} ساعة و ${diff % 60} دقيقة`
        };
      }

      setNextEvent(found);
    }, 1000);

    return () => clearInterval(interval);
  }, [times, offsets, isPlayingAdhan]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-emerald-islamic animate-spin" />
        <p className="text-emerald-islamic font-bold animate-pulse text-center">جاري ضبط التوقيت لموقعك...</p>
      </div>
    );
  }

  return (
    <div className="page-transition space-y-6">
      <section className="bg-emerald-islamic rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-100 dark:shadow-emerald-900/20 relative overflow-hidden transition-all">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black mb-2">توقيت القاهرة</h2>
              <p className="text-emerald-50 opacity-90 italic text-sm font-medium">"وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ"</p>
            </div>
            
            <button 
              onClick={() => setIsAdhanEnabled(!isAdhanEnabled)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all shadow-xl active:scale-95 ${
                isAdhanEnabled 
                ? 'bg-amber-gold text-white' 
                : 'bg-white/20 text-white/60'
              }`}
            >
              {isAdhanEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              <span className="text-xs font-black whitespace-nowrap">
                {isAdhanEnabled ? 'الآذان مفعل' : 'الآذان صامت'}
              </span>
            </button>
          </div>
          
          {nextEvent && (
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 inline-block border border-white/30 shadow-inner">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">
                <Clock size={16} /> {nextEvent.type === 'Adhan' ? 'الأذان القادم' : 'الإقامة القادمة'}
              </div>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black">{nextEvent.name}</span>
                <span className="text-2xl opacity-90 mb-1 font-bold">في {nextEvent.time}</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                 <div className="px-4 py-1.5 bg-white/20 rounded-full text-xs font-black">متبقي {nextEvent.diff}</div>
                 {isPlayingAdhan && (
                   <div className="flex items-center gap-2 text-amber-gold font-bold text-xs animate-pulse bg-white rounded-full px-3 py-1">
                     <Volume2 size={14} /> جاري الأذان...
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {times && (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((key) => {
          const names: Record<string, string> = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
          const adhanTime = (times as any)[key];
          const iqamaTime = addMinutes(adhanTime, (offsets as any)[key]);
          const isNext = nextEvent?.key === key;
          
          return (
            <div key={key} className={`bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border shadow-sm transition-all relative overflow-hidden group ${isNext ? 'ring-2 ring-emerald-islamic border-emerald-islamic shadow-lg shadow-emerald-50 dark:shadow-none' : 'border-gray-100 dark:border-slate-700 hover:border-emerald-islamic/30'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-sm font-black uppercase tracking-widest ${isNext ? 'text-emerald-islamic' : 'text-gray-400'}`}>{names[key]}</span>
              </div>
              
              <div className="mb-6 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-black text-gray-800 dark:text-slate-100">{adhanTime}</span>
                  <span className="text-[10px] text-gray-400 font-bold">صوت الأذان</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-50 dark:border-slate-700/50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-emerald-islamic font-black uppercase block">الإقامة</span>
                  <span className="text-xl font-black text-emerald-islamic">{iqamaTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] p-8 border border-amber-100 dark:border-amber-900/20 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 text-amber-gold mb-6">
            <div className="p-3 bg-white rounded-2xl shadow-sm"><Bookmark size={24} fill="currentColor" /></div>
            <div>
              <h3 className="font-black text-xl">واصل القراءة</h3>
              <p className="text-[10px] uppercase font-bold opacity-60">آخر ما توقفت عنده</p>
            </div>
          </div>
          {bookmark ? (
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-amber-100/50">
              <div>
                <p className="font-black text-gray-800 dark:text-slate-100 text-2xl mb-1">{bookmark.surahName}</p>
                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                   <BookOpen size={14} /> الآية {bookmark.ayahNumber}
                </div>
              </div>
              <button 
                onClick={() => onOpenQuran(bookmark.surahNumber)}
                className="bg-amber-gold text-white px-8 py-3 rounded-2xl font-black hover:bg-amber-600 transition-all shadow-lg active:scale-95"
              >
                إكمال
              </button>
            </div>
          ) : (
            <div className="text-center py-6 bg-white/50 rounded-3xl border-2 border-dashed border-amber-200">
              <p className="text-amber-700/60 font-bold mb-4">لم تحفظ أي موضع بعد</p>
              <button 
                onClick={() => onOpenQuran(1)}
                className="bg-white text-amber-gold px-6 py-2 rounded-xl font-black shadow-sm flex items-center gap-2 mx-auto hover:bg-amber-gold hover:text-white transition-all"
              >
                ابدأ من الفاتحة <BookOpen size={16} />
              </button>
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-islamic">
                <Navigation size={32} />
              </div>
              <div>
                <h3 className="font-black text-xl text-gray-800 dark:text-slate-100">موقعك الحالي</h3>
                <p className="text-emerald-islamic font-black text-[10px] uppercase tracking-widest">القاهرة، مصر</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
