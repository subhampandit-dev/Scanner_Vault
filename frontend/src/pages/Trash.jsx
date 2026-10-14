
import { useEffect, useState } from "react";
import { Trash2, RotateCcw, RefreshCw, FileText } from "lucide-react";
import api from "../services/api";

export default function Trash() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busyId, setBusyId] = useState(null);

    async function loadTrash() {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/documents/trash");
            setDocuments(response.data.documents || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Couldn't load Trash. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTrash();
    }, []);

    async function restoreDocument(doc) {
        if (busyId) return;

        setBusyId(doc._id);
        setError("");
        setMessage("");

        try {
            await api.patch(`/documents/${doc._id}/restore`);
            setDocuments((current) =>
                current.filter((item) => item._id !== doc._id)
            );
            setMessage(`"${doc.originalName}" restored successfully.`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Couldn't restore this document."
            );
        } finally {
            setBusyId(null);
        }
    }

    async function deleteForever(doc) {
        if (busyId) return;

        const confirmed = window.confirm(
            `Permanently delete "${doc.originalName}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        setBusyId(doc._id);
        setError("");
        setMessage("");

        try {
            await api.delete(`/documents/${doc._id}/permanent`);
            setDocuments((current) =>
                current.filter((item) => item._id !== doc._id)
            );
            setMessage(`"${doc.originalName}" permanently deleted.`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Couldn't permanently delete this document."
            );
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div className="trash-page">
            <section className="page-heading">
                <div>
                    <h1>Trash</h1>
                    <p>
                        Restore deleted documents or permanently remove them.
                    </p>
                </div>

                <button
                    className="button"
                    onClick={loadTrash}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </section>

            {message && (
                <p className="trash-success" role="status">
                    {message}
                </p>
            )}

            {error && (
                <div className="trash-error" role="alert">
                    <p>{error}</p>
                    <button className="button" onClick={loadTrash}>
                        Try again
                    </button>
                </div>
            )}

            {loading ? (
                <p className="trash-message">Loading Trash...</p>
            ) : !error && documents.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <Trash2 size={28} />
                    </div>
                    <h3>Trash is empty</h3>
                    <p>Documents you delete will appear here.</p>
                </div>
            ) : (
                !error && (
                    <section className="content-card trash-list">
                        {documents.map((doc) => (
                            <article className="trash-document" key={doc._id}>
                                <span className="vault-file-icon">
                                    <FileText size={21} />
                                </span>

                                <div className="vault-file-info">
                                    <strong>{doc.originalName}</strong>
                                    <span>
                                        {doc.mimeType || "Document"}
                                        {" · "}
                                        {doc.size
                                            ? `${(doc.size / 1024).toFixed(1)} KB`
                                            : "Size unavailable"}
                                    </span>
                                </div>

                                <div className="trash-actions">
                                    <button
                                        className="button"
                                        onClick={() => restoreDocument(doc)}
                                        disabled={busyId !== null}
                                    >
                                        <RotateCcw size={16} />
                                        Restore
                                    </button>

                                    <button
                                        className="button trash-delete-button"
                                        onClick={() => deleteForever(doc)}
                                        disabled={busyId !== null}
                                    >
                                        <Trash2 size={16} />
                                        Delete Forever
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                )
            )}
        </div>
    );
}
