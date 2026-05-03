import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

const navItems = [
  { icon: "⌂", label: "Dashboard", path: "/dashboard" },
  { icon: "$", label: "Income", path: "/income" },
  { icon: "◎", label: "Budgets", path: "/budgets" },
  { icon: "□", label: "Fixed Expenses", path: "/fixed-expenses" },
  { icon: "≡", label: "All Expenses", path: "/expenses" },
  { icon: "◇", label: "Goals", path: "/goals" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const name = localStorage.getItem("name") || "User";
  const email = localStorage.getItem("email") || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div style={styles.sidebar}>
        <div style={styles.workspace}>
          <div style={styles.wsIcon}>◆</div>
          <div>
            <div style={styles.wsName}>Spendly</div>
            <div style={styles.wsSub}>Personal Finance</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.section}>MENU</div>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{ ...styles.navItem, ...(active ? styles.navActive : {}) }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
                {active && <span style={styles.navDot} />}
              </div>
            );
          })}
        </nav>

        <div style={styles.bottom}>
          <div style={styles.profileRow} onClick={() => navigate("/profile")}>
            <div style={styles.avatar}>{initials}</div>
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>{name}</div>
              <div style={styles.profileEmail}>{email}</div>
            </div>
          </div>
          <div style={styles.logoutBtn} onClick={() => setShowLogout(true)}>⏻ Sign out</div>
        </div>
      </div>

      <ConfirmLogoutModal isOpen={showLogout} onClose={() => setShowLogout(false)} onConfirm={handleLogout} />
    </>
  );
};

const styles = {
  sidebar: { width: 240, minHeight: "100vh", background: "#fafaf9", borderRight: "1px solid #e8e8e6", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, fontFamily: "'Inter', sans-serif" },
  workspace: { display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 12px", borderBottom: "1px solid #e8e8e6" },
  wsIcon: { fontSize: 22, color: "#2563eb", lineHeight: 1 },
  wsName: { fontSize: 14, fontWeight: 600, color: "#191919" },
  wsSub: { fontSize: 11, color: "#9b9b9b", marginTop: 1 },
  nav: { flex: 1, padding: "12px 8px" },
  section: { fontSize: 10, fontWeight: 600, color: "#9b9b9b", letterSpacing: "0.08em", padding: "4px 8px 8px" },
  navItem: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, cursor: "pointer", position: "relative", marginBottom: 2 },
  navActive: { background: "#eff6ff" },
  navIcon: { fontSize: 14, width: 18, textAlign: "center", color: "#6b6b6b" },
  navLabel: { fontSize: 14, color: "#374151" },
  navDot: { width: 6, height: 6, borderRadius: "50%", background: "#2563eb", position: "absolute", right: 10 },
  bottom: { borderTop: "1px solid #e8e8e6", padding: 8 },
  profileRow: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, cursor: "pointer" },
  avatar: { width: 28, height: 28, borderRadius: 6, background: "#dbeafe", color: "#2563eb", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  profileInfo: { overflow: "hidden" },
  profileName: { fontSize: 13, fontWeight: 500, color: "#191919", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  profileEmail: { fontSize: 11, color: "#9b9b9b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  logoutBtn: { padding: "6px 10px", fontSize: 12, color: "#9b9b9b", cursor: "pointer", borderRadius: 6, marginTop: 2 },
};

export default Sidebar;
