import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BugOff, ExternalLink, Plus, X } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  githubIssueUrl: string | null;
  githubIssueId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const data = await api.get<{ issues: Issue[] }>('/api/issues');
      setIssues(data.issues);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const data = await api.post<{ issue: Issue }>('/api/issues', {
        title: title.trim(),
        description: description.trim(),
        severity,
      });
      setIssues([data.issue, ...issues]);
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to submit issue');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-500/10 text-green-400 border-green-500/20',
      medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return colors[sev] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      investigating: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
      closed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    };
    return colors[status] || colors.open;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Issues center</h1>
          <p className="text-twitch-text-muted/80">Help us improve by reporting bugs and feedback</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl transition-all duration-300 ${
            showForm 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-twitch-purple hover:bg-twitch-purple-hover text-white shadow-lg shadow-twitch-purple/20 hover:shadow-twitch-purple/40'
          }`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Report Issue'}
        </button>
      </header>

      {success && (
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="font-semibold text-sm">Issue successfully submitted. Thank you!</p>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 bg-twitch-dark border border-white/5 rounded-[20px] p-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Submit details</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-twitch-text-muted/90 text-[13px] font-bold uppercase tracking-wider mb-2">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-4 py-3 bg-twitch-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-twitch-purple focus:ring-1 focus:ring-twitch-purple transition-colors appearance-none"
              >
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Affects functionality</option>
                <option value="high">High - Major feature broken</option>
                <option value="critical">Critical - App unusable</option>
              </select>
            </div>

            <div>
              <label className="block text-twitch-text-muted/90 text-[13px] font-bold uppercase tracking-wider mb-2">Issue Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 bg-twitch-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-twitch-purple focus:ring-1 focus:ring-twitch-purple transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-twitch-text-muted/90 text-[13px] font-bold uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the issue, including steps to reproduce..."
                rows={6}
                className="w-full px-4 py-3 bg-twitch-black border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-twitch-purple focus:ring-1 focus:ring-twitch-purple transition-all resize-none"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-twitch-purple hover:bg-twitch-purple-hover disabled:bg-white/10 disabled:text-white/40 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-twitch-purple/20"
            >
              {submitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      )}

      {issues.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-twitch-dark/50 rounded-3xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-tr from-twitch-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-white/5 relative z-10 transition-transform group-hover:scale-110 duration-500">
            <BugOff className="w-8 h-8 text-twitch-text-muted group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10 tracking-tight">No Issues Reported</h2>
          <p className="text-twitch-text-muted relative z-10 font-medium max-w-sm">System functioning nominally. If you encounter a bug, click "Report Issue" above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-twitch-dark border border-white/5 hover:border-twitch-purple/30 rounded-2xl p-6 transition-colors group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-twitch-purple to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
                <span className="text-twitch-text-muted/60 text-[12px] font-medium block whitespace-nowrap">{formatDate(issue.createdAt)}</span>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2 tracking-tight group-hover:text-twitch-purple transition-colors">{issue.title}</h3>
              <p className="text-twitch-text-muted/80 text-[14px] mb-4 whitespace-pre-wrap leading-relaxed">
                {issue.description}
              </p>
              
              {issue.githubIssueUrl && (
                <div className="pt-4 border-t border-white/5 mt-auto">
                  <a
                    href={issue.githubIssueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[13px] font-bold text-twitch-purple hover:text-white transition-colors tracking-wide"
                  >
                    View tracking on GitHub
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
