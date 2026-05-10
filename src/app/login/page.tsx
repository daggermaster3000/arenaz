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
        <div className="container login-page">
            <div className="login-card">
                <header>
                    <span className="login-eyebrow">secure access</span>
                    <h1 className="login-title">brasserie login</h1>
                    <p className="login-subtitle">access the scientific dashboard.</p>
                </header>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="field">
                        <label htmlFor="email">email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@arenaz.ch"
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-submit"
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

                <footer className="login-footer">
                    <p>&copy; {new Date().getFullYear()} brasserie arénaz lab. access restricted to authorized personnel.</p>
                </footer>
            </div>
        </div>
    );
}
