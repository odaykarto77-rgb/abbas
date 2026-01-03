
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BusinessIdea } from '../types';

interface CreateIdeaProps {
  currentUser: User | null;
  setIdeas: React.Dispatch<React.SetStateAction<BusinessIdea[]>>;
}

const CreateIdea: React.FC<CreateIdeaProps> = ({ currentUser, setIdeas }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'SaaS',
    short_summary: '',
    full_description: '',
    required_budget: '',
    expected_profit_share: '',
    monetization_model: '',
    deal_type: 'Partnership',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      monetization_model: formData.monetization_model,
      deal_type: formData.deal_type,
      visibility: 'public',
      status: 'published',
      created_at: new Date().toISOString().split('T')[0],
      tags: [formData.category],
      image_data: imageData
    };

    setIdeas(prev => [newIdea, ...prev]);
    navigate('/dashboard');
  };

  // Permission check updated for testers (standard) and admins
  if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'standard' && currentUser.role !== 'admin')) {
    return (
      <div className="p-32 text-center bg-zinc-950 min-h-screen">
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs mb-8">Auth Failed: Clearance Required</p>
        <button onClick={() => navigate('/login')} className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Return to Login</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-zinc-900 rounded-[3rem] border border-zinc-800 p-8 lg:p-16 shadow-2xl">
        <div className="mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">Post Your Idea</h1>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Publish your strategic vision to the Portfolio Section.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="col-span-full">
              <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 ml-1">Idea Title</label>
              <input 
                required
                type="text" 
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-zinc-800 font-bold text-lg"
                placeholder="Next Gen AI Logistics"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 ml-1">Industry / Category</label>
              <select 
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-zinc-300 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none cursor-pointer font-bold uppercase text-[10px] tracking-widest"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>SaaS</option>
                <option>FinTech</option>
                <option>Biotech</option>
                <option>Environment</option>
                <option>E-Commerce</option>
                <option>AI / Machine Learning</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 ml-1">Deal Type</label>
              <select 
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-zinc-300 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none cursor-pointer font-bold uppercase text-[10px] tracking-widest"
                value={formData.deal_type}
                onChange={e => setFormData({...formData, deal_type: e.target.value})}
              >
                <option>Fixed Price</option>
                <option>Partnership</option>
                <option>Negotiable</option>
                <option>Equity Only</option>
              </select>
            </div>

            <div className="col-span-full">
              <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 ml-1">Short Description (Public Summary)</label>
              <input 
                required
                type="text" 
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder-zinc-800 font-medium"
                placeholder="One sentence that captures the essence of the venture."
                value={formData.short_summary}
                onChange={e => setFormData({...formData, short_summary: e.target.value})}
              />
            </div>

            <div className="col-span-full">
              <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 ml-1">Detailed Idea Explanation</label>
              <textarea 
                required
                rows={6}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder-zinc-800 font-medium leading-relaxed"
                placeholder="Deep dive into your execution plan, USP, and market potential..."
                value={formData.full_description}
                onChange={e => setFormData({...formData, full_description: e.target.value})}
              />
            </div>

            <div className="col-span-full">
              <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4 ml-1">Monetization Model (Optional)</label>
              <input 
                type="text" 
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder-zinc-800 font-medium"
                placeholder="e.g. SaaS Subscription, Commission-based"
                value={formData.monetization_model}
                onChange={e => setFormData({...formData, monetization_model: e.target.value})}
              />
            </div>

            <div className="col-span-full border-t border-zinc-800 pt-10">
              <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-8 text-center">Supporting Asset Protocol</label>
              <div className="relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-black border-2 border-dashed border-zinc-800 rounded-[2rem] px-6 py-12 text-zinc-600 hover:border-emerald-500/50 hover:text-emerald-500 cursor-pointer transition-all text-center group"
                >
                  {imageData ? (
                    <div className="flex flex-col items-center">
                      <img src={imageData} alt="Preview" className="h-32 w-32 object-cover rounded-2xl mb-4 grayscale border border-zinc-800 group-hover:grayscale-0 transition-all" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Encrypted Image Loaded</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-zinc-900 rounded-full mx-auto mb-6 flex items-center justify-center border border-zinc-800 group-hover:bg-emerald-500/10">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Concept Visual (Max 2MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-sm hover:bg-emerald-400 shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98]">
              Publish to Portfolio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIdea;
