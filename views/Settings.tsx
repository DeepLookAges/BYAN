
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Bell, MapPin, Moon, Info, LogOut, Sun, Timer, 
  ChevronLeft, ShieldCheck, Globe, Volume2, Play, Pause, 
  Music, VolumeX, AlertCircle, Headphones, Loader2
} from 'lucide-react';
import { IqamaOffsets } from '../types';

interface SettingsProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DEFAULT_OFFSETS: IqamaOffsets = {
  Fajr: 20,
  Dhuhr: 15,
  Asr: 15,
  Maghrib: 10,
  Isha: 15,
};

// روابط صوتية موثوقة تدعم HTTPS من مصادر عالمية
const ADHAN_VOICES = [
  { id: 'makkah', name: 'أذان مكة المكرمة', url: 'https://www.islamcan.com/audio/adhan/adhan2.mp3' },
  { id: 'madinah', name: 'أذان المدينة المنورة', url: 'https://www.islamcan.com/audio/adhan/adhan3.mp3' },
  { id: 'abdulbasit', name: 'عبد الباسط عبد الصمد', url: 'https://www.islamcan.com/audio/adhan/adhan1.mp3' },
  { id: 'egypt', name: 'أذان من مصر', url: 'https://www.islamcan.com/audio/adhan/adhan15.mp3' },
  { id: 'rifaat', name: 'الشيخ محمد رفعت', url: 'https://www.islamcan.com/audio/adhan/adhan12.mp3' },
];

