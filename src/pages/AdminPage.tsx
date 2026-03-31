import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { LogIn, LogOut, Heart, HeartOff, Eye, Search, Bug, Settings, MapPin } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalActivities: number;
}

interface Activity {
  id: string;
  activityType: string;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    login: string;
    displayName: string;
  };
}

interface User {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  role: string;
  createdAt: string;
  _count: {
    sessions: number;
    viewHistory: number;
    followedChannels: number;
    activities: number;
  };
}

type Tab = 'overview' | 'users' | 'activities';

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === 'activities') fetchActivities();
    if (tab === 'users') fetchUsers();
  }, [tab]);

  const fetchStats = async () => {
    try {
      const data = await api.get<{ stats: Stats }>('/api/admin/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await api.get<{ activities: Activity[] }>('/api/admin/activities?limit=100');
      setActivities(data.activities);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get<{ users: User[] }>('/api/admin/users');
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogIn className="w-5 h-5 text-green-400" />;
      case 'logout': return <LogOut className="w-5 h-5 text-red-400" />;
      case 'follow': return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
      case 'unfollow': return <HeartOff className="w-5 h-5 text-zinc-500" />;
      case 'view': return <Eye className="w-5 h-5 text-blue-400" />;
      case 'search': return <Search className="w-5 h-5 text-purple-400" />;
      case 'issue_created': return <Bug className="w-5 h-5 text-yellow-500" />;
      case 'role_change': return <Settings className="w-5 h-5 text-orange-400" />;
      default: return <MapPin className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-[#a1a1aa]">Monitor user activity and manage the application</p>
      </header>

      <div className="flex gap-2 mb-6 border-b border-[#2d2d30] pb-2">
        {(['overview', 'users', 'activities'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t
                ? 'bg-[#a855f7] text-white'
                : 'text-[#a1a1aa] hover:bg-[#2d2d30] hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0e0e10] border border-[#2d2d30] rounded-lg p-6">
            <p className="text-[#a1a1aa] text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-[#0e0e10] border border-[#2d2d30] rounded-lg p-6">
            <p className="text-[#a1a1aa] text-sm mb-1">Active Sessions</p>
            <p className="text-3xl font-bold text-green-400">{stats.activeUsers}</p>
          </div>
          <div className="bg-[#0e0e10] border border-[#2d2d30] rounded-lg p-6">
            <p className="text-[#a1a1aa] text-sm mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-white">{stats.totalSessions}</p>
          </div>
          <div className="bg-[#0e0e10] border border-[#2d2d30] rounded-lg p-6">
            <p className="text-[#a1a1aa] text-sm mb-1">Total Activities</p>
            <p className="text-3xl font-bold text-white">{stats.totalActivities}</p>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-[#0e0e10] border border-[#2d2d30] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#18181b]">
                <tr className="text-left text-[#a1a1aa] text-sm">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Follows</th>
                  <th className="px-4 py-3 font-medium">History</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d30]">
                {users.map((user) => (
                  <tr key={user.id} className="text-white text-sm hover:bg-[#18181b]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-[#a1a1aa] text-xs">@{user.login}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#2d2d30] text-[#a1a1aa]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{user._count.followedChannels}</td>
                    <td className="px-4 py-3">{user._count.viewHistory}</td>
                    <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user.id, e.target.value)}
                          className="px-2 py-1 text-xs bg-[#2d2d30] border border-[#3d3d40] rounded text-white"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'activities' && (
        <div className="bg-[#0e0e10] border border-[#2d2d30] rounded-lg overflow-hidden">
          <div className="max-h-150 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-[#18181b] sticky top-0">
                <tr className="text-left text-[#a1a1aa] text-sm">
                  <th className="px-4 py-3 font-medium w-12">Type</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">IP Address</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d30]">
                {activities.map((activity) => (
                  <tr key={activity.id} className="text-white text-sm hover:bg-[#18181b]">
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center p-1 bg-[#18181b] rounded-md w-fit border border-[#2d2d30]">
                         {getActivityIcon(activity.activityType)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{activity.user.displayName}</td>
                    <td className="px-4 py-3 text-[#a1a1aa] font-mono text-xs">{activity.ipAddress || '-'}</td>
                    <td className="px-4 py-3 text-[#a1a1aa]">{formatDate(activity.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
