import React from "react";

const Template4 = ({ headline, summary }) => (
  <div
    style={{
      fontFamily: "Montserrat, sans-serif",
      color: "#444",
      backgroundColor: "#e0f7fa",
      padding: "20px",
      borderRadius: "10px",
    }}
  >
    <div
      style={{
        backgroundColor: "#00796b",
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
      <h2 style={{ borderBottom: "2px solid #00796b", paddingBottom: "10px" }}>
        Summary
      </h2>
      <p style={{ lineHeight: "1.6", fontSize: "16px" }}>{summary}</p>
    </div>

    <div
      style={{
        backgroundColor: "#004d40",
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

export default Template4;
