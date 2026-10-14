
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Image, X, CheckCircle2 } from "lucide-react";
import api from "../services/api";

export default function Scan() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function selectFile(selectedFile) {
        setError("");
        setSuccess("");

        if (!selectedFile) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Choose a PDF, JPG, PNG, or WEBP file.");
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("File size must be 10 MB or less.");
            return;
        }

        setFile(selectedFile);
    }

    async function handleUpload() {

        if (!file) {
            console.log("Upload attempted with no file selected.");
            setError("Please choose the file again before uploading.");
            return;
        }

        console.log("Selected file:", file.name, file.type, file.size);

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();
            formData.append("document", file);

            await api.post("/documents/upload", formData);

            setSuccess("Document uploaded successfully!");
            setFile(null);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Upload failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="scan-page">
            <section className="page-heading">
                <div>
                    <h1>Scan documents</h1>
                    <p>Upload a document to store it in your secure vault.</p>
                </div>
            </section>

            <section className="content-card scan-card">
                <div
                    className={`scan-dropzone ${dragging ? "dragging" : ""}`}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        selectFile(event.dataTransfer.files?.[0]);
                    }}
                >
                    <div className="scan-upload-icon">
                        <Upload size={28} />
                    </div>

                    <h2>Upload your document</h2>
                    <p>Drag and drop a file here, or select one from your device.</p>

                    <label className="button button-primary scan-browse">
                        Choose file
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            hidden
                            onChange={(event) => {
                                selectFile(event.target.files?.[0]);
                                event.target.value = "";
                            }}
                        />
                    </label>

                    <span className="scan-hint">
                        PDF, JPG, PNG, WEBP · Maximum 10 MB
                    </span>
                </div>

                {file && (
                    <div className="scan-selected-file">
                        {file.type === "application/pdf"
                            ? <FileText size={22} />
                            : <Image size={22} />}

                        <div>
                            <strong>{file.name}</strong>
                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                        </div>

                        <button
                            className="icon-button"
                            type="button"
                            aria-label="Remove selected file"
                            onClick={() => setFile(null)}
                            disabled={loading}
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {error && <p className="scan-error" role="alert">{error}</p>}

                {success && (
                    <div className="scan-success" role="status">
                        <CheckCircle2 size={18} />
                        {success}
                    </div>
                )}

                <div className="scan-actions">
                    <button
                        className="button button-primary"
                        onClick={handleUpload}
                        disabled={!file || loading}
                    >
                        {loading ? "Uploading..." : "Upload to vault"}
                    </button>

                    {success && (
                        <button
                            className="button"
                            onClick={() => navigate("/vault")}
                        >
                            View vault
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}
