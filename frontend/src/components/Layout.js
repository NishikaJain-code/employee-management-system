import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  let userObj = {};
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      userObj = JSON.parse(storedUser);
    }
  } catch(e) {}

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      background: "#0B0F19",
      color: "#e2e8f0",
      fontFamily: "'Outfit', sans-serif" 
    }}>
      <Sidebar user={userObj} />
      <div style={{ flex: 1, marginLeft: "280px", display: "flex", flexDirection: "column" }}>
        <Topbar user={userObj} />
        <main style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
