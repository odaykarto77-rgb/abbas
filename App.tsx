
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { User, BusinessIdea, Message, Agreement } from './types';
import { initializeDB, MOCK_IDEAS, MOCK_MESSAGES, MOCK_AGREEMENTS } from './mockData';

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
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>(MOCK_AGREEMENTS);
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize DB and Check Session on Mount
  useEffect(() => {
    initializeDB();
    const sessionUserId = localStorage.getItem('sellit_session');
    
    // Sync messages from local storage
    const savedMessages = JSON.parse(localStorage.getItem('sellit_messages') || '[]');
    setMessages(savedMessages.length > 0 ? savedMessages : MOCK_MESSAGES);

    // Sync ideas from local storage (Global shared data)
    const savedIdeas = JSON.parse(localStorage.getItem('sellit_ideas') || '[]');
    setIdeas(savedIdeas);
    
    if (sessionUserId) {
      const users: User[] = JSON.parse(localStorage.getItem('sellit_users') || '[]');
      const user = users.find(u => u.id === sessionUserId);
      if (user && user.is_active) {
        setCurrentUser(user);
      } else {
        localStorage.removeItem('sellit_session');
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for storage changes to sync across tabs/pages
  useEffect(() => {
    const handleStorageChange = () => {
      const savedMessages = JSON.parse(localStorage.getItem('sellit_messages') || '[]');
      setMessages(savedMessages);

      const savedIdeas = JSON.parse(localStorage.getItem('sellit_ideas') || '[]');
      setIdeas(savedIdeas);

      const sessionUserId = localStorage.getItem('sellit_session');
      if (sessionUserId) {
        const users: User[] = JSON.parse(localStorage.getItem('sellit_users') || '[]');
        const user = users.find(u => u.id === sessionUserId);
        if (user) setCurrentUser(user);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sellit_session');
    setCurrentUser(null);
    navigate('/');
  };

  const updateSession = (user: User) => {
    localStorage.setItem('sellit_session', user.id);
    setCurrentUser(user);
  };

  // Persistent setter for ideas
  const handleSetIdeas = (val: React.SetStateAction<BusinessIdea[]>) => {
    setIdeas(current => {
      const next = typeof val === 'function' ? (val as (prev: BusinessIdea[]) => BusinessIdea[])(current) : val;
      localStorage.setItem('sellit_ideas', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    // Update users in storage
    const users: User[] = JSON.parse(localStorage.getItem('sellit_users') || '[]');
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('sellit_users', JSON.stringify(updatedUsers));
    // Trigger storage event for other components/tabs
    window.dispatchEvent(new Event('storage'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const userMessages = messages.filter(m => m.sender_id === currentUser?.id || m.receiver_id === currentUser?.id);
  const hasMessages = userMessages.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans">
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
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">ID: {currentUser.id.toUpperCase()}</p>
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
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={currentUser ? <Dashboard currentUser={currentUser} ideas={ideas} agreements={agreements} /> : <Navigate to="/login" />} 
          />
          <Route path="/idea/:id" element={<IdeaDetail ideas={ideas} currentUser={currentUser} onUpdateIdeas={handleSetIdeas} />} />
          <Route 
            path="/messages" 
            element={currentUser ? <Messaging currentUser={currentUser} messages={messages} setMessages={setMessages} users={JSON.parse(localStorage.getItem('sellit_users') || '[]')} ideas={ideas} onAgreement={() => navigate('/agreement/new')} /> : <Navigate to="/login" />} 
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
            element={currentUser?.role === 'admin' ? <AdminPanel ideas={ideas} users={JSON.parse(localStorage.getItem('sellit_users') || '[]')} messages={messages} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/create-idea" 
            element={currentUser?.role === 'owner' ? <CreateIdea currentUser={currentUser} setIdeas={handleSetIdeas} /> : <Navigate to="/dashboard" />} 
          />
        </Routes>
      </main>

      <footer className="bg-zinc-950 py-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
             Sell It © {new Date().getFullYear()} • Secure Strategic Terminal
           </div>
           <div className="flex gap-8">
             <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest cursor-default">Privacy</span>
             <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest cursor-default">Compliance</span>
             <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest cursor-default">Integrity</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
