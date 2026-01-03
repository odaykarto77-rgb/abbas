
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, BusinessIdea, Message, Agreement } from '../types';

interface DashboardProps {
  currentUser: User | null;
  ideas: BusinessIdea[];
  agreements: Agreement[];
}

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_PATTERN = /\b(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g;

const Dashboard: React.FC<DashboardProps> = ({ currentUser, ideas, agreements }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [isTesterModalOpen, setIsTesterModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    const savedMessages = JSON.parse(localStorage.getItem('sellit_messages') || '[]');
    setLocalMessages(savedMessages);
  };

  useEffect(() => {
    fetchMessages();
    const contactId = searchParams.get('contact');
    if (contactId) {
      setActiveChatId(contactId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, activeChatId]);

  if (!currentUser) return null;

  const users: User[] = JSON.parse(localStorage.getItem('sellit_users') || '[]');

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          idea.short_summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || idea.category === categoryFilter;
    const isPublic = idea.status === 'published';
    const isMine = idea.user_id === currentUser.id;
    const isDraft = idea.status === 'draft';
    return matchesSearch && matchesCategory && (isPublic || (isMine && isDraft));
  });

  const handleResetData = () => {
    if (currentUser.role !== 'admin') return;
    if (confirm("Reset terminal state to factory defaults?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleCopyInviteLink = () => {
    if (currentUser.role !== 'admin') return;
    const baseUrl = window.location.origin + window.location.pathname;
    const inviteLink = `${baseUrl}#/dashboard?mode=test&key=SELLIT-TEST-2025`;
    navigator.clipboard.writeText(inviteLink);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const categories = ['All', 'SaaS', 'FinTech', 'Biotech', 'Environment', 'E-Commerce', 'AI / Machine Learning'];
  
  const chatParticipants = Array.from(new Set(
    localMessages.filter(m => m.sender_id === currentUser.id || m.receiver_id === currentUser.id)
      .map(m => m.sender_id === currentUser.id ? m.receiver_id : m.sender_id)
  )).map(id => users.find(u => u.id === id)).filter(Boolean) as User[];

  const activeMessages = localMessages.filter(m => 
    (m.sender_id === currentUser.id && m.receiver_id === activeChatId) ||
    (m.sender_id === activeChatId && m.receiver_id === currentUser.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    if (EMAIL_PATTERN.test(newMessage) || PHONE_PATTERN.test(newMessage)) {
      setSecurityWarning("SECURITY PROTOCOL: Direct contact sharing is prohibited.");
      setTimeout(() => setSecurityWarning(null), 5000);
      return;
    }

    const msg: Message = {
      id: `msg_${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: activeChatId,
      idea_id: '',
      message_text: newMessage,
      timestamp: new Date().toISOString()
    };

    const updated = [...localMessages, msg];
    setLocalMessages(updated);
    localStorage.setItem('sellit_messages', JSON.stringify(updated));
    setNewMessage('');
    window.dispatchEvent(new Event('storage'));
  };

  const handleContactOwner = (ownerId: string, ideaTitle: string) => {
    if (ownerId === currentUser.id) {
      alert("Note: This is your own idea.");
      return;
    }
    
    navigate(`/dashboard?contact=${ownerId}`);
    setActiveChatId(ownerId);
    
    const existing = localMessages.some(m => 
      (m.sender_id === currentUser.id && m.receiver_id === ownerId) ||
      (m.sender_id === ownerId && m.receiver_id === currentUser.id)
    );

    if (!existing) {
      const msg: Message = {
        id: `msg_init_${Date.now()}`,
        sender_id: currentUser.id,
        receiver_id: ownerId,
        idea_id: '',
        message_text: `System: Strategic handshake initiated regarding "${ideaTitle}".`,
        timestamp: new Date().toISOString()
      };
      const updated = [...localMessages, msg];
      setLocalMessages(updated);
      localStorage.setItem('sellit_messages', JSON.stringify(updated));
    }
  };

  const activeUser = users.find(u => u.id === activeChatId);
  const isTestEnvironment = localStorage.getItem('sellit_config_testmode') === 'true';

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative min-h-screen">
      
      {/* Strict Access: Only Admin sees the Toolbox */}
      {currentUser.role === 'admin' && (
        <>
          <button 
            onClick={() => setIsTesterModalOpen(true)}
            className="fixed bottom-10 right-10 z-[60] bg-emerald-500 text-black px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all border-4 border-black"
          >
            Tester Toolbox
          </button>

          {isTesterModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
              <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Terminal Test Suite</h2>
                <p className="text-zinc-500 text-xs mb-8 font-medium leading-relaxed">
                  Environment configuration tools. Affects local instance only.
                </p>
                <div className="space-y-4">
                  <button onClick={handleResetData} className="w-full py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all">
                    Reset Factory Data
                  </button>
                  <button onClick={() => navigate('/admin')} className="w-full py-4 bg-zinc-800 border border-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">
                    Open Admin Oversight
                  </button>
                  <button onClick={() => setIsTesterModalOpen(false)} className="w-full py-4 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">
                    Close Suite
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed: Portfolio Section */}
        <div className="flex-grow space-y-10">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Portfolio</h1>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Verified Market Concepts</p>
            </div>

            {/* Post Idea Button available for testers (standard) and owners */}
            {(currentUser.role === 'owner' || currentUser.role === 'standard' || currentUser.role === 'admin') && (
              <button 
                onClick={() => navigate('/create-idea')}
                className="w-full sm:w-auto bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                Post Your Idea
              </button>
            )}
          </div>

          <div className="bg-zinc-900/40 p-1.5 rounded-[2rem] border border-zinc-800/50 flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <input 
                type="text" 
                placeholder="Filter concepts by keyword or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl py-5 pl-16 pr-6 text-white outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-800 font-bold"
              />
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-black border border-zinc-800 text-zinc-400 rounded-2xl px-8 py-5 text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:border-zinc-600 transition-all appearance-none"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'Every Sector' : c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 pb-20">
            {filteredIdeas.length > 0 ? filteredIdeas.map(idea => {
              const owner = users.find(u => u.id === idea.user_id);
              return (
                <div key={idea.id} className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 hover:border-emerald-500/40 transition-all group relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -z-10 group-hover:bg-emerald-500/10 transition-all"></div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <img src={owner?.avatar} alt="" className="w-8 h-8 rounded-xl grayscale border border-zinc-800" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{owner?.full_name || 'Anonymous Strategist'}</span>
                      </div>
                      <span className="px-4 py-1 bg-zinc-800 text-zinc-300 text-[9px] font-black rounded-lg uppercase border border-zinc-700 tracking-widest">{idea.category}</span>
                    </div>
                    
                    <h3 className="text-3xl font-black text-white mb-4 group-hover:text-emerald-400 transition-colors tracking-tight leading-none uppercase">{idea.title}</h3>
                    <p className="text-zinc-500 text-base leading-relaxed mb-8 max-w-3xl font-medium line-clamp-2">{idea.short_summary}</p>
                    
                    <div className="flex flex-wrap items-center gap-10">
                      <div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Target Cap</p>
                        <p className="text-xl font-black text-white">${idea.required_budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Equity Yield</p>
                        <p className="text-xl font-black text-emerald-500">{idea.expected_profit_share}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 shrink-0 w-full sm:w-auto">
                    <button 
                      onClick={() => navigate(`/idea/${idea.id}`)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all whitespace-nowrap active:scale-95"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleContactOwner(idea.user_id, idea.title)}
                      className="w-full bg-emerald-500 text-black px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all whitespace-nowrap shadow-lg active:scale-95"
                    >
                      Message Owner
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="py-64 text-center border-2 border-dashed border-zinc-900 rounded-[4rem]">
                <p className="text-zinc-700 font-black uppercase tracking-[0.6em] text-sm">Portfolio Buffer Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Intelligence Net */}
        <div className="w-full lg:w-[450px] shrink-0 space-y-8">
          
          {/* Admin Command Hub (Strictly Restricted) */}
          {currentUser.role === 'admin' && isTestEnvironment && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[3rem] p-10 space-y-8 backdrop-blur-xl">
               <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.3em]">Testing Hub</h2>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
               </div>
               
               <div className="space-y-4">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Master Invite Protocol</p>
                  <button 
                    onClick={handleCopyInviteLink}
                    className="w-full bg-black border border-zinc-800 hover:border-emerald-500/50 p-5 rounded-2xl text-left flex items-center justify-between group transition-all"
                  >
                     <span className="text-[10px] font-black text-zinc-300 uppercase truncate">SELLIT-TEST-2025</span>
                     <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest group-hover:scale-105 transition-transform">
                        {copyFeedback ? 'Copied' : 'Copy Link'}
                     </span>
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-5 rounded-2xl border border-zinc-800">
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Total Items</p>
                    <p className="text-xl font-black text-white">{ideas.length}</p>
                  </div>
                  <div className="bg-black/40 p-5 rounded-2xl border border-zinc-800">
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">User Base</p>
                    <p className="text-xl font-black text-white">{users.length}</p>
                  </div>
               </div>
            </div>
          )}

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-[3rem] flex flex-col h-[700px] overflow-hidden sticky top-28 shadow-2xl backdrop-blur-2xl">
            <div className="p-10 border-b border-zinc-800/50 flex items-center justify-between bg-black/40">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Intelligence</h2>
            </div>

            <div className="flex-grow flex flex-col min-h-0 relative">
              {securityWarning && (
                <div className="absolute inset-x-8 top-28 z-50 bg-rose-500 text-white p-6 rounded-3xl text-[10px] font-black uppercase tracking-widest text-center shadow-2xl animate-pulse">
                  {securityWarning}
                </div>
              )}

              {activeChatId ? (
                <>
                  <div className="px-10 py-6 bg-black/40 border-b border-zinc-800/50 flex items-center gap-5">
                    <button onClick={() => setActiveChatId(null)} className="text-zinc-600 hover:text-white transition-colors">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <div className="relative">
                      <img src={activeUser?.avatar} className="w-12 h-12 rounded-2xl grayscale border border-zinc-800 shadow-lg" alt="" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest">{activeUser?.full_name}</p>
                      <p className="text-[9px] text-emerald-500/70 font-black uppercase tracking-widest">Encrypted Tunnel</p>
                    </div>
                  </div>

                  <div ref={scrollRef} className="flex-grow overflow-y-auto p-10 space-y-10 scrollbar-hide bg-zinc-950/30">
                    {activeMessages.length > 0 ? activeMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                        <div className={`p-6 rounded-[2rem] text-[13px] leading-relaxed max-w-[90%] shadow-xl ${msg.sender_id === currentUser.id ? 'bg-emerald-500 text-black font-black' : 'bg-zinc-900 text-zinc-100 border border-zinc-800'}`}>
                          {msg.message_text}
                        </div>
                        <span className="text-[8px] text-zinc-700 font-black mt-4 uppercase tracking-[0.2em]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )) : (
                       <div className="h-full flex flex-col items-center justify-center text-center px-16 opacity-30">
                          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">No shared signal yet. Send a message to begin handshake.</p>
                       </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-10 bg-zinc-950/80 border-t border-zinc-800">
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Encrypted protocol entry..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow bg-black border border-zinc-800 rounded-2xl px-8 py-5 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-900 font-bold transition-all"
                      />
                      <button type="submit" className="bg-emerald-500 text-black p-5 rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-90">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  {chatParticipants.length > 0 ? chatParticipants.map(participant => (
                    <button 
                      key={participant.id}
                      onClick={() => setActiveChatId(participant.id)}
                      className="w-full p-8 text-left rounded-[2.5rem] transition-all flex items-center gap-6 hover:bg-white/5 group border border-transparent hover:border-zinc-800/50"
                    >
                      <img src={participant.avatar} alt="" className="h-14 w-14 rounded-2xl grayscale border border-zinc-800" />
                      <div className="flex-grow min-w-0">
                        <p className="font-black text-white truncate text-xs uppercase tracking-widest group-hover:text-emerald-400 transition-colors">{participant.full_name}</p>
                        <p className="text-[10px] text-zinc-600 truncate uppercase font-bold tracking-tighter italic mt-1">HANDSHAKE ACTIVE</p>
                      </div>
                    </button>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-20 opacity-20">
                      <p className="text-[11px] font-black uppercase tracking-[0.6em] mb-4 text-white">Silent Terminal</p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                        Messages from peer stakeholders will appear here once handshake is established.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
