
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Upload, Users, Home } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        properties: 0,
        tenants: 0,
        incomeYTD: 0,
        expensesYTD: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        try {
            const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

            // Parallel fetching
            const [props, tenants, payments, expenses] = await Promise.all([
                supabase.from('properties').select('count', { count: 'exact', head: true }),
                supabase.from('tenants').select('count', { count: 'exact', head: true }),
                supabase.from('payments').select('amount').gte('payment_date', yearStart),
                supabase.from('expenses').select('amount').gte('expense_date', yearStart)
            ]);

            const income = payments.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
            const expense = expenses.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

            setStats({
                properties: props.count || 0,
                tenants: tenants.count || 0,
                incomeYTD: income,
                expensesYTD: expense
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="card">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-muted text-sm font-medium uppercase tracking-wider">{title}</h3>
                <div className={`p-2 rounded-full bg-opacity-20 ${color.bg}`}>
                    <Icon size={20} className={color.text} />
                </div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {loading ? (
                <div className="flex justify-center p-12"><div className="spinner"></div></div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    <StatCard
                        title="Total Properties"
                        value={stats.properties}
                        icon={Home}
                        color={{ bg: 'bg-blue-500', text: 'text-blue-500' }}
                    />
                    <StatCard
                        title="Active Tenants"
                        value={stats.tenants}
                        icon={Users}
                        color={{ bg: 'bg-purple-500', text: 'text-purple-500' }}
                    />
                    <StatCard
                        title="YTD Income"
                        value={`$${stats.incomeYTD.toLocaleString()}`}
                        icon={DollarSign}
                        color={{ bg: 'bg-green-500', text: 'text-green-500' }}
                    />
                    <StatCard
                        title="YTD Expenses"
                        value={`$${stats.expensesYTD.toLocaleString()}`}
                        icon={Upload}
                        color={{ bg: 'bg-red-500', text: 'text-red-500' }}
                    />
                </div>
            )}

            <div className="grid grid-cols-2 mt-8 gap-8">
                <div className="card">
                    <h3 className="text-lg mb-4">Recent Activity</h3>
                    <p className="text-muted">No recent activity found.</p>
                </div>
                <div className="card">
                    <h3 className="text-lg mb-4">Quick Actions</h3>
                    <div className="flex gap-4">
                        <button className="btn w-full">Add Payment</button>
                        <button className="btn btn-secondary w-full">Upload Receipt</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
