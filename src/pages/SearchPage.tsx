import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Search } from 'lucide-react';

interface Channel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  game_name: string;
  is_live: boolean;
  thumbnail_url: string;
  title: string;
}

interface Category {
  id: string;
  name: string;
  box_art_url: string;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await api.get<{ channels: Channel[]; categories: Category[] }>(
        `/api/categories/search?q=${encodeURIComponent(query)}`
      );
      setChannels(data.channels);
      setCategories(data.categories);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Discover</h1>
        <p className="text-twitch-text-muted/80 font-medium">Find your favorite channels, games, and streamers</p>
      </header>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-16 max-w-2xl mx-auto relative group">
        <div className="absolute inset-0 bg-twitch-purple rounded-[16px] blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
        <div className="relative flex-1 flex items-center">
           <Search className="absolute left-4 w-5 h-5 text-twitch-text-muted/60" />
           <input
             type="text"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Search for streamers or games..."
             className="w-full pl-12 pr-4 py-4 bg-[#121217] border border-white/5 hover:border-white/10 rounded-[16px] text-white placeholder-white/30 focus:outline-none focus:border-twitch-purple focus:ring-1 focus:ring-twitch-purple transition-all shadow-lg"
           />
        </div>
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="px-8 py-4 bg-twitch-purple hover:bg-twitch-purple-hover disabled:bg-white/5 disabled:text-white/30 disabled:border-white/5 text-white font-semibold rounded-[16px] transition-all shadow-lg shadow-twitch-purple/20 hover:shadow-twitch-purple/40 disabled:shadow-none"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading && (
        <div className="flex justify-center items-center py-12">
           <div className="w-8 h-8 rounded-full border-2 border-twitch-purple border-t-transparent animate-spin" />
        </div>
      )}

      {searched && !loading && (
        <div className="space-y-12">
          {channels.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Channels</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {channels.map((channel) => (
                  <Link
                    key={channel.broadcaster_id}
                    to={`/watch/${channel.broadcaster_login}`}
                    className="flex items-center gap-5 p-4 bg-[#121217] border border-white/5 rounded-[16px] hover:border-twitch-purple/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-twitch-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                       <img
                         src={channel.thumbnail_url.replace('{width}', '80').replace('{height}', '80')}
                         alt={channel.broadcaster_name}
                         className="w-16 h-16 rounded-full object-cover ring-2 ring-transparent group-hover:ring-twitch-purple/50 transition-all"
                       />
                       {channel.is_live && (
                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-[4px] border-2 border-[#121217] uppercase tracking-wider">
                           Live
                         </div>
                       )}
                    </div>
                    
                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex flex-col gap-0.5 mb-1.5">
                        <span className="text-white font-bold text-[16px] group-hover:text-twitch-purple transition-colors truncate">{channel.broadcaster_name}</span>
                        {channel.is_live ? (
                          <div className="text-twitch-text-muted/80 text-[13px] font-medium truncate">{channel.title}</div>
                        ) : (
                          <div className="text-twitch-text-muted/60 text-[12px] font-medium uppercase tracking-wider">Offline</div>
                        )}
                      </div>
                      
                      {channel.game_name && (
                         <span className="inline-block px-2 py-0.5 bg-white/5 text-white/70 text-[10px] uppercase font-bold tracking-wider rounded-[6px] truncate max-w-full">
                           {channel.game_name}
                         </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {categories.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6 mt-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Categories</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-8">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="group block relative"
                  >
                    <div className="relative aspect-[3/4] rounded-[12px] overflow-hidden mb-3 bg-[#121217] shadow-lg group-hover:shadow-twitch-purple/20 transition-all duration-500">
                      <img
                        src={category.box_art_url.replace('{width}', '285').replace('{height}', '380')}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="px-1 text-center">
                      <p className="text-white text-[15px] font-semibold truncate group-hover:text-twitch-purple transition-colors">{category.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {channels.length === 0 && categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-[#121217] rounded-[24px] border border-white/5 relative overflow-hidden group">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-white/5 relative z-10 transition-transform group-hover:scale-110 duration-500">
                <Search className="w-8 h-8 text-twitch-text-muted group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 relative z-10 tracking-tight">No results found</h2>
              <p className="text-twitch-text-muted relative z-10 font-medium">We couldn't find anything matching "{query}". Try another search term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
