
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Message, BusinessIdea } from '../types';

interface MessagingProps {
  currentUser: User | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  users: User[];
  ideas: BusinessIdea[];
  onAgreement: () => void;
}

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_PATTERN = /\b(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g;
const KEYWORD_PATTERN = /\b(whatsapp|telegram|discord|wechat|signal|phone|call me|number|skype|viber)\b/gi;

const Messaging: React.FC<MessagingProps> = ({ currentUser, messages, setMessages, users, ideas, onAgreement }) => {
  const [searchParams] = useSearchParams();
  const ideaIdParam = searchParams.get('idea');
  const contactIdParam = searchParams.get('contact');
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync active chat based on URL params
    if (contactIdParam) {
      setActiveChatId(contactIdParam);
    } else if (ideaIdParam) {
      const idea = ideas.find(i => i.id === ideaIdParam);
      if (idea) {
        setActiveChatId(idea.user_id === currentUser?.id ? null : idea.user_id);
      }
    }
  }, [contactIdParam, ideaIdParam, ideas, currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChatId]);

  const chatParticipants = Array.from(new Set(
    messages.filter(m => m.sender_id === currentUser?.id || m.receiver_id === currentUser?.id)
      .map(m => m.sender_id === currentUser?.id ? m.receiver_id : m.sender_id)
  )).map(id => users.find(u => u.id === id)).filter(Boolean) as User[];

  const activeMessages = messages.filter(m => 
    (m.sender_id === currentUser?.id && m.receiver_id === activeChatId) ||
    (m.sender_id === activeChatId && m.receiver_id === currentUser?.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const checkPolicyViolation = (text: string) => {
    return EMAIL_PATTERN.test(text) || PHONE_PATTERN.test(text) || KEYWORD_PATTERN.test(text);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !currentUser) return;

    if (checkPolicyViolation(newMessage)) {
      setSecurityWarning("Safety Alert: Contact details detected. Please keep terminal integrity by communicating only via Sell It.");
      setTimeout(() => setSecurityWarning(null), 6000);
      return;
    }

    const msg: Message = {
      id: `msg_${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: activeChatId,
      idea_id: ideaIdParam || '',
      message_text: newMessage,
      timestamp: new Date().toISOString()
    };

    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem('sellit_messages', JSON.stringify(updated));
    setNewMessage('');
    window.dispatchEvent(new Event('storage'));
  };

  if (!currentUser) return null;

  const activeUser = users.find(u => u.id === activeChatId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl h-[750px] flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
          <div className="p-10 border-b border-zinc-800">
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Connections</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {chatParticipants.length > 0 ? chatParticipants.map(participant => (
              <button 
                key={participant.id}
                onClick={() => setActiveChatId(participant.id)}
                className={`w-full p-5 text-left rounded-2xl transition-all flex items-center gap-4 ${activeChatId === participant.id ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-transparent border border-transparent hover:bg-zinc-800'}`}
              >
                <div className="relative">
                  <img src={participant.avatar} alt="Avatar" className="h-10 w-10 rounded-xl grayscale" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full"></div>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-extrabold text-white truncate text-xs uppercase tracking-widest">{participant.full_name}</p>
                  <p className="text-[9px] text-zinc-500 font-black">ID: {participant.id.slice(-4).toUpperCase()}</p>
                </div>
              </button>
            )) : (
              <div className="p-12 text-center opacity-20">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Connections</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow flex flex-col bg-zinc-900 relative">
          {activeUser ? (
            <>
              <div className="p-6 border-b border-zinc-800 bg-zinc-950/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                  <div>
                    <p className="font-black text-white uppercase text-xs tracking-widest leading-none mb-1">{activeUser.full_name}</p>
                    <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Secure Messaging Terminal</span>
                  </div>
                </div>
              </div>

              {securityWarning && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 w-[90%] bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-center gap-4 animate-bounce">
                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </div>
                  <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    {securityWarning}
                  </p>
                </div>
              )}

              <div ref={scrollRef} className="flex-grow p-10 overflow-y-auto space-y-8 scrollbar-hide">
                {activeMessages.length > 0 ? activeMessages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                    <div className={`p-6 rounded-3xl text-sm leading-relaxed max-w-[80%] ${
                      msg.sender_id === currentUser.id 
                        ? 'bg-emerald-500 text-black font-bold rounded-br-none' 
                        : 'bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-none'
                    }`}>
                      {msg.message_text}
                    </div>
                    <span className="text-[8px] text-zinc-600 font-black mt-2 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center opacity-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Channel Initialized</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-8 border-t border-zinc-800 bg-zinc-950/40">
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-grow bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-6 py-5 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-zinc-700 font-medium"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="bg-emerald-500 text-black px-10 py-5 rounded-2xl font-black uppercase text-xs hover:bg-emerald-400 shadow-xl transition-all">Send</button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-zinc-800 space-y-6">
              <div className="w-24 h-24 rounded-full border border-zinc-800/50 flex items-center justify-center">
                <svg className="w-10 h-10 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 00-2 2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Select a communication channel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
