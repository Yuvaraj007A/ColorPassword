import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, ShieldAlert, ArrowLeft, RefreshCw, Unlock, 
  Shield, Users, History, Activity, Trash2, UserCheck, UserMinus, 
  Search, Filter, AlertTriangle, Key, Terminal, Ban, Info, CheckCircle 
} from 'lucide-react';

export default function AdminPanel() {
  const { fetchWithAuth, navigateTo, user: currentUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Tab State: 'analytics', 'users', 'logs'
  const [activeTab, setActiveTab] = useState('analytics');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all', 'active', 'locked'
  
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all'); // 'all', 'success', 'failed', 'locked'

  // Admin Actions Temporary States
  const [lockTargetId, setLockTargetId] = useState(null);
  const [lockHours, setLockHours] = useState(2);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showClearLogsConfirm, setShowClearLogsConfirm] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const loadData = async () => {
    setError('');
    try {
      const [statsRes, usersRes, historyRes] = await Promise.all([
        fetchWithAuth('/admin/stats'),
        fetchWithAuth('/admin/users'),
        fetchWithAuth('/admin/history')
      ]);

      if (statsRes.status !== 200 || usersRes.status !== 200 || historyRes.status !== 200) {
        throw new Error('Failed to load administrator data. Privilege check failed.');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const historyData = await historyRes.json();

      setStats(statsData);
      setUsers(usersData);
      setHistory(historyData);
    } catch (e) {
      console.error(e);
      setError(e.message || 'An error occurred fetching admin records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setGeneratedOtp(null);
    loadData();
  };

  const showInfo = (msg) => {
    setInfoMessage(msg);
    setTimeout(() => setInfoMessage(''), 5000);
  };

  const handleUnlockUser = async (userId) => {
    try {
      const response = await fetchWithAuth('/admin/unlock', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.status === 200) {
        showInfo(data.message || 'User successfully unlocked.');
        loadData();
      } else {
        setError(data.error || 'Failed to unlock user.');
      }
    } catch (e) {
      console.error('Unlock error:', e);
      setError('Network error unlocking account.');
    }
  };

  const handleLockUser = async (userId) => {
    try {
      const response = await fetchWithAuth('/admin/lock', {
        method: 'POST',
        body: JSON.stringify({ userId, durationHours: lockHours })
      });
      const data = await response.json();
      if (response.status === 200) {
        showInfo(data.message || 'User locked successfully.');
        setLockTargetId(null);
        loadData();
      } else {
        setError(data.error || 'Failed to lock user.');
      }
    } catch (e) {
      console.error('Lock error:', e);
      setError('Network error locking account.');
    }
  };

  const handleToggleRole = async (userId) => {
    try {
      const response = await fetchWithAuth('/admin/toggle-role', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.status === 200) {
        showInfo(data.message || 'User role updated.');
        loadData();
      } else {
        setError(data.error || 'Failed to change user role.');
      }
    } catch (e) {
      console.error('Role update error:', e);
      setError('Network error changing role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetchWithAuth(`/admin/user/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (response.status === 200) {
        showInfo(data.message || 'User account successfully deleted.');
        setDeleteConfirmId(null);
        loadData();
      } else {
        setError(data.error || 'Failed to delete user.');
      }
    } catch (e) {
      console.error('Delete error:', e);
      setError('Network error deleting user.');
    }
  };

  const handleClearHistory = async () => {
    try {
      const response = await fetchWithAuth('/admin/history', {
        method: 'DELETE'
      });
      const data = await response.json();
      if (response.status === 200) {
        showInfo(data.message || 'All audit logs cleared.');
        setShowClearLogsConfirm(false);
        loadData();
      } else {
        setError(data.error || 'Failed to clear security audit logs.');
      }
    } catch (e) {
      console.error('Clear logs error:', e);
      setError('Network error clearing logs.');
    }
  };

  const handleGenerateOtp = async (userId) => {
    try {
      const response = await fetchWithAuth('/admin/reset-otp', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.status === 200) {
        setGeneratedOtp({
          userId,
          otp: data.otp,
          email: data.email,
          username: users.find(u => u._id === userId)?.username || 'User'
        });
        showInfo('Temporary reset OTP generated.');
      } else {
        setError(data.error || 'Failed to generate OTP.');
      }
    } catch (e) {
      console.error('OTP generation error:', e);
      setError('Network error generating reset OTP.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Accessing Security Vault...</p>
        </div>
      </div>
    );
  }

  // Frontend filters
  const filteredUsers = users.filter((u) => {
    const isLocked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
    const matchesSearch = 
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    
    if (userFilter === 'locked') return matchesSearch && isLocked;
    if (userFilter === 'active') return matchesSearch && !isLocked;
    return matchesSearch;
  });

  const filteredHistory = history.filter((log) => {
    const matchesSearch = 
      log.username.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.ip.includes(logSearch);
    
    if (logFilter !== 'all') return matchesSearch && log.status === logFilter;
    return matchesSearch;
  });

  // SVG Success Donut computations
  const successPercentage = stats ? parseFloat(stats.successRate) : 0;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (successPercentage / 100) * circumference;

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            title="Return to banking dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400 animate-pulse" /> Administrative Security Console
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Real-time Graphical Access Monitoring & Authentication Stats</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors focus:outline-none disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Sync Data
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Administrative Alert:</span> {error}
            <button className="text-[10px] text-rose-400 underline block mt-1 hover:text-rose-300" onClick={() => setError('')}>Dismiss</button>
          </div>
        </div>
      )}

      {infoMessage && (
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-sm flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* OTP Display Banner */}
      {generatedOtp && (
        <div className="p-5 rounded-xl bg-indigo-950/40 border border-indigo-700/40 text-slate-200 text-xs space-y-2.5">
          <div className="flex justify-between items-center border-b border-indigo-900 pb-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Key className="w-3.5 h-3.5" /> Direct Password Reset Credentials
            </span>
            <button className="text-slate-450 hover:text-slate-200 font-semibold font-mono" onClick={() => setGeneratedOtp(null)}>✕ Close</button>
          </div>
          <p>
            You have initiated a secure bypass OTP generation for user <span className="font-bold text-white">{generatedOtp.username}</span> ({generatedOtp.email}). Give this code to the user to bypass their current color sequence:
          </p>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-indigo-900 text-indigo-100 font-mono text-lg font-bold rounded-lg tracking-widest border border-indigo-700">
              {generatedOtp.otp}
            </div>
            <span className="text-slate-400 text-[10px]">Valid for 10 minutes. Can be submitted in the OTP confirmation route.</span>
          </div>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 gap-1.5">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all focus:outline-none ${
            activeTab === 'analytics'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-350 hover:border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Security Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all focus:outline-none ${
            activeTab === 'users'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-350 hover:border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Users Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all focus:outline-none ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-350 hover:border-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Audit History Logs
        </button>
      </div>

      {/* TAB CONTENT: 1. Analytics & Visuals */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          {/* Stats Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl glass-panel border border-slate-800 shadow flex items-center gap-4">
              <div className="p-3 bg-indigo-950/40 text-indigo-400 border border-indigo-800/30 rounded-lg shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Total Profiles</span>
                <span className="text-xl font-extrabold text-slate-100">{stats.totalUsers}</span>
              </div>
            </div>

            <div className="p-5 rounded-xl glass-panel border border-slate-800 shadow flex items-center gap-4">
              <div className="p-3 bg-rose-950/40 text-rose-450 border border-rose-800/30 rounded-lg shrink-0">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Blocked Accounts</span>
                <span className="text-xl font-extrabold text-slate-100">{stats.currentlyLocked}</span>
              </div>
            </div>

            <div className="p-5 rounded-xl glass-panel border border-slate-800 shadow flex items-center gap-4">
              <div className="p-3 bg-sky-950/40 text-sky-400 border border-sky-800/30 rounded-lg shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Auth Attempts</span>
                <span className="text-xl font-extrabold text-slate-100">{stats.totalAttempts}</span>
              </div>
            </div>

            <div className="p-5 rounded-xl glass-panel border border-slate-800 shadow flex items-center gap-4">
              <div className={`p-3 border rounded-lg shrink-0 ${
                parseFloat(stats.successRate) > 75 
                  ? 'bg-emerald-950/40 text-emerald-450 border-emerald-800/30' 
                  : 'bg-amber-950/40 text-amber-450 border-amber-800/30'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Success Rate</span>
                <span className="text-xl font-extrabold text-slate-100">{stats.successRate}%</span>
              </div>
            </div>
          </div>

          {/* SVG Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut Chart */}
            <div className="p-6 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Access Integrity Ratio</h4>
                <p className="text-[10px] text-slate-500">Ratio of authenticated requests to failed attacks.</p>
              </div>

              <div className="flex items-center justify-center py-4 relative">
                {/* SVG Circle Progress */}
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 144 144">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-slate-200 block font-mono">{stats.successRate}%</span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Success</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Successful: {stats.successfulLogins}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Failed/Locked: {stats.failedLogins + stats.lockedAttempts}</span>
                </div>
              </div>
            </div>

            {/* Operating System & Browser distributions */}
            <div className="p-6 rounded-xl glass-panel border border-slate-800 space-y-5">
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">User Agent Analytics</h4>
                <p className="text-[10px] text-slate-500">Client environments logged during authentications.</p>
              </div>

              <div className="space-y-4">
                {/* Operating Systems */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block">Operating Systems</span>
                  {stats.osDistribution && stats.osDistribution.length > 0 ? (
                    stats.osDistribution.map((item) => {
                      const pct = stats.totalAttempts > 0 ? ((item.count / stats.totalAttempts) * 100).toFixed(0) : 0;
                      return (
                        <div key={item._id} className="space-y-1 text-[11px]">
                          <div className="flex justify-between text-slate-400 font-medium">
                            <span className="truncate max-w-[150px]">{item._id || 'Unknown'}</span>
                            <span className="font-mono text-slate-500">{item.count} attempts ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-600 py-2">No system statistics recorded yet.</p>
                  )}
                </div>

                {/* Browsers */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block">Web Browsers</span>
                  {stats.browserDistribution && stats.browserDistribution.length > 0 ? (
                    stats.browserDistribution.map((item) => {
                      const pct = stats.totalAttempts > 0 ? ((item.count / stats.totalAttempts) * 100).toFixed(0) : 0;
                      return (
                        <div key={item._id} className="space-y-1 text-[11px]">
                          <div className="flex justify-between text-slate-400 font-medium">
                            <span className="truncate max-w-[150px]">{item._id || 'Unknown'}</span>
                            <span className="font-mono text-slate-500">{item.count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-600 py-2">No browser statistics recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Threat Intelligence / Suspicious IPs */}
            <div className="p-6 rounded-xl glass-panel border border-slate-800 space-y-4">
              <div>
                <h4 className="text-xs uppercase font-bold text-rose-450 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Threat Intelligence Feed
                </h4>
                <p className="text-[10px] text-slate-500">Flags client IP addresses logging anomalous failure levels.</p>
              </div>

              <div className="space-y-2.5">
                {stats.suspiciousIps && stats.suspiciousIps.length > 0 ? (
                  stats.suspiciousIps.map((ip, index) => {
                    const level = ip.count >= 8 ? 'High Threat' : ip.count >= 4 ? 'Warning' : 'Low Threat';
                    const badgeColor = 
                      level === 'High Threat' ? 'bg-rose-950/60 text-rose-400 border-rose-900/40 animate-pulse' :
                      level === 'Warning' ? 'bg-amber-950/60 text-amber-400 border-amber-900/45' : 'bg-slate-900 text-slate-450 border-slate-800';

                    return (
                      <div key={ip._id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-350">{ip._id}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded border font-semibold uppercase ${badgeColor}`}>
                              {level}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">Total consecutive failures: <span className="font-bold text-slate-400 font-mono">{ip.count}</span></p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">#{index + 1} Flagged</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-slate-600 text-xs">
                    🛡️ System Security Intact. No suspicious IP threats flagged.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search and Filters bar */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search profiles by username/email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 text-slate-300 placeholder-slate-500 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">Filter Lock Status:</span>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="all">Show All Profiles</option>
                <option value="active">Active Only</option>
                <option value="locked">Locked Out Only</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl glass-panel p-6 border border-slate-800 shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Profile / Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Security Level</th>
                    <th className="pb-3">Fail Count</th>
                    <th className="pb-3">Lockout Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredUsers.map((u) => {
                    const isLocked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
                    const isSelf = u._id === currentUser?.id;
                    const canAlterAdmin = !isSelf;

                    return (
                      <tr key={u._id} className="hover:bg-slate-900/10">
                        {/* Name */}
                        <td className="py-4 font-semibold text-slate-200">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${isLocked ? 'bg-rose-500 shadow-rose' : 'bg-emerald-500 shadow-emerald'}`} />
                            <div>
                              <span className="font-bold text-slate-200 block text-xs">{u.username}</span>
                              <span className="text-[10px] text-slate-500 font-medium">Registered: {new Date(u.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 text-slate-400 font-mono">{u.email}</td>

                        {/* Admin Badge */}
                        <td className="py-4">
                          {u.isAdmin ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-305 border border-indigo-800/40 text-[9px] font-black uppercase tracking-wider">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-850 text-[9px] font-bold uppercase tracking-wider">
                              Standard User
                            </span>
                          )}
                        </td>

                        {/* Failed attempts */}
                        <td className="py-4 text-slate-400 font-mono">{u.failedAttempts} / 5</td>

                        {/* Status details */}
                        <td className="py-4">
                          {isLocked ? (
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/40 text-[10px] font-bold uppercase tracking-widest inline-block animate-pulse">
                                Locked
                              </span>
                              <span className="text-[9px] text-slate-500 block">
                                Until: {new Date(u.lockedUntil).toLocaleTimeString()}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-450 border border-slate-800 text-[10px] font-semibold">
                              Unchecked / Safe
                            </span>
                          )}
                        </td>

                        {/* User Actions */}
                        <td className="py-4">
                          <div className="flex items-center gap-1.5 justify-end">
                            {/* Bypass OTP */}
                            <button
                              onClick={() => handleGenerateOtp(u._id)}
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                              title="Generate Bypass Reset OTP"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Lock/Unlock Toggle */}
                            {isLocked ? (
                              <button
                                onClick={() => handleUnlockUser(u._id)}
                                className="px-2 py-1.5 bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-850 rounded text-[10px] font-extrabold flex items-center gap-1 transition-colors"
                                title="Unlock Account Profile"
                              >
                                <Unlock className="w-3 h-3" /> Unlock
                              </button>
                            ) : (
                              <>
                                {lockTargetId === u._id ? (
                                  <div className="flex items-center bg-slate-900 border border-slate-850 rounded px-1.5 py-0.5 gap-1 animate-fadeIn">
                                    <select
                                      value={lockHours}
                                      onChange={(e) => setLockHours(Number(e.target.value))}
                                      className="bg-transparent text-[10px] text-slate-350 focus:outline-none pr-1.5 font-bold cursor-pointer"
                                    >
                                      <option value="1">1h</option>
                                      <option value="2">2h</option>
                                      <option value="6">6h</option>
                                      <option value="24">24h</option>
                                    </select>
                                    <button
                                      onClick={() => handleLockUser(u._id)}
                                      className="px-1.5 py-0.5 bg-rose-950 text-rose-300 hover:bg-rose-900 rounded text-[9px] font-bold border border-rose-900/40"
                                    >
                                      Lock
                                    </button>
                                    <button
                                      onClick={() => setLockTargetId(null)}
                                      className="text-slate-500 hover:text-slate-200 text-[10px] font-bold px-0.5"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setLockTargetId(u._id);
                                      setLockHours(2);
                                    }}
                                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded text-slate-400 hover:text-rose-455 transition-colors"
                                    title="Manually Lock Account"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}

                            {/* Promote/Demote Toggle */}
                            {canAlterAdmin ? (
                              <button
                                onClick={() => handleToggleRole(u._id)}
                                className={`p-1.5 border rounded transition-colors ${
                                  u.isAdmin 
                                    ? 'bg-amber-950/20 text-amber-400 border-amber-900/30 hover:bg-amber-950/40' 
                                    : 'bg-slate-900 text-slate-400 border-slate-850 hover:text-indigo-400 hover:bg-slate-800'
                                }`}
                                title={u.isAdmin ? 'Revoke Admin Privileges' : 'Grant Admin Privileges'}
                              >
                                {u.isAdmin ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            ) : (
                              <span className="p-1.5 text-slate-650 opacity-30 select-none" title="You cannot demote yourself.">
                                <UserCheck className="w-3.5 h-3.5" />
                              </span>
                            )}

                            {/* Delete Button */}
                            {canAlterAdmin ? (
                              <>
                                {deleteConfirmId === u._id ? (
                                  <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/40 rounded px-2 py-1 animate-fadeIn">
                                    <span className="text-[9px] text-rose-300 font-bold">Delete?</span>
                                    <button
                                      onClick={() => handleDeleteUser(u._id)}
                                      className="px-1.5 py-0.5 bg-rose-700 hover:bg-rose-650 rounded text-[9px] text-white font-bold"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="text-slate-400 hover:text-white text-[9px]"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(u._id)}
                                    className="p-1.5 bg-slate-900 hover:bg-rose-950 hover:border-rose-900/40 border border-slate-850 rounded text-slate-400 hover:text-rose-455 transition-colors animate-fadeIn"
                                    title="Delete User Permanently"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="p-1.5 text-slate-650 opacity-30 select-none" title="You cannot delete yourself.">
                                <Trash2 className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                        No profile matches found under the search and filter settings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. Security Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Action and Search bar */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-center flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search logs by Username or IP address..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-300 placeholder-slate-500 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                <Filter className="w-3 h-3 text-slate-500 ml-1.5" />
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2.5 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="all">All Events</option>
                  <option value="success">Success only</option>
                  <option value="failed">Failures only</option>
                  <option value="locked">Account Locks only</option>
                </select>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto flex justify-end">
              {showClearLogsConfirm ? (
                <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-900/40 rounded-lg p-1.5 animate-fadeIn">
                  <span className="text-[10px] text-rose-300 font-bold pl-1.5">Purge all logs?</span>
                  <button
                    onClick={handleClearHistory}
                    className="px-2.5 py-1.5 bg-rose-750 hover:bg-rose-650 rounded text-[10px] font-bold text-white transition-colors"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setShowClearLogsConfirm(false)}
                    className="px-2 py-1.5 bg-slate-900 text-slate-350 hover:text-white rounded text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearLogsConfirm(true)}
                  disabled={history.length === 0}
                  className="px-3.5 py-2.5 bg-rose-950/20 text-rose-400 hover:text-rose-300 border border-rose-900/30 hover:bg-rose-950/45 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Clear Security Audit Logs
                </button>
              )}
            </div>
          </div>

          {/* Logs Stream */}
          <div className="rounded-xl glass-panel p-6 border border-slate-800 shadow space-y-3 max-h-[600px] overflow-y-auto pr-2 scroll-area">
            {filteredHistory.map((log) => {
              const statusColors = {
                success: 'bg-emerald-950/30 border-emerald-900/40 text-emerald-450',
                failed: 'bg-rose-950/30 border-rose-900/40 text-rose-450',
                locked: 'bg-amber-950/30 border-amber-900/40 text-amber-450',
              };
              const isExpanded = expandedLogId === log._id;

              return (
                <div key={log._id} className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-900/70 hover:border-slate-800 text-[11px] space-y-2 leading-tight transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-xs">{log.username}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({log.ip})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 border rounded-full font-bold text-[9px] uppercase tracking-wider ${statusColors[log.status] || 'bg-slate-900 text-slate-400'}`}>
                        {log.status}
                      </span>
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                        className="text-slate-500 hover:text-slate-350 px-1 font-bold text-[10px]"
                      >
                        {isExpanded ? 'Collapse' : 'Details'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 text-slate-500 py-1">
                    <div>Browser: <span className="text-slate-400 font-medium">{log.browser}</span></div>
                    <div>OS: <span className="text-slate-400 font-medium">{log.os}</span></div>
                    <div className="sm:text-right text-slate-600 font-medium">
                      {new Date(log.loginTime).toLocaleString()}
                    </div>
                  </div>

                  {/* Expandable client characteristics details */}
                  {isExpanded && (
                    <div className="p-3 bg-slate-950 border border-slate-900 rounded mt-2 space-y-2 text-[10px] text-slate-400 animate-slideDown">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-bold border-b border-slate-900 pb-1">
                        <Terminal className="w-3.5 h-3.5" /> Full Authentication Context Metadata
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-mono">
                        <div><span className="text-slate-600">Client IP Address:</span> {log.ip}</div>
                        <div><span className="text-slate-600">Event Trigger Timestamp:</span> {log.loginTime}</div>
                        <div><span className="text-slate-600">Operating System Name:</span> {log.os}</div>
                        <div><span className="text-slate-600">Target Auth Account:</span> {log.username}</div>
                        <div className="col-span-2"><span className="text-slate-600">User Agent Description:</span> {log.browser}</div>
                        <div className="col-span-2"><span className="text-slate-600">Trace/System ID:</span> {log._id}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredHistory.length === 0 && (
              <div className="py-16 text-center text-slate-600 text-xs flex flex-col items-center justify-center gap-2">
                <Info className="w-6 h-6 text-slate-700" />
                <span>No history records found under the search and filter settings.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
