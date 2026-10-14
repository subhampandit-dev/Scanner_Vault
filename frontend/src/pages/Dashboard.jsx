
import {
    FileText,
    ScanLine,
    HardDrive,
    QrCode,
    ArrowUpRight,
    Clock3,
    Upload,
    Files,
    ChevronRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import api from "../services/api";


export default function Dashboard() {

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadDocuments() {
            try {
                const response = await api.get("/documents");

                if (!cancelled) {
                    setDocuments(response.data.documents || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Couldn't load your documents."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDocuments();

        return () => {
            cancelled = true;
        };
    }, []);

    const stats = [
        {
            label: "Total documents",
            value: loading ? "..." : error ? "—" : documents.length,
            note: "Your document library",
            icon: FileText,
            color: "#2563EB",
            tint: "#EAF1FE",
        },
        {
            label: "Pages scanned",
            value: "—",
            note: "Across all documents",
            icon: ScanLine,
            color: "#7C3AED",
            tint: "#F3E8FF",
        },
        {
            label: "Storage used",
            value: "—",
            note: "Cloud storage",
            icon: HardDrive,
            color: "#0D9488",
            tint: "#CCFBF1",
        },
        {
            label: "QR scans",
            value: "0",
            note: "QR & barcode activity",
            icon: QrCode,
            color: "#D97706",
            tint: "#FEF3C7",
        },
    ];


    return (
        <div className="dashboard-page">
            <section className="page-heading">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome to your secure document workspace.</p>
                </div>

                <button
                    className="button button-primary"
                    onClick={() => {
                        window.location.href = "/scan";
                    }}
                >
                    <Upload size={18} />
                    Scan document
                </button>
            </section>

            <section className="stats-grid" aria-label="Vault statistics">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article className="stat-card" key={stat.label}>
                            <div className="stat-top">
                                <span className="stat-label">{stat.label}</span>
                                <span
                                    className="stat-icon"
                                    style={{
                                        color: stat.color,
                                        backgroundColor: stat.tint,
                                    }}
                                >
                                    <Icon size={20} />
                                </span>
                            </div>

                            <div className="stat-value">{stat.value}</div>
                            <p className="stat-note">{stat.note}</p>
                        </article>
                    );
                })}
            </section>


            <section className="dashboard-section">
                <div className="section-heading">
                    <h2>Recent documents</h2>

                    <a href="/vault" className="text-link">
                        View vault <ArrowUpRight size={16} />
                    </a>
                </div>

                {loading && (
                    <p>Loading your documents...</p>
                )}

                {error && (
                    <p role="alert">{error}</p>
                )}

                {!loading && !error && documents.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Files size={28} />
                        </div>

                        <h3>Your vault starts here</h3>

                        <p>
                            Upload your first document to keep important files
                            organized in one secure place.
                        </p>
                    </div>
                )}

                {!loading && !error && documents.length > 0 && (
                    <div className="document-list">
                        {documents.slice(0, 5).map((doc) => (
                            <div className="content-card" key={doc._id}>
                                <Files size={20} />
                                <span>{doc.originalName}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>


            <section className="dashboard-bottom-grid">
                <article className="content-card">
                    <div className="section-heading compact">
                        <div>
                            <h2>Quick actions</h2>
                            <p>Get started with your vault.</p>
                        </div>
                    </div>

                    <a href="/scan" className="quick-action">
                        <span className="quick-icon blue">
                            <ScanLine size={20} />
                        </span>
                        <span className="quick-copy">
                            <strong>Scan a document</strong>
                            <small>Upload a PDF or image</small>
                        </span>
                        <ChevronRight size={18} />
                    </a>

                    <a href="/vault" className="quick-action">
                        <span className="quick-icon teal">
                            <Files size={20} />
                        </span>
                        <span className="quick-copy">
                            <strong>Browse your vault</strong>
                            <small>Find your stored documents</small>
                        </span>
                        <ChevronRight size={18} />
                    </a>

                    <a href="/trash" className="quick-action">
                        <span className="quick-icon amber">
                            <Clock3 size={20} />
                        </span>
                        <span className="quick-copy">
                            <strong>Recently deleted</strong>
                            <small>Review items in Trash</small>
                        </span>
                        <ChevronRight size={18} />
                    </a>
                </article>

                <article className="content-card storage-card">
                    <div className="section-heading compact">
                        <div>
                            <h2>Vault overview</h2>
                            <p>Your storage at a glance.</p>
                        </div>
                    </div>

                    <div className="storage-empty-visual">
                        <HardDrive size={30} />
                    </div>

                    <p className="storage-empty-title">Ready for your first upload</p>
                    <p className="storage-empty-description">
                        Your document count and storage usage will appear
                        here when connected to your account.
                    </p>
                </article>
            </section>
        </div>
    );
}
