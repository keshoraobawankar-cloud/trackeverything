import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Bell,
  CheckCircle,
  AlertCircle,
  CreditCard,
  PieChart,
  Trash2
} from 'lucide-react';
import { Transaction, Subscription } from '../types';

interface FinanceViewProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddSubscription: (sub: Omit<Subscription, 'id'>) => void;
  onToggleSubscription: (id: string) => void;
  onDeleteSubscription: (id: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  subscriptions,
  onAddTransaction,
  onDeleteTransaction,
  onAddSubscription,
  onToggleSubscription,
  onDeleteSubscription
}) => {
  // Modal states
  const [showTxModal, setShowTxModal] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState<number>(50);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState<Transaction['category']>('Nutrition');

  const [showSubModal, setShowSubModal] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState<number>(15);
  const [subRenewalDay, setSubRenewalDay] = useState<number>(5);
  const [subBilling, setSubBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [subCategory, setSubCategory] = useState('Tech & Tools');

  // Filter
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Aggregations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Subscription total
  const activeSubs = subscriptions.filter(s => s.active);
  const monthlySubsCost = activeSubs.reduce((acc, s) => {
    return acc + (s.billingCycle === 'monthly' ? s.amount : s.amount / 12);
  }, 0);

  // Category breakdown for expenses
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const categoriesSorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Renewal alerts (upcoming in 7 days)
  const currentDay = new Date().getDate();
  const sortedSubsByUrgency = subscriptions
    .filter(s => s.active)
    .map(s => {
      let daysLeft = s.renewalDayOfMonth - currentDay;
      if (daysLeft < 0) daysLeft += 30;
      return { ...s, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || txAmount <= 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    onAddTransaction({
      date: todayStr,
      title: txTitle.trim(),
      amount: txAmount,
      type: txType,
      category: txCategory
    });
    setTxTitle('');
    setShowTxModal(false);
  };

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || subAmount <= 0) return;
    onAddSubscription({
      serviceName: subName.trim(),
      amount: subAmount,
      billingCycle: subBilling,
      renewalDayOfMonth: subRenewalDay,
      category: subCategory,
      active: true,
      notes: 'Monthly recurring budget allocation'
    });
    setSubName('');
    setShowSubModal(false);
  };

  const filteredTxs = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-cyan-400" />
            Financial Health & Recurring Subscription Hub
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Visual cashflow analysis, category burn rates, and recurring subscription renewal reminder alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Add Subscription</span>
          </button>
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* Top Cashflow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Monthly Inflow</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">+${totalIncome.toLocaleString()}</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">Salary, contracts & creator payouts</p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Monthly Outflow</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">-${totalExpense.toLocaleString()}</span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">Rent, organic nutrition & operations</p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Net Surplus / Savings</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">${netSavings.toLocaleString()}</span>
            <span className="text-xs font-mono text-cyan-400 font-bold">{savingsRate}% Rate</span>
          </div>
          <div className="mt-2.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.max(5, savingsRate)}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Recurring Subscriptions</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">${monthlySubsCost.toFixed(2)}</span>
            <span className="text-xs text-zinc-400">/ month</span>
          </div>
          <p className="mt-2 text-[11px] text-indigo-400 font-mono">
            {activeSubs.length} active recurring accounts
          </p>
        </div>
      </div>

      {/* Subscription Manager & Renewal Dates Alerts */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Subscription Renewal Calendar & Proactive Alerts
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automated reminders before renewal dates prevent unnoticed budget leakage
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Projected Annual: ${(monthlySubsCost * 12).toFixed(2)}
          </span>
        </div>

        {/* Upcoming Renewal Alert Pill Banner */}
        {sortedSubsByUrgency.length > 0 && sortedSubsByUrgency[0].daysLeft <= 7 && (
          <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="text-xs text-cyan-200">
              <span className="font-bold text-white">{sortedSubsByUrgency[0].serviceName}</span> renews on Day {sortedSubsByUrgency[0].renewalDayOfMonth} (${sortedSubsByUrgency[0].amount}) —{' '}
              <span className="font-semibold text-cyan-300">
                {sortedSubsByUrgency[0].daysLeft === 0 ? 'Due Today!' : `Renews in ${sortedSubsByUrgency[0].daysLeft} days`}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedSubsByUrgency.map((sub) => (
            <div
              key={sub.id}
              className={`p-3.5 rounded-xl border transition-all ${
                sub.active
                  ? sub.daysLeft <= 4
                    ? 'bg-zinc-850 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'bg-zinc-850/70 border-zinc-800'
                  : 'bg-zinc-900/40 border-zinc-850 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{sub.serviceName}</span>
                <span className="text-xs font-mono font-bold text-cyan-400">${sub.amount}</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Renews: Day {sub.renewalDayOfMonth}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] ${sub.daysLeft <= 3 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-zinc-400'}`}>
                  {sub.daysLeft === 0 ? 'Today' : `in ${sub.daysLeft}d`}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => onToggleSubscription(sub.id)}
                  className={`text-[11px] font-semibold flex items-center gap-1 ${sub.active ? 'text-emerald-400' : 'text-zinc-500'}`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {sub.active ? 'Active' : 'Paused'}
                </button>
                <button
                  onClick={() => onDeleteSubscription(sub.id)}
                  className="text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphical Spending Breakdown & Transactions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                Expense Allocation
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Budget concentration across lifestyle pillars</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {categoriesSorted.map(([category, amount]) => {
              const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-medium">{category}</span>
                    <span className="font-mono text-zinc-300">
                      ${amount.toLocaleString()} <span className="text-zinc-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions Ledger (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Financial Journal Ledger
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Real-time ledger entries</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'income', 'expense'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterType(mode)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    filterType === mode
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-zinc-800/60 mt-2 max-h-96 overflow-y-auto">
            {filteredTxs.map((tx) => (
              <div key={tx.id} className="py-3 px-2 flex items-center justify-between hover:bg-zinc-850/40 rounded-lg transition-colors">
                <div>
                  <div className="font-semibold text-sm text-zinc-200">{tx.title}</div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {tx.date} • {tx.category}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-sm font-bold ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-300'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Record Financial Entry</h3>
            <p className="text-xs text-zinc-400 mb-4">Track cashflow, income streams, or operational expenses.</p>

            <form onSubmit={handleCreateTx} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-Protein Organic Groceries"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Nutrition">Nutrition & Fuel</option>
                  <option value="Housing">Housing & Space</option>
                  <option value="Fitness">Fitness & Wellness</option>
                  <option value="Tech & Tools">Tech & Tools</option>
                  <option value="Education">Education & Books</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Salary">Salary / Retainer</option>
                  <option value="Freelance">Freelance Gig</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Recurring Subscription</h3>
            <p className="text-xs text-zinc-400 mb-4">Set renewal day for automated proactive reminders.</p>

            <form onSubmit={handleCreateSub} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI / Claude Pro"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={subAmount}
                    onChange={(e) => setSubAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Renewal Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={subRenewalDay}
                    onChange={(e) => setSubRenewalDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Billing Cycle</label>
                <select
                  value={subBilling}
                  onChange={(e) => setSubBilling(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors"
                >
                  Add Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
