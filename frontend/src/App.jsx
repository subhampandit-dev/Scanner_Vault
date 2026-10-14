
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Vault from "./pages/Vault";
import Scan from "./pages/Scan";
import Trash from "./pages/Trash";

function PlaceholderPage({ title }) {
    return (
        <section className="page-heading">
            <div>
                <h1>{title}</h1>
                <p>This workspace is being prepared.</p>
            </div>
        </section>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public pages */}
                <Route element={<PublicRoute />}>
                    <Route path="/" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Protected pages */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />
                        <Route path="/scan" element={<Scan />} />
                        <Route path="/vault" element={<Vault />} />
                        <Route
                            path="/qr"
                            element={<PlaceholderPage title="QR & Barcodes" />}
                        />
                        <Route
                            path="/ask"
                            element={<PlaceholderPage title="Ask Your Vault" />}
                        />
                        <Route path="/trash" element={<Trash />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
