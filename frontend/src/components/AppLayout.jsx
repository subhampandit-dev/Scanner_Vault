
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  UserRound,
} from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    setAccountMenuOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={`sidebar-container ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <Sidebar />
      </div>

      <div className="main-panel">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <label className="global-search">
            <Search size={19} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search your documents..."
              aria-label="Search documents"
            />
            <kbd>/</kbd>
          </label>

          <div className="topbar-actions">
            <button
              className="icon-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={20} />
            </button>


            <div className="account-menu-container">
              <button
                className="avatar-menu"
                aria-label="Account menu"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              >
                <span className="avatar">
                  <UserRound size={19} />
                </span>
                <ChevronDown size={16} />
              </button>

              {accountMenuOpen && (
                <div className="account-dropdown">
                  <button
                    className="account-dropdown-item"
                    onClick={handleLogout}
                  >
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="main-content">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
