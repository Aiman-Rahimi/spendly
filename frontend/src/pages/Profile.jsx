import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    setName(localStorage.getItem("name") || "");
    setEmail(localStorage.getItem("email") || "");
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/users/${userId}`, { name, email });
      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      setEdit(false);
      setMsg({ text: "Profile updated.", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch {
      setMsg({ text: "Failed to update.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const initials =
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#f7f7f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "60px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          style={{
            fontSize: 13,
            marginBottom: 14,
            background: "none",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              color: "#9b9b9b",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Account
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0 }}>
            Profile
          </h1>
        </div>

        {/* Message */}
        {msg.text && (
          <div
            style={{
              background: msg.type === "success" ? "#f6fff9" : "#fff5f5",
              border: `1px solid ${
                msg.type === "success" ? "#d1fadf" : "#ffd6d6"
              }`,
              color: msg.type === "success" ? "#067647" : "#b42318",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {msg.text}
          </div>
        )}

        {/* CARD */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* TOP */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#eef2ff",
                color: "#4f46e5",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {initials}
            </div>

            <div>
              <div style={{ fontWeight: 600 }}>{name || "—"}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                {email}
              </div>
            </div>
          </div>

          {/* FORM */}
          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {[
              { label: "Full Name", val: name, set: setName, type: "text" },
              { label: "Email Address", val: email, set: setEmail, type: "email" },
            ].map(({ label, val, set, type }) => (
              <div key={label}>
                <label style={{ fontSize: 13, color: "#6b7280" }}>
                  {label}
                </label>

                <input
                  type={type}
                  value={val}
                  disabled={!edit}
                  onChange={(e) => set(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px",
                    borderRadius: 6,
                    border: "1px solid #e5e5e5",
                    background: edit ? "#fff" : "#fafafa",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            ))}

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {edit ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: "8px 14px",
                      background: "#111",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={() => setEdit(false)}
                    style={{
                      padding: "8px 14px",
                      background: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEdit(true)}
                  style={{
                    padding: "8px 14px",
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              padding: 14,
              borderTop: "1px solid #f0f0f0",
              background: "#fafafa",
            }}
          >
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              style={{
                fontSize: 13,
                color: "#dc2626",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;