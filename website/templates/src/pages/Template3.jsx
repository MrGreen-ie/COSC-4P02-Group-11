import React from "react";

const Template3 = () => (
  <div style={{
    fontFamily: "Arial, sans-serif",
    color: "#333",
    backgroundColor: "#f5f5f5",
    padding: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridGap: "20px",
    gridTemplateAreas: `
      "header header header"
      "section1 section2 section3"
      "footer footer footer"
    `
  }}>
    <div style={{
      gridArea: "header",
      backgroundColor: "#4a4a4a",
      color: "white",
      padding: "20px",
      textAlign: "center",
      borderRadius: "5px"
    }}>
      <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "bold" }}>Newsletter Title</h1>
    </div>
    
    <div style={{
      gridArea: "section1",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ borderBottom: "2px solid #4a4a4a", paddingBottom: "10px" }}>Section 1</h2>
      <p style={{ lineHeight: "1.6" }}>
        A newsletter is a regularly distributed publication that is generally about one main topic of interest to its subscribers.
        Newsletters and leaflets are types of publications that provide information to readers in a concise format.
      </p>
    </div>
    
    <div style={{
      gridArea: "section2",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ borderBottom: "2px solid #4a4a4a", paddingBottom: "10px" }}>Section 2</h2>
      <p style={{ lineHeight: "1.6" }}>
        Newsletters can be distributed in both print and digital formats. Digital newsletters typically reach a wider audience
        and allow for interactive elements like links and buttons.
      </p>
    </div>
    
    <div style={{
      gridArea: "section3",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ borderBottom: "2px solid #4a4a4a", paddingBottom: "10px" }}>Section 3</h2>
      <p style={{ lineHeight: "1.6" }}>
        When creating a newsletter, it's important to keep the content relevant and concise. Use headings, images, and bullet points
        to break up the text and make it more readable.
      </p>
    </div>
    
    <div style={{
      gridArea: "footer",
      backgroundColor: "#333",
      color: "#fff",
      padding: "15px",
      textAlign: "center",
      borderRadius: "5px"
    }}>
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
      <p style={{ margin: "5px 0", fontSize: "12px" }}>© 2024 Your Company Name</p>
    </div>
  </div>
);

export default Template3;
