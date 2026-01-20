
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, Users, DollarSign, FileText } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/properties', label: 'Properties', icon: Home },
        { path: '/tenants', label: 'Tenants', icon: Users },
        { path: '/finance', label: 'Finance', icon: DollarSign },
        { path: '/reports', label: 'Reports', icon: FileText },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:block fixed h-full">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Home className="text-blue-500" />
                        Tenant<span className="text-blue-500">Track</span>
                    </h1>
                </div>
                <nav className="px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <div className="container mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Nav (simple bottom bar for mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-4 z-50">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`${isActive ? 'text-blue-500' : 'text-slate-400'}`}
                        >
                            <Icon size={24} />
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}
