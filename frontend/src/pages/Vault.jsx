
import { useEffect, useState } from "react";
import {
    Search,
    Files,
    FileText,
    Image,
    RefreshCw,
    X,
    ExternalLink,
    LoaderCircle,
    Trash2,
    Folder,
    FolderPlus,
    ChevronLeft
} from "lucide-react";
import api from "../services/api";

export default function Vault() {
    const [documents, setDocuments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState("");

    //summary

    const [summary, setSummary] = useState("");
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState("");
    const [activePanel, setActivePanel] = useState("summary");


    // OCR state
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrError, setOcrError] = useState("");
    const [ocrResult, setOcrResult] = useState(null);
    const [copyMessage, setCopyMessage] = useState("");

    //Folder state
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [newFolderName, setNewFolderName] = useState("");
    const [folderError, setFolderError] = useState("");
    const [documentActionError, setDocumentActionError] = useState("");
    const [showCreateFolder, setShowCreateFolder] = useState(false);



    async function moveDocument(documentId, folderId) {
        setDocumentActionError("");

        try {
            await api.patch(`/documents/${documentId}/move`, {
                folderId: folderId || null
            });

            await loadDocuments(search);
        } catch (err) {
            setDocumentActionError(
                err.response?.data?.message ||
                "Couldn't move this document."
            );
        }
    }




    async function loadFolders() {
        try {
            const response = await api.get("/folders");
            setFolders(response.data.folders || []);
        } catch (err) {
            setFolderError(
                err.response?.data?.message || "Couldn't load folders."
            );
        }
    }

    async function createFolder(event) {
        event.preventDefault();

        const name = newFolderName.trim();
        if (!name) return;

        try {
            await api.post("/folders", { name });
            setNewFolderName("");
            setShowCreateFolder(false);
            setFolderError("");
            await loadFolders();
        } catch (err) {
            setFolderError(
                err.response?.data?.message || "Couldn't create folder."
            );
        }
    }




    async function loadDocuments(searchTerm = "") {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/documents", {
                params: {
                    search: searchTerm.trim()
                }
            });

            setDocuments(response.data.documents || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Couldn't load your documents."
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadDocuments();
        loadFolders();
    }, []);

    // Close the preview when the user presses Escape.
    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                closePreview();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);


    const filteredDocuments = documents.filter((doc) => {
        if (selectedFolderId === null) {
            return true;
        }

        if (selectedFolderId === "root") {
            return !doc.folderId;
        }

        return String(doc.folderId || "") === String(selectedFolderId);
    });


    function getFileIcon(mimeType = "") {
        return mimeType.startsWith("image/") ? Image : FileText;
    }

    function closePreview() {
        setSelectedDocument(null);
        setPreviewUrl("");
        setPreviewError("");
        setPreviewLoading(false);

        setOcrLoading(false);
        setOcrError("");
        setOcrResult(null);
        setCopyMessage("");
    }

    async function openPreview(doc) {
        setSelectedDocument(doc);
        setPreviewUrl("");
        setPreviewError("");
        setPreviewLoading(true);

        setOcrError("");
        setOcrResult(null);
        setOcrLoading(false);
        setCopyMessage("");

        try {
            const response = await api.get(
                `/documents/${doc._id}/preview`
            );

            if (!response.data.previewUrl) {
                throw new Error("No preview URL was returned.");
            }

            setPreviewUrl(response.data.previewUrl);
        } catch (err) {
            setPreviewError(
                err.response?.data?.message ||
                "Couldn't open this document. Please try again."
            );
        } finally {
            setPreviewLoading(false);
        }
    }


    async function generateSummary() {
        if (!selectedDocument) return;

        setSummary("");
        setSummaryError("");
        setSummaryLoading(true);

        try {
            const response = await api.post(
                `/documents/${selectedDocument._id}/summary`
            );

            setSummary(response.data.summary || "No summary was returned.");
        } catch (err) {
            setSummaryError(
                err.response?.data?.message ||
                "Couldn't generate the AI summary. Please try again."
            );
        } finally {
            setSummaryLoading(false);
        }
    }



    async function handleDeleteDocument() {
        if (!selectedDocument) return;

        const confirmed = window.confirm(
            `Move "${selectedDocument.originalName}" to Trash?`
        );

        if (!confirmed) return;

        try {
            await api.patch(
                `/documents/${selectedDocument._id}/trash`
            );

            closePreview();
            await loadDocuments();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Couldn't delete this document. Please try again."
            );
        }
    }



    async function extractDocumentText() {
        if (!selectedDocument || ocrLoading) return;

        setOcrLoading(true);
        setOcrError("");
        setCopyMessage("");

        try {
            const response = await api.post(
                `/documents/${selectedDocument._id}/ocr`
            );

            setOcrResult({
                text: response.data.extractedText || "",
                method: response.data.method || "unknown",
                characterCount:
                    response.data.characterCount ??
                    (response.data.extractedText || "").length
            });
        } catch (err) {
            setOcrError(
                err.response?.data?.message ||
                "Text extraction failed. Please try again."
            );
        } finally {
            setOcrLoading(false);
        }
    }

    async function copyExtractedText() {
        if (!ocrResult?.text) return;

        try {
            await navigator.clipboard.writeText(ocrResult.text);
            setCopyMessage("Text copied to clipboard!");
        } catch {
            setCopyMessage(
                "Copy failed. Select the text and copy it manually."
            );
        }
    }


    const isPdf =
        selectedDocument?.mimeType === "application/pdf";

    const isImage =
        selectedDocument?.mimeType?.startsWith("image/");

    return (
        <div className="vault-page">
            <section className="page-heading">
                <div>
                    <h1>My Vault</h1>
                    <p>All your documents, organized in one place.</p>
                </div>

                {/* <button
                    className="button button-primary"
                    onClick={loadDocuments}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button> */}
            </section>


            <section className="vault-folders">
                <div className="vault-folders-heading">
                    <div>
                        <h3>My Folders</h3>
                        <p>Keep your documents organized.</p>
                    </div>

                    <button
                        type="button"
                        className="button button-primary"
                        onClick={() => setShowCreateFolder(!showCreateFolder)}
                    >
                        <FolderPlus size={16} />
                        New Folder
                    </button>
                </div>

                {showCreateFolder && (
                    <form className="vault-create-folder" onSubmit={createFolder}>
                        <input
                            value={newFolderName}
                            onChange={(event) => setNewFolderName(event.target.value)}
                            placeholder="Enter folder name"
                            maxLength={50}
                            required
                        />
                        <button type="submit" className="button button-primary">
                            Create
                        </button>
                    </form>
                )}

                {folderError && (
                    <p className="vault-folder-error" role="alert">{folderError}</p>
                )}
                {documentActionError && (
                    <p className="vault-folder-error" role="alert">
                        {documentActionError}
                    </p>
                )}

                <div className="vault-folder-grid">
                    <button
                        type="button"
                        className={`vault-folder-card ${selectedFolderId === null ? "active" : ""}`}
                        onClick={() => setSelectedFolderId(null)}
                    >
                        <Folder size={22} />
                        <span>All Documents</span>
                    </button>


                    <button
                        type="button"
                        className={`vault-folder-card ${selectedFolderId === "root" ? "active" : ""}`}
                        onClick={() => setSelectedFolderId("root")}
                    >
                        <Folder size={22} />
                        <span>Unfiled</span>
                    </button>


                    {folders.map((folder) => (
                        <button
                            type="button"
                            key={folder._id}
                            className={`vault-folder-card ${selectedFolderId === folder._id ? "active" : ""}`}
                            onClick={() => setSelectedFolderId(folder._id)}
                        >
                            <Folder size={22} />
                            <span>{folder.name}</span>
                        </button>
                    ))}
                </div>
            </section>


            <section className="content-card vault-content">
                <div className="vault-toolbar">
                    <div className="vault-search">
                        <Search size={18} />
                        <input
                            type="search"
                            placeholder="Search filenames and document contents..."
                            value={search}
                            onChange={(event) => {
                                const value = event.target.value;
                                setSearch(value);
                                loadDocuments(value);
                            }}
                            aria-label="Search documents by filename and OCR text"
                        />
                    </div>

                    <span className="vault-count">
                        {documents.length} documents
                    </span>
                </div>

                {loading && (
                    <p className="vault-message">
                        Loading documents...
                    </p>
                )}

                {error && (
                    <div className="vault-message" role="alert">
                        <p>{error}</p>
                        <button
                            className="button"
                            onClick={loadDocuments}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading &&
                    !error &&
                    filteredDocuments.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <Files size={28} />
                            </div>

                            <h3>
                                {search
                                    ? "No matching documents"
                                    : "Your vault is empty"}
                            </h3>

                            <p>
                                {search
                                    ? "Try another filename."
                                    : "Upload your first document to see it here."}
                            </p>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    filteredDocuments.length > 0 && (
                        <div className="vault-document-list">
                            {filteredDocuments.map((doc) => {
                                const Icon = getFileIcon(doc.mimeType);

                                return (
                                    <article
                                        className="vault-document vault-document-clickable"
                                        key={doc._id}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Preview ${doc.originalName}`}
                                        onClick={() => openPreview(doc)}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" ||
                                                event.key === " "
                                            ) {
                                                event.preventDefault();
                                                openPreview(doc);
                                            }
                                        }}
                                    >
                                        <span className="vault-file-icon">
                                            <Icon size={21} />
                                        </span>

                                        <div className="vault-file-info">
                                            <strong>
                                                {doc.originalName}
                                            </strong>

                                            <span>
                                                {doc.mimeType || "Document"}{" "}
                                                ·{" "}
                                                {doc.size
                                                    ? `${(
                                                        doc.size / 1024
                                                    ).toFixed(1)} KB`
                                                    : "Size unavailable"}
                                            </span>
                                        </div>


                                        <div className="vault-document-actions">
                                            <select
                                                aria-label={`Move ${doc.originalName} to a folder`}
                                                value={doc.folderId ? String(doc.folderId) : ""}
                                                onClick={(event) => event.stopPropagation()}
                                                onKeyDown={(event) => event.stopPropagation()}
                                                onChange={(event) => {
                                                    event.stopPropagation();
                                                    moveDocument(doc._id, event.target.value);
                                                }}
                                            >
                                                <option value="">Unfiled</option>
                                                {folders.map((folder) => (
                                                    <option key={folder._id} value={folder._id}>
                                                        {folder.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <ExternalLink
                                                size={17}
                                                className="vault-preview-icon"
                                            />
                                        </div>

                                    </article>
                                );
                            })}
                        </div>
                    )}
            </section>

            {selectedDocument && (
                <div
                    className="document-preview-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closePreview();
                        }
                    }}
                >
                    <section
                        className="document-preview-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Preview ${selectedDocument.originalName}`}
                    >
                        <header className="document-preview-header">
                            <div className="document-preview-title">
                                <FileText size={20} />

                                <div>
                                    <strong>
                                        {selectedDocument.originalName}
                                    </strong>
                                    <span>
                                        {selectedDocument.mimeType}
                                    </span>
                                </div>
                            </div>

                            <div className="document-preview-actions">
                                {previewUrl && (
                                    <a
                                        className="button"
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink size={16} />
                                        Open in new tab
                                    </a>
                                )}


                                <button
                                    type="button"
                                    className="button"
                                    onClick={handleDeleteDocument}
                                    title="Move document to Trash"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>


                                <button
                                    className="button"
                                    onClick={closePreview}
                                    aria-label="Close preview"
                                    title="Close preview"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </header>


                        <div className="document-preview-workspace">
                            <main className="document-viewer">
                                {previewLoading && (
                                    <div className="document-preview-status">
                                        <LoaderCircle size={28} className="ocr-spinner" />
                                        <p>Loading document preview...</p>
                                    </div>
                                )}

                                {!previewLoading && previewError && (
                                    <div className="document-preview-status" role="alert">
                                        <p>{previewError}</p>
                                        <button
                                            className="button button-primary"
                                            onClick={() => openPreview(selectedDocument)}
                                        >
                                            Try again
                                        </button>
                                    </div>
                                )}

                                {!previewLoading && !previewError && previewUrl && isPdf && (
                                    <iframe
                                        className="document-preview-frame"
                                        src={previewUrl}
                                        title={`PDF preview: ${selectedDocument.originalName}`}
                                    />
                                )}

                                {!previewLoading && !previewError && previewUrl && isImage && (
                                    <img
                                        className="document-preview-image"
                                        src={previewUrl}
                                        alt={selectedDocument.originalName}
                                    />
                                )}

                                {!previewLoading && !previewError && previewUrl && !isPdf && !isImage && (
                                    <div className="document-preview-status">
                                        <p>Preview is not supported for this file type.</p>
                                        <a
                                            className="button button-primary"
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Open document
                                        </a>
                                    </div>
                                )}
                            </main>

                            <aside className="document-tools-panel">
                                <div className="document-tools-heading">
                                    <span className="document-tools-eyebrow">DOCUMENT TOOLS</span>
                                    <h3>Understand your document</h3>
                                    <p>Extract text or get an AI-powered summary.</p>
                                </div>

                                <div className="document-tools-tabs" role="tablist">
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={activePanel === "summary"}
                                        className={`document-tools-tab ${activePanel === "summary" ? "active" : ""}`}
                                        onClick={() => setActivePanel("summary")}
                                    >
                                        AI Summary
                                    </button>

                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={activePanel === "ocr"}
                                        className={`document-tools-tab ${activePanel === "ocr" ? "active" : ""}`}
                                        onClick={() => setActivePanel("ocr")}
                                    >
                                        Extracted Text
                                    </button>
                                </div>

                                <div className="document-tools-content">
                                    {activePanel === "summary" && (
                                        <section className="ai-summary-panel">
                                            <div className="ai-summary-heading">
                                                <div className="ai-summary-icon">
                                                    <FileText size={20} />
                                                </div>
                                                <h3>AI Document Summary</h3>
                                                <p>Key details, without reading every page.</p>
                                            </div>

                                            {!summary && !summaryLoading && (
                                                <div className="ai-summary-empty">
                                                    <p>Your document summary will appear here.</p>
                                                    <button
                                                        type="button"
                                                        className="button button-primary"
                                                        onClick={generateSummary}
                                                    >
                                                        Generate AI Summary
                                                    </button>
                                                </div>
                                            )}

                                            {summaryLoading && (
                                                <div className="ai-summary-status" role="status">
                                                    <LoaderCircle size={22} className="ocr-spinner" />
                                                    <p>Analyzing your document...</p>
                                                    <span>This may take a few moments.</span>
                                                </div>
                                            )}

                                            {summaryError && (
                                                <div className="ai-summary-error" role="alert">
                                                    <p>{summaryError}</p>
                                                    <button
                                                        type="button"
                                                        className="button"
                                                        onClick={generateSummary}
                                                    >
                                                        Try again
                                                    </button>
                                                </div>
                                            )}

                                            {summary && !summaryLoading && (
                                                <div className="ai-summary-result">
                                                    <div className="ai-summary-result-heading">
                                                        <span>SUMMARY</span>
                                                        <button
                                                            type="button"
                                                            className="button"
                                                            onClick={generateSummary}
                                                            disabled={summaryLoading}
                                                        >
                                                            Regenerate
                                                        </button>
                                                    </div>
                                                    <div className="ai-summary-text">{summary}</div>
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {activePanel === "ocr" && (
                                        <section className="ocr-panel">
                                            <div className="ocr-panel-header">
                                                <div>
                                                    <h3>Text Extraction</h3>
                                                    <p>Extract searchable text from this document.</p>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="button button-primary"
                                                    onClick={extractDocumentText}
                                                    disabled={ocrLoading || previewLoading}
                                                >
                                                    {ocrLoading ? (
                                                        <>
                                                            <LoaderCircle size={16} className="ocr-spinner" />
                                                            Extracting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText size={16} />
                                                            {ocrResult ? "Extract Again" : "Extract Text"}
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {ocrError && (
                                                <div className="ocr-error" role="alert">
                                                    <strong>Text extraction failed</strong>
                                                    <p>{ocrError}</p>
                                                </div>
                                            )}

                                            {ocrLoading && (
                                                <div className="ocr-status" role="status">
                                                    <LoaderCircle size={22} className="ocr-spinner" />
                                                    <span>Processing your document...</span>
                                                </div>
                                            )}

                                            {ocrResult && (
                                                <div className="ocr-results">
                                                    <div className="ocr-result-meta">
                                                        <span>{ocrResult.characterCount} characters</span>
                                                        <span>Method: {ocrResult.method}</span>
                                                    </div>

                                                    <div className="ocr-text-container">
                                                        <pre className="ocr-extracted-text">
                                                            {ocrResult.text || "No readable text was returned."}
                                                        </pre>
                                                    </div>

                                                    <div className="ocr-result-actions">
                                                        <button
                                                            type="button"
                                                            className="button"
                                                            onClick={copyExtractedText}
                                                            disabled={!ocrResult.text}
                                                        >
                                                            Copy text
                                                        </button>
                                                        {copyMessage && (
                                                            <span role="status" className="ocr-copy-message">
                                                                {copyMessage}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    )}
                                </div>
                            </aside>
                        </div>

                    </section>
                </div>
            )}
        </div>
    );
}
