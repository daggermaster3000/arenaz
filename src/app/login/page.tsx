"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            router.push("/admin");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Invalid login credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container min-h-[80vh] flex items-center justify-center">
            <div className="login-card w-full max-w-md">
                <header className="mb-12 text-center">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 block">secure access</span>
                    <h1 className="text-5xl font-extrabold lowercase tracking-tight mb-2">brasserie login</h1>
                    <p className="opacity-60">access the scientific dashboard.</p>
                </header>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="input-group">
                        <label className="text-xs font-bold uppercase opacity-50 block mb-2 px-1">email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@arenaz.ch"
                            className="w-full bg-muted border border-border p-4 focus:border-accent outline-none transition-all font-medium"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="text-xs font-bold uppercase opacity-50 block mb-2 px-1">password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-muted border border-border p-4 focus:border-accent outline-none transition-all font-medium"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-fg text-bg p-5 font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>sign in</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <footer className="mt-12 text-center">
                    <p className="text-xs opacity-40">
                        &copy; {new Date().getFullYear()} brasserie arénaz lab. access restricted to authorized personnel.
                    </p>
                </footer>
            </div>

            <style jsx>{`
                .login-card {
                    padding: var(--space-8);
                }
                @media (min-width: 640px) {
                    .login-card {
                        border: 1px solid var(--border);
                        background: var(--bg);
                    }
                }
            `}</style>
        </div>
    );
}
