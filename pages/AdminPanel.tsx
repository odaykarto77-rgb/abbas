
import React, { useState } from 'react';
import { BusinessIdea, User, Message } from '../types';

interface AdminPanelProps {
  ideas: BusinessIdea[];
  users: User[];
  messages: Message[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ ideas, users, messages }) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'moderation'>('concepts');
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  
  // Filter messages that are either auto-blocked or user-reported
  const safetyQueue = localMessages.filter(m => m.is_blocked || m.is_reported);

  const handleDismissFlag = (msgId: string) => {
    setLocalMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, is_blocked: false, is_reported: false, report_reason: undefined } : m
    ));
    alert("Flag dismissed. Message status restored.");
  };

  const handleSuspendUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    alert(`Account for ${user?.full_name || userId} has been suspended pending full audit.`);
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.full_name || userId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
         <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase">Central Moderation</h1>
            <p className="text-zinc-500 font-medium mt-2 tracking-widest text-[10px] uppercase">Sell It Administrative Oversight Terminal</p>
         </div>
         <div className="flex gap-4">
            <button 
               onClick={() => setActiveTab('concepts')}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'concepts' ? 'bg-emerald-500 border-emerald-500 text-black shadow-xl shadow-emerald-500/10' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
            >
               Concept Audit
            </button>
            <button 
               onClick={() => setActiveTab('moderation')}
               className={`relative px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'moderation' ? 'bg-rose-500 border-rose-500 text-black shadow-xl shadow-rose-500/10' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
            >
               Safety Queue 
               {safetyQueue.length > 0 && (
                 <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-950 font-black">
                   {safetyQueue.length}
                 </span>
               )}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { label: 'Verified Concepts', value: ideas.length, color: 'text-white' },
          { label: 'Active Partners', value: users.length, color: 'text-white' },
          { label: 'Audit Velocity', value: '98%', color: 'text-emerald-500' },
          { label: 'Integrity Alerts', value: safetyQueue.length, color: 'text-rose-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800">
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">{stat.label}</p>
             <p className={`text-4xl font-extrabold tracking-tighter ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {activeTab === 'concepts' ? (
        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-zinc-800 flex justify-between items-center bg-black/30">
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Integrity Queue</h2>
            <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Monitoring</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-zinc-600 uppercase text-[9px] font-black tracking-widest border-b border-zinc-800">
                  <th className="px-10 py-6">Venture Designation</th>
                  <th className="px-10 py-6">Origin Partner</th>
                  <th className="px-10 py-6">Timestamp</th>
                  <th className="px-10 py-6">Clearance Level</th>
                  <th className="px-10 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-black/10">
                {ideas.map(idea => (
                  <tr key={idea.id} className="hover:bg-emerald-500/5 transition-colors group">
                    <td className="px-10 py-8">
                       <p className="font-extrabold text-white text-sm tracking-tight mb-1 group-hover:text-emerald-500 transition-colors">{idea.title}</p>
                       <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{idea.category}</p>
                    </td>
                    <td className="px-10 py-8 text-zinc-400 text-xs font-bold">{getUserName(idea.user_id)}</td>
                    <td className="px-10 py-8 text-zinc-600 text-xs font-mono">{idea.created_at}</td>
                    <td className="px-10 py-8">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20 uppercase">SEC_LEVEL_01</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-6">
                        <button className="text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:text-emerald-400">Verify</button>
                        <button className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:text-rose-400">Redact</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-zinc-800 flex justify-between items-center bg-rose-500/5">
            <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Policy Enforcement Terminal</h2>
            <span className="flex items-center gap-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Awaiting Manual Discretion</span>
            </span>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-zinc-950 text-zinc-600 uppercase text-[9px] font-black tracking-widest border-b border-zinc-800">
                      <th className="px-10 py-6">Signal Origin</th>
                      <th className="px-10 py-6">Captured Payload</th>
                      <th className="px-10 py-6">Violation Log</th>
                      <th className="px-10 py-6 text-right">Moderation Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-black/10">
                   {safetyQueue.length > 0 ? (
                      safetyQueue.map(msg => (
                         <tr key={msg.id} className="hover:bg-rose-500/5 transition-colors">
                            <td className="px-10 py-8">
                               <p className="font-extrabold text-white text-xs tracking-widest mb-1">{getUserName(msg.sender_id)}</p>
                               <p className="text-[9px] text-zinc-600 font-mono">ID: {msg.sender_id.slice(-6).toUpperCase()}</p>
                            </td>
                            <td className="px-10 py-8">
                               <p className="text-zinc-400 text-xs max-w-md bg-black/40 p-3 rounded-xl border border-zinc-800/50 italic leading-relaxed">
                                  "{msg.message_text}"
                               </p>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex flex-col gap-2">
                                  <span className={`px-3 py-1 text-[9px] font-black rounded-lg border uppercase w-fit ${msg.is_blocked ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                     {msg.is_blocked ? 'Auto_System_Flag' : 'User_Report_Manual'}
                                  </span>
                                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{msg.report_reason || 'General Safety Alert'}</p>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <div className="flex justify-end gap-6">
                                  <button 
                                    onClick={() => handleDismissFlag(msg.id)}
                                    className="text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:text-emerald-400"
                                  >
                                    Authorize
                                  </button>
                                  <button 
                                    onClick={() => handleSuspendUser(msg.sender_id)}
                                    className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:text-rose-400"
                                  >
                                    Blacklist
                                  </button>
                               </div>
                            </td>
                         </tr>
                      ))
                   ) : (
                      <tr>
                         <td colSpan={4} className="px-10 py-40 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-30">
                              <svg className="w-16 h-16 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                              <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs">Integrity Shield Active: No Alerts</p>
                            </div>
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
