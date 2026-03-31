import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Home, Compass, Clock, Bug, Search, Settings, LogOut, Shield, ChevronRight, Zap } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Following', icon: Home },
  { path: '/browse', label: 'Browse', icon: Compass },
  { path: '/history', label: 'History', icon: Clock },
  { path: '/issues', label: 'Report Issue', icon: Bug },
];

interface SearchResult {
  broadcaster_login: string;
  display_name: string;
  thumbnail_url: string;
  is_live: boolean;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Profile menu state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setShowResults(true);
      setIsSearching(true);
      try {
        const data = await api.get<{ channels: SearchResult[] }>(`/api/categories/search/channels?q=${query}`);
        setSearchResults(data.channels.slice(0, 8));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-[#f0f0f0] font-sans selection:bg-twitch-purple/20">
      {/* Top Navigation */}
      <header className="h-[72px] border-b border-white/5 bg-[#09090b]/80 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-twitch-purple to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-twitch-purple/20 transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <h1 className="text-white font-bold text-xl hidden md:block tracking-tight">StreamVault</h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.slice(0, 2).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2.5 rounded-[10px] text-[13px] font-semibold tracking-wide transition-all flex items-center gap-2 ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white'
                    : 'text-twitch-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-1 max-w-xl mx-8 hidden sm:block relative" ref={searchRef}>
          <div className="relative group flex items-center">
            <div className="absolute left-4 text-twitch-text-muted transition-colors group-focus-within:text-twitch-purple">
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-twitch-purple border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length > 0 && setShowResults(true)}
              placeholder="Search for streamers..." 
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-[13px] font-medium focus:border-twitch-purple/50 focus:bg-white/10 outline-none transition-all placeholder:text-twitch-text-muted/60"
            />
          </div>

          {/* Live search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#121217]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 h-[400px] flex flex-col overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#18181b]/50">
                  <span className="text-[11px] font-semibold text-twitch-text-muted">Streamers</span>
                  {isSearching && <span className="text-[11px] text-twitch-purple animate-pulse">Scanning...</span>}
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
                  {searchResults.map((result) => (
                    <button
                      key={result.broadcaster_login}
                      onClick={() => {
                        navigate(`/watch/${result.broadcaster_login}`);
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-[12px] hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={result.thumbnail_url} alt="" className="w-9 h-9 rounded-full bg-white/5 object-cover border border-white/10" />
                          {result.is_live && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-[2px] border-[#121217]" />}
                        </div>
                        <div className="text-left">
                          <p className="text-[13px] font-semibold text-white group-hover:text-twitch-purple transition-colors">{result.display_name}</p>
                          <p className="text-[11px] text-twitch-text-muted font-medium">{result.is_live ? 'Live Now' : 'Offline'}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <ChevronRight className="w-4 h-4 text-twitch-purple" />
                      </div>
                    </button>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                 <p className="text-[13px] font-semibold text-white">{user.displayName}</p>
                 <p className="text-[11px] font-medium text-twitch-text-muted capitalize">{user.role}</p>
              </div>
              <div className="relative cursor-pointer" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-twitch-purple/80 to-purple-500/80 shadow-lg shadow-twitch-purple/10 transition-all hover:ring-2 hover:ring-white/20 active:scale-95"
                >
                  <img 
                    src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} 
                    alt={user.displayName} 
                    className="w-full h-full rounded-full bg-twitch-black object-cover border-[2px] border-[#09090b]"
                  />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[#121217]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-3 border-b border-white/5 mb-2">
                      <p className="font-semibold text-[14px] text-white truncate">{user.displayName}</p>
                      <p className="text-[11px] text-twitch-text-muted font-medium mt-0.5 capitalize">{user.role} Account</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium hover:bg-white/5 rounded-[10px] transition-all"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Settings
                      </Link>
                    )}
                    <button 
                      onClick={() => { logout(); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-red-400 hover:bg-red-400/10 rounded-[10px] transition-all mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="twitch-button-primary px-6 py-2 text-[13px]">Sign In</Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[72px] lg:w-[240px] bg-[#09090b] border-r border-white/5 flex flex-col transition-all duration-300 overflow-y-auto z-40">
          <div className="p-4 mb-2 hidden lg:block">
            <h2 className="text-[11px] font-semibold text-twitch-text-muted/60 uppercase tracking-wider">Navigation</h2>
          </div>

          <nav className="flex-1 px-3 space-y-1 mt-4 lg:mt-0">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const IconItem = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all group ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-twitch-text-muted hover:bg-white/5 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <IconItem className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-twitch-text-muted group-hover:text-white'}`} />
                  <span className="text-[14px] font-medium hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 mt-auto border-t border-white/5 hidden lg:block">
            <div className="bg-twitch-purple/5 p-4 rounded-[14px] border border-twitch-purple/20 relative overflow-hidden group hover:border-twitch-purple/40 hover:bg-twitch-purple/10 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-twitch-purple" />
                <p className="text-[11px] font-semibold text-twitch-purple uppercase tracking-wider">Shield Service</p>
              </div>
              <p className="text-[12px] text-twitch-text-muted leading-relaxed font-medium">
                Advanced AI filtering is active and protecting your session.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#09090b] overflow-x-hidden">
          <div className="p-6 lg:p-8 max-w-[1800px] mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