const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [offsets, setOffsets] = useState<IqamaOffsets>(DEFAULT_OFFSETS);
  const [notifications, setNotifications] = useState({ adhan: true, athkar: true });
  const [selectedVoice, setSelectedVoice] = useState(ADHAN_VOICES[0].id);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedOffsets = localStorage.getItem('byan_iqama_offsets');
    if (savedOffsets) setOffsets(JSON.parse(savedOffsets));

    const savedVoice = localStorage.getItem('byan_adhan_voice');
    if (savedVoice) setSelectedVoice(savedVoice);

    const savedNotifs = localStorage.getItem('byan_notifications');
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleOffsetChange = (key: keyof IqamaOffsets, val: string) => {
    const num = parseInt(val) || 0;
    const updated = { ...offsets, [key]: num };
    setOffsets(updated);
    localStorage.setItem('byan_iqama_offsets', JSON.stringify(updated));
  };

  const handleVoiceChange = (id: string) => {
    setSelectedVoice(id);
    localStorage.setItem('byan_adhan_voice', id);
    setAudioError(null);
    if (isPlayingPreview || isLoadingAudio) {
      stopAdhanPreview();
    }
  };

  const toggleAdhanPreview = () => {
    if (isPlayingPreview || isLoadingAudio) {
      stopAdhanPreview();
    } else {
      setAudioError(null);
      setIsLoadingAudio(true);
      const voice = ADHAN_VOICES.find(v => v.id === selectedVoice);
      
      if (voice) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.preload = "auto";
          
          audioRef.current.onended = () => {
            setIsPlayingPreview(false);
            setIsLoadingAudio(false);
          };
          
          audioRef.current.oncanplaythrough = () => {
            setIsLoadingAudio(false);
            audioRef.current?.play().then(() => {
              setIsPlayingPreview(true);
            }).catch(e => {
              console.error("Play failed:", e);
              setAudioError("يرجى الضغط على الشاشة للسماح بتشغيل الصوت.");
              setIsLoadingAudio(false);
            });
          };
          
          audioRef.current.onerror = () => {
            const error = audioRef.current?.error;
            let msg = "عذراً، فشل تحميل الصوت من المصدر.";
            if (error) {
              switch (error.code) {
                case error.MEDIA_ERR_NETWORK: msg = "خطأ في الشبكة. تأكد من اتصالك."; break;
                case error.MEDIA_ERR_DECODE: msg = "فشل فك تشفير الملف الصوتي."; break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED: msg = "المصدر غير مدعوم أو الرابط تالف."; break;
              }
            }
            setAudioError(msg);
            setIsPlayingPreview(false);
            setIsLoadingAudio(false);
          };
        }
        
        audioRef.current.src = voice.url;
        audioRef.current.load();
      }
    }
  };

  const stopAdhanPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingPreview(false);
    setIsLoadingAudio(false);
  };

  const toggleNotification = (type: 'adhan' | 'athkar') => {
    const updated = { ...notifications, [type]: !notifications[type] };
    setNotifications(updated);
    localStorage.setItem('byan_notifications', JSON.stringify(updated));
  };

  return (
    <div className="page-transition space-y-8 pb-24 max-w-4xl mx-auto text-right">
      <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-islamic/10 dark:bg-emerald-islamic/20 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden">
            <User size={48} className="text-emerald-islamic" />
          </div>
          <div className="absolute bottom-1 right-1 bg-amber-gold w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-lg"></div>
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-slate-100">حمزة هلال</h2>
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mt-1">
          <MapPin size={14} />
          <span className="text-sm font-medium">القاهرة، جمهورية مصر العربية</span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 px-4 justify-end">
          <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">إعدادات الأذان والصلوات</h3>
          <Headphones size={18} className="text-emerald-islamic" />
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
          <div className="p-6 border-b border-gray-50 dark:border-slate-700/50 flex items-center justify-between">
            <button 
              onClick={() => toggleNotification('adhan')}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${notifications.adhan ? 'bg-emerald-islamic' : 'bg-gray-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${notifications.adhan ? 'translate-x-1' : 'translate-x-8'}`}></div>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-gray-700 dark:text-slate-200">تنبيهات الأذان</p>
                <p className="text-xs text-gray-400">تفعيل صوت الأذان التلقائي عند دخول الوقت</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-islamic">
                <Bell size={24} />
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-50 dark:border-slate-700/50 space-y-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={toggleAdhanPreview}
                disabled={isLoadingAudio}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
                  isPlayingPreview 
                  ? 'bg-amber-gold text-white shadow-amber-200' 
                  : isLoadingAudio
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-emerald-islamic text-white shadow-emerald-100 hover:bg-emerald-600'
                }`}
              >
                {isLoadingAudio ? <Loader2 size={16} className="animate-spin" /> : (isPlayingPreview ? <Pause size={16} /> : <Play size={16} />)}
                <span>
                  {isLoadingAudio ? 'جاري التحميل...' : (isPlayingPreview ? 'إيقاف التجربة' : 'استماع للأذان')}
                </span>
              </button>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-700 dark:text-slate-200">صوت المؤذن المفضل</p>
                  <p className="text-xs text-gray-400">سيتم استخدام هذا الصوت للتنبيهات التلقائية</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-gold">
                  <Music size={24} />
                </div>
              </div>
            </div>

            {audioError && (
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold justify-end animate-in fade-in slide-in-from-top-2">
                <span>{audioError}</span>
                <AlertCircle size={18} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ADHAN_VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => handleVoiceChange(voice.id)}
                  className={`px-4 py-3.5 rounded-2xl text-xs font-black border transition-all text-center ${
                    selectedVoice === voice.id 
                    ? 'bg-emerald-islamic text-white border-emerald-islamic shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-gray-500 border-gray-100 dark:border-slate-700 hover:border-emerald-islamic/30'
                  }`}
                >
                  {voice.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 bg-gray-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 mb-6 justify-end">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">فوارق وقت الإقامة (بالدقائق بعد الأذان)</p>
              <Timer size={16} className="text-gray-400" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((key) => {
                const names: Record<string, string> = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
                return (
                  <div key={key} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:scale-105 group text-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest group-hover:text-emerald-islamic transition-colors">{names[key]}</label>
                    <input 
                      type="number"
                      value={offsets[key]}
                      onChange={(e) => handleOffsetChange(key, e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-700/50 rounded-xl px-2 py-2 font-black text-center text-emerald-islamic focus:outline-none transition-all text-lg"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 px-4 justify-end">
          <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">تخصيص التطبيق</h3>
          <Globe size={18} className="text-emerald-islamic" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-slate-700">
          <div className="flex items-center justify-between p-6">
            <button 
              onClick={toggleDarkMode}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${isDarkMode ? 'bg-emerald-islamic' : 'bg-gray-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-1' : 'translate-x-8'}`}></div>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-gray-700 dark:text-slate-200">المظهر الليلي</p>
                <p className="text-xs text-gray-400">تغيير السمة حسب الإضاءة المحيطة</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4">
        <button className="w-full bg-red-50 dark:bg-red-900/10 text-red-500 py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-3 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95 border border-red-100 dark:border-red-900/20 shadow-lg shadow-red-100">
          <LogOut size={24} />
          تسجيل الخروج من الحساب
        </button>
      </div>
    </div>
  );
};

export default Settings;
