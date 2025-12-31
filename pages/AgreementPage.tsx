
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Agreement, BusinessIdea } from '../types';

interface AgreementPageProps {
  agreements: Agreement[];
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>;
  currentUser: User | null;
  ideas: BusinessIdea[];
}

const AgreementPage: React.FC<AgreementPageProps> = ({ agreements, setAgreements, currentUser, ideas }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agreement = agreements.find(a => a.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTerms, setDraftTerms] = useState(agreement?.terms || '');

  if (!currentUser) return <div className="p-32 text-center text-zinc-500 font-black uppercase tracking-widest text-xs">Auth Required</div>;

  const handleSign = () => {
    if (!agreement) return;
    const updatedStatus = currentUser.role === 'owner' ? 'PENDING_INVESTOR' : 'PENDING_OWNER';
    const newStatus = agreement.status === 'DRAFT' ? updatedStatus : 'SIGNED';
    
    setAgreements(agreements.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
    alert('Contract signed and encrypted via Sell It.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-zinc-900 rounded-[3rem] border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="bg-black p-12 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-zinc-800">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Strategic Partnership</h1>
            <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] mt-2">DOCKET: {id?.toUpperCase() || 'DRAFT'}</p>
          </div>
          <div className="px-6 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
            {agreement?.status || 'INTERNAL_REVIEW'}
          </div>
        </div>

        <div className="p-12 lg:p-16 space-y-12 bg-zinc-900/50">
          <div className="grid sm:grid-cols-2 gap-12 py-10 border-b border-zinc-800">
            <div>
              <h3 className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em] mb-6">Party A (Owner)</h3>
              <div className="flex items-center gap-4 bg-black p-5 rounded-2xl border border-zinc-800">
                 <img src="https://picsum.photos/seed/sarah/50" className="h-10 w-10 rounded-lg grayscale" alt="" />
                 <div>
                    <p className="font-extrabold text-white text-sm tracking-tight">Sarah Chen</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Partner Station: 01</p>
                 </div>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em] mb-6">Party B (Investor)</h3>
              <div className="flex items-center gap-4 bg-black p-5 rounded-2xl border border-zinc-800">
                 <img src="https://picsum.photos/seed/marcus/50" className="h-10 w-10 rounded-lg grayscale" alt="" />
                 <div>
                    <p className="font-extrabold text-white text-sm tracking-tight">Marcus Sterling</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Partner Station: 02</p>
                 </div>
              </div>
            </div>
          </div>

          <section>
             <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-8">Memorandum of Understanding</h3>
             {isEditing ? (
               <textarea 
                className="w-full h-80 p-8 bg-black border border-zinc-800 rounded-3xl text-zinc-100 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all leading-relaxed"
                value={draftTerms}
                onChange={(e) => setDraftTerms(e.target.value)}
                placeholder="Enter formal terms..."
               />
             ) : (
               <div className="bg-black p-10 rounded-[2.5rem] border border-zinc-800 text-zinc-400 leading-[1.8] font-mono text-xs whitespace-pre-wrap">
                  {agreement?.terms || "I. PREAMBLE\nThis agreement serves as a binding manual framework facilitated by the Sell It network...\n\nII. EQUITY DISBURSEMENT\nThe Investor covenants to provide capital for the agreed net equity...\n\nIII. PLATFORM JURISDICTION\nSell It is a facilitator. Final legal enforceability is determined by third-party notarization."}
               </div>
             )}
          </section>

          <div className="bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-500/10 text-[10px] text-zinc-500 font-bold leading-relaxed uppercase tracking-wider">
             <p className="text-emerald-500 font-black mb-2 tracking-[0.1em]">PROTECTION NOTICE:</p>
             Sell It remains a third-party non-legal entity. Users acknowledge that this digital document acts as a manual intent for partnership and is not a substitute for formal legal representation in your jurisdiction.
          </div>

          <div className="flex justify-end gap-6 pt-10">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-8 py-3 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Discard</button>
                <button onClick={() => setIsEditing(false)} className="bg-white text-black px-10 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 shadow-xl transition-all">Commit Terms</button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="px-8 py-3 text-emerald-500 font-black uppercase tracking-widest text-[10px] hover:text-emerald-400 transition-colors">Edit Clauses</button>
                <button onClick={handleSign} className="bg-emerald-500 text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all">Authenticate Signature</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementPage;
