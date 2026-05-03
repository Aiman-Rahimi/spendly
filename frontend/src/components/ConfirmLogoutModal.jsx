import React from "react";

const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(2px)", fontFamily: "'Inter', sans-serif" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, maxWidth: 360, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#191919", marginBottom: 8 }}>Sign out?</div>
        <div style={{ fontSize: 14, color: "#6b6b6b", marginBottom: 24 }}>You'll be redirected to the login page.</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e8e8e6", color: "#374151", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "8px 16px", background: "#191919", border: "none", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Sign out</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
