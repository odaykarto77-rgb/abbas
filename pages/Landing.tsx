
import React from 'react';

const Landing: React.FC = () => {
  return (
    <div className="bg-zinc-950 selection:bg-emerald-500/30">
      {/* Pure Marketing Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-48 sm:pt-48 sm:pb-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
             <span className="inline-block px-5 py-2 rounded-full bg-emerald-500/5 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-emerald-500/10">
                A Bridge Between Vision and Capital
             </span>
             <h1 className="text-6xl tracking-tighter font-extrabold sm:text-8xl xl:text-9xl text-white mb-12 leading-[0.9]">
               The terminal for <br/>
               <span className="text-emerald-500">strategic scale.</span>
             </h1>
             <p className="mt-8 text-xl text-zinc-500 sm:text-2xl leading-relaxed max-w-3xl mx-auto font-medium">
                Sell It is a secure environment purpose-built for the direct exchange of business concepts. We facilitate a quiet, high-integrity connection between elite entrepreneurs and discerning investors.
             </p>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none opacity-20">
           <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[160px]"></div>
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-zinc-800/20 rounded-full blur-[160px]"></div>
        </div>
      </section>

      {/* Concept Breakdown: What Sell It Is */}
      <section className="py-32 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-6">What is Sell It</h2>
              <h3 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-8">A private terminal for <br/>strategic assets.</h3>
              <p className="text-zinc-500 text-lg leading-relaxed mb-6 font-medium">
                Sell It functions as a specialized communication terminal rather than a traditional marketplace. It is designed for businesses and investors who value discretion above all else.
              </p>
              <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                The platform removes the noise of public listings and social engagement, focusing entirely on peer-to-peer verification and strategic alignment.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="p-8 bg-zinc-900/50 rounded-[2rem] border border-zinc-900">
                  <div className="text-white text-3xl font-black mb-4">01</div>
                  <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed">Direct Terminal Access</p>
               </div>
               <div className="p-8 bg-zinc-900/50 rounded-[2rem] border border-zinc-900">
                  <div className="text-white text-3xl font-black mb-4">02</div>
                  <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed">Encrypted Exchange</p>
               </div>
               <div className="p-8 bg-zinc-900/50 rounded-[2rem] border border-zinc-900">
                  <div className="text-white text-3xl font-black mb-4">03</div>
                  <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed">Verified Pedigree</p>
               </div>
               <div className="p-8 bg-zinc-900/50 rounded-[2rem] border border-zinc-800">
                  <div className="text-emerald-500 text-3xl font-black mb-4">04</div>
                  <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed">Zero Public Data</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience: Who Sell It Is For */}
      <section className="py-32 bg-black border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
           <div className="text-center mb-24">
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4">The Ecosystem</h2>
              <h3 className="text-5xl font-extrabold text-white tracking-tighter">Built for purpose.</h3>
           </div>
           
           <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-zinc-900/30 p-12 lg:p-16 rounded-[3rem] border border-zinc-800/50">
                 <h4 className="text-emerald-500 font-black uppercase text-xs tracking-[0.3em] mb-8">For Visionaries</h4>
                 <h5 className="text-3xl font-bold text-white mb-6">Protect your intellectual capital.</h5>
                 <p className="text-zinc-500 leading-relaxed font-medium">
                   Entrepreneurs who have developed high-value concepts but require a quiet, professional gate to present them to capital partners without public exposure.
                 </p>
              </div>
              <div className="bg-zinc-900/30 p-12 lg:p-16 rounded-[3rem] border border-zinc-800/50">
                 <h4 className="text-emerald-500 font-black uppercase text-xs tracking-[0.3em] mb-8">For Strategists</h4>
                 <h5 className="text-3xl font-bold text-white mb-6">Access unfiltered opportunities.</h5>
                 <p className="text-zinc-500 leading-relaxed font-medium">
                   Investors looking for vetted, direct access to business owners. Sell It provides the tools to evaluate concepts in a streamlined, non-competitive environment.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Differentiator: Why Sell It is Different */}
      <section className="py-32 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-8">The Difference</h2>
           <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug mb-16">
             In a world of constant noise, Sell It provides the clarity of direct communication. 
             No middlemen, no public auctions, just strategic partnership.
           </p>
           
           <div className="space-y-12">
              {[
                { title: "Privacy Protocol", desc: "No concept data is ever indexed by search engines or visible to unverified visitors." },
                { title: "Strategic Intent", desc: "Communication is driven by mutual interest and verified capacity." },
                { title: "Secure Terminal", desc: "Every interaction happens within our end-to-end encrypted messaging environment." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                   <h6 className="text-white text-lg font-black uppercase tracking-widest mb-2">{item.title}</h6>
                   <p className="text-zinc-600 font-medium max-w-lg">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust & Integrity Section */}
      <section className="py-32 bg-emerald-500/5 border-t border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto mb-10 flex items-center justify-center">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
           </div>
           <h3 className="text-4xl font-extrabold text-white tracking-tighter mb-6">Integrity by Design</h3>
           <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
             Sell It operates on a foundation of absolute confidentiality. Our network is composed of partners who prioritize the security of their vision and the longevity of their investments.
           </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
