
import {
  LayoutDashboard,
  ScanLine,
  FolderLock,
  QrCode,
  MessageCircleQuestion,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Scan", to: "/scan", icon: ScanLine },
  { label: "Vault", to: "/vault", icon: FolderLock },
  { label: "QR & Barcodes", to: "/qr", icon: QrCode },
  { label: "Ask Your Vault", to: "/ask", icon: MessageCircleQuestion },
  { label: "Trash", to: "/trash", icon: Trash2 },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand" aria-label="Scanner Vault home">
        <span className="brand-mark">
          <ScanLine size={21} />
        </span>
        <span>
          Scanner<span className="brand-accent">Vault</span>
        </span>
      </NavLink>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-storage">
        <div className="storage-heading">
          <span>Storage used</span>
          <span className="storage-value">—</span>
        </div>

        <div
          className="storage-track"
          role="progressbar"
          aria-label="Storage used"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <div className="storage-fill" />
        </div>

        <p>Storage information coming soon</p>
      </div>

      <div className="sidebar-security">
        <span className="security-icon">
          <ShieldCheck size={19} />
        </span>
        <span>
          <strong>Your vault, organized.</strong>
          <small>Keep everything in one place.</small>
        </span>
      </div>
    </aside>
  );
}
