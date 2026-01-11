
import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, RotateCcw, Calendar, TrendingUp } from 'lucide-react';
import { HifzGoal } from '../types';

const Hifz: React.FC = () => {
  const [goals, setGoals] = useState<HifzGoal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', verses: 0, date: '' });

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
    setNewGoal({ title: '', verses: 0, date: '' });
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

  const streak = 5; // Static for prototype

  return (
    <div className="page-transition space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">مخطط الحفظ</h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-emerald-islamic text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Stats Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">سلسلة الحفظ</p>
            <p className="text-2xl font-bold text-gray-800">{streak} أيام متواصلة</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-islamic">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">الآيات المنجزة</p>
            <p className="text-2xl font-bold text-gray-800">124 آية</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <RotateCcw size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">مراجعة اليوم</p>
            <p className="text-2xl font-bold text-gray-800">سورة الملك</p>
          </div>
        </div>
      </section>

      {/* Goals List */}
      <section className="space-y-4">
        <h3 className="font-bold text-gray-700">أهدافي الحالية</h3>
        {goals.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400">
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا توجد أهداف حفظ حالية، ابدأ بإضافة هدف جديد</p>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-gray-800">{goal.title}</h4>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Calendar size={14} /> تنتهي في {goal.targetDate}
                  </p>
                </div>
                <div className="text-emerald-islamic font-bold text-xl">
                  {Math.round((goal.completedVerses.length / goal.totalVerses) * 100)}%
                </div>
              </div>
              
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-islamic transition-all duration-500"
                  style={{ width: `${(goal.completedVerses.length / goal.totalVerses) * 100}%` }}
                ></div>
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: Math.min(goal.totalVerses, 10) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => toggleVerse(goal.id, i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      goal.completedVerses.includes(i + 1)
                        ? 'bg-emerald-islamic text-white'
                        : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-emerald-islamic/30'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {goal.totalVerses > 10 && <span className="text-gray-300 self-end px-2">... {goal.totalVerses}</span>}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 space-y-4 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300">
            <h3 className="text-xl font-bold text-emerald-islamic text-center mb-4">إضافة هدف حفظ جديد</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="اسم السورة أو الجزء"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:outline-emerald-islamic font-medium"
                value={newGoal.title}
                onChange={e => setNewGoal({...newGoal, title: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="عدد الآيات"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:outline-emerald-islamic font-medium"
                value={newGoal.verses || ''}
                onChange={e => setNewGoal({...newGoal, verses: Number(e.target.value)})}
              />
              <input 
                type="date" 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:outline-emerald-islamic font-medium"
                value={newGoal.date}
                onChange={e => setNewGoal({...newGoal, date: e.target.value})}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button 
                onClick={addGoal}
                className="flex-1 bg-emerald-islamic text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200"
              >
                حفظ الهدف
              </button>
              <button 
                onClick={() => setShowAdd(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold"
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
