
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Tenant, Property } from '../types';
import { Plus, Users, Trash2, Home, Phone, Mail, Calendar } from 'lucide-react';

export default function Tenants() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        property_id: '',
        name: '',
        email: '',
        phone: '',
        lease_start: '',
        lease_end: '',
        rent_amount: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [tenantsRes, propsRes] = await Promise.all([
                supabase.from('tenants').select('*, property:properties(address)').order('created_at', { ascending: false }),
                supabase.from('properties').select('*').order('address')
            ]);

            if (tenantsRes.error) throw tenantsRes.error;
            if (propsRes.error) throw propsRes.error;

            setTenants(tenantsRes.data || []);
            setProperties(propsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const { error } = await supabase.from('tenants').insert([{
                property_id: formData.property_id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                lease_start: formData.lease_start || null,
                lease_end: formData.lease_end || null,
                rent_amount: parseFloat(formData.rent_amount)
            }]);

            if (error) throw error;

            setFormData({
                property_id: '', name: '', email: '', phone: '',
                lease_start: '', lease_end: '', rent_amount: ''
            });
            setShowForm(false);
            fetchData();
        } catch (error) {
            console.error('Error adding tenant:', error);
            alert('Error adding tenant');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure? This will delete all payment history for this tenant.')) return;
        try {
            const { error } = await supabase.from('tenants').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error deleting tenant:', error);
        }
    }

    return (
        <div>
            <div className="header">
                <h1 className="text-2xl font-bold">Tenants</h1>
                <button className="btn" onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} />
                    Add Tenant
                </button>
            </div>

            {showForm && (
                <div className="card mb-8 animate-fade-in">
                    <h2 className="text-lg font-bold mb-4">New Tenant</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Name</label>
                            <input
                                required className="input" placeholder="John Doe"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="label">Property</label>
                            <select
                                required className="input"
                                value={formData.property_id} onChange={e => setFormData({ ...formData, property_id: e.target.value })}
                            >
                                <option value="">Select Property...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.address}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Email (Optional)</label>
                            <input
                                type="email" className="input" placeholder="john@example.com"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Phone (Optional)</label>
                            <input
                                type="tel" className="input" placeholder="(555) 123-4567"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Lease Start</label>
                            <input
                                type="date" className="input"
                                value={formData.lease_start} onChange={e => setFormData({ ...formData, lease_start: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Lease End</label>
                            <input
                                type="date" className="input"
                                value={formData.lease_end} onChange={e => setFormData({ ...formData, lease_end: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Monthly Rent ($)</label>
                            <input
                                required type="number" className="input" placeholder="0.00"
                                value={formData.rent_amount} onChange={e => setFormData({ ...formData, rent_amount: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 flex justify-end gap-2 mt-4">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn">Save Tenant</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12"><div className="spinner"></div></div>
            ) : tenants.length === 0 ? (
                <div className="card flex flex-col items-center justify-center p-12 text-center text-muted">
                    <Users size={48} className="mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Tenants Yet</h3>
                    <p>Add tenants to your properties to track rent.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tenants.map(tenant => (
                        <div key={tenant.id} className="card hover:border-blue-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{tenant.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-muted">
                                            <Home size={14} />
                                            <span className="truncate max-w-[150px]">
                                                {tenant.property?.address || 'Unknown Property'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(tenant.id)}
                                    className="text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted">
                                    <Calendar size={14} />
                                    <span>
                                        {tenant.lease_start ? new Date(tenant.lease_start).toLocaleDateString() : 'N/A'}
                                        {' - '}
                                        {tenant.lease_end ? new Date(tenant.lease_end).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
                                    <div>
                                        <span className="block text-xs uppercase text-muted">Rent</span>
                                        <span className="font-bold text-lg">${tenant.rent_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs uppercase text-muted">Status</span>
                                        <span className="badge badge-success">Active</span>
                                    </div>
                                </div>

                                {(tenant.email || tenant.phone) && (
                                    <div className="pt-2 flex gap-3">
                                        {tenant.email && (
                                            <a href={`mailto:${tenant.email}`} className="text-slate-400 hover:text-white">
                                                <Mail size={16} />
                                            </a>
                                        )}
                                        {tenant.phone && (
                                            <a href={`tel:${tenant.phone}`} className="text-slate-400 hover:text-white">
                                                <Phone size={16} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
