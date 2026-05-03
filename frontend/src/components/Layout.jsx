import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => (
  <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>
    <Sidebar />
    <main style={{ marginLeft: 240, flex: 1, padding: "40px 48px", maxWidth: "100%" }}>
      {children}
    </main>
  </div>
);

export default Layout;
