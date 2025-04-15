import React from "react";

const Template6 = ({ headline, contentLeft, contentRight }) => (
  <div
    style={{
      fontFamily: "Poppins, sans-serif",
      color: "#fff",
      backgroundColor: "#2C2C54",
      padding: "40px",
      display: "grid",
      gridTemplateColumns: "1fr",
      gridGap: "20px",
    }}
  >
    {/* Header Section */}
    <div
      style={{
        border: "2px solid #fff",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
        {headline}
      </h1>
      <h2
        style={{ margin: "10px 0 0", fontSize: "18px", fontWeight: "normal" }}
      >
        Newsletter Examples
      </h2>
    </div>

    {/* Content Section */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridGap: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#40407A",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <p style={{ fontSize: "12px" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
      <div
        style={{
          backgroundColor: "#40407A",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <p style={{ fontSize: "12px" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </div>

    <div
      style={{
        backgroundColor: "#2C2C54",
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

export default Template6;
