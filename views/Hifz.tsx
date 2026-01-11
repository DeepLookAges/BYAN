
import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, Plus, CheckCircle2, RotateCcw, Calendar, 
  TrendingUp, Mic, Play, Pause, Square, Trash2, 
  Headphones, RefreshCw, X, Check, Save, Volume2,
  BookOpen 
} from 'lucide-react';
import { HifzGoal } from '../types';

const Hifz: React.FC = () => {
  const [goals, setGoals] = useState<HifzGoal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', verses: 0, date: '', surahNumber: 1 });
  const [recitationMode, setRecitationMode] = useState<{ goal: HifzGoal; verse: number } | null>(null);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recDuration, setRecDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Prof Recitation State
  const [isPlayingProf, setIsPlayingProf] = useState(false);
  const profAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('byan_hifz_goals');
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  const saveGoals = (updated: HifzGoal[]) => {
    setGoals(updated);
    localStorage.setItem('byan_hifz_goals', JSON.stringify(updated));
  };

  const addGoal = () => {
    if (!newGoal.title) return;
    const goal: HifzGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title: newGoal.title,
      targetDate: newGoal.date,
      totalVerses: newGoal.verses,
      completedVerses: [],
      isCompleted: false
    };
    saveGoals([...goals, goal]);
    setShowAdd(false);
    setNewGoal({ title: '', verses: 0, date: '', surahNumber: 1 });
  };

  const toggleVerse = (goalId: string, verseNum: number) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        const completed = g.completedVerses.includes(verseNum)
          ? g.completedVerses.filter(v => v !== verseNum)
          : [...g.completedVerses, verseNum];
        return { ...g, completedVerses: completed, isCompleted: completed.length === g.totalVerses };
      }
      return g;
    });
    saveGoals(updated);
  };

  // --- Recitation Mode Logic ---

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordingUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      alert("يرجى السماح بالوصول إلى الميكروفون لاستخدام هذه الميزة.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const toggleProfAudio = () => {
    if (!profAudioRef.current || !recitationMode) return;
    
    if (isPlayingProf) {
      profAudioRef.current.pause();
      setIsPlayingProf(false);
    } else {
      // For prototype, we use a generic ayah audio API structure
      // Real implementation would need precise mapping of goal title to surah number
      const surahNum = 1; // Defaulting to 1 for prototype
      profAudioRef.current.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3`; // Placeholder
      profAudioRef.current.play();
      setIsPlayingProf(true);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-transition space-y-6 pb-20 max-w-5xl mx-auto px-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-slate-100">مخطط الحفظ</h2>
          <p className="text-emerald-islamic text-sm font-bold mt-1">"وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ"</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-emerald-islamic text-white p-4 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={24} /> <span className="font-black text-sm hidden sm:inline">إضافة هدف</span>
        </button>
      </div>

      {/* Stats Dashboard */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-orange-500 shadow-inner">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">سلسلة الحفظ</p>
            <p className="text-2xl font-black text-gray-800 dark:text-slate-100">7 أيام</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-islamic shadow-inner">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">الآيات المنجزة</p>
            <p className="text-2xl font-black text-gray-800 dark:text-slate-100">142 آية</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-500 shadow-inner">
            <RotateCcw size={28} />
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">مراجعة اليوم</p>
            <p className="text-2xl font-black text-gray-800 dark:text-slate-100">سورة الملك</p>
          </div>
        </div>
      </section>

      {/* Goals List */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
           <Target size={18} className="text-emerald-islamic" />
           <h3 className="font-black text-gray-700 dark:text-slate-200 uppercase tracking-widest text-xs">أهدافي الحالية</h3>
        </div>
        
        {goals.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-[3rem] p-16 text-center text-gray-400">
            <Target size={64} className="mx-auto mb-6 opacity-20" />
            <p className="font-bold text-lg">لا توجد أهداف حفظ حالية</p>
            <p className="text-xs mt-2">ابدأ رحلة الحفظ بإضافة سورة أو جزء ترغب في إتقانه</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-slate-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-slate-700 shadow-sm space-y-6 transition-all hover:shadow-xl group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {/* Fixed Error: Added BookOpen to lucide-react imports */}
                    <div className="w-12 h-12 rounded-2xl bg-emerald-islamic text-white flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                       <BookOpen size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-gray-800 dark:text-slate-100">{goal.title}</h4>
                      <p className="text-[10px] text-gray-400 font-black uppercase flex items-center gap-1.5 mt-1 tracking-widest">
                        <Calendar size={12} /> ينتهي في {goal.targetDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-emerald-islamic font-black text-2xl flex flex-col items-end">
                    {Math.round((goal.completedVerses.length / goal.totalVerses) * 100)}%
                    <span className="text-[10px] opacity-40 uppercase tracking-widest">منجز</span>
                  </div>
                </div>
                
                <div className="w-full h-4 bg-gray-50 dark:bg-slate-900 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700 shadow-inner">
                  <div 
                    className="h-full bg-emerald-islamic transition-all duration-700 ease-out shadow-lg shadow-emerald-200"
                    style={{ width: `${(goal.completedVerses.length / goal.totalVerses) * 100}%` }}
                  ></div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">تتبع الآيات <span className="w-full h-px bg-gray-100 dark:bg-slate-700"></span></p>
                  <div className="flex flex-wrap gap-2.5">
                    {Array.from({ length: Math.min(goal.totalVerses, 15) }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => toggleVerse(goal.id, i + 1)}
                          className={`w-10 h-10 rounded-2xl text-xs font-black transition-all transform active:scale-90 border-2 ${
                            goal.completedVerses.includes(i + 1)
                              ? 'bg-emerald-islamic text-white border-emerald-islamic shadow-md'
                              : 'bg-gray-50 dark:bg-slate-900 text-gray-400 border-gray-100 dark:border-slate-700 hover:border-emerald-islamic/30'
                          }`}
                        >
                          {i + 1}
                        </button>
                        <button 
                          onClick={() => setRecitationMode({ goal, verse: i + 1 })}
                          className={`p-1.5 rounded-lg transition-all ${recitationMode?.verse === i + 1 && recitationMode?.goal.id === goal.id ? 'bg-amber-gold text-white' : 'text-gray-300 hover:text-amber-gold'}`}
                          title="نمط التسميع"
                        >
                          <Mic size={12} />
                        </button>
                      </div>
                    ))}
                    {goal.totalVerses > 15 && <span className="text-gray-300 self-center px-2 font-black">...</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recitation Mode Modal */}
      {recitationMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300 flex flex-col items-center text-center">
             <div className="w-full flex justify-between items-center mb-10">
                <div className="flex items-center gap-4 text-right">
                   <div className="bg-amber-gold p-4 rounded-3xl text-white shadow-xl shadow-amber-200 dark:shadow-none"><Mic size={28} /></div>
                   <div>
                     <h4 className="font-black text-2xl text-gray-800 dark:text-slate-100">نمط التسميع</h4>
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{recitationMode.goal.title} - آية {recitationMode.verse}</p>
                   </div>
                </div>
                <button onClick={() => { setRecitationMode(null); stopRecording(); }} className="p-3 text-gray-300 hover:text-red-500 rounded-2xl transition-all"><X size={32} /></button>
             </div>

             <div className="w-full bg-gray-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] mb-10 border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">تلاوة تعليمية</p>
                <button 
                  onClick={toggleProfAudio}
                  className="flex items-center justify-center gap-4 bg-white dark:bg-slate-800 px-8 py-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-slate-700 group w-full"
                >
                  <div className={`p-3 rounded-2xl transition-all ${isPlayingProf ? 'bg-amber-gold text-white' : 'bg-emerald-islamic text-white group-hover:scale-110'}`}>
                    {isPlayingProf ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-islamic">الشيخ مشاري العفاسي</p>
                    <p className="text-[9px] text-gray-400 font-bold">تلاوة مرشدة للإتقان</p>
                  </div>
                </button>
                <audio ref={profAudioRef} onEnded={() => setIsPlayingProf(false)} hidden />
             </div>

             <div className="w-full flex flex-col items-center gap-8">
                <div className="relative">
                   <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-2xl transform active:scale-90 ${
                      isRecording 
                      ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-100 dark:ring-red-900/20' 
                      : 'bg-emerald-islamic text-white shadow-emerald-200 ring-8 ring-emerald-50 dark:ring-emerald-900/10'
                    }`}
                   >
                     {isRecording ? <Square size={40} fill="currentColor" /> : <Mic size={40} />}
                   </button>
                   {isRecording && (
                     <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-black text-red-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        {formatTime(recDuration)}
                     </div>
                   )}
                </div>

                <p className="font-black text-gray-500 text-sm mt-4">
                  {isRecording ? "جاري التسجيل... اضغط للإيقاف" : (recordingUrl ? "تم التسجيل! استمع وقارن" : "اضغط لبدء تسجيل تلاوتك")}
                </p>

                {recordingUrl && (
                  <div className="w-full flex items-center gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex-1 bg-gray-50 dark:bg-slate-900 p-6 rounded-[2rem] flex items-center justify-between border border-emerald-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-islamic text-white flex items-center justify-center">
                            <Volume2 size={20} />
                         </div>
                         <p className="text-xs font-black text-emerald-islamic uppercase tracking-widest">تلاوتك</p>
                      </div>
                      <audio src={recordingUrl} controls className="h-10 w-40 opacity-80" />
                    </div>
                    <button 
                      onClick={() => { setRecordingUrl(null); setRecDuration(0); }}
                      className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="حذف"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                )}
             </div>

             <div className="w-full grid grid-cols-2 gap-4 mt-12">
                <button 
                  onClick={() => {
                    toggleVerse(recitationMode.goal.id, recitationMode.verse);
                    setRecitationMode(null);
                  }}
                  className="bg-emerald-islamic text-white py-5 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 transition-all"
                >
                  <Check size={20} /> تم الإتقان
                </button>
                <button 
                  onClick={() => { setRecitationMode(null); stopRecording(); }}
                  className="bg-gray-100 dark:bg-slate-700 text-gray-500 py-5 rounded-[2rem] font-black text-sm"
                >
                  إغلاق
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] max-w-sm w-full p-10 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-emerald-islamic">هدف حفظ جديد</h3>
              <p className="text-xs text-gray-400 font-bold">ابدأ رحلة الإتقان والتدبر</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">اسم السورة / الجزء</label>
                <input 
                  type="text" 
                  placeholder="مثال: سورة الملك"
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 focus:ring-4 focus:ring-emerald-islamic/10 focus:outline-none font-bold transition-all"
                  value={newGoal.title}
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">إجمالي الآيات</label>
                <input 
                  type="number" 
                  placeholder="مثال: 30"
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 focus:ring-4 focus:ring-emerald-islamic/10 focus:outline-none font-bold transition-all"
                  value={newGoal.verses || ''}
                  onChange={e => setNewGoal({...newGoal, verses: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">تاريخ الإنجاز المستهدف</label>
                <input 
                  type="date" 
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 focus:ring-4 focus:ring-emerald-islamic/10 focus:outline-none font-bold transition-all text-right"
                  value={newGoal.date}
                  onChange={e => setNewGoal({...newGoal, date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button 
                onClick={addGoal}
                className="flex-1 bg-emerald-islamic text-white py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 transition-all active:scale-95"
              >
                حفظ الهدف
              </button>
              <button 
                onClick={() => setShowAdd(false)}
                className="px-6 py-5 bg-gray-100 dark:bg-slate-700 text-gray-500 rounded-[2rem] font-black text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hifz;
