
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ScanLine, Eye, EyeOff, ShieldCheck } from "lucide-react";
import api from "../services/api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const token = response.data.token;
            if (!token) {
                throw new Error("The server did not return an authentication token.");
            }

            localStorage.setItem("token", token);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <Link to="/" className="brand auth-brand">
                    <span className="brand-mark">
                        <ScanLine size={21} />
                    </span>
                    <span>
                        Scanner<span className="brand-accent">Vault</span>
                    </span>
                </Link>

                <div className="auth-heading">
                    <h1>Welcome back</h1>
                    <p>Sign in to access your secure document vault.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <div className="password-field">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && <p className="auth-error" role="alert">{error}</p>}

                    <button
                        className="button button-primary auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>

                <div className="auth-security">
                    <ShieldCheck size={17} />
                    <span>Your documents belong to you.</span>
                </div>
            </section>
        </main>
    );
}
