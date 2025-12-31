
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

  if (!idea) return <div className="p-32 text-center text-zinc-500 font-black uppercase">Venture not found</div>;

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
        id: `msg_${Date.now()}`,
        sender_id: currentUser.id,
        receiver_id: idea.user_id,
        idea_id: idea.id,
        message_text: `I've reviewed "${idea.title}" and would like to initiate a strategic discussion.`,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('sellit_messages', JSON.stringify([...localMessages, greeting]));
    }

    navigate(`/dashboard?contact=${idea.user_id}`);
  };

  const handleArchive = () => {
    if (!onUpdateIdeas) return;
    const updated = ideas.map(i => i.id === idea.id ? { ...i, status: 'archived' as const } : i);
    onUpdateIdeas(updated);
    navigate('/dashboard');
  };

  const handleDelete = () => {
    if (!onUpdateIdeas) return;
    if (confirm("Permanently redact this concept? This action is irreversible.")) {
      const updated = ideas.filter(i => i.id !== idea.id);
      onUpdateIdeas(updated);
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/dashboard" className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-10 inline-flex items-center group">
        <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        Back to Dashboard
      </Link>

      <div className="bg-zinc-900/50 rounded-[3rem] border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-10 lg:p-16">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-emerald-500/20">{idea.category}</span>
                <span className={`px-4 py-1.5 ${idea.status === 'published' ? 'bg-zinc-800 text-emerald-500' : 'bg-zinc-800 text-zinc-400'} text-[10px] font-black rounded-lg uppercase tracking-widest border border-zinc-700`}>{idea.status}</span>
              </div>
              {isOwner && (
                <div className="flex gap-4">
                   <button onClick={handleArchive} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">Archive</button>
                   <button onClick={handleDelete} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors">Redact</button>
                </div>
              )}
            </div>
            <h1 className="text-4xl lg:text-7xl font-extrabold text-white tracking-tighter leading-[0.9] mb-8">{idea.title}</h1>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-3xl">{idea.short_summary}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <p className="text-zinc-300 leading-[1.8] text-lg font-light whitespace-pre-wrap">{idea.full_description}</p>
              </section>

              <section className="bg-black/40 p-10 rounded-[2.5rem] border border-zinc-800">
                <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8">Financial Structure</h2>
                <div className="grid sm:grid-cols-2 gap-10">
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Required Capital</p>
                    <p className="text-4xl font-black text-white tracking-tighter">${idea.required_budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Equity Exchange</p>
                    <p className="text-4xl font-black text-emerald-500 tracking-tighter">{idea.expected_profit_share}%</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800 text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl mx-auto mb-4 flex items-center justify-center border border-emerald-500/20">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <p className="text-xs font-black text-white uppercase tracking-widest mb-8">Partner P-{idea.user_id.slice(-4).toUpperCase()}</p>
                
                {!isOwner ? (
                  <button 
                    onClick={handleMessageOwner}
                    className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 transition-all"
                  >
                    Message Idea Owner
                  </button>
                ) : (
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Ownership Station Verified</div>
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
