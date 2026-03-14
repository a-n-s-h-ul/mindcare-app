'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

// ========================================
// SERENITY UI COMPONENT LIBRARY
// Premium, Calm, Human-Centered
// ========================================

// ---- LAYOUT COMPONENTS ----

interface PageWrapperProps {
    children: ReactNode;
    showNav?: boolean;
    className?: string;
}

export function PageWrapper({ children, showNav = true, className = '' }: PageWrapperProps) {
    return (
        <div className={`min-h-screen gradient-mesh relative ${className}`}>
            {/* Ambient Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/30 to-violet-300/20 rounded-full blur-[100px] animate-float-slow" />
                <div className="absolute top-[60%] right-[5%] w-[400px] h-[400px] bg-gradient-to-br from-sky-200/30 to-indigo-200/20 rounded-full blur-[80px] animate-float delay-300" />
                <div className="absolute bottom-[5%] left-[30%] w-[350px] h-[350px] bg-gradient-to-br from-emerald-200/20 to-sky-200/15 rounded-full blur-[70px] animate-float-fast delay-700" />
            </div>

            {showNav && <TopNav />}

            <main className="relative z-10 animate-fade-up">
                {children}
            </main>
        </div>
    );
}

export function TopNav() {
    return (
        <nav className="sticky top-0 z-50 glass-panel border-b border-white/40 transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 hover-scale">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 p-1 transition-transform">
                        <img src="/logo.svg" alt="KIIT Wellness Space" className="w-8 h-8 rounded-lg object-contain" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900 tracking-tight">KIIT Wellness Space</span>
                </Link>
            </div>
        </nav>
    );
}

interface SectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
}

export function Section({ children, className = '', id }: SectionProps) {
    return (
        <section id={id} className={`py-12 px-6 ${className}`}>
            <div className="max-w-5xl mx-auto">
                {children}
            </div>
        </section>
    );
}

// ---- CARD COMPONENTS ----

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export function Card({ children, className = '', hover = false, onClick, style }: CardProps) {
    return (
        <div
            className={`glass-panel rounded-3xl p-8 ${hover ? 'hover-lift cursor-pointer' : ''} ${className}`}
            onClick={onClick}
            style={style}
        >
            {children}
        </div>
    );
}

export function StatCard({ label, value, icon, trend }: { label: string; value: string | number; icon?: ReactNode; trend?: 'up' | 'down' | 'neutral' }) {
    return (
        <Card className="relative overflow-hidden">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">{label}</p>
                    <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
                </div>
                {icon && (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-sm border border-indigo-100/50 flex items-center justify-center text-indigo-500">
                        {icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${trend === 'up' ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' :
                    trend === 'down' ? 'bg-gradient-to-r from-amber-400 to-amber-300' :
                        'bg-gradient-to-r from-slate-300 to-slate-200'
                    }`} />
            )}
        </Card>
    );
}

// ---- BUTTON COMPONENTS ----

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit';
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    onClick,
    type = 'button'
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full hover-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none';

    const variants = {
        primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 border border-transparent',
        secondary: 'glass-panel border-indigo-200 border-2 text-indigo-700 hover:bg-indigo-50 shadow-sm',
        ghost: 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/80 transition-colors',
        outline: 'border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors bg-transparent'
    };

    const sizes = {
        sm: 'px-5 py-2 text-sm',
        md: 'px-7 py-3 text-base',
        lg: 'px-10 py-4 text-lg'
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
}

// ---- FORM COMPONENTS ----

interface InputProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    icon?: ReactNode;
    disabled?: boolean;
    required?: boolean;
    name?: string;
}

export function Input({ label, type = 'text', placeholder, value, onChange, error, icon, disabled, required, name }: InputProps) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                    {required && <span className="text-rose-400 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={`w-full px-5 py-3.5 ${icon ? 'pl-12' : ''} rounded-2xl bg-white/60 backdrop-blur-md border border-slate-200/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 transition-all duration-300 hover:bg-white/80 disabled:opacity-50 disabled:bg-slate-50`}
                />
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>
    );
}

// ---- BADGE COMPONENTS ----

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
    const variants = {
        default: 'bg-slate-100 text-slate-600 border-slate-200/50',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
        warning: 'bg-amber-50 text-amber-700 border-amber-200/50',
        danger: 'bg-rose-50 text-rose-700 border-rose-200/50',
        info: 'bg-indigo-50 text-indigo-700 border-indigo-200/50'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium border ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
}

// ---- PROGRESS COMPONENTS ----

export function ProgressBar({ value, max = 100, className = '' }: { value: number; max?: number; className?: string }) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className={`h-2 bg-slate-100 rounded-full overflow-hidden ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}

// ---- LOADING COMPONENTS ----

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`${sizes[size]} animate-spin`}>
            <svg viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
        </div>
    );
}

export function LoadingPage({ message = 'Loading...' }: { message?: string }) {
    return (
        <PageWrapper showNav={false}>
            <div className="min-h-screen flex items-center justify-center bg-mesh-light">
                <div className="text-center animate-pop">
                    <div className="w-24 h-24 mx-auto mb-8 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                        <div className="absolute inset-2 bg-indigo-500/10 rounded-full animate-pulse" />
                        <img src="/logo.svg" alt="Loading" className="w-16 h-16 relative z-10 object-contain animate-float" />
                    </div>
                    <p className="text-slate-500 font-medium tracking-wide animate-pulse">{message}</p>
                </div>
            </div>
        </PageWrapper>
    );
}

// ---- EMPTY STATE ----

export function EmptyState({
    icon,
    title,
    description,
    action
}: {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="text-center py-16">
            {icon && (
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
            {description && <p className="text-slate-500 mb-6 max-w-sm mx-auto">{description}</p>}
            {action}
        </div>
    );
}

// ---- TAB COMPONENTS ----

interface TabsProps {
    tabs: { id: string; label: string; icon?: ReactNode }[];
    activeTab: string;
    onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
    return (
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100/70 w-fit">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

// ---- ALERT COMPONENTS ----

interface AlertProps {
    variant?: 'info' | 'success' | 'warning' | 'danger';
    title?: string;
    children: ReactNode;
}

export function Alert({ variant = 'info', title, children }: AlertProps) {
    const variants = {
        info: 'bg-indigo-50/70 border-indigo-200/50 text-indigo-800',
        success: 'bg-emerald-50/70 border-emerald-200/50 text-emerald-800',
        warning: 'bg-amber-50/70 border-amber-200/50 text-amber-800',
        danger: 'bg-rose-50/70 border-rose-200/50 text-rose-800'
    };

    const icons = {
        info: '💡',
        success: '✓',
        warning: '⚠',
        danger: '!'
    };

    return (
        <div className={`p-4 rounded-xl border ${variants[variant]}`}>
            <div className="flex gap-3">
                <span className="text-lg">{icons[variant]}</span>
                <div>
                    {title && <p className="font-medium mb-1">{title}</p>}
                    <div className="text-sm opacity-90">{children}</div>
                </div>
            </div>
        </div>
    );
}
