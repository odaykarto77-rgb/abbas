
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';

interface SignupProps {
  onAuthSuccess: (user: User) => void;
}

const Signup: React.FC<SignupProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const isTestMode = localStorage.getItem('sellit_config_testmode') === 'true';
  
  // Strict Role Control: Testers are forced into 'standard' role.
  // Investors/Owners can only be created in production mode.
  const [selectedRole, setSelectedRole] = useState<UserRole>(isTestMode ? 'standard' : 'investor');
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

    // Enforce role assignment server-side (simulated here)
    const finalRole: UserRole = isTestMode ? 'standard' : selectedRole;

    setTimeout(() => {
      const users: User[] = JSON.parse(localStorage.getItem('sellit_users') || '[]');
      
      if (users.find(u => u.email === email)) {
        setError("Email already registered in this environment.");
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        full_name: name,
        email,
        password, 
        role: finalRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        rating: 5.0,
        is_verified: true, // Auto-verify in test mode for better UX
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      const updatedUsers = [...users, newUser];
      localStorage.setItem('sellit_users', JSON.stringify(updatedUsers));
      
      onAuthSuccess(newUser);
      navigate('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full bg-zinc-900 rounded-[2.5rem] border border-zinc-800 p-8 lg:p-14 shadow-2xl relative overflow-hidden">
        {isTestMode && (
          <div className="absolute top-0 right-0 px-6 py-2 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">
            Test Environment
          </div>
        )}
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight uppercase">Terminal Enrollment</h1>
          <p className="text-zinc-500 font-medium">
            {isTestMode ? 'Join the Private Beta Sandbox' : 'Register for the Sell It Network'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">
          
          {/* Role selector HIDDEN in Test Mode to prevent permission selection */}
          {!isTestMode ? (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest">Step 1: Choose your role</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setSelectedRole('investor')}
                  className={`p-5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 ${selectedRole === 'investor' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span className="font-black text-[10px] uppercase tracking-widest">Investor</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedRole('owner')}
                  className={`p-5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 ${selectedRole === 'owner' ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                  <span className="font-black text-[10px] uppercase tracking-widest">Idea Owner</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl">
               <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Assigned Clearance</p>
               <p className="text-white font-bold text-sm uppercase tracking-tighter">Standard Tester Access</p>
            </div>
          )}

          <div className={`space-y-5 ${!isTestMode ? 'pt-4 border-t border-zinc-800' : ''}`}>
            <p className="text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest">Account Details</p>
            <input 
              required
              type="text" 
              autoComplete="name"
              className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-bold placeholder-zinc-800 text-sm"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input 
              required
              type="email" 
              autoComplete="email"
              className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-bold placeholder-zinc-800 text-sm"
              placeholder="Email Protocol"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input 
              required
              type="password" 
              autoComplete="new-password"
              className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-bold placeholder-zinc-800 text-sm"
              placeholder="Secure Passphrase"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-4 p-5 bg-black/40 rounded-2xl border border-zinc-800">
             <input 
              type="checkbox" 
              required 
              checked={agree}
              onChange={e => setAgree(e.target.checked)}
              className="mt-1 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 w-5 h-5 cursor-pointer" 
             />
             <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-relaxed">
               I agree to the beta testing protocol and platform use-only policy.
             </span>
          </div>

          <button 
            disabled={loading || !agree}
            type="submit"
            className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-emerald-400 shadow-2xl shadow-emerald-500/10 transition-all disabled:opacity-50"
          >
            {loading ? 'Transmitting...' : 'Access Terminal'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
            Already registered? <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-bold ml-1">Access Terminal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
