
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BusinessIdea } from '../types';

interface MarketplaceProps {
  ideas: BusinessIdea[];
  onContact: (id: string) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ ideas, onContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          idea.full_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || idea.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(ideas.map(i => i.category)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Idea Marketplace</h1>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search concepts, industries, or keywords..." 
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder-zinc-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-4 top-4.5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
          </div>
        </div>
        <div className="flex space-x-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${categoryFilter === cat ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredIdeas.length > 0 ? (
          filteredIdeas.map(idea => (
            <Link to={`/idea/${idea.id}`} key={idea.id} className="bg-zinc-900 rounded-[2rem] border border-zinc-800 overflow-hidden hover:border-emerald-500/50 transition-all duration-300 group flex flex-col hover:shadow-2xl hover:shadow-emerald-500/5 cursor-pointer">
              <div className="p-8 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold rounded-lg uppercase tracking-widest border border-emerald-500/20">{idea.category}</span>
                  {idea.visibility === 'private' && (
                    <span className="flex items-center text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                      Private
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors leading-tight">{idea.title}</h3>
                <p className="text-zinc-500 text-sm line-clamp-2 mb-8 leading-relaxed">
                  {idea.visibility === 'private' ? 'CONFIDENTIAL: Requires manual permission.' : idea.short_summary}
                </p>
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-800">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest mb-1.5">Capital</p>
                    <p className="text-xl font-bold text-white">${idea.required_budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest mb-1.5">Equity</p>
                    <p className="text-xl font-bold text-emerald-500">{idea.expected_profit_share}%</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
            <p className="text-zinc-500 text-xl">No concepts match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
