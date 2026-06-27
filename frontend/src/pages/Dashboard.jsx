import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Sun, Moon, Accessibility, LogOut, Lock, 
  Wallet, ArrowUpRight, ArrowDownLeft, Send, Landmark, 
  CreditCard, Activity, DollarSign, RefreshCw 
} from 'lucide-react';

export default function Dashboard() {
  const {
    user,
    logout,
    theme,
    setTheme,
    accessibilityMode,
    setAccessibilityMode,
    colorBlindMode,
    setColorBlindMode,
    navigateTo
  } = useAuth();

  // Mock Banking State
  const [checkingBalance, setCheckingBalance] = useState(14245.82);
  const [savingsBalance, setSavingsBalance] = useState(98541.20);
  const [creditBalance, setCreditBalance] = useState(1420.50);
  const [transactions, setTransactions] = useState([
    { id: 1, title: 'Employer Direct Deposit', type: 'credit', amount: 3200.00, date: 'June 26, 2026', category: 'Salary' },
    { id: 2, title: 'Apex Cyber Solutions Purchase', type: 'debit', amount: 240.00, date: 'June 25, 2026', category: 'Services' },
    { id: 3, title: 'Terminal ATM Cash Withdrawal', type: 'debit', amount: 100.00, date: 'June 24, 2026', category: 'Cash' },
    { id: 4, title: 'Dividends Yield Allocation', type: 'credit', amount: 45.30, date: 'June 22, 2026', category: 'Investment' },
    { id: 5, title: 'Global Grid Electric Bill', type: 'debit', amount: 89.20, date: 'June 20, 2026', category: 'Utilities' },
  ]);

  // Money Transfer Form State
  const [transferFrom, setTransferFrom] = useState('checking');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setTransferError('Please enter a valid transfer amount.');
      return;
    }

    if (!recipientAccount || !recipientName) {
      setTransferError('Please provide both the account number and name.');
      return;
    }

    if (transferFrom === 'checking') {
      if (amount > checkingBalance) {
        setTransferError('Insufficient funds in checking account.');
        return;
      }
      setCheckingBalance(prev => prev - amount);
    } else {
      if (amount > savingsBalance) {
        setTransferError('Insufficient funds in savings account.');
        return;
      }
      setSavingsBalance(prev => prev - amount);
    }

    // Add transaction to history
    const newTx = {
      id: Date.now(),
      title: `Transfer to ${recipientName}`,
      type: 'debit',
      amount: amount,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      category: 'Transfer'
    };

    setTransactions([newTx, ...transactions]);
    setTransferSuccess(`Successfully transferred $${amount.toFixed(2)} to ${recipientName}.`);
    setTransferAmount('');
    setRecipientAccount('');
    setRecipientName('');
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Navigation Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 shadow glow-emerald animate-pulse">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Vanguard Secure Trust Bank
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Secure Web Session: <span className="font-mono text-indigo-300 font-semibold">{user?.username}</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {user?.isAdmin && (
            <button
              onClick={() => navigateTo('admin')}
              className="px-4 py-2 text-xs bg-indigo-950 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/60 rounded-lg font-semibold flex items-center gap-1.5 transition-colors focus:outline-none"
            >
              <Lock className="w-3.5 h-3.5" /> Administrative Dashboard
            </button>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 text-xs bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-all focus:outline-none ml-auto"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Checking Account */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow relative overflow-hidden">
          <div className="absolute top-4 right-4 text-indigo-500 opacity-20"><Wallet className="w-12 h-12" /></div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Secure Checking Account</span>
          <h3 className="text-2xl font-black text-slate-100 mt-2 font-mono">${checkingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <div className="mt-4 flex justify-between text-slate-500 text-[10px] font-mono">
            <span>Routing: **** 9042</span>
            <span>Account: **** 8421</span>
          </div>
        </div>

        {/* Savings Account */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-500 opacity-20"><Landmark className="w-12 h-12" /></div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Premium Yield Savings</span>
          <h3 className="text-2xl font-black text-slate-100 mt-2 font-mono">${savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <div className="mt-4 flex justify-between text-slate-500 text-[10px] font-mono">
            <span>APY: 4.85%</span>
            <span>Account: **** 9245</span>
          </div>
        </div>

        {/* Credit Card Limit */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow relative overflow-hidden">
          <div className="absolute top-4 right-4 text-rose-500 opacity-20"><CreditCard className="w-12 h-12" /></div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Infinite Credit Card</span>
          <h3 className="text-2xl font-black text-slate-100 mt-2 font-mono">${creditBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <div className="mt-4 flex justify-between text-slate-500 text-[10px] font-mono">
            <span>Limit: $15,000.00</span>
            <span>Card: **** 1124</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transaction History Column */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-6 border border-slate-800 shadow flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" /> Recent Account Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Transaction</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/10">
                    <td className="py-3.5 font-semibold text-slate-200">{tx.title}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-400 text-[9px] font-bold">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">{tx.date}</td>
                    <td className={`py-3.5 text-right font-mono font-bold ${
                      tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transfer Funds Column */}
        <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Send className="w-4 h-4" /> Transfer Funds
          </h3>

          {transferError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
              ⚠️ {transferError}
            </div>
          )}

          {transferSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
              ✔️ {transferSuccess}
            </div>
          )}

          <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <label className="text-slate-400">Source Account</label>
              <select
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="checking">Checking Account (Balance: ${checkingBalance.toFixed(2)})</option>
                <option value="savings">Savings Account (Balance: ${savingsBalance.toFixed(2)})</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Recipient Account Number</label>
              <input
                type="text"
                required
                placeholder="Routing/Account Number"
                value={recipientAccount}
                onChange={(e) => setRecipientAccount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 font-medium font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Recipient Name</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Transfer Amount ($)</label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-350 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 font-medium font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Authorize Wire Transfer
            </button>
          </form>
        </div>

      </div>

      {/* Settings & Accessibility Customizations Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Verification Summary Badge */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex gap-4 text-xs text-indigo-300 leading-relaxed items-start justify-center">
          <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <span className="font-bold text-slate-200 block">Cryptographic Integrity Protection</span>
            <span>Your session is securely authenticated. Color inputs were converted, quantized to the nearest multiple of 10, and validated against the database using a 64MB memory-configured Argon2id hashing process. No readable plain passwords exist in our databases.</span>
          </div>
        </div>

        {/* Layout Preferences */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest">Layout Preferences</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

            {/* Accessibility toggle */}
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 mb-1">Zoom Text:</span>
              <button
                onClick={() => setAccessibilityMode(!accessibilityMode)}
                className={`w-full px-3 py-2 border rounded-lg font-medium flex items-center gap-1.5 transition-all focus:outline-none ${
                  accessibilityMode
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Accessibility className="w-3.5 h-3.5" /> {accessibilityMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Color Blind selector */}
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 mb-1">Color Filter:</span>
              <select
                value={colorBlindMode}
                onChange={(e) => setColorBlindMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2.5 focus:outline-none focus:border-indigo-500 font-medium transition-colors"
              >
                <option value="none">Standard</option>
                <option value="protanopia">Protanopia</option>
                <option value="deuteranopia">Deuteranopia</option>
                <option value="tritanopia">Tritanopia</option>
              </select>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
