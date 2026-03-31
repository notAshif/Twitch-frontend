import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Clock, Trash2, X, RotateCcw } from 'lucide-react';

interface HistoryItem {
  id: string;
  streamId: string;
  channelName: string;
  channelLogin: string;
  gameName: string;
  title: string;
  thumbnailUrl: string;
  watchedAt: string;
}

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.get<{ history: HistoryItem[] }>('/api/history');
      setHistory(data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/api/history/${id}`);
      setHistory(history.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const clearAll = async () => {
    if (!confirm('Clear all watch history?')) return;
    try {
      await api.delete('/api/history');
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <div className="text-white">Loading history...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Watch History</h1>
          <p className="text-twitch-text-muted/80">Your recently watched streams and channels</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearAll} 
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all bg-red-500/10 border border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-twitch-dark/50 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-tr from-twitch-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-white/5 relative z-10 transition-transform group-hover:scale-110 duration-500">
            <RotateCcw className="w-8 h-8 text-twitch-text-muted group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 relative z-10 tracking-tight">No Watch History</h2>
          <p className="text-twitch-text-muted mb-8 relative z-10 leading-relaxed font-medium">Streams you interact with will securely appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-6 p-4 bg-twitch-dark border border-white/5 rounded-2xl hover:border-twitch-purple/30 transition-all hover:shadow-lg hover:shadow-twitch-purple/5 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-twitch-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <Link
                to={`/watch/${item.channelLogin}`}
                className="flex items-center gap-6 flex-1 min-w-0 relative z-10"
              >
                <div className="relative rounded-xl overflow-hidden shrink-0 group-hover:shadow-lg shadow-black/50 transition-all group-hover:ring-2 ring-twitch-purple/30">
                  <img 
                    src={item.thumbnailUrl} 
                    alt={item.channelName} 
                    className="w-40 aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                
                <div className="flex-1 min-w-0 py-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-white font-bold text-[16px] truncate group-hover:text-twitch-purple transition-colors">{item.channelLogin}</div>
                    <span className="px-2 py-0.5 bg-white/5 text-twitch-text-muted/80 text-[10px] uppercase font-bold tracking-wider rounded-md">{item.gameName}</span>
                  </div>
                  <div className="text-twitch-text-muted text-[13px] font-medium truncate mb-2 lg:w-3/4">{item.title}</div>
                  
                  <div className="flex items-center gap-2 text-[11px] text-twitch-text-muted/60 font-semibold uppercase tracking-wider">
                     <Clock className="w-3.5 h-3.5" />
                     {formatDate(item.watchedAt)}
                  </div>
                </div>
              </Link>
              <div className="relative z-10 pr-2">
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2.5 text-twitch-text-muted/50 hover:text-red-400 hover:bg-red-500/10 rounded-[10px] transition-all bg-white/5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                  title="Remove from history"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
