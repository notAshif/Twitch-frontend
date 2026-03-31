import { useAuth } from '../hooks/useAuth';
import { Tv, ShieldBan, LineChart, Zap } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden -mt-6 lg:-mt-8 -mx-6 lg:-mx-8 font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-twitch-purple/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(145,71,255,0.08),transparent_70%)] pointer-events-none" />

      <div className="bg-[#121217]/80 border border-white/5 rounded-[24px] p-10 max-w-md w-full shadow-2xl relative z-10 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-twitch-purple to-purple-600 rounded-[20px] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-twitch-purple/20 transition-transform duration-500 hover:scale-105 hover:rotate-3 relative group">
            <div className="absolute inset-0 bg-white/20 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className="w-8 h-8 fill-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">StreamVault</h1>
          <p className="text-twitch-text-muted/80 font-medium">Elevate your viewing experience</p>
        </div>

        <div className="space-y-4 mb-10">
          <FeatureItem 
            icon={<Tv className="w-5 h-5 text-twitch-purple" />} 
            title="Followed Channels" 
            desc="Seamlessly sync your Twitch follows and watch live content directly."
          />
          <FeatureItem 
            icon={<ShieldBan className="w-5 h-5 text-green-400" />} 
            title="Premium Ad-Free" 
            desc="Automatic high-performance stream injection filtering."
          />
          <FeatureItem 
            icon={<LineChart className="w-5 h-5 text-blue-400" />} 
            title="Smart Analytics" 
            desc="Keep a professional track of your watch history."
          />
        </div>

        <button 
          onClick={login} 
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-twitch-purple hover:bg-twitch-purple-hover text-white font-semibold rounded-[16px] transition-all shadow-lg shadow-twitch-purple/20 hover:shadow-twitch-purple/40 active:scale-[0.98] group"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current transition-transform duration-500 group-hover:scale-110">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
          </svg>
          <span className="text-[15px]">Sign in with Twitch</span>
        </button>
        
        <p className="mt-8 text-center text-[10px] text-twitch-text-muted/50 uppercase tracking-[0.2em] font-bold">
           Secured by OAuth 2.0
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 hover:border-twitch-purple/30 hover:bg-white/10 rounded-[16px] transition-all duration-300 group">
      <div className="p-2 bg-[#09090b] rounded-[10px] border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-sm">
        {icon}
      </div>
      <div className="pt-0.5">
        <h3 className="text-white font-semibold text-[14px] mb-1 leading-none">{title}</h3>
        <p className="text-twitch-text-muted/70 text-[12px] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
