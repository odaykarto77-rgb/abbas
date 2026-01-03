
import React, { useState, useEffect } from 'react';
import { BusinessIdea, User, Message, LogEntry } from '../types';
import { Logger } from '../services/Logger';

interface AdminPanelProps {
  ideas: BusinessIdea[];
  users: User[];
  messages: Message[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ ideas, users, messages }) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'moderation' | 'logs'>('concepts');
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  useEffect(() => {
    setLogs(Logger.getLogs());
    const interval = setInterval(() => setLogs(Logger.getLogs()), 5000);
    return () => clearInterval(interval);
  }, []);

  const safetyQueue = localMessages.filter(m => m.is_blocked || m.is_reported);

  const handleDismissFlag = (msgId: string) => {
    setLocalMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, is_blocked: false, is_reported: false, report_reason: undefined } : m
    ));
    Logger.log(`Moderator dismissed flag for message ${msgId}`, 'INFO');
  };

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.full_name || userId;
  };

  const generateInviteLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const inviteLink = `${baseUrl}#/dashboard?mode=test&key=SELLIT-TEST-2025`;
    navigator.clipboard.writeText(inviteLink);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
    Logger.log('Tester invite link generated and copied to clipboard', 'INFO');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
         <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase">Central Moderation</h1>
            <p className="text-zinc-500 font-medium mt-2 tracking-widest text-[10px] uppercase">Sell It Administrative Oversight Terminal</p>
         </div>
         <div className="flex flex-wrap gap-4">
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
            <button 
               onClick={() => setActiveTab('logs')}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'logs' ? 'bg-white border-white text-black shadow-xl shadow-white/10' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
            >
               Audit Logs
            </button>
         </div>
      </div>

      {activeTab === 'concepts' && (
        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
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
                       <p className="font-extrabold text-white text-sm tracking-tight mb-1 group-hover:text-emerald-400 transition-colors">{idea.title}</p>
                       <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{idea.category}</p>
                    </td>
                    <td className="px-10 py-8 text-zinc-400 text-xs font-bold">{getUserName(idea.user_id)}</td>
                    <td className="px-10 py-8 text-zinc-600 text-xs font-mono">{idea.created_at}</td>
                    <td className="px-10 py-8">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20 uppercase">SEC_LEVEL_01</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:text-emerald-400">Verify</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-zinc-950 text-zinc-600 uppercase text-[9px] font-black tracking-widest border-b border-zinc-800">
                      <th className="px-10 py-6">Signal Origin</th>
                      <th className="px-10 py-6">Captured Payload</th>
                      <th className="px-10 py-6">Violation Log</th>
                      <th className="px-10 py-6 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-black/10">
                   {safetyQueue.length > 0 ? safetyQueue.map(msg => (
                         <tr key={msg.id} className="hover:bg-rose-500/5 transition-colors">
                            <td className="px-10 py-8">
                               <p className="font-extrabold text-white text-xs tracking-widest mb-1">{getUserName(msg.sender_id)}</p>
                            </td>
                            <td className="px-10 py-8">
                               <p className="text-zinc-400 text-xs max-w-md bg-black/40 p-3 rounded-xl border border-zinc-800/50 italic leading-relaxed">"{msg.message_text}"</p>
                            </td>
                            <td className="px-10 py-8">
                               <span className={`px-3 py-1 text-[9px] font-black rounded-lg border uppercase ${msg.is_blocked ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                  {msg.is_blocked ? 'Auto_Flag' : 'User_Report'}
                               </span>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <button onClick={() => handleDismissFlag(msg.id)} className="text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:text-emerald-400">Dismiss</button>
                            </td>
                         </tr>
                      )) : (
                      <tr><td colSpan={4} className="px-10 py-40 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.4em]">Queue Empty</td></tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="p-8 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-[10px] font-black text-white uppercase tracking-widest">Observability Terminal</h2>
            <div className="flex gap-4">
              <button 
                onClick={generateInviteLink}
                className="bg-emerald-500 text-black px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10"
              >
                {copyFeedback ? 'Link Copied' : 'Generate Invite Link'}
              </button>
              <button onClick={() => Logger.clear()} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400">Purge Audit Log</button>
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto bg-black/50 p-6 font-mono space-y-2">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="flex gap-4 text-[10px] border-b border-zinc-800/30 pb-2">
                <span className="text-zinc-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={`font-black shrink-0 ${log.level === 'ERROR' ? 'text-rose-500' : log.level === 'WARN' ? 'text-orange-500' : 'text-emerald-500'}`}>
                  {log.level}
                </span>
                <span className="text-zinc-100 uppercase tracking-tight">{log.event}</span>
                {log.userId && <span className="text-zinc-600 italic truncate">User: {log.userId.slice(-6)}</span>}
                {log.details && <span className="text-zinc-600 truncate opacity-50">• {log.details}</span>}
              </div>
            )) : (
              <p className="text-center py-20 text-zinc-700 uppercase tracking-widest text-xs">No entries recorded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
