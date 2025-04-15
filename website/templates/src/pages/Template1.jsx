import React from "react";

const Template1 = () => (
  <div
    style={{
      fontFamily: "Times New Roman, serif",
      color: "#000",
      backgroundColor: "#f4f4f4",
      padding: "20px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        backgroundColor: "#fff",
        borderBottom: "2px solid #000",
      }}
    ></div>
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#fff",
        borderBottom: "2px solid #000",
      }}
    >
      <h2 style={{ margin: "0", fontSize: "36px", fontWeight: "bold" }}>
        BUSINESS NEWSLETTER
      </h2>
    </div>
    <div style={{ padding: "20px", backgroundColor: "#fff" }}>
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>
            Business Stock
          </h2>
          <p className="par1" style={{ fontSize: "15px" }}>
            A newsletter is a regularly distributed publication that is
            generally about one main topic of interest to its subscribers.
            Newspapers and leaflets are types of newsletters. For Newspapers and
            leaflets are types of newsletters.
          </p>
          <p className="par2" style={{ fontSize: "15px" }}>
            A newsletter is a regularly distributed publication that is
            generally about one main topic of interest to its subscribers.
            Newspapers and leaflets are types of newsletters. For Newspapers and
            leaflets are types of newsletters.
          </p>
        </div>
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
      <p style={{ margin: "0", fontSize: "12px" }}>Footer information</p>
    </div>
  </div>
);

export default Template1;
