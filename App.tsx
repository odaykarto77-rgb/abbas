
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { User, BusinessIdea, Message, Agreement } from './types';
import { initializeDB, MOCK_IDEAS, MOCK_MESSAGES, MOCK_AGREEMENTS } from './mockData';
import { Storage } from './services/Storage';
import { Logger } from './services/Logger';

// Pages
import Landing from './pages/Landing';
import IdeaDetail from './pages/IdeaDetail';
import Messaging from './pages/Messaging';
import AgreementPage from './pages/AgreementPage';
import AdminPanel from './pages/AdminPanel';
import CreateIdea from './pages/CreateIdea';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProfileSettings from './pages/ProfileSettings';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(localStorage.getItem('sellit_config_testmode') === 'true');
  const [testAccessGranted, setTestAccessGranted] = useState(localStorage.getItem('sellit_test_access') === 'true');
  const [testKeyInput, setTestKeyInput] = useState('');
  
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>(MOCK_AGREEMENTS);
  
  const location = useLocation();
  const navigate = useNavigate();

  // URL Parameter Handling for Private Testing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    const keyParam = params.get('key');

    if (modeParam === 'test' && !isTestMode) {
      localStorage.setItem('sellit_config_testmode', 'true');
      setIsTestMode(true);
      Logger.log('Test mode activated via URL parameter', 'INFO');
      window.location.reload(); 
    }

    if (keyParam?.toUpperCase() === 'SELLIT-TEST-2025' && !testAccessGranted) {
      localStorage.setItem('sellit_test_access', 'true');
      setTestAccessGranted(true);
      Logger.log('Test access granted via URL secret key', 'INFO');
    }
  }, [location, isTestMode, testAccessGranted]);

  // Initialize DB and Check Session
  useEffect(() => {
    initializeDB();
    const sessionUserId = Storage.get('session');
    
    const savedMessages = JSON.parse(Storage.get('messages') || '[]');
    setMessages(savedMessages);

    const savedIdeas = JSON.parse(Storage.get('ideas') || '[]');
    setIdeas(savedIdeas);
    
    if (sessionUserId) {
      const users: User[] = JSON.parse(Storage.get('users') || '[]');
      const user = users.find(u => u.id === sessionUserId);
      if (user && user.is_active) {
        setCurrentUser(user);
      } else {
        Storage.remove('session');
      }
    }
    setIsLoading(false);
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const handleStorageChange = () => {
      const savedMessages = JSON.parse(Storage.get('messages') || '[]');
      setMessages(savedMessages);

      const savedIdeas = JSON.parse(Storage.get('ideas') || '[]');
      setIdeas(savedIdeas);

      const sessionUserId = Storage.get('session');
      if (sessionUserId) {
        const users: User[] = JSON.parse(Storage.get('users') || '[]');
        const user = users.find(u => u.id === sessionUserId);
        if (user) setCurrentUser(user);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    Logger.log('User logout initiated', 'INFO', currentUser?.id);
    Storage.remove('session');
    setCurrentUser(null);
    navigate('/');
  };

  const updateSession = (user: User) => {
    Logger.log('User session established', 'INFO', user.id);
    Storage.set('session', user.id);
    setCurrentUser(user);
  };

  const handleSetIdeas = (val: React.SetStateAction<BusinessIdea[]>) => {
    setIdeas(current => {
      const next = typeof val === 'function' ? (val as (prev: BusinessIdea[]) => BusinessIdea[])(current) : val;
      Storage.set('ideas', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    const users: User[] = JSON.parse(Storage.get('users') || '[]');
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    Storage.set('users', JSON.stringify(updatedUsers));
    Logger.log('Profile updated', 'INFO', updatedUser.id);
  };

  const handleTestKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (testKeyInput.toUpperCase() === 'SELLIT-TEST-2025') {
      localStorage.setItem('sellit_test_access', 'true');
      setTestAccessGranted(true);
      Logger.log('Testing access key validated', 'INFO');
    } else {
      Logger.log('Failed access attempt', 'WARN', undefined, `Key used: ${testKeyInput}`);
      alert("INVALID CLEARANCE KEY");
    }
  };

  const toggleTestMode = () => {
    if (currentUser?.role !== 'admin') return;
    const newState = !isTestMode;
    localStorage.setItem('sellit_config_testmode', String(newState));
    localStorage.removeItem('sellit_test_access');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">Synchronizing Terminal</p>
      </div>
    );
  }

  // Testing Gate Splash
  if (isTestMode && !testAccessGranted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="scanline"></div>
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-12 rounded-[3rem] shadow-2xl relative z-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl mx-auto mb-8 flex items-center justify-center border border-emerald-500/20">
               <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Private Testing Portal</h1>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-relaxed">
              Authorized clearance required for sandbox access.
            </p>
          </div>
          <form onSubmit={handleTestKeySubmit} className="space-y-6">
            <input 
              autoFocus
              type="text" 
              placeholder="ENTER ACCESS KEY"
              value={testKeyInput}
              onChange={e => setTestKeyInput(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-2xl py-5 px-6 text-center text-white font-mono text-sm focus:border-emerald-500 outline-none transition-all placeholder-zinc-800"
            />
            <button type="submit" className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 shadow-xl shadow-emerald-500/10">
              Verify Credentials
            </button>
            {currentUser?.role === 'admin' && (
              <button type="button" onClick={toggleTestMode} className="w-full text-[9px] font-black text-zinc-700 uppercase tracking-widest hover:text-white transition-colors">
                Exit Testing Environment
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  const userMessages = messages.filter(m => m.sender_id === currentUser?.id || m.receiver_id === currentUser?.id);
  const hasMessages = userMessages.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans">
      
      {/* Test Environment Status Bar */}
      {isTestMode && (
        <div className="bg-gradient-to-r from-emerald-500 to-zinc-800 text-black h-8 flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)' , backgroundSize: '10px 10px' }}></div>
           <p className="relative z-10 text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
             <span className="animate-pulse">●</span>
             Private Sandbox Active
             <span className="hidden sm:inline opacity-60">•</span>
             <span className="hidden sm:inline opacity-60">ID: ALPHA-PROTOCOL-25</span>
             {currentUser?.role === 'admin' && (
               <button onClick={toggleTestMode} className="ml-4 bg-black text-white px-3 py-1 rounded text-[7px] hover:bg-white hover:text-black transition-all">TERMINATE TEST</button>
             )}
           </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-black text-emerald-500 tracking-tighter flex items-center group">
                SELL IT <span className="text-white ml-1 font-black uppercase group-hover:text-emerald-500 transition-colors">TERMINAL</span>
              </Link>
              {currentUser && (
                <div className="hidden sm:ml-12 sm:flex sm:space-x-10">
                  <Link to="/dashboard" className={`inline-flex items-center px-1 pt-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${location.pathname === '/dashboard' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-100'}`}>
                    Portfolio
                  </Link>
                  <Link to="/messages" className={`relative inline-flex items-center px-1 pt-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${location.pathname === '/messages' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-100'}`}>
                    Messages
                    {hasMessages && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-white uppercase tracking-tighter">{currentUser.full_name}</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">ROLE: {currentUser.role.toUpperCase()}</p>
                  </div>
                  <Link to="/profile">
                    <img src={currentUser.avatar} alt="Avatar" className="h-10 w-10 rounded-2xl grayscale border border-zinc-800 hover:border-emerald-500 transition-all cursor-pointer object-cover" />
                  </Link>
                  <button onClick={handleLogout} className="text-[10px] text-zinc-600 hover:text-rose-500 font-black uppercase tracking-[0.2em] transition-colors">Exit</button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Link 
                    to="/login" 
                    className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 transition-all text-center"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/10 transition-all text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onAuthSuccess={updateSession} />} />
          <Route path="/signup" element={<Signup onAuthSuccess={updateSession} />} />
          
          <Route 
            path="/dashboard" 
            element={currentUser ? <Dashboard currentUser={currentUser} ideas={ideas} agreements={agreements} /> : <Navigate to="/login" />} 
          />
          <Route path="/idea/:id" element={<IdeaDetail ideas={ideas} currentUser={currentUser} onUpdateIdeas={handleSetIdeas} />} />
          <Route 
            path="/messages" 
            element={currentUser ? <Messaging currentUser={currentUser} messages={messages} setMessages={setMessages} users={JSON.parse(Storage.get('users') || '[]')} ideas={ideas} onAgreement={() => navigate('/agreement/new')} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={currentUser ? <ProfileSettings currentUser={currentUser} onUpdateProfile={handleUpdateProfile} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/agreement/:id" 
            element={currentUser ? <AgreementPage agreements={agreements} setAgreements={setAgreements} currentUser={currentUser} ideas={ideas} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={currentUser?.role === 'admin' ? <AdminPanel ideas={ideas} users={JSON.parse(Storage.get('users') || '[]')} messages={messages} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/create-idea" 
            element={currentUser && (currentUser.role === 'owner' || currentUser.role === 'standard' || currentUser.role === 'admin') ? <CreateIdea currentUser={currentUser} setIdeas={handleSetIdeas} /> : <Navigate to="/dashboard" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer className="bg-zinc-950 py-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
             Sell It © {new Date().getFullYear()} • Private Beta v0.95
           </div>
           <div className="flex gap-8">
             {currentUser?.role === 'admin' && (
               <button onClick={toggleTestMode} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{isTestMode ? 'Exit Sandbox' : 'Enter Sandbox'}</button>
             )}
             <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest cursor-default">Compliance</span>
             <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest cursor-default">Integrity</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
