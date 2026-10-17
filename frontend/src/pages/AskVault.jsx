
import { useState } from "react";
import {
    Bot,
    User,
    Send,
    MessageCircleQuestion,
    LoaderCircle
} from "lucide-react";
import "./AskVault.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const suggestions = [
    "Summarize my documents",
    "What important dates are in my documents?",
    "Find my college details",
    "What information is available in my vault?"
];

export default function AskVault() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function askQuestion(text = question) {
        const prompt = text.trim();

        if (!prompt || loading) return;

        setQuestion("");
        setError("");
        setMessages(previous => [
            ...previous,
            { role: "user", text: prompt }
        ]);
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please log in again.");
            }

            const response = await fetch(
                `${API_URL}/documents/ask`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ question: prompt })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to get an answer."
                );
            }

            setMessages(previous => [
                ...previous,
                {
                    role: "assistant",
                    text: data.answer,
                    documents: data.documentsUsed || []
                }
            ]);
        } catch (err) {
            setError(
                err.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="ask-vault-page">
            <header className="ask-vault-header">
                <div className="ask-vault-heading-icon">
                    <MessageCircleQuestion size={25} />
                </div>

                <div>
                    <h1>Ask Your Vault</h1>
                    <p>
                        Ask questions about your documents using AI.
                    </p>
                </div>
            </header>

            <div className="ask-vault-chat">
                {messages.length === 0 ? (
                    <div className="ask-vault-welcome">
                        <div className="ask-vault-bot-icon">
                            <Bot size={32} />
                        </div>

                        <h2>Your documents, understood.</h2>

                        <p>
                            Ask questions and get answers based on
                            text extracted from your stored documents.
                        </p>

                        <div className="ask-vault-suggestions">
                            {suggestions.map(item => (
                                <button
                                    key={item}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => askQuestion(item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="ask-vault-messages">
                        {messages.map((message, index) => (
                            <div
                                className={`ask-vault-message ${
                                    message.role === "user"
                                        ? "user-message"
                                        : "ai-message"
                                }`}
                                key={index}
                            >
                                <span className="message-avatar">
                                    {message.role === "user"
                                        ? <User size={18} />
                                        : <Bot size={18} />}
                                </span>

                                <div className="message-content">
                                    <strong>
                                        {message.role === "user"
                                            ? "You"
                                            : "Vault AI"}
                                    </strong>

                                    <p>{message.text}</p>

                                    {message.documents?.length > 0 && (
                                        <div className="source-documents">
                                            <strong>Documents used</strong>

                                            {message.documents.map(doc => (
                                                <span key={doc}>{doc}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="ask-vault-loading">
                                <LoaderCircle size={19} />
                                <span>Vault AI is thinking...</span>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="ask-vault-error" role="alert">
                        {error}
                    </div>
                )}

                <form
                    className="ask-vault-form"
                    onSubmit={event => {
                        event.preventDefault();
                        askQuestion();
                    }}
                >
                    <input
                        value={question}
                        onChange={event => setQuestion(event.target.value)}
                        placeholder="Ask something about your documents..."
                        maxLength={1000}
                        disabled={loading}
                        aria-label="Ask your vault a question"
                    />

                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        aria-label="Send question"
                    >
                        {loading
                            ? <LoaderCircle size={19} />
                            : <Send size={19} />}
                    </button>
                </form>

                <p className="ask-vault-disclaimer">
                    AI responses may be inaccurate. Verify important
                    details against your original documents.
                </p>
            </div>
        </section>
    );
}
