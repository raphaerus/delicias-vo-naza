import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { LOGO_URL } from '../../constants';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            navigate('/admin');
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-neutral-100">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src={LOGO_URL} className="w-16 h-16 rounded-full object-cover" alt="Logo" />
                    </div>
                    <h1 className="text-2xl font-bold text-brand-brown">Área Restrita</h1>
                    <p className="text-neutral-500 text-sm">Acesso exclusivo para Vó Naza</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm mb-6">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full bg-neutral-50 border-neutral-200 pl-12 pr-4 py-3 rounded-xl focus:border-brand-pink focus:ring-brand-pink"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input
                            type="password"
                            placeholder="Senha"
                            className="w-full bg-neutral-50 border-neutral-200 pl-12 pr-4 py-3 rounded-xl focus:border-brand-pink focus:ring-brand-pink"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-pink text-white font-bold py-3 rounded-xl shadow-lg hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Entrar na Cozinha'}
                    </button>
                </form>
            </div>
        </div>
    );
}
