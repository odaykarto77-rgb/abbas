
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';

interface SignupProps {
  onAuthSuccess: (user: User) => void;
}

const Signup: React.FC<SignupProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('investor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const users: User[] = JSON.parse(localStorage.getItem('sellit_users') || '[]');
      
      // Check for existing email
      if (users.find(u => u.email === email)) {
        setError("Email already registered.");
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        full_name: name,
        email,
        password, // In real app, this would be hashed
        role: selectedRole,
        avatar: `https://picsum.photos/seed/${email}/200`,
        rating: 5.0,
        is_verified: false,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      const updatedUsers = [...users, newUser];
      localStorage.setItem('sellit_users', JSON.stringify(updatedUsers));
      
      onAuthSuccess(newUser);
      navigate('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full bg-zinc-900 rounded-[2.5rem] border border-zinc-800 p-8 lg:p-14 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Create Your Sell It Account</h1>
          <p className="text-zinc-500 font-medium">Join the Sell It network in less than a minute</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-bold text-zinc-400 mb-2">Step 1: Choose your role</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setSelectedRole('investor')}
                className={`p-5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 ${selectedRole === 'investor' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span className="font-bold text-sm text-inherit">Investor</span>
              </button>
              <button 
                type="button"
                onClick={() => setSelectedRole('owner')}
                className={`p-5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 ${selectedRole === 'owner' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                <span className="font-bold text-sm text-inherit">Idea Owner</span>
              </button>
            </div>
          </div>

          <div className="space-y-5 pt-4 border-t border-zinc-800">
            <p className="text-sm font-bold text-zinc-400 mb-2">Step 2: Account details</p>
            <input 
              required
              type="text" 
              className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input 
              required
              type="email" 
              className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input 
              required
              type="password" 
              className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-4 p-5 bg-black rounded-2xl border border-zinc-800">
             <input 
              type="checkbox" 
              required 
              checked={agree}
              onChange={e => setAgree(e.target.checked)}
              className="mt-1 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 w-5 h-5 cursor-pointer" 
             />
             <span className="text-xs text-zinc-400 font-medium leading-relaxed">
               I agree that Sell It connects people and is not part of any deal.
             </span>
          </div>

          <button 
            disabled={loading || !agree}
            type="submit"
            className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-bold text-lg hover:bg-emerald-400 shadow-2xl shadow-emerald-500/10 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm font-medium">
            Already have an account? <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-bold ml-1">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
