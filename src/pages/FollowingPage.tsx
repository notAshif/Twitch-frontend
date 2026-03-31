import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { AlertCircle, Megaphone, Play } from 'lucide-react';

interface Stream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  title: string;
  viewer_count: number;
  thumbnail_url: string;
  started_at: string;
  user_profile_image_url?: string;
}

export function FollowingPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ streams: Stream[] }>('/api/following/live');
      setStreams(data.streams);
    } catch (err) {
      setError('Failed to load streams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatViewers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto animate-pulse px-2">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-48 bg-white/5 rounded-[12px]" />
          <div className="h-4 w-32 bg-white/5 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i}>
               <div className="aspect-video bg-white/5 rounded-[16px] mb-4" />
               <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5" />
                  <div className="flex-1 space-y-2">
                     <div className="h-4 bg-white/5 rounded w-3/4" />
                     <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Oops! Something went wrong</h2>
        <p className="text-twitch-text-muted mb-8 max-w-md">{error}</p>
        <button onClick={fetchStreams} className="twitch-button-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 px-2">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1.5 tracking-tight hover:text-twitch-purple transition-colors w-fit">Following</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <p className="text-red-400 font-semibold text-xs py-0.5 uppercase tracking-widest">Live Channels</p>
          </div>
        </div>
      </header>

      {streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-[#121217] rounded-[24px] border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-twitch-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-white/5 relative z-10">
            <Megaphone className="w-8 h-8 text-twitch-text-muted group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 relative z-10 tracking-tight">No Live Channels</h2>
          <p className="text-twitch-text-muted max-w-sm mb-8 relative z-10 leading-relaxed font-medium">
            Looks like everyone you follow is taking a break. Why not explore some new categories?
          </p>
          <Link to="/browse" className="twitch-button-primary relative z-10">Browse Categories</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {streams.map((stream) => (
            <div key={stream.id} className="group flex flex-col cursor-pointer">
              <Link
                to={`/watch/${stream.user_login}`}
                className="block relative aspect-video rounded-[16px] overflow-hidden mb-4 bg-[#121217]"
              >
                <img
                  src={stream.thumbnail_url.replace('{width}', '440').replace('{height}', '248')}
                  alt={stream.user_name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Overlays */}
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-[6px] uppercase tracking-wider shadow-lg">
                  LIVE
                </div>
                <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/80 backdrop-blur-md text-white text-[12px] font-medium rounded-[6px] shadow-lg group-hover:bg-twitch-purple/90 transition-colors">
                  {formatViewers(stream.viewer_count)} viewers
                </div>
                
                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-14 h-14 bg-twitch-purple rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-twitch-purple/30">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                </div>
              </Link>

              <div className="flex gap-4">
                 <div className="flex-shrink-0">
                     <Link to={`/watch/${stream.user_login}`} className="block relative w-11 h-11 rounded-full p-[2px] bg-white/10 group-hover:bg-gradient-to-tr group-hover:from-twitch-purple group-hover:to-purple-500 transition-all duration-300">
                        <img 
                           src={stream.user_profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.user_name}`} 
                           alt="" 
                           className="w-full h-full rounded-full object-cover bg-twitch-black border-[2px] border-[#09090b]"
                        />
                     </Link>
                 </div>
                 <div className="min-w-0 flex-1 pt-0.5">
                    <Link to={`/watch/${stream.user_login}`} className="block">
                      <h3 className="text-white font-semibold text-[15px] group-hover:text-twitch-purple truncate transition-colors leading-tight mb-1" title={stream.title}>
                        {stream.title}
                      </h3>
                    </Link>
                    <p className="text-twitch-text-muted text-[13px] font-medium mb-0.5 hover:text-white transition-colors truncate" title={stream.user_name}>
                      {stream.user_name}
                    </p>
                    <p className="text-twitch-text-muted/60 text-[12px] hover:text-twitch-purple transition-colors truncate">
                      {stream.game_name}
                    </p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
