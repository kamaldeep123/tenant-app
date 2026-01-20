
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, PieChart, TrendingUp, TrendingDown } from 'lucide-react';

export default function Reports() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState({
        income: 0,
        expenses: 0,
        net: 0,
        expenseByCategory: {} as Record<string, number>
    });

    useEffect(() => {
        fetchReportData();
    }, [year]);

    async function fetchReportData() {
        setLoading(true);
        try {
            const yearStart = `${year}-01-01`;
            const yearEnd = `${year}-12-31`;

            const [payments, expenses] = await Promise.all([
                supabase.from('payments').select('amount').gte('payment_date', yearStart).lte('payment_date', yearEnd),
                supabase.from('expenses').select('amount, category').gte('expense_date', yearStart).lte('expense_date', yearEnd)
            ]);

            const totalIncome = payments.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

            const expenseByCategory: Record<string, number> = {};
            let totalExpense = 0;

            expenses.data?.forEach(e => {
                const amt = e.amount || 0;
                totalExpense += amt;
                expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + amt;
            });

            setSummary({
                income: totalIncome,
                expenses: totalExpense,
                net: totalIncome - totalExpense,
                expenseByCategory
            });
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleExport() {
        // Simple CSV Export logic could go here
        alert('Export functionality would generate a CSV here.');
    }

    return (
        <div>
            <div className="header">
                <h1 className="text-2xl font-bold">Annual Report</h1>
                <div className="flex gap-4 items-center">
                    <select
                        className="input w-32"
                        value={year}
                        onChange={e => setYear(parseInt(e.target.value))}
                    >
                        {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="spinner"></div></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Summary Cards */}
                    <div className="col-span-1 lg:col-span-2 grid grid-cols-3 gap-6">
                        <div className="card border-l-4 border-l-blue-500">
                            <div className="text-muted text-sm uppercase mb-1">Total Income</div>
                            <div className="text-2xl font-bold text-blue-500 flex items-center gap-2">
                                <TrendingUp size={24} />
                                ${summary.income.toLocaleString()}
                            </div>
                        </div>
                        <div className="card border-l-4 border-l-red-500">
                            <div className="text-muted text-sm uppercase mb-1">Total Expenses</div>
                            <div className="text-2xl font-bold text-red-500 flex items-center gap-2">
                                <TrendingDown size={24} />
                                ${summary.expenses.toLocaleString()}
                            </div>
                        </div>
                        <div className={`card border-l-4 ${summary.net >= 0 ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                            <div className="text-muted text-sm uppercase mb-1">Net Cash Flow</div>
                            <div className={`text-2xl font-bold ${summary.net >= 0 ? 'text-green-500' : 'text-yellow-500'}`}>
                                ${summary.net.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Expense Breakdown */}
                    <div className="card">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <PieChart size={20} className="text-slate-400" />
                            Expenses by Category
                        </h3>
                        <div className="space-y-4">
                            {Object.keys(summary.expenseByCategory).length === 0 ? (
                                <p className="text-muted text-center py-8">No expenses recorded for this period.</p>
                            ) : (
                                Object.entries(summary.expenseByCategory).map(([category, amount]) => {
                                    const percentage = ((amount / summary.expenses) * 100).toFixed(1);
                                    return (
                                        <div key={category}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="capitalize">{category}</span>
                                                <span className="font-mono">${amount.toLocaleString()} ({percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2">
                                                <div
                                                    className="bg-red-500 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Tax Purpose Note */}
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4">Tax Summary Info</h3>
                        <p className="text-secondary text-sm mb-4">
                            Use these figures for your Schedule E (Supplemental Income and Loss).
                            Ensure all expenses documented in the "Finance" tab have attached receipts.
                        </p>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted block">Taxable Period</span>
                                    <span className="font-medium">Jan 1 - Dec 31, {year}</span>
                                </div>
                                <div>
                                    <span className="text-muted block">Status</span>
                                    <span className="badge badge-success">Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
