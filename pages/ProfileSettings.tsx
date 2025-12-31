
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProfileSettingsProps {
  currentUser: User;
  onUpdateProfile: (user: User) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, onUpdateProfile }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setSuccess(false);

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview) return;

    setIsUploading(true);
    setError(null);

    // Simulate API call: POST /api/user/profile-image
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const updatedUser = {
        ...currentUser,
        avatar: preview
      };

      onUpdateProfile(updatedUser);
      setSuccess(true);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError("Failed to update profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess(false);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResending(false);
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 5000);
  };

  const handleCancel = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-zinc-900 rounded-[3rem] border border-zinc-800 p-12 lg:p-20 shadow-2xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-extrabold text-white tracking-tighter mb-2">Profile Settings</h1>
            <p className="text-zinc-500 font-medium tracking-widest text-[10px] uppercase">Personalize your terminal presence</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="space-y-12">
          {/* Avatar Section */}
          <section className="flex flex-col md:flex-row items-center gap-12 p-10 bg-black/30 rounded-[2.5rem] border border-zinc-800">
            <div className="relative group shrink-0">
              <img 
                src={preview || currentUser.avatar} 
                className={`w-40 h-40 rounded-[2.5rem] object-cover border-4 ${isUploading ? 'border-emerald-500/50 animate-pulse' : 'border-zinc-800'} shadow-2xl transition-all grayscale group-hover:grayscale-0`}
                alt="Avatar"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest"
              >
                Change Photo
              </button>
            </div>

            <div className="flex-grow space-y-6 text-center md:text-left">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Terminal Identity Image</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                  Your avatar is your primary identifier in messages and secure channels. Square JPG, PNG, or WEBP. Max 2MB.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {!preview ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Select New Image
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSave}
                      disabled={isUploading}
                      className="px-10 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/10"
                    >
                      {isUploading ? 'Syncing...' : 'Commit Changes'}
                    </button>
                    <button 
                      onClick={handleCancel}
                      disabled={isUploading}
                      className="px-8 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Discard
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-bold uppercase tracking-widest animate-shake">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                  Identity Updated Successfully
                </div>
              )}
            </div>
          </section>

          {/* User Info Readonly */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-4">Account Access Name</label>
               <div className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-zinc-400 font-bold opacity-50 select-none">
                 {currentUser.full_name}
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between px-4">
                 <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Secure Email Protocol</label>
                 <div className="flex items-center gap-2">
                    {currentUser.is_verified ? (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[8px] font-black uppercase tracking-widest">
                        Unverified
                      </span>
                    )}
                 </div>
               </div>
               <div className="relative group">
                 <div className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-zinc-400 font-bold opacity-50 select-none">
                   {currentUser.email}
                 </div>
                 
                 {!currentUser.is_verified && (
                   <div className="mt-4 flex items-center justify-between px-2">
                     <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
                       Account features limited until email ownership is confirmed.
                     </p>
                     <button 
                       onClick={handleResendVerification}
                       disabled={resending || resendSuccess}
                       className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                         resendSuccess 
                         ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                         : 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                       } disabled:opacity-50`}
                     >
                       {resending ? 'Transmitting...' : resendSuccess ? 'Link Dispatched' : 'Resend Verification'}
                     </button>
                   </div>
                 )}
               </div>
            </div>
          </section>

          <div className="pt-10 border-t border-zinc-800 flex justify-end">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-12 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
            >
              Return to Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
