import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Star, Flame, Pin } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  box_art_url: string;
}

export function BrowsePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pinnedCategories, setPinnedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trendingData, pinnedData] = await Promise.all([
        api.get<{ categories: Category[] }>('/api/categories/trending'),
        api.get<{ pinned: Category[] }>('/api/categories/pinned/list'),
      ]);
      setCategories(trendingData.categories);
      setPinnedCategories(pinnedData.pinned);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const pinCategory = async (category: Category) => {
    try {
      await api.post('/api/categories/pin', {
        categoryId: category.id,
        name: category.name,
        boxArtUrl: category.box_art_url,
      });
      setPinnedCategories([...pinnedCategories, category]);
    } catch (err) {
      console.error('Failed to pin category:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto animate-pulse px-4">
        <div className="h-12 w-64 bg-white/5 rounded-[12px] mb-8" />
        <div className="flex gap-4 mb-8">
           <div className="h-4 w-24 bg-white/5 rounded-full" />
           <div className="h-4 w-24 bg-white/5 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i => (
            <div key={i} className="flex flex-col gap-2">
               <div className="aspect-[3/4] bg-white/5 rounded-[12px]" />
               <div className="h-3 bg-white/5 rounded w-3/4" />
               <div className="h-2 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <header className="mb-10">
        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">Browse</h1>
        <div className="flex gap-6 border-b border-twitch-border/50 text-[14px] font-semibold">
           <button className="px-1 py-3 text-twitch-purple border-b-2 border-twitch-purple tracking-wide">Categories</button>
           <button className="px-1 py-3 text-twitch-text-muted hover:text-white transition-colors tracking-wide">Live Channels</button>
        </div>
      </header>

      {pinnedCategories.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2.5 mb-6">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Pinned Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8">
            {pinnedCategories.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                isPinned={true}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Trending Categories</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8">
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onPin={() => pinCategory(category)}
              isPinned={pinnedCategories.some(p => p.id === category.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ category, onPin, isPinned }: { category: Category; onPin?: () => void; isPinned?: boolean }) {
  return (
    <div className="group relative flex flex-col cursor-pointer">
      <Link
        to={`/category/${category.id}`}
        className="block relative aspect-[3/4] rounded-[12px] overflow-hidden mb-2.5 bg-[#121217] shadow-lg group-hover:shadow-twitch-purple/10 transition-all duration-300"
      >
        <img
          src={category.box_art_url.replace('{width}', '285').replace('{height}', '380')}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {onPin && !isPinned && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onPin();
            }}
            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-twitch-purple text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 backdrop-blur-sm"
            title="Pin category"
          >
            <Pin className="w-4 h-4" />
          </button>
        )}
      </Link>
      
      <div className="px-1">
        <Link to={`/category/${category.id}`} className="block">
          <h3 className="text-white font-semibold text-[15px] truncate hover:text-twitch-purple transition-colors leading-tight">
            {category.name}
          </h3>
        </Link>
        <p className="text-twitch-text-muted text-[12px] font-medium mt-0.5" title={`${Math.floor(Math.random() * 500 + 50)}K Viewers`}>
           {Math.floor(Math.random() * 500 + 50)}K Viewers
        </p>
      </div>
    </div>
  );
}
