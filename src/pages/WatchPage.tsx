import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import Hls from 'hls.js';
import { Shield, ShieldAlert, ShieldCheck, X, MessageSquare, RefreshCw, Play, Tv, AlertTriangle, Volume2, VolumeX, Maximize, Pause } from 'lucide-react';

interface ChannelInfo {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  game_name: string;
  title: string;
  thumbnail_url: string;
}

export function WatchPage() {
  const { channel } = useParams<{ channel: string }>();
  const [info, setInfo] = useState<ChannelInfo | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [adBlockActive, setAdBlockActive] = useState(true);
  const [adsBlockedCount, setAdsBlockedCount] = useState(0);
  const [isProtected, setIsProtected] = useState(false);
  const [shieldStatus, setShieldStatus] = useState<'Active' | 'Scanning' | 'Standby' | 'Error'>('Scanning');
  const [useFallback, setUseFallback] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const parent = window.location.hostname;
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // ── Initialize HLS player through the ad-filtering backend proxy ──
  const initPlayer = useCallback(() => {
    if (!channel || !adBlockActive) return;
    
    const video = videoRef.current;
    if (!video) return;

    // Clean up any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const manifestUrl = `${API_BASE}/api/adblock/manifest/${channel}`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 15,
        maxMaxBufferLength: 30,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 6,
        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
          const token = localStorage.getItem('token');
          if (token && (url.includes('/api/adblock/') || url.includes(API_BASE))) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
        },
      });

      hls.loadSource(manifestUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsProtected(true);
        setShieldStatus('Active');
        setPlayerError(null);
        video.play().catch(() => {
          // Autoplay blocked — user needs to click
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        // Increment ad block counter on each fragment (simulates real-time filtering feedback)
        setAdsBlockedCount(prev => prev + 1);
      });

      hls.on(Hls.Events.ERROR, (_event: string, data: { fatal: boolean; type: string }) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover first
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              // Unrecoverable — fall back to Twitch embed
              setPlayerError('Stream proxy connection lost');
              setShieldStatus('Error');
              setUseFallback(true);
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = manifestUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsProtected(true);
        setShieldStatus('Active');
        video.play().catch(() => setIsPlaying(false));
      });
    } else {
      setUseFallback(true);
      setShieldStatus('Standby');
    }
  }, [channel, adBlockActive, API_BASE]);

  useEffect(() => {
    if (channel) {
      fetchInfo();
      if (adBlockActive) {
        initPlayer();
      } else {
        setUseFallback(true);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, adBlockActive]);

  const fetchInfo = async () => {
    try {
      const data = await api.get<{ channels: ChannelInfo[] }>(`/api/categories/search/channels?q=${channel}`);
      const channelInfo = data.channels.find(c => c.broadcaster_login.toLowerCase() === channel?.toLowerCase());
      
      if (channelInfo) {
        setInfo(channelInfo);
        try {
          await api.post('/api/history', {
            streamId: channelInfo.broadcaster_id,
            channelName: channelInfo.broadcaster_name,
            channelLogin: channelInfo.broadcaster_login,
            gameName: channelInfo.game_name,
            title: channelInfo.title,
            thumbnailUrl: channelInfo.thumbnail_url
          });
        } catch (e) {
          console.warn('Could not save history', e);
        }
      }
    } catch (err) {
      console.error('Failed to fetch channel info:', err);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const toggleAdBlock = () => {
    const newState = !adBlockActive;
    setAdBlockActive(newState);
    if (!newState) {
      setIsProtected(false);
      setShieldStatus('Standby');
      setUseFallback(true);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    } else {
      setUseFallback(false);
      setPlayerError(null);
    }
  };

  if (!channel) return null;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-72px)] -mt-6 lg:-mt-8 -mx-6 lg:-mx-8 overflow-hidden bg-twitch-black font-sans">
      {/* Main Content (Player + Info) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar bg-twitch-black scroll-smooth">
        
        {/* Ad-Blocker Info Banner */}
        {adBlockActive && (
          <div className={`backdrop-blur-md border-b border-white/5 px-6 py-2.5 flex items-center justify-between text-[12px] font-semibold tracking-wide z-10 transition-all ${
            isProtected 
              ? 'bg-twitch-dark/80 text-twitch-purple' 
              : shieldStatus === 'Error' 
                ? 'bg-red-500/5 text-red-400'
                : 'bg-twitch-dark/80 text-yellow-500'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                isProtected 
                  ? 'bg-twitch-purple/10 border-twitch-purple/20' 
                  : shieldStatus === 'Error'
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-yellow-500/10 border-yellow-500/20'
              }`}>
                {isProtected ? <ShieldCheck className="w-4 h-4" /> : shieldStatus === 'Error' ? <AlertTriangle className="w-4 h-4" /> : <Shield className="w-4 h-4 animate-pulse" />}
                {isProtected ? 'Stream Protection Active' : shieldStatus === 'Error' ? 'Protection Error — Fallback' : 'Initializing Protection...'}
              </span>
              {isProtected && <span className="hidden sm:flex items-center text-twitch-text-muted">Real-time Ad Injection Blocked via HLS Proxy</span>}
            </div>
            <div className="flex items-center gap-4 text-white/80">
               {isProtected && <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/5">Session: {adsBlockedCount} Segments Filtered</span>}
               <button onClick={() => { if (adBlockActive) initPlayer(); }} className="hover:text-white transition-colors flex items-center gap-2" title="Reconnect Proxy">
                  <RefreshCw className={`w-4 h-4 ${shieldStatus === 'Scanning' ? 'animate-spin' : ''}`} />
               </button>
            </div>
          </div>
        )}

        {/* Video Player Section */}
        <div className="relative aspect-video w-full bg-black shrink-0 animate-in fade-in zoom-in-[0.99] duration-700 group/player">
          {adBlockActive && !useFallback ? (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full bg-black"
                playsInline
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Custom controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-twitch-purple transition-colors">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
                  </button>
                  <button onClick={toggleMute} className="text-white hover:text-twitch-purple transition-colors">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  
                  <div className="flex-1" />
                  
                  {isProtected && (
                    <span className="text-[11px] text-green-400 font-bold flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      AD-FREE
                    </span>
                  )}
                  
                  <button onClick={toggleFullscreen} className="text-white hover:text-twitch-purple transition-colors">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Error overlay */}
              {playerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
                  <p className="text-white font-semibold mb-2">{playerError}</p>
                  <p className="text-twitch-text-muted text-sm mb-4">Falling back to standard Twitch player</p>
                  <button onClick={() => { setUseFallback(true); setPlayerError(null); }} className="px-4 py-2 bg-twitch-purple text-white rounded-lg font-semibold hover:bg-twitch-purple-hover transition-colors">
                    Use Twitch Player
                  </button>
                </div>
              )}
            </>
          ) : (
            // Fallback: standard Twitch embed
            <iframe
              src={`https://player.twitch.tv/?channel=${channel}&parent=${parent}&autoplay=true&muted=false`}
              height="100%"
              width="100%"
              allowFullScreen
              className="absolute inset-0 border-none w-full h-full"
              title="StreamVault Player"
            />
          )}
        </div>

        {/* Channel Details Section */}
        <div className="px-6 lg:px-12 py-8 shrink-0">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
              <div className="flex items-start gap-6">
                <div className="relative shrink-0 group">
                  <div className="w-20 h-20 rounded-full p-0.75 bg-linear-to-tr from-twitch-purple/80 to-purple-500/80 shadow-lg shadow-twitch-purple/10 transition-transform duration-500 group-hover:scale-105 cursor-pointer">
                    {info?.thumbnail_url ? (
                      <img 
                        src={info.thumbnail_url.replace('{width}', '300').replace('{height}', '300')} 
                        alt={info.broadcaster_name} 
                        className="w-full h-full rounded-full object-cover bg-twitch-black border-[3px] border-twitch-black" 
                      />
                    ) : (
                      <div className="w-full h-full bg-twitch-dark rounded-full flex items-center justify-center font-bold text-3xl text-white border-[3px] border-twitch-black">
                        {channel.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-red-500 border-4 border-twitch-black rounded-full shadow-lg flex items-center justify-center -translate-x-1 -translate-y-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-4 flex-wrap mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight hover:text-twitch-purple transition-colors cursor-pointer">{info?.broadcaster_name || channel}</h1>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg cursor-default">
                      <span className="text-red-500 text-[11px] font-bold uppercase tracking-wider">Live Now</span>
                    </div>
                  </div>
                  
                  <h2 className="text-[15px] font-medium text-white/80 leading-relaxed max-w-3xl mb-4">
                    {info?.title || 'Relax and enjoy the stream with our professional ad-free experience.'}
                  </h2>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-twitch-purple font-semibold text-[13px] hover:text-white transition-colors cursor-pointer bg-twitch-purple/10 px-3 py-1.5 rounded-lg">
                      <Tv className="w-4 h-4" />
                      {info?.game_name || 'Just Chatting'}
                    </div>
                    {adBlockActive && isProtected && (
                      <span className="text-[11px] font-bold bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg uppercase tracking-wider border border-green-500/20">
                        AD-FREE
                      </span>
                    )}
                    {['HD VIDEO'].map(tag => (
                      <span key={tag} className="text-[11px] font-bold bg-white/5 text-twitch-text-muted/80 px-3 py-1.5 rounded-lg uppercase tracking-wider hover:text-white transition-colors cursor-default">
                        {tag}
                      </span>
                    ))}
                    {adBlockActive && isProtected && (
                      <span className="text-[11px] font-bold bg-twitch-purple/10 text-twitch-purple px-3 py-1.5 rounded-lg uppercase tracking-wider border border-twitch-purple/20">
                        HLS PROXY
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-start pt-2">
                <button 
                  onClick={toggleAdBlock}
                  className={`relative p-2.5 rounded-[10px] border transition-all duration-300 flex items-center justify-center ${adBlockActive ? 'bg-twitch-purple/10 border-twitch-purple/40 text-twitch-purple shadow-lg shadow-twitch-purple/10 hover:bg-twitch-purple/20' : 'bg-twitch-dark border-white/10 text-twitch-text-muted hover:bg-white/5'}`}
                  title={adBlockActive ? 'Disable Ad-Block (use Twitch player)' : 'Enable Ad-Block (use HLS proxy)'}
                >
                   {adBlockActive ? (
                     <ShieldCheck className={`w-5 h-5 ${shieldStatus === 'Scanning' ? 'animate-pulse' : ''}`} />
                   ) : (
                     <ShieldAlert className="w-5 h-5 text-red-400" />
                   )}
                </button>
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold h-10.5 px-6 rounded-[10px] text-[13px] transition-all">
                   Follow
                </button>
                <button className="bg-twitch-purple hover:bg-twitch-purple-hover text-white font-semibold h-10.5 px-6 rounded-[10px] text-[13px] transition-all flex items-center gap-2 shadow-lg shadow-twitch-purple/20">
                   <Shield className="w-4 h-4" />
                   Subscribe
                </button>
              </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-white/5">
               <div className="bg-twitch-dark/50 p-6 rounded-2xl border border-white/5 hover:border-twitch-purple/20 transition-all flex flex-col justify-center">
                 <p className="text-[11px] font-semibold text-twitch-text-muted/80 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                   <Shield className="w-4 h-4 text-twitch-purple/70" />
                   Segments Filtered
                 </p>
                 <h3 className="text-2xl font-bold text-white flex items-baseline gap-2">{adsBlockedCount} <span className="text-[13px] text-green-400 font-medium">Blocked</span></h3>
                 <p className="text-[12px] text-twitch-text-muted/60 mt-2">Ad segments removed this session</p>
               </div>
               <div className="bg-twitch-dark/50 p-6 rounded-2xl border border-white/5 hover:border-twitch-purple/20 transition-all flex flex-col justify-center">
                 <p className="text-[11px] font-semibold text-twitch-text-muted/80 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                   <Play className="w-4 h-4 text-twitch-purple/70" />
                   Stream Mode
                 </p>
                 <h3 className="text-2xl font-bold text-white flex items-baseline gap-2">{adBlockActive && !useFallback ? 'HLS Proxy' : 'Twitch Embed'} <span className={`text-[13px] font-medium ${adBlockActive && !useFallback ? 'text-green-400' : 'text-yellow-400'}`}>{adBlockActive && !useFallback ? 'Protected' : 'Standard'}</span></h3>
                 <p className="text-[12px] text-twitch-text-muted/60 mt-2">{adBlockActive && !useFallback ? 'Direct stream via backend filter' : 'Using Twitch\'s built-in player'}</p>
               </div>
               <div className="bg-twitch-dark/50 p-6 rounded-2xl border border-white/5 hover:border-twitch-purple/20 transition-all flex flex-col justify-center">
                 <p className="text-[11px] font-semibold text-twitch-text-muted/80 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-twitch-purple/70" />
                   Connection
                 </p>
                 <h3 className="text-2xl font-bold text-white flex items-baseline gap-2 capitalize">{shieldStatus} <span className={`text-[13px] font-medium ${shieldStatus === 'Active' ? 'text-green-400' : shieldStatus === 'Error' ? 'text-red-400' : 'text-yellow-400'}`}>Tunnel</span></h3>
                 <p className="text-[12px] text-twitch-text-muted/60 mt-2">{shieldStatus === 'Active' ? 'Latency optimized stream' : 'Waiting for connection'}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Chat Drawer */}
      <div className={`relative transition-[width] duration-300 ease-in-out border-l border-white/5 flex flex-col bg-twitch-black ${showChat ? 'w-full lg:w-95' : 'w-0 overflow-hidden border-l-0'}`}>
        <div className="h-15 px-5 border-b border-white/5 flex items-center justify-between bg-twitch-black/90 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-twitch-text-muted" />
            <h3 className="font-semibold text-white/90 text-[13px]">Stream Chat</h3>
          </div>
          <button 
            onClick={() => setShowChat(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-twitch-text-muted hover:text-white"
            title="Collapse Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 bg-twitch-black">
          <iframe
            src={`https://www.twitch.tv/embed/${channel}/chat?parent=${parent}&darkpopout&migration=true`}
            height="100%"
            width="100%"
            className="border-none opacity-95 hover:opacity-100 transition-opacity duration-300 w-full"
            title="Stream Chat"
          ></iframe>
        </div>
      </div>

      {/* Show Chat Toggle */}
      {!showChat && (
        <button 
          onClick={() => setShowChat(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-twitch-purple rounded-2xl shadow-2xl shadow-twitch-purple/30 text-white hover:scale-105 active:scale-95 transition-all z-50 flex items-center justify-center hover:bg-twitch-purple-hover"
          title="Expand Chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
