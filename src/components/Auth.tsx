import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Cpu, ShieldCheck, Mail, Key, User as UserIcon, ArrowRight } from 'lucide-react';

export function Auth({ onLogin }: { onLogin: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { email, password, username };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('lifescore_token', data.token);
        onLogin(data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20 mb-4">
              <Cpu className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">LifeScore AI</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Intelligent Behavioral Analytics</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input 
                    icon={<UserIcon size={18} />} 
                    placeholder="Full Name" 
                    value={username} 
                    onChange={setUsername}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input 
              icon={<Mail size={18} />} 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={setEmail}
            />
            
            <Input 
              icon={<Key size={18} />} 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={setPassword}
            />

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-xs text-red-500 font-bold text-center bg-red-50 dark:bg-red-950/20 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <button
              disabled={loading}
              className="w-full bg-brand text-white py-4 rounded-2xl font-black shadow-xl shadow-brand/20 flex items-center justify-center gap-2 hover:bg-brand-dark transition-all active:scale-[0.98] tracking-widest text-xs uppercase disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-brand font-bold hover:underline"
              >
                {isLogin ? 'Register now' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Input({ icon, type = 'text', placeholder, value, onChange }: any) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand">
        {icon}
      </div>
      <input
        required
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 py-4 pl-12 pr-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-all dark:text-white"
      />
    </div>
  );
}
