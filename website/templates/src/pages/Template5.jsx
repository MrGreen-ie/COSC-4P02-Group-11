import React from "react";

const Template5 = ({ headline, summary }) => (
  <div
    style={{
      fontFamily: "Poppins, sans-serif",
      color: "#333",
      backgroundColor: "#f0f0f0",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    }}
  >
    <div
      style={{
        backgroundColor: "#6200ea",
        color: "#fff",
        padding: "20px",
        textAlign: "center",
        borderRadius: "10px 10px 0 0",
      }}
    >
      <h1 style={{ margin: "0", fontSize: "32px" }}>{headline}</h1>
    </div>

    <div
      style={{
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "0 0 10px 10px",
      }}
    >
      <h2 style={{ borderBottom: "2px solid #6200ea", paddingBottom: "10px" }}>
        Summary
      </h2>
      <p style={{ lineHeight: "1.6", fontSize: "16px" }}>{summary}</p>
    </div>

    <div
      style={{
        backgroundColor: "#3700b3",
        color: "#fff",
        padding: "10px",
        textAlign: "center",
        borderRadius: "0 0 10px 10px",
        marginTop: "20px",
      }}
    >
      <p style={{ margin: "0", fontSize: "12px" }}>Follow us on:</p>
      <p style={{ margin: "5px 0", fontSize: "12px" }}>
        <a
          href="https://facebook.com"
          style={{ color: "#fff", margin: "0 5px" }}
        >
          Facebook
        </a>{" "}
        |
        <a
          href="https://twitter.com"
          style={{ color: "#fff", margin: "0 5px" }}
        >
          Twitter
        </a>{" "}
        |
        <a
          href="https://linkedin.com"
          style={{ color: "#fff", margin: "0 5px" }}
        >
          LinkedIn
        </a>
      </p>
      <p style={{ margin: "5px 0", fontSize: "12px" }}>© 2025 SUMMIT</p>
    </div>
  </div>
);

export default Template5;
