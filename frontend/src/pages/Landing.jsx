
import { Link } from "react-router-dom";
import {
    ScanLine,
    FileText,
    Search,
    ShieldCheck
} from "lucide-react";

export default function Landing() {
    return (
        <main className="landing-page">
            <nav className="landing-nav">
                <Link to="/" className="landing-brand">
                    <ScanLine size={27} />
                    <span>Scanner Vault</span>
                </Link>

                <div className="landing-nav-actions">
                    <Link to="/login" className="button">
                        Log in
                    </Link>
                    <Link to="/register" className="button button-primary">
                        Sign up
                    </Link>
                </div>
            </nav>

            <section className="landing-hero">
                <span className="landing-eyebrow">
                    YOUR SMART DOCUMENT WORKSPACE
                </span>

                <h1>
                    Your documents.
                    <br />
                    <span>Smarter and simpler.</span>
                </h1>

                <p>
                    Scan documents, extract text, and organize your
                    digital files with Scanner Vault.
                </p>

                <div className="landing-hero-actions">
                    <Link to="/register" className="button button-primary">
                        Get started
                    </Link>
                    <Link to="/login" className="button">
                        I already have an account
                    </Link>
                </div>
            </section>

            <section className="landing-features">
                <article className="landing-feature">
                    <ScanLine size={27} />
                    <h3>Smart scanning</h3>
                    <p>Upload supported documents and preview them.</p>
                </article>

                <article className="landing-feature">
                    <FileText size={27} />
                    <h3>Text extraction</h3>
                    <p>Extract text from supported images and PDFs.</p>
                </article>

                <article className="landing-feature">
                    <Search size={27} />
                    <h3>Find documents</h3>
                    <p>Keep your files organized in one place.</p>
                </article>

                <article className="landing-feature">
                    <ShieldCheck size={27} />
                    <h3>Personal vault</h3>
                    <p>Sign in to access your saved documents.</p>
                </article>
            </section>

            <footer className="landing-footer">
                Scanner Vault · Scan. Extract. Organize.
            </footer>
        </main>
    );
}
