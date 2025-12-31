
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';

interface LoginProps {
  onAuthSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [recoveryName, setRecoveryName] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const users: User[] = JSON.parse(localStorage.getItem('sellit_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        if (!user.is_active) {
          setError("Your account is suspended. Contact administration.");
          setLoading(false);
          return;
        }

        // Update last login
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, last_login_at: new Date().toISOString() } : u
        );
        localStorage.setItem('sellit_users', JSON.stringify(updatedUsers));
        
        onAuthSuccess(user);
        navigate('/dashboard');
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    }, 800);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setRecoverySent(true);
      setLoading(false);
    }, 1000);
  };

  if (view === 'forgot') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-zinc-900 rounded-[2rem] border border-zinc-800 p-8 lg:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-white mb-2">Find Your Account</h1>
            <p className="text-zinc-500 font-medium">Enter your details and we'll help you get back in.</p>
          </div>

          {recoverySent ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-medium">
                Instructions have been sent if an account matches <span className="text-white font-bold">{recoveryName}</span>.
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/signup" className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all text-center">Create New Account</Link>
                <button onClick={() => { setView('login'); setRecoverySent(false); }} className="text-zinc-500 hover:text-white text-sm font-bold py-2">Back to Login</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRecovery} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest text-[10px]">Your Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-zinc-800 font-medium"
                  placeholder="The name on your profile"
                  value={recoveryName}
                  onChange={e => setRecoveryName(e.target.value)}
                />
              </div>
              <button 
                disabled={loading}
                type="submit"
                className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 transition-all disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Send Recovery Instructions'}
              </button>
              <div className="text-center pt-4">
                <button type="button" onClick={() => setView('login')} className="text-zinc-500 hover:text-white text-sm font-bold">Return to Login</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-zinc-900 rounded-[2rem] border border-zinc-800 p-8 lg:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-500 font-medium">Log in to your Sell It account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest text-[10px]">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-zinc-800 font-medium"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest text-[10px]">Password</label>
            <input 
              required
              type="password" 
              className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-zinc-800 font-medium"
              placeholder="Your secure password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-center space-y-6">
          <p className="text-zinc-500 text-sm font-medium">
            Don't have an account? <Link to="/signup" className="text-emerald-500 hover:text-emerald-400 font-bold ml-1">Create one now</Link>
          </p>
          <button onClick={() => setView('forgot')} className="text-zinc-600 hover:text-zinc-400 text-xs font-medium transition-colors">Forgot password?</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
