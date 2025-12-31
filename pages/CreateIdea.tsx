
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BusinessIdea } from '../types';

interface CreateIdeaProps {
  currentUser: User | null;
  setIdeas: React.Dispatch<React.SetStateAction<BusinessIdea[]>>;
}

const CreateIdea: React.FC<CreateIdeaProps> = ({ currentUser, setIdeas }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'SaaS',
    short_summary: '',
    full_description: '',
    required_budget: '',
    expected_profit_share: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newIdea: BusinessIdea = {
      id: `idea_${Date.now()}`,
      user_id: currentUser.id,
      title: formData.title,
      category: formData.category,
      short_summary: formData.short_summary,
      full_description: formData.full_description,
      required_budget: Number(formData.required_budget),
      expected_profit_share: Number(formData.expected_profit_share),
      visibility: 'public',
      status: 'published', // Defaulting to published as per requirements
      created_at: new Date().toISOString().split('T')[0],
      tags: [formData.category]
    };

    setIdeas(prev => [newIdea, ...prev]);
    navigate('/dashboard');
  };

  if (!currentUser || currentUser.role !== 'owner') {
    return <div className="p-32 text-center text-zinc-500 font-black uppercase tracking-widest text-xs">Auth Failed: Owner Role Required</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-zinc-900 rounded-[3rem] border border-zinc-800 p-12 lg:p-20 shadow-2xl">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold text-white tracking-tighter mb-2">Post Venture</h1>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Global visibility active: This concept will be published to the marketplace.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="col-span-full">
              <input 
                required
                type="text" 
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-zinc-700 font-bold text-xl"
                placeholder="Venture Name"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <select 
              className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-zinc-400 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none cursor-pointer font-bold"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option>SaaS</option>
              <option>FinTech</option>
              <option>Biotech</option>
              <option>Environment</option>
              <option>E-Commerce</option>
            </select>

            <div className="col-span-full">
              <input 
                required
                type="text" 
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder-zinc-700 font-medium"
                placeholder="Short Pitch"
                value={formData.short_summary}
                onChange={e => setFormData({...formData, short_summary: e.target.value})}
              />
            </div>

            <div className="col-span-full">
              <textarea 
                required
                rows={5}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder-zinc-700 font-medium leading-relaxed"
                placeholder="Detailed Overview..."
                value={formData.full_description}
                onChange={e => setFormData({...formData, full_description: e.target.value})}
              />
            </div>

            <input 
              required
              type="number" 
              className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder-zinc-700 font-medium"
              placeholder="Budget ($)"
              value={formData.required_budget}
              onChange={e => setFormData({...formData, required_budget: e.target.value})}
            />

            <input 
              required
              type="number" 
              className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder-zinc-700 font-medium"
              placeholder="Equity (%)"
              value={formData.expected_profit_share}
              onChange={e => setFormData({...formData, expected_profit_share: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-emerald-400 shadow-2xl shadow-emerald-500/10 transition-all mt-6">
            Publish Instantly
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIdea;
