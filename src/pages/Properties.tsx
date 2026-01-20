
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Property } from '../types';
import { Plus, Home, Trash2 } from 'lucide-react';

export default function Properties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        address: '',
        purchase_date: '',
        price: ''
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    async function fetchProperties() {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const { error } = await supabase.from('properties').insert([{
                address: formData.address,
                purchase_date: formData.purchase_date || null,
                price: formData.price ? parseFloat(formData.price) : null
            }]);

            if (error) throw error;

            setFormData({ address: '', purchase_date: '', price: '' });
            setShowForm(false);
            fetchProperties();
        } catch (error) {
            console.error('Error adding property:', error);
            alert('Error adding property');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure? This will delete all associated tenants and records.')) return;

        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
            fetchProperties();
        } catch (error) {
            console.error('Error deleting property:', error);
        }
    }

    return (
        <div>
            <div className="header">
                <h1 className="text-2xl font-bold">Properties</h1>
                <button
                    className="btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    <Plus size={20} />
                    Add Property
                </button>
            </div>

            {showForm && (
                <div className="card mb-8 animate-fade-in">
                    <h2 className="text-lg font-bold mb-4">New Property</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Address</label>
                            <input
                                type="text"
                                required
                                className="input"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="123 Main St, City, State"
                            />
                        </div>
                        <div>
                            <label className="label">Purchase Date</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.purchase_date}
                                onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Price ($)</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="col-span-2 flex justify-end gap-2 mt-4">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn">Save Property</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12"><div className="spinner"></div></div>
            ) : properties.length === 0 ? (
                <div className="card flex flex-col items-center justify-center p-12 text-center text-muted">
                    <Home size={48} className="mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
                    <p>Add your first rental property to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map(property => (
                        <div key={property.id} className="card hover:border-blue-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Home size={24} />
                                </div>
                                <button
                                    onClick={() => handleDelete(property.id)}
                                    className="text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold mb-2 truncate" title={property.address}>
                                {property.address}
                            </h3>

                            <div className="space-y-2 text-sm text-muted">
                                {property.purchase_date && (
                                    <div className="flex justify-between">
                                        <span>Purchased:</span>
                                        <span className="text-slate-200">{new Date(property.purchase_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {property.price && (
                                    <div className="flex justify-between">
                                        <span>Price:</span>
                                        <span className="text-slate-200">${property.price.toLocaleString()}</span>
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
