import React from "react";

const Template3 = ({ headline, date, issue }) => (
  <div
    style={{
      fontFamily: "Open Sans, sans-serif",
      color: "#333",
      backgroundColor: "#f5f5f5",
      padding: "20px",
      display: "grid",
      gridTemplateColumns: "1fr",
      gridGap: "20px",
      gridTemplateAreas: `
      "header"
      "title"
      "content"
    `,
    }}
  >
    {/* Header Section */}
    <div
      style={{
        gridArea: "header",
        backgroundColor: "#4a4a4a",
        color: "white",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "5px",
      }}
    >
      <h1 style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
        Newsletter
      </h1>
      <p style={{ margin: "0", fontSize: "14px" }}>April 2025</p>
    </div>

    {/* Title Section */}
    <div
      style={{
        gridArea: "title",
        backgroundColor: "#4a90e2",
        color: "white",
        padding: "20px",
        textAlign: "center",
        borderRadius: "5px",
      }}
    >
      <h2 style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
        {headline}
      </h2>
    </div>

    {/* Content Section */}
    <div
      style={{
        gridArea: "content",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridGap: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <p className="section1" style={{ fontSize: "14px", lineHeight: "1.6" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
      </div>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <p className="section2" style={{ fontSize: "14px", lineHeight: "1.6" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
      </div>
    </div>
    <div
      style={{
        backgroundColor: "#333",
        color: "#fff",
        padding: "10px",
        textAlign: "center",
      }}
    >
      <p style={{ margin: "0", fontSize: "12px" }}>Follow us on:</p>
      <p style={{ margin: "0", fontSize: "12px" }}>
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
      <p style={{ margin: "0", fontSize: "12px" }}>© 2025 SUMMIT</p>
    </div>
  </div>
);

export default Template3;
