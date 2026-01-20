
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Property, Tenant, Payment, Expense } from '../types';
import { Upload, Plus, FileText } from 'lucide-react';

export default function Finance() {
    const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
    const [loading, setLoading] = useState(true);

    const [properties, setProperties] = useState<Property[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);

    // Forms
    const [incomeForm, setIncomeForm] = useState({
        tenant_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_type: 'rent',
        notes: ''
    });

    const [expenseForm, setExpenseForm] = useState({
        property_id: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        category: 'maintenance',
        description: '',
        file: null as File | null
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [props, tens, pays, exps] = await Promise.all([
                supabase.from('properties').select('*'),
                supabase.from('tenants').select('*, property:properties(address)'),
                supabase.from('payments').select('*, tenant:tenants(name, property:properties(address))').order('payment_date', { ascending: false }).limit(20),
                supabase.from('expenses').select('*, property:properties(address)').order('expense_date', { ascending: false }).limit(20)
            ]);

            setProperties(props.data || []);
            setTenants(tens.data || []);
            setPayments(pays.data || []);
            setExpenses(exps.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleIncomeSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            let amount = parseFloat(incomeForm.amount);
            // Auto-fill rent amount if tenant selected and amount is empty/0? No, let user input.

            const { error } = await supabase.from('payments').insert([{
                tenant_id: incomeForm.tenant_id,
                amount,
                payment_date: incomeForm.payment_date,
                payment_type: incomeForm.payment_type,
                notes: incomeForm.notes
            }]);

            if (error) throw error;

            setIncomeForm({ ...incomeForm, amount: '', notes: '' });
            setShowIncomeForm(false);
            fetchData();
        } catch (error) {
            console.error('Error adding payment:', error);
            alert('Error adding payment');
        }
    }

    async function handleExpenseSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            let receipt_url = null;
            if (expenseForm.file) {
                const fileExt = expenseForm.file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('receipts')
                    .upload(fileName, expenseForm.file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('receipts')
                    .getPublicUrl(fileName);

                receipt_url = publicUrl;
            }

            const { error } = await supabase.from('expenses').insert([{
                property_id: expenseForm.property_id,
                amount: parseFloat(expenseForm.amount),
                expense_date: expenseForm.expense_date,
                category: expenseForm.category,
                description: expenseForm.description,
                receipt_url
            }]);

            if (error) throw error;

            setExpenseForm({
                property_id: '', amount: '', expense_date: new Date().toISOString().split('T')[0],
                category: 'maintenance', description: '', file: null
            });
            setShowExpenseForm(false);
            fetchData();
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Error adding expense: ' + (error as any).message);
        }
    }

    return (
        <div>
            <div className="header">
                <h1 className="text-2xl font-bold">Finance</h1>
                <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'income' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        onClick={() => setActiveTab('income')}
                    >
                        Income
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'expenses' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        onClick={() => setActiveTab('expenses')}
                    >
                        Expenses
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="spinner"></div></div>
            ) : (
                <>
                    {/* Income Section */}
                    {activeTab === 'income' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Recent Income</h2>
                                <button className="btn" onClick={() => setShowIncomeForm(!showIncomeForm)}>
                                    <Plus size={18} /> Log Payment
                                </button>
                            </div>

                            {showIncomeForm && (
                                <div className="card mb-8">
                                    <h3 className="text-md font-bold mb-4">Record Payment</h3>
                                    <form onSubmit={handleIncomeSubmit} className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="label">Tenant</label>
                                            <select required className="input" value={incomeForm.tenant_id} onChange={e => setIncomeForm({ ...incomeForm, tenant_id: e.target.value })}>
                                                <option value="">Select Tenant...</option>
                                                {tenants.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name} - {t.property?.address}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Amount ($)</label>
                                            <input required type="number" step="0.01" className="input" value={incomeForm.amount} onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">Date</label>
                                            <input required type="date" className="input" value={incomeForm.payment_date} onChange={e => setIncomeForm({ ...incomeForm, payment_date: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">Type</label>
                                            <select className="input" value={incomeForm.payment_type} onChange={e => setIncomeForm({ ...incomeForm, payment_type: e.target.value })}>
                                                <option value="rent">Rent</option>
                                                <option value="deposit">Deposit</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Notes</label>
                                            <input type="text" className="input" value={incomeForm.notes} onChange={e => setIncomeForm({ ...incomeForm, notes: e.target.value })} />
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2 mt-4">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowIncomeForm(false)}>Cancel</button>
                                            <button type="submit" className="btn">Save Payment</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="card overflow-hidden p-0">
                                <div className="table-container">
                                    <table className="w-full">
                                        <thead className="bg-slate-800/50">
                                            <tr>
                                                <th>Date</th>
                                                <th>Tenant</th>
                                                <th>Type</th>
                                                <th>Notes</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.length === 0 ? (
                                                <tr><td colSpan={5} className="text-center py-8 text-muted">No payments recorded</td></tr>
                                            ) : (
                                                payments.map(p => (
                                                    <tr key={p.id}>
                                                        <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                                        <td>
                                                            <div className="font-medium">{p.tenant?.name}</div>
                                                            <div className="text-xs text-muted">{p.tenant?.property?.address}</div>
                                                        </td>
                                                        <td><span className="capitalize badge bg-blue-500/10 text-blue-400">{p.payment_type}</span></td>
                                                        <td className="text-muted text-sm">{p.notes || '-'}</td>
                                                        <td className="font-bold text-green-500">+${p.amount.toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Expenses Section */}
                    {activeTab === 'expenses' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Recent Expenses</h2>
                                <button className="btn btn-danger" onClick={() => setShowExpenseForm(!showExpenseForm)}>
                                    <Plus size={18} /> Log Expense
                                </button>
                            </div>

                            {showExpenseForm && (
                                <div className="card mb-8">
                                    <h3 className="text-md font-bold mb-4">Record Expense</h3>
                                    <form onSubmit={handleExpenseSubmit} className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="label">Property</label>
                                            <select required className="input" value={expenseForm.property_id} onChange={e => setExpenseForm({ ...expenseForm, property_id: e.target.value })}>
                                                <option value="">Select Property...</option>
                                                {properties.map(p => (
                                                    <option key={p.id} value={p.id}>{p.address}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Amount ($)</label>
                                            <input required type="number" step="0.01" className="input" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">Date</label>
                                            <input required type="date" className="input" value={expenseForm.expense_date} onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">Category</label>
                                            <select className="input" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="utility">Utility</option>
                                                <option value="tax">Tax</option>
                                                <option value="insurance">Insurance</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Receipt (Upload)</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={e => setExpenseForm({ ...expenseForm, file: e.target.files?.[0] || null })}
                                                />
                                                <div className="input flex items-center gap-2 text-sm text-muted">
                                                    <Upload size={16} />
                                                    {expenseForm.file ? expenseForm.file.name : 'Choose file...'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label">Description</label>
                                            <input type="text" className="input" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="e.g. Broken faucet repair" />
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2 mt-4">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseForm(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-danger">Save Expense</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="card overflow-hidden p-0">
                                <div className="table-container">
                                    <table className="w-full">
                                        <thead className="bg-slate-800/50">
                                            <tr>
                                                <th>Date</th>
                                                <th>Property</th>
                                                <th>Category</th>
                                                <th>Description</th>
                                                <th>Receipt</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-8 text-muted">No expenses recorded</td></tr>
                                            ) : (
                                                expenses.map(e => (
                                                    <tr key={e.id}>
                                                        <td>{new Date(e.expense_date).toLocaleDateString()}</td>
                                                        <td className="font-medium">{e.property?.address}</td>
                                                        <td><span className="capitalize badge bg-red-500/10 text-red-400">{e.category}</span></td>
                                                        <td className="text-muted text-sm">{e.description || '-'}</td>
                                                        <td>
                                                            {e.receipt_url ? (
                                                                <a href={e.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                                                                    <FileText size={14} /> View
                                                                </a>
                                                            ) : <span className="text-muted text-xs">-</span>}
                                                        </td>
                                                        <td className="font-bold text-red-500">-${e.amount.toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
