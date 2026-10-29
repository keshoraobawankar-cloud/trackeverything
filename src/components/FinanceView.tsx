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
  PieChart as PieChartIcon,
  Trash2,
  Download,
  Zap,
  X,
  Coffee,
  Utensils,
  Dumbbell,
  Laptop,
  Banknote,
  Sparkles,
  Target,
  Edit2,
  Check,
  Calculator,
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { Transaction, Subscription } from '../types';
import { Storage } from '../services/storage';

const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#6366f1', // Indigo
  Nutrition: '#10b981', // Emerald
  Fitness: '#06b6d4', // Cyan
  'Tech & Tools': '#8b5cf6', // Violet
  Education: '#f59e0b', // Amber
  Entertainment: '#ec4899', // Pink
  Freelance: '#3b82f6', // Blue
  Salary: '#14b8a6', // Teal
};
const FALLBACK_COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-zinc-900 border border-zinc-700/80 p-2.5 rounded-xl shadow-2xl text-xs backdrop-blur-md">
        <div className="font-semibold text-white flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: data.payload.color || data.fill }}
          />
          <span>{data.name}</span>
        </div>
        <div className="mt-1 font-mono text-zinc-300">
          Amount: <span className="font-bold text-cyan-400">${Number(data.value).toLocaleString()}</span>
        </div>
        {data.payload.pct !== undefined && (
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
            Share: <span className="text-zinc-200 font-medium">{data.payload.pct}%</span> of expenses
          </div>
        )}
      </div>
    );
  }
  return null;
};

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

  const pieData = categoriesSorted.map(([category, amount], idx) => {
    const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
    return {
      name: category,
      value: amount,
      pct,
      color: CATEGORY_COLORS[category] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
    };
  });

  // Renewal alerts (accurate days calculation for month boundaries)
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const getDaysUntilRenewal = (renewalDay: number) => {
    let target = new Date(currentYear, currentMonth, renewalDay);
    if (currentDay > renewalDay) {
      target = new Date(currentYear, currentMonth + 1, renewalDay);
    }
    const diff = target.getTime() - new Date(currentYear, currentMonth, currentDay).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  const sortedSubsByUrgency = subscriptions
    .filter(s => s.active)
    .map(s => {
      const daysLeft = getDaysUntilRenewal(s.renewalDayOfMonth);
      return { ...s, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const dueSoonSubs = sortedSubsByUrgency.filter(s => s.active && s.daysLeft <= 3);
  const totalDueSoonAmount = dueSoonSubs.reduce((acc, s) => acc + s.amount, 0);

  // Monthly Budget Cap State & Progress Metrics
  const [budgetCap, setBudgetCap] = useState<number>(() => Storage.getMonthlyBudgetCap());
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudgetInput, setTempBudgetInput] = useState<string>(() => String(Storage.getMonthlyBudgetCap()));

  const handleSaveBudgetCap = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(tempBudgetInput);
    if (isNaN(parsed) || parsed <= 0) return;
    setBudgetCap(parsed);
    Storage.saveMonthlyBudgetCap(parsed);
    setIsEditingBudget(false);
    setExportNotice(`Monthly budget cap updated to $${parsed.toLocaleString()}!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const budgetUsedPct = budgetCap > 0 ? Math.round((totalExpense / budgetCap) * 100) : 0;
  const budgetRemaining = budgetCap - totalExpense;
  const isOverBudget = totalExpense > budgetCap;
  const overageAmount = isOverBudget ? totalExpense - budgetCap : 0;

  // Calendar Month Day Progress for Pacing
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthProgressPct = Math.round((currentDay / daysInCurrentMonth) * 100);
  const pacingDiff = budgetUsedPct - monthProgressPct;

  // Upcoming Recurring Bills & Total Predicted Spend Calculations
  const upcomingBills = activeSubs.map(sub => {
    const monthlyAmount = sub.billingCycle === 'monthly' ? sub.amount : Number((sub.amount / 12).toFixed(2));
    const daysUntilDue = getDaysUntilRenewal(sub.renewalDayOfMonth);
    return {
      ...sub,
      monthlyAmount,
      daysUntilDue
    };
  }).sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const totalUpcomingBillsAmount = upcomingBills.reduce((acc, b) => acc + b.monthlyAmount, 0);
  const predictedMonthlySpend = totalExpense + totalUpcomingBillsAmount;
  const predictedBudgetUtilizationPct = budgetCap > 0 ? Math.round((predictedMonthlySpend / budgetCap) * 100) : 0;
  const predictedBuffer = budgetCap - predictedMonthlySpend;
  const isPredictedOverBudget = predictedMonthlySpend > budgetCap;

  const handleLogBillAsPaid = (bill: typeof upcomingBills[0]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    onAddTransaction({
      date: todayStr,
      title: `${bill.serviceName} Renewal`,
      amount: bill.monthlyAmount,
      type: 'expense',
      category: (bill.category as any) || 'Tech & Tools'
    });
    setExportNotice(`Recorded $${bill.monthlyAmount.toFixed(2)} for ${bill.serviceName} in transactions!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Subscriptions Filter
  const [subFilter, setSubFilter] = useState<'all' | 'dueSoon' | 'active'>('all');

  const filteredSubscriptions = subscriptions.filter(s => {
    if (subFilter === 'dueSoon') {
      const daysLeft = getDaysUntilRenewal(s.renewalDayOfMonth);
      return s.active && daysLeft <= 3;
    }
    if (subFilter === 'active') {
      return s.active;
    }
    return true;
  }).map(s => {
    const daysLeft = getDaysUntilRenewal(s.renewalDayOfMonth);
    return { ...s, daysLeft };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const handleAddSampleDueSoonSub = () => {
    // Add sample subscription renewing in 2 days for quick testing
    const dueDay = ((currentDay + 2 - 1) % 28) + 1;
    onAddSubscription({
      serviceName: 'Netflix Premium 4K',
      amount: 22.99,
      billingCycle: 'monthly',
      renewalDayOfMonth: dueDay,
      category: 'Entertainment',
      active: true,
      notes: 'Sample subscription due in 2 days for payment alert verification'
    });
    setExportNotice('Added sample subscription "Netflix Premium 4K" due in 2 days!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  // CSV Export State and Handler
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportCsv = () => {
    if (!transactions || transactions.length === 0) {
      setExportNotice('No transactions available to export.');
      setTimeout(() => setExportNotice(null), 4000);
      return;
    }

    const headers = ['Transaction ID', 'Date', 'Description', 'Type', 'Category', 'Amount ($)'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount.toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `apexlife-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Successfully exported ${transactions.length} transaction${transactions.length === 1 ? '' : 's'} to CSV.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Quick Add FAB State & Handlers
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAmount, setQuickAmount] = useState<string>('15');
  const [quickCategory, setQuickCategory] = useState<Transaction['category']>('Nutrition');
  const [quickType, setQuickType] = useState<'income' | 'expense'>('expense');

  const QUICK_PRESETS: Array<{
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: Transaction['category'];
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badgeBg: string;
  }> = [
    { title: 'Coffee / Snack', amount: 5, type: 'expense', category: 'Nutrition', icon: Coffee, color: 'text-amber-400', badgeBg: 'bg-amber-500/10 border-amber-500/20' },
    { title: 'Healthy Meal', amount: 18, type: 'expense', category: 'Nutrition', icon: Utensils, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Groceries / Fuel', amount: 45, type: 'expense', category: 'Nutrition', icon: DollarSign, color: 'text-cyan-400', badgeBg: 'bg-cyan-500/10 border-cyan-500/20' },
    { title: 'Workout / Gym', amount: 25, type: 'expense', category: 'Fitness', icon: Dumbbell, color: 'text-indigo-400', badgeBg: 'bg-indigo-500/10 border-indigo-500/20' },
    { title: 'Cloud / SaaS Tool', amount: 20, type: 'expense', category: 'Tech & Tools', icon: Laptop, color: 'text-violet-400', badgeBg: 'bg-violet-500/10 border-violet-500/20' },
    { title: 'Freelance Inflow', amount: 100, type: 'income', category: 'Freelance', icon: Banknote, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  const handleInstantPresetLog = (preset: typeof QUICK_PRESETS[0]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    onAddTransaction({
      date: todayStr,
      title: preset.title,
      amount: preset.amount,
      type: preset.type,
      category: preset.category
    });
    setQuickAddOpen(false);
    setExportNotice(`⚡ Instantly logged $${preset.amount.toFixed(2)} for ${preset.title}!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleInstantCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(quickAmount);
    if (isNaN(parsed) || parsed <= 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const title = `${quickCategory} ${quickType === 'income' ? 'Income' : 'Quick Log'}`;
    onAddTransaction({
      date: todayStr,
      title,
      amount: parsed,
      type: quickType,
      category: quickCategory
    });
    setQuickAddOpen(false);
    setQuickAmount('15');
    setExportNotice(`⚡ Instantly logged $${parsed.toFixed(2)} for ${quickCategory}!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 hover:border-cyan-500/50 transition-all shadow-sm"
            title="Download transaction history as a CSV file"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>
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

      {/* Export Notification Banner */}
      {exportNotice && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-cyan-400 hover:text-white text-xs p-1 rounded hover:bg-cyan-500/20 transition-colors"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

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
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-400">Cap: ${budgetCap.toLocaleString()}</span>
            <span className={isOverBudget ? 'text-rose-400 font-bold' : budgetUsedPct >= 90 ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
              {budgetUsedPct}% used
            </span>
          </div>
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
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-indigo-400 font-mono">
              {activeSubs.length} active recurring accounts
            </p>
            {dueSoonSubs.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                {dueSoonSubs.length} due &le; 3d
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" /> 0 due &le; 3d
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Manager & Renewal Dates Alerts */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Subscription Renewal Calendar & Payment Alerts
              </h2>
              {/* Notification Badge for Subscriptions Due within 3 Days */}
              {dueSoonSubs.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm shadow-rose-500/20 animate-pulse">
                  <Bell className="w-3.5 h-3.5 text-rose-400" />
                  <span>{dueSoonSubs.length} Payment{dueSoonSubs.length === 1 ? '' : 's'} Due in &le; 3 Days</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>All Active Subscriptions Current (No charges &le; 3d)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Automated reminders before renewal dates prevent unnoticed budget leakage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
              Projected Annual: ${(monthlySubsCost * 12).toFixed(2)}
            </span>
            {dueSoonSubs.length === 0 && (
              <button
                type="button"
                onClick={handleAddSampleDueSoonSub}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-cyan-400 border border-zinc-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                title="Add a sample subscription renewing in 2 days to test the alert system"
              >
                <Plus className="w-3 h-3" />
                <span>Test 3-Day Alert</span>
              </button>
            )}
          </div>
        </div>

        {/* High-Priority Payment Due Alert Banner (Due within next 3 days) */}
        {dueSoonSubs.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-950/60 via-amber-950/30 to-zinc-900 border border-rose-500/40 shadow-lg shadow-rose-950/20 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30 animate-pulse mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-rose-500 text-white">
                      Action Required
                    </span>
                    <span className="text-sm font-bold text-white">
                      {dueSoonSubs.length} Subscription{dueSoonSubs.length === 1 ? '' : 's'} Due for Payment in &le; 3 Days
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-300">
                      (${totalDueSoonAmount.toFixed(2)} upcoming)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1">
                    Review upcoming auto-debits to avoid unexpected charges or pause services you no longer need.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSubFilter(subFilter === 'dueSoon' ? 'all' : 'dueSoon')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{subFilter === 'dueSoon' ? 'Show All' : `Filter Due Soon (${dueSoonSubs.length})`}</span>
                </button>
              </div>
            </div>

            {/* Micro Cards of Subscriptions Due within 3 Days */}
            <div className="mt-3 pt-3 border-t border-rose-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {dueSoonSubs.map((sub) => (
                <div
                  key={`alert-chip-${sub.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/70 border border-rose-500/30 text-xs shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 animate-ping" />
                    <div>
                      <div className="font-semibold text-white truncate">{sub.serviceName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">${sub.amount} • Day {sub.renewalDayOfMonth}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        sub.daysLeft === 0
                          ? 'bg-rose-500 text-white animate-pulse'
                          : sub.daysLeft === 1
                          ? 'bg-amber-500/30 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {sub.daysLeft === 0 ? 'Today!' : sub.daysLeft === 1 ? 'Tomorrow' : `in ${sub.daysLeft}d`}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleSubscription(sub.id)}
                      className="px-2 py-0.5 text-[11px] font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                      title="Toggle active/pause"
                    >
                      Pause
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Filter Controls */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSubFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                subFilter === 'all'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({subscriptions.length})
            </button>
            <button
              type="button"
              onClick={() => setSubFilter('dueSoon')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                subFilter === 'dueSoon'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'text-zinc-400 hover:text-rose-300'
              }`}
            >
              <Bell className="w-3 h-3 text-rose-400" />
              <span>Due in &le; 3 Days ({dueSoonSubs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSubFilter('active')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                subFilter === 'active'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Active ({activeSubs.length})
            </button>
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            Showing {filteredSubscriptions.length} item{filteredSubscriptions.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Subscriptions Grid Cards */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSubscriptions.map((sub) => {
            const isDueSoon = sub.active && sub.daysLeft <= 3;
            return (
              <div
                key={sub.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDueSoon
                    ? 'bg-gradient-to-b from-rose-950/40 via-zinc-850 to-zinc-900 border-rose-500/60 shadow-lg shadow-rose-500/15 ring-1 ring-rose-500/40'
                    : sub.active
                    ? sub.daysLeft <= 7
                      ? 'bg-zinc-850 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'bg-zinc-850/70 border-zinc-800'
                    : 'bg-zinc-900/40 border-zinc-850 opacity-50'
                }`}
              >
                {/* Specific Notification Badge on Card if Due in Next 3 Days */}
                {isDueSoon && (
                  <div className="mb-2 -mt-1 -mx-1 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                      <Bell className="w-3 h-3 text-rose-400 animate-bounce" />
                      Payment Due {sub.daysLeft === 0 ? 'Today!' : sub.daysLeft === 1 ? 'Tomorrow' : `in ${sub.daysLeft} days`}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-rose-200">
                      ${sub.amount}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isDueSoon && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                    <span className="text-sm font-bold text-white truncate">{sub.serviceName}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${isDueSoon ? 'text-rose-300' : 'text-cyan-400'}`}>
                    ${sub.amount}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Renews: Day {sub.renewalDayOfMonth}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      sub.daysLeft === 0
                        ? 'bg-rose-500 text-white animate-pulse'
                        : sub.daysLeft === 1
                        ? 'bg-amber-500/25 text-amber-300'
                        : sub.daysLeft <= 3
                        ? 'bg-rose-500/20 text-rose-300'
                        : sub.daysLeft <= 7
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-zinc-400'
                    }`}
                  >
                    {sub.daysLeft === 0 ? 'Due Today' : `in ${sub.daysLeft}d`}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onToggleSubscription(sub.id)}
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      sub.active ? (isDueSoon ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400') : 'text-zinc-500'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {sub.active ? (isDueSoon ? 'Active (Due Soon)' : 'Active') : 'Paused'}
                  </button>
                  <button
                    onClick={() => onDeleteSubscription(sub.id)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="mt-4 p-8 rounded-xl bg-zinc-850/40 border border-dashed border-zinc-800 text-center text-xs text-zinc-400">
            {subFilter === 'dueSoon'
              ? 'No active subscriptions are currently due within the next 3 days. All payments are clear!'
              : 'No subscriptions found matching the selected filter.'}
          </div>
        )}
      </div>

      {/* Automated Upcoming Recurring Bills & Total Predicted Monthly Spend Section */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-5 shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Calculator className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Upcoming Recurring Bills & Total Predicted Spend
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AUTO-CALCULATED
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Automatically compounds active recurring subscriptions with realized expenditures to forecast month-end cashflow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">
              {upcomingBills.length} Active Recurring Bill{upcomingBills.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* 3-Part Forecast Formula Overview Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-11 items-center gap-3">
          {/* Card 1: Realized Expenses */}
          <div className="md:col-span-3 p-4 rounded-xl bg-zinc-850/80 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">1. Current Logged Spend</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Actual</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white">
              ${totalExpense.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Realized transactions to date
            </p>
          </div>

          {/* Plus Operator */}
          <div className="md:col-span-1 flex items-center justify-center text-zinc-500 font-bold text-lg">
            +
          </div>

          {/* Card 2: Upcoming Recurring Bills */}
          <div className="md:col-span-3 p-4 rounded-xl bg-zinc-850/80 border border-cyan-500/30 shadow-sm shadow-cyan-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyan-300 font-semibold">2. Scheduled Bills</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                +{upcomingBills.length} Bills
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-cyan-400">
              +${totalUpcomingBillsAmount.toFixed(2)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Active subscriptions obligations
            </p>
          </div>

          {/* Equals Operator */}
          <div className="md:col-span-1 flex items-center justify-center text-zinc-500 font-bold text-lg">
            =
          </div>

          {/* Card 3: Total Predicted Monthly Spend */}
          <div className={`md:col-span-3 p-4 rounded-xl border ${
            isPredictedOverBudget
              ? 'bg-gradient-to-br from-rose-950/40 to-zinc-900 border-rose-500/50 shadow-md shadow-rose-950/20'
              : predictedBudgetUtilizationPct >= 90
              ? 'bg-gradient-to-br from-amber-950/40 to-zinc-900 border-amber-500/50 shadow-md shadow-amber-950/20'
              : 'bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 border-indigo-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">3. Predicted Total Spend</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isPredictedOverBudget
                  ? 'bg-rose-500 text-white animate-pulse'
                  : predictedBudgetUtilizationPct >= 90
                  ? 'bg-amber-500/30 text-amber-300'
                  : 'bg-indigo-500/30 text-indigo-200'
              }`}>
                {predictedBudgetUtilizationPct}% Cap
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white">
              ${predictedMonthlySpend.toFixed(2)}
            </div>
            <div className="text-[11px] font-mono mt-1">
              {isPredictedOverBudget ? (
                <span className="text-rose-400 font-bold">
                  ⚠️ Projected +${Math.abs(predictedBuffer).toFixed(2)} over budget
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">
                  ✓ Projected buffer: ${predictedBuffer.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Upcoming Recurring Bills Timeline / Schedule */}
        <div className="mt-5 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Upcoming Recurring Schedule & 1-Click Pay Logger
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              Next renewal: {upcomingBills.length > 0 ? `${upcomingBills[0].serviceName} (Day ${upcomingBills[0].renewalDayOfMonth})` : 'None'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {upcomingBills.map((bill) => (
              <div
                key={`predicted-bill-${bill.id}`}
                className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white truncate">{bill.serviceName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {bill.category}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                    <span>Day {bill.renewalDayOfMonth}</span>
                    <span>•</span>
                    <span className={bill.daysUntilDue <= 3 ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
                      {bill.daysUntilDue === 0 ? 'Due Today' : `in ${bill.daysUntilDue}d`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="font-mono font-bold text-sm text-cyan-400">
                    ${bill.monthlyAmount}
                    <span className="text-[10px] text-zinc-500 font-normal">/mo</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLogBillAsPaid(bill)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 border border-zinc-700 hover:border-emerald-500/30 text-[10px] font-semibold transition-colors shadow-sm"
                    title="Log this bill as an actual transaction if paid"
                  >
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                    <span>Log as Paid</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {upcomingBills.length === 0 && (
            <div className="p-6 rounded-xl bg-zinc-850/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
              No active recurring subscriptions scheduled. Add subscriptions above to automatically forecast month-end spend.
            </div>
          )}
        </div>
      </div>

      {/* Graphical Spending Breakdown & Transactions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (5 cols) with Recharts Pie Chart & Monthly Budget Cap Progress */}
        <div className="lg:col-span-5 rounded-xl bg-zinc-900/90 border border-zinc-800 p-5 flex flex-col justify-between">
          <div>
            {/* Header with Title and Budget Cap Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-400" />
                  Monthly Expense & Budget Cap
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Category distribution vs monthly spending ceiling</p>
              </div>

              {/* Set Budget Cap Action Button */}
              {!isEditingBudget ? (
                <button
                  type="button"
                  onClick={() => {
                    setTempBudgetInput(String(budgetCap));
                    setIsEditingBudget(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-cyan-400 border border-zinc-700 hover:border-cyan-500/50 text-xs font-semibold transition-all shadow-sm self-start sm:self-auto"
                  title="Configure monthly budget cap"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Cap: ${budgetCap.toLocaleString()}</span>
                  <Edit2 className="w-3 h-3 text-zinc-500 ml-0.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1 self-start sm:self-auto">
                  <div className="flex items-center px-2 py-1 rounded-lg bg-zinc-800 border border-cyan-500 text-xs font-mono">
                    <span className="text-zinc-400 mr-1">$</span>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={tempBudgetInput}
                      onChange={(e) => setTempBudgetInput(e.target.value)}
                      className="w-16 bg-transparent text-white font-bold focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveBudgetCap()}
                    className="p-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                    title="Save budget cap"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingBudget(false)}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Inline Quick Budget Presets when editing */}
            {isEditingBudget && (
              <div className="mt-3 p-3 rounded-xl bg-zinc-850/80 border border-zinc-700 text-xs animate-in fade-in duration-150">
                <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[2000, 2500, 3000, 3500, 4000, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setBudgetCap(preset);
                        setTempBudgetInput(String(preset));
                        Storage.saveMonthlyBudgetCap(preset);
                        setIsEditingBudget(false);
                        setExportNotice(`Monthly budget cap set to $${preset.toLocaleString()}!`);
                        setTimeout(() => setExportNotice(null), 3000);
                      }}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 border border-zinc-700 text-[11px] font-mono transition-colors"
                    >
                      ${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Budget Progress Visualization Bar alongside Pie Chart */}
            <div className="mt-4 p-3.5 rounded-xl bg-zinc-850/60 border border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-zinc-300 font-semibold">Budget Utilization</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-white">${totalExpense.toLocaleString()}</span>
                  <span className="text-zinc-500">/</span>
                  <span className="text-zinc-400">${budgetCap.toLocaleString()}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isOverBudget
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : budgetUsedPct >= 90
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {budgetUsedPct}%
                  </span>
                </div>
              </div>

              {/* Progress Bar with Month Marker */}
              <div className="mt-2.5 relative">
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 animate-pulse'
                        : budgetUsedPct >= 90
                        ? 'bg-gradient-to-r from-cyan-500 to-amber-400'
                        : 'bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
                  />
                </div>

                {/* Day of Month Indicator Marker on Progress Bar */}
                <div
                  className="absolute -top-1 w-0.5 h-4.5 bg-zinc-400/80 pointer-events-none rounded"
                  style={{ left: `${Math.min(100, Math.max(0, monthProgressPct))}%` }}
                  title={`Day ${currentDay} of ${daysInCurrentMonth} (${monthProgressPct}% of month elapsed)`}
                />

                {/* Predicted Month-End Spend Pin (Realized + Upcoming Bills) */}
                {totalUpcomingBillsAmount > 0 && (
                  <div
                    className={`absolute -top-1 w-1 h-4.5 rounded pointer-events-none shadow-sm ${
                      isPredictedOverBudget ? 'bg-rose-400 shadow-rose-400/60' : 'bg-cyan-400 shadow-cyan-400/60'
                    }`}
                    style={{ left: `${Math.min(100, Math.max(0, predictedBudgetUtilizationPct))}%` }}
                    title={`Predicted Month-End Spend: $${predictedMonthlySpend.toFixed(2)} (${predictedBudgetUtilizationPct}%)`}
                  />
                )}
              </div>

              {/* Progress Summary Subtext */}
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>
                  {isOverBudget ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Exceeded by ${overageAmount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">
                      ${budgetRemaining.toLocaleString()} current buffer
                    </span>
                  )}
                </span>
                <span className={isPredictedOverBudget ? 'text-rose-400 font-semibold' : 'text-cyan-400 font-semibold'}>
                  Predicted Total: ${predictedMonthlySpend.toFixed(0)} ({predictedBudgetUtilizationPct}%)
                </span>
              </div>
            </div>

            {pieData.length > 0 ? (
              <>
                {/* Recharts Pie Chart Graphic */}
                <div className="relative w-full h-52 mt-3 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={76}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#18181b"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  {/* Donut Center Display With Budget Utilization */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Budget Used</span>
                    <span className={`text-base font-bold font-mono mt-0.5 ${isOverBudget ? 'text-rose-400' : 'text-white'}`}>
                      {budgetUsedPct}%
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      ${totalExpense.toLocaleString()} of ${budgetCap.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Categories progress & values list */}
                <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                  {pieData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-zinc-200 font-medium">{item.name}</span>
                        </div>
                        <span className="font-mono text-zinc-300">
                          ${item.value.toLocaleString()} <span className="text-zinc-500">({item.pct}% of spent)</span>
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs my-auto">
                <PieChartIcon className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-60" />
                <p>No monthly expense transactions recorded yet.</p>
                <button
                  onClick={() => setShowTxModal(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-cyan-400 border border-zinc-700 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record First Expense</span>
                </button>
              </div>
            )}
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

      {/* Quick Add Floating Action Button & Instant Speed-Dial */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Backdrop for click outside */}
        {quickAddOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs"
            onClick={() => setQuickAddOpen(false)}
          />
        )}

        {/* Quick Add Popover Panel */}
        {quickAddOpen && (
          <div className="relative z-40 mb-3 w-[21rem] sm:w-[24rem] rounded-2xl bg-zinc-900 border border-zinc-700 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Quick Log
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">1-TAP</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">Instantly record without filling full forms</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Close Quick Add"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instant 1-Tap Presets */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Common Presets (Instant 1-Tap)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleInstantPresetLog(preset)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-left transition-all group shadow-sm active:scale-95"
                    >
                      <div className={`w-8 h-8 rounded-lg ${preset.badgeBg} ${preset.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white">
                          {preset.title}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-cyan-400">
                          {preset.type === 'income' ? '+' : '-'}${preset.amount}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Express Custom Numeric Bar */}
            <form onSubmit={handleInstantCustomLog} className="mt-4 pt-3 border-t border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Custom Quick Amount
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 flex-1">
                  <span className="text-xs font-mono text-zinc-400 mr-1.5">$</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.01"
                    placeholder="0.00"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value as any)}
                  className="px-2.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                >
                  <option value="Nutrition">Nutrition</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Tech & Tools">Tech</option>
                  <option value="Housing">Housing</option>
                  <option value="Entertainment">Fun</option>
                  <option value="Freelance">Freelance</option>
                </select>

                <button
                  type="submit"
                  disabled={!quickAmount || parseFloat(quickAmount) <= 0}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-cyan-600/30 shrink-0"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Log</span>
                </button>
              </div>
            </form>

            {/* Footer with link to detailed modal */}
            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Need receipts or notes?</span>
              <button
                type="button"
                onClick={() => {
                  setQuickAddOpen(false);
                  setShowTxModal(true);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
              >
                Open Full Form →
              </button>
            </div>
          </div>
        )}

        {/* Floating Action Trigger Button */}
        <button
          type="button"
          onClick={() => setQuickAddOpen(!quickAddOpen)}
          className={`relative z-40 flex items-center gap-2.5 px-4 py-3 rounded-full font-bold text-sm shadow-2xl transition-all duration-300 ${
            quickAddOpen
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-cyan-500/10'
              : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 active:scale-95'
          }`}
          title="Quick Add Transaction (Instant Log)"
        >
          {quickAddOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <div className="relative">
              <Zap className="w-5 h-5 fill-current" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
            </div>
          )}
          <span>Quick Add</span>
        </button>
      </div>
    </div>
  );
};
