
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BusinessIdea, User, Message } from '../types';

interface IdeaDetailProps {
  ideas: BusinessIdea[];
  currentUser: User | null;
  onContact?: (id: string) => void;
  onUpdateIdeas?: (ideas: BusinessIdea[]) => void;
}

const IdeaDetail: React.FC<IdeaDetailProps> = ({ ideas, currentUser, onUpdateIdeas }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idea = ideas.find(i => i.id === id);

  if (!idea) return <div className="p-32 text-center text-zinc-500 font-black uppercase bg-zinc-950 min-h-screen">Venture not found</div>;

  const isOwner = currentUser?.id === idea.user_id;

  const handleMessageOwner = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (isOwner) {
      navigate('/dashboard');
      return;
    }

    const localMessages: Message[] = JSON.parse(localStorage.getItem('sellit_messages') || '[]');
    const hasExisting = localMessages.some(m => 
      (m.sender_id === currentUser.id && m.receiver_id === idea.user_id) ||
      (m.sender_id === idea.user_id && m.receiver_id === currentUser.id)
    );

    if (!hasExisting) {
      const greeting: Message = {
        id: `msg_det_${Date.now()}`,
        sender_id: currentUser.id,
        receiver_id: idea.user_id,
        idea_id: idea.id,
        message_text: `System: Strategic handshake initiated via detail view for "${idea.title}".`,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('sellit_messages', JSON.stringify([...localMessages, greeting]));
    }

    navigate(`/dashboard?contact=${idea.user_id}`);
  };

  const users: User[] = JSON.parse(localStorage.getItem('sellit_users') || '[]');
  const owner = users.find(u => u.id === idea.user_id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
      <Link to="/dashboard" className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12 inline-flex items-center group transition-all">
        <svg className="w-5 h-5 mr-3 group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
        Back to Portfolio
      </Link>

      <div className="bg-zinc-900/40 rounded-[4rem] border border-zinc-800/80 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="p-10 lg:p-20">
          <div className="mb-16">
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <span className="px-6 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] border border-emerald-500/20">{idea.category}</span>
              <span className="px-6 py-2 bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] border border-zinc-700">{idea.deal_type || 'Custom Venture'}</span>
              <span className="px-6 py-2 bg-black/40 text-zinc-600 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] border border-zinc-900">Ref: {idea.id.slice(-6).toUpperCase()}</span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-12 uppercase">{idea.title}</h1>
            <p className="text-zinc-400 text-2xl font-medium leading-relaxed max-w-4xl italic border-l-8 border-emerald-500 pl-10 py-2">{idea.short_summary}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-20">
            <div className="lg:col-span-2 space-y-20">
              <section>
                <h2 className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-10 border-b border-zinc-800 pb-4">Venture Blueprint</h2>
                <div className="text-zinc-300 leading-[1.8] text-xl font-light whitespace-pre-wrap">
                  {idea.full_description}
                </div>
              </section>

              {idea.image_data && (
                <section>
                  <h2 className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-10 border-b border-zinc-800 pb-4">Concept Visuals</h2>
                  <div className="rounded-[3rem] overflow-hidden border-2 border-zinc-800 group relative shadow-2xl">
                    <img src={idea.image_data} alt="Venture Asset" className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none group-hover:bg-transparent transition-colors"></div>
                  </div>
                </section>
              )}

              <section className="bg-black/60 p-16 rounded-[4rem] border border-zinc-800 grid sm:grid-cols-2 gap-16 shadow-inner">
                <div className="space-y-12">
                  <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Financial Dynamics</h2>
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Target Capital</p>
                    <p className="text-5xl font-black text-white tracking-tighter">${idea.required_budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Proposed Equity</p>
                    <p className="text-5xl font-black text-emerald-500 tracking-tighter">{idea.expected_profit_share}%</p>
                  </div>
                </div>
                <div className="space-y-12">
                  <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Operational Alpha</h2>
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Monetization Model</p>
                    <p className="text-3xl font-black text-white tracking-tight uppercase">{idea.monetization_model || 'Proprietary'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Strategic Category</p>
                    <p className="text-3xl font-black text-zinc-400 tracking-tight uppercase">{idea.category}</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-10">
              <div className="bg-zinc-950/80 p-12 rounded-[3.5rem] border border-zinc-800 text-center sticky top-32 shadow-2xl backdrop-blur-md">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <img src={owner?.avatar} className="w-full h-full rounded-3xl grayscale border-2 border-zinc-800 shadow-xl" alt="" />
                  <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-black text-[9px] font-black px-3 py-1 rounded-lg border-2 border-black uppercase tracking-widest">Verified</div>
                </div>
                
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">{owner?.full_name}</h3>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-12">Authorized Stakeholder</p>
                
                {!isOwner ? (
                  <div className="space-y-6">
                    <button 
                      onClick={handleMessageOwner}
                      className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-400 shadow-2xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-4 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 00-2 2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                      Contact Owner
                    </button>
                    <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest leading-relaxed">
                      Handshake protocol is monitored for terminal integrity. Stay within the platform.
                    </p>
                  </div>
                ) : (
                  <div className="p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">
                    Internal Dashboard Access
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
