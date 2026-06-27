import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, ArrowLeft, RefreshCw, Unlock, Shield, Users, History, Activity } from 'lucide-react';

export default function AdminPanel() {
  const { fetchWithAuth, navigateTo } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
    loadData();
  };

  const handleUnlockUser = async (userId) => {
    try {
      const response = await fetchWithAuth('/admin/unlock', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.status === 200) {
        // Reload page data
        loadData();
      } else {
        setError(data.error || 'Failed to unlock user.');
      }
    } catch (e) {
      setError('Network error unlocking account.');
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

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> Administrative Security Console
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Real-time Graphical Access Monitoring & Authentication Stats</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors focus:outline-none disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Sync Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-sm">
          ⚠️ Administrative Error: {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl glass-panel border border-slate-800 shadow flex items-center gap-4">
            <div className="p-3 bg-indigo-950/40 text-indigo-400 border border-indigo-800/30 rounded-lg shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Total Users</span>
              <span className="text-xl font-extrabold text-slate-100">{stats.totalUsers}</span>
            </div>
          </div>

          <div className="p-5 rounded-xl glass-panel border border-slate-800 shadow flex items-center gap-4">
            <div className="p-3 bg-rose-950/40 text-rose-400 border border-rose-800/30 rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Locked Accounts</span>
              <span className="text-xl font-extrabold text-slate-100">{stats.currentlyLocked}</span>
            </div>
          </div>

          <div className="p-5 rounded-xl glass-panel border border-slate-800 shadow flex items-center gap-4">
            <div className="p-3 bg-sky-950/40 text-sky-400 border border-sky-800/30 rounded-lg shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Login Attempts</span>
              <span className="text-xl font-extrabold text-slate-100">{stats.totalAttempts}</span>
            </div>
          </div>

          <div className="p-5 rounded-xl glass-panel border border-slate-800 shadow flex items-center gap-4">
            <div className="p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Success Rate</span>
              <span className="text-xl font-extrabold text-slate-100">{stats.successRate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Users list & Login History */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="xl:col-span-2 rounded-xl glass-panel p-6 border border-slate-800 shadow space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            👤 User Accounts Directory
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Failed Logs</th>
                  <th className="pb-3">Lock Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {users.map((u) => {
                  const isLocked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
                  return (
                    <tr key={u._id} className="hover:bg-slate-900/10">
                      <td className="py-3 font-semibold text-slate-200">{u.username}</td>
                      <td className="py-3 text-slate-400 font-mono">{u.email}</td>
                      <td className="py-3 text-slate-400 font-mono text-center sm:text-left">{u.failedAttempts}</td>
                      <td className="py-3">
                        {isLocked ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/40 text-[10px] font-semibold animate-pulse">
                            Locked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-semibold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isLocked ? (
                          <button
                            onClick={() => handleUnlockUser(u._id)}
                            className="px-2.5 py-1.5 bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800/40 rounded text-[10px] font-bold flex items-center gap-1 ml-auto transition-colors focus:outline-none"
                          >
                            <Unlock className="w-3 h-3" /> Unlock
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px] pr-2">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">No accounts registerd in local database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Logs stream */}
        <div className="rounded-xl glass-panel p-6 border border-slate-800 shadow space-y-4 flex flex-col">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4" /> Live Security History
          </h3>

          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2 scroll-area">
            {history.map((log) => {
              const statusColors = {
                success: 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400',
                failed: 'bg-rose-950/30 border-rose-900/40 text-rose-400',
                locked: 'bg-amber-950/30 border-amber-900/40 text-amber-400',
              };
              return (
                <div key={log._id} className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-900 text-[11px] space-y-2 leading-tight">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{log.username}</span>
                    <span className={`px-2 py-0.5 border rounded-full font-bold text-[9px] uppercase ${statusColors[log.status] || 'bg-slate-900 text-slate-400'}`}>
                      {log.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1 text-slate-500">
                    <div>IP: <span className="font-mono text-slate-400">{log.ip}</span></div>
                    <div>OS: <span className="text-slate-400">{log.os}</span></div>
                    <div className="col-span-2">Browser: <span className="text-slate-400">{log.browser}</span></div>
                  </div>

                  <div className="text-[10px] text-slate-600 border-t border-slate-900 pt-1.5 mt-1.5">
                    {new Date(log.loginTime).toLocaleString()}
                  </div>
                </div>
              );
            })}
            {history.length === 0 && (
              <div className="py-12 text-center text-slate-600 text-xs">No historical records available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
