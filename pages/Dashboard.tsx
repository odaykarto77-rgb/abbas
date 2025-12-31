
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, BusinessIdea, Message, Agreement, MarketSignal } from '../types';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  currentUser: User | null;
  ideas: BusinessIdea[];
  agreements: Agreement[];
}

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_PATTERN = /\b(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g;
const URL_PATTERN = /(https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
const KEYWORD_PATTERN = /\b(whatsapp|telegram|discord|wechat|signal|phone|call me|number|skype|viber|email|contact)\b/gi;

const Dashboard: React.FC<DashboardProps> = ({ currentUser, ideas, agreements }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'concepts' | 'signals'>('concepts');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [isLoadingSignals, setIsLoadingSignals] = useState(false);
  const [isTesterModalOpen, setIsTesterModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    const savedMessages = JSON.parse(localStorage.getItem('sellit_messages') || '[]');
    setLocalMessages(savedMessages);
  };

  const fetchMarketSignals = async () => {
    if (signals.length > 0) return;
    setIsLoadingSignals(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "List 5 major global business news items from the last 7 days focusing on SaaS funding, FinTech innovations, or large-scale M&A. Return them as a structured narrative. Be concise.",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedSignals: MarketSignal[] = chunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title || "Market Signal Detected",
          summary: "Strategic insight related to recent market movement.",
          url: chunk.web.uri,
          source: new URL(chunk.web.uri).hostname,
          timestamp: "RECENT"
        }));

      setSignals(extractedSignals);
    } catch (error) {
      console.error("Failed to fetch signals:", error);
    } finally {
      setIsLoadingSignals(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const contactId = searchParams.get('contact');
    if (contactId) {
      setActiveChatId(contactId);
    }
    if (activeTab === 'signals') {
      fetchMarketSignals();
    }
  }, [searchParams, activeTab]);

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
    if (confirm("Reset terminal state to factory defaults?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const categories = ['All', 'SaaS', 'FinTech', 'Biotech', 'Environment', 'E-Commerce'];
  
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

  const activeUser = users.find(u => u.id === activeChatId);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* Floating Tester Control Center Button */}
      <button 
        onClick={() => setIsTesterModalOpen(true)}
        className="fixed bottom-10 right-10 z-[60] bg-emerald-500 text-black px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all border-4 border-black"
      >
        Tester Toolbox
      </button>

      {/* Tester Modal */}
      {isTesterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Terminal Test Suite</h2>
            <p className="text-zinc-500 text-xs mb-8 font-medium leading-relaxed">
              Use these tools to prepare your environment for testing. Changes affect local storage only.
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

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Feed & Signals */}
        <div className="flex-grow space-y-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
               <button 
                onClick={() => setActiveTab('concepts')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'concepts' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
               >
                 Concepts
               </button>
               <button 
                onClick={() => setActiveTab('signals')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'signals' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
               >
                 Intelligence
               </button>
            </div>
            
            <div className="relative flex-grow">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <input 
                type="text" 
                placeholder={activeTab === 'concepts' ? "Search published business ideas" : "Search intelligence stream"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          {activeTab === 'concepts' ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-zinc-900/50 border border-zinc-800 text-zinc-400 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none cursor-pointer hover:border-zinc-700 transition-all"
                >
                  {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'Category' : c}</option>)}
                </select>
              </div>

              {filteredIdeas.length > 0 ? filteredIdeas.map(idea => {
                const owner = users.find(u => u.id === idea.user_id);
                return (
                  <div key={idea.id} className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-emerald-500/20 transition-all group relative overflow-hidden">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={owner?.avatar} alt="" className="w-6 h-6 rounded-lg grayscale opacity-50" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{owner?.full_name || 'Anonymous Partner'}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{idea.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed mb-4 max-w-2xl">{idea.short_summary}</p>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                        <span className="text-zinc-400">{idea.category}</span>
                        <span>•</span>
                        <span className="text-emerald-500/80">${idea.required_budget.toLocaleString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/idea/${idea.id}`)}
                      className="bg-emerald-500 text-black px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all whitespace-nowrap"
                    >
                      View & Message
                    </button>
                  </div>
                );
              }) : (
                <div className="py-32 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
                  <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs">No ideas available yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Live Intelligence Stream</h3>
                <button onClick={fetchMarketSignals} className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                   <svg className={`w-3 h-3 ${isLoadingSignals ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                   Sync Intelligence
                </button>
              </div>

              {isLoadingSignals ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Querying Global Markets...</p>
                </div>
              ) : signals.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {signals.map((signal, idx) => (
                    <a key={idx} href={signal.url} target="_blank" rel="noopener noreferrer" className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] hover:border-emerald-500/40 transition-all group flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded uppercase border border-emerald-500/20">Authenticated Source</span>
                          <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">{signal.source}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors leading-snug">{signal.title}</h4>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Protocol: GROUNDED_SEARCH</span>
                        <svg className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
                  <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs">No data synced</p>
                  <button onClick={fetchMarketSignals} className="mt-6 bg-emerald-500 text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Initiate Pulse</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Messaging Terminal */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] flex flex-col h-[700px] overflow-hidden sticky top-28 shadow-2xl">
            <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-black text-white tracking-tighter uppercase">Messages</h2>
            </div>

            <div className="flex-grow flex flex-col min-h-0 relative">
              {securityWarning && (
                <div className="absolute inset-x-4 top-20 z-50 bg-rose-500 text-white p-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-center shadow-2xl animate-pulse">
                  {securityWarning}
                </div>
              )}

              {activeChatId ? (
                <>
                  <div className="px-8 py-4 bg-black/20 border-b border-zinc-800 flex items-center gap-4">
                    <button onClick={() => setActiveChatId(null)} className="text-zinc-500 hover:text-white mr-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <div className="relative">
                      <img src={activeUser?.avatar} className="w-8 h-8 rounded-lg grayscale" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{activeUser?.full_name}</p>
                      <p className="text-[8px] text-emerald-500/60 font-black uppercase tracking-widest">Channel Secured</p>
                    </div>
                  </div>

                  <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide">
                    {activeMessages.length > 0 ? activeMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] ${msg.sender_id === currentUser.id ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-800 text-zinc-100'}`}>
                          {msg.message_text}
                        </div>
                        <span className="text-[8px] text-zinc-600 font-black mt-2 uppercase tracking-widest">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )) : (
                       <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-40">
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2">Channel Established</p>
                          <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">Safety Protocol Active. Initiating primary handshake...</p>
                       </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-6 bg-black/40 border-t border-zinc-800">
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Text-only protocol..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-700"
                      />
                      <button type="submit" className="bg-emerald-500 text-black p-3.5 rounded-xl hover:bg-emerald-400 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                  {chatParticipants.length > 0 ? chatParticipants.map(participant => (
                    <button 
                      key={participant.id}
                      onClick={() => setActiveChatId(participant.id)}
                      className="w-full p-6 text-left rounded-3xl transition-all flex items-center gap-4 hover:bg-zinc-800/50 group"
                    >
                      <div className="relative shrink-0">
                        <img src={participant.avatar} alt="" className="h-12 w-12 rounded-xl grayscale" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full"></div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-extrabold text-white truncate text-xs uppercase tracking-widest">{participant.full_name}</p>
                        <p className="text-[10px] text-zinc-500 truncate italic">Established Connection</p>
                      </div>
                    </button>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-20">
                      <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 border border-zinc-700">
                        <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">No Active Messages</p>
                      <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
                        Find a business concept on the feed and initiate a secure connection to start.
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
