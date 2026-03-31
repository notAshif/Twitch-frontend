import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Gamepad2, Play } from 'lucide-react';

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
}

interface Category {
  id: string;
  name: string;
  boxArtUrl: string;
}

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchCategory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ category: Category; streams: Stream[] }>(`/api/categories/${id}`);
      setCategory(data.category);
      setStreams(data.streams);
    } catch (err) {
      setError('Failed to load category streams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatViewers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto animate-pulse px-4">
        <div className="flex gap-6 mb-8">
           <div className="w-32 h-44 bg-white/5 rounded-[16px]" />
           <div className="flex flex-col justify-end pb-2">
             <div className="w-48 h-8 bg-white/5 rounded-lg mb-3" />
             <div className="w-24 h-6 bg-white/5 rounded-full" />
           </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return <div className="text-red-400 p-8 text-center">{error || 'Category not found'}</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 flex items-end gap-6 relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-twitch-purple rounded-[16px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
          <img
            src={category.boxArtUrl.replace('{width}', '144').replace('{height}', '192')}
            alt={category.name}
            className="w-28 h-40 lg:w-36 lg:h-48 rounded-[16px] object-cover shadow-2xl relative z-10 border border-white/10 group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="pb-1 lg:pb-3">
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">{category.name}</h1>
          <p className="bg-twitch-purple/10 border border-twitch-purple/20 text-twitch-purple px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-[13px] font-semibold tracking-wide">
            <span className="w-2 h-2 bg-twitch-purple rounded-full animate-pulse" />
            {streams.length} Live Channels
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {streams.map((stream) => (
          <div key={stream.id} className="group flex flex-col cursor-pointer">
            <Link
              to={`/watch/${stream.user_login}`}
              className="block relative aspect-video rounded-[16px] overflow-hidden mb-4 bg-[#121217]"
            >
              <img
                src={stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')}
                alt={stream.user_name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-[6px] uppercase tracking-wider shadow-lg">
                LIVE
              </div>
              <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/80 backdrop-blur-md text-white text-[12px] font-medium rounded-[6px] shadow-lg group-hover:bg-twitch-purple/90 transition-colors">
                {formatViewers(stream.viewer_count)} viewers
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-14 h-14 bg-twitch-purple rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-twitch-purple/30">
                  <Play className="w-6 h-6 fill-white ml-1" />
                </div>
              </div>
            </Link>
            
            <div className="px-1">
              <Link to={`/watch/${stream.user_login}`} className="block">
                 <h3 className="text-white font-semibold text-[15px] group-hover:text-twitch-purple truncate transition-colors leading-tight mb-1" title={stream.title}>
                   {stream.title}
                 </h3>
              </Link>
              <p className="text-twitch-text-muted text-[13px] font-medium hover:text-white transition-colors truncate" title={stream.user_name}>
                {stream.user_name}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {streams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-[#121217] rounded-[24px] border border-white/5 relative overflow-hidden group mt-8">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-white/5 relative z-10 transition-transform group-hover:scale-110 duration-500">
            <Gamepad2 className="w-8 h-8 text-twitch-text-muted group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10 tracking-tight">No Live Streams</h2>
          <p className="text-twitch-text-muted relative z-10 font-medium">No one is currently streaming this category.</p>
        </div>
      )}
    </div>
  );
}
