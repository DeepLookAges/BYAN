
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { User, Mail, Phone, Lock, ArrowRight, Loader2, CheckCircle2, ShieldCheck, MailQuestion } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [view, setView] = useState<'register' | 'verify'>('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    otp: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: method === 'email' ? formData.email : undefined,
        phone: method === 'phone' ? formData.phone : undefined,
        options: {
          data: { full_name: formData.name },
          shouldCreateUser: true,
        }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'تم إرسال رمز التحقق بنجاح!' });
      setView('verify');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'حدث خطأ أثناء الإرسال' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: method === 'email' ? formData.email : undefined,
        phone: method === 'phone' ? formData.phone : undefined,
        token: formData.otp,
        type: method === 'email' ? 'magiclink' : 'sms'
      });

      if (error) throw error;
      
      // التوجيه سيتم تلقائياً عبر App.tsx عند رصد تغير الحالة
    } catch (error: any) {
      setMessage({ type: 'error', text: 'رمز التحقق غير صحيح أو انتهت صلاحيته' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFDF9] flex flex-col items-center justify-center p-6 dir-rtl">
      {/* Logo Area */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-emerald-islamic rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-100">
          <ShieldCheck className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-emerald-islamic">بَيَان</h1>
        <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">رفيقك في رحلة القرآن</p>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-2xl shadow-emerald-50 border border-emerald-50 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-islamic"></div>
        
        {view === 'register' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-800">إنشاء حساب</h2>
              <p className="text-gray-400 text-sm mt-1">أهلاً بك في بيان، سجل للبدء</p>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="text"
                  placeholder="الاسم الكامل"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-islamic/20 transition-all font-bold"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Method Switcher */}
              <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${method === 'email' ? 'bg-emerald-islamic text-white shadow-lg' : 'text-gray-400'}`}
                >
                  بالبريد الإلكتروني
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${method === 'phone' ? 'bg-emerald-islamic text-white shadow-lg' : 'text-gray-400'}`}
                >
                  برقم الهاتف
                </button>
              </div>

              {/* Email or Phone Input */}
              {method === 'email' ? (
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-islamic/20 transition-all font-bold"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              ) : (
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="tel"
                    placeholder="+20 123 456 7890"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-emerald-islamic/20 transition-all font-bold dir-ltr text-right"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <MailQuestion size={18} />}
                <span>{message.text}</span>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-islamic text-white py-5 rounded-[2rem] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>إرسال الرمز <ArrowRight size={20} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-800">تحقق من الرمز</h2>
              <p className="text-gray-400 text-sm mt-1">أدخل الرمز المرسل إلى {method === 'email' ? formData.email : formData.phone}</p>
            </div>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type="text"
                placeholder="رمز التحقق (OTP)"
                className="w-full bg-gray-50 border-none rounded-2xl py-5 pr-12 pl-4 focus:ring-2 focus:ring-emerald-islamic/20 transition-all font-black text-center text-2xl tracking-[0.5em]"
                value={formData.otp}
                onChange={e => setFormData({...formData, otp: e.target.value})}
              />
            </div>

            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <MailQuestion size={18} />}
                <span>{message.text}</span>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-islamic text-white py-5 rounded-[2rem] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'تأكيد الرمز'}
            </button>

            <button
              type="button"
              onClick={() => setView('register')}
              className="w-full text-gray-400 font-bold text-sm hover:text-emerald-islamic transition-all"
            >
              العودة لتعديل البيانات
            </button>
          </form>
        )}
      </div>

      <footer className="mt-12 text-center">
        <p className="text-gray-400 text-xs font-medium">تم التطوير بواسطة <a href="https://hamzahub.shop" target="_blank" className="text-emerald-islamic font-bold">HAMZA Hilal</a></p>
      </footer>
    </div>
  );
};

export default Auth;
