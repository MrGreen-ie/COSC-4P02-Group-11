import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Template1 from "./Template1";
import Template2 from "./Template2";
import Template3 from "./Template3";
import Template4 from "./Template4";
import Template5 from "./Template5";
import Template6 from "./Template6";
import { getSavedSummaries } from "../services/api";

const Template = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [activeView, setActiveView] = useState("selection"); // 'selection' or 'preview'
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedHeadline, setEditedHeadline] = useState("");
  const [editedContent, setEditedContent] = useState("");

  // Fetch summaries from the API
  const fetchSummaries = async () => {
    setLoading(true);
    try {
      // Fetch real summaries from the API
      const response = await getSavedSummaries();
      console.log("API Response:", response);

      if (response && response.summaries && response.summaries.length > 0) {
        // Check the structure of the first summary to see what properties are available
        const firstSummary = response.summaries[0];
        console.log("First summary structure:", firstSummary);

        // Normalize the summaries to ensure they have the expected properties
        const normalizedSummaries = response.summaries.map((summary) => {
          // If summary has a "summary" field but no "content" field, copy it to content
          if (summary.summary && !summary.content) {
            return {
              ...summary,
              content: summary.summary,
            };
          }
          return summary;
        });

        console.log("Normalized summaries:", normalizedSummaries);

        setSummaries(normalizedSummaries);
        setSelectedSummary(normalizedSummaries[0]); // Select the first summary by default
        setEditedHeadline(normalizedSummaries[0].headline || "");
        setEditedContent(
          normalizedSummaries[0].content || normalizedSummaries[0].summary || ""
        );
        console.log(
          "Summaries loaded successfully:",
          normalizedSummaries.length
        );
      } else {
        // If no summaries are available, show mock data as fallback
        console.log("No summaries found in API response, using fallback data");
        const mockSummaries = [
          {
            id: 1,
            headline: "The Future of AI in Healthcare",
            content:
              "Artificial intelligence is revolutionizing healthcare in unprecedented ways. From diagnosis to treatment planning, AI tools are becoming invaluable assets to medical professionals.\n\nRecent studies show that AI can detect certain conditions with accuracy comparable to human specialists. This could lead to earlier interventions and better patient outcomes, especially in underserved regions.\n\nHowever, challenges remain regarding ethics, data privacy, and integration with existing systems. As technology advances, addressing these concerns will be crucial for widespread adoption.",
            created_at: "2023-04-15",
          },
          {
            id: 2,
            headline: "Sustainable Business Practices",
            content:
              "Companies worldwide are increasingly adopting sustainable business models to address environmental concerns while meeting stakeholder expectations.\n\nImplementing green initiatives not only helps protect the planet but can also lead to cost savings and improved brand reputation. Many organizations are finding that sustainability and profitability can go hand in hand.\n\nConsumers are becoming more environmentally conscious, creating market demand for eco-friendly products and services. Businesses that adapt to this shift may find competitive advantages in the changing landscape.",
            created_at: "2023-04-12",
          },
          {
            id: 3,
            headline: "The Remote Work Revolution",
            content:
              "The pandemic has permanently altered how we think about work, with remote and hybrid models becoming the new normal for many industries.\n\nStudies indicate that remote work can increase productivity and employee satisfaction when implemented thoughtfully. Organizations are now investing in tools and policies to support distributed teams effectively.\n\nHowever, challenges around collaboration, company culture, and work-life boundaries continue to evolve. The most successful companies will be those that can balance flexibility with meaningful connection.",
            created_at: "2023-04-08",
          },
        ];

        setSummaries(mockSummaries);
        setSelectedSummary(mockSummaries[0]);
        setEditedHeadline(mockSummaries[0].headline || "");
        setEditedContent(mockSummaries[0].content || "");
      }
    } catch (err) {
      console.error("Error fetching summaries:", err);
      setError("Failed to load recent summaries. Please try again later.");

      // In case of error, load mock data as fallback
      const mockSummaries = [
        {
          id: 1,
          headline: "The Future of AI in Healthcare",
          content:
            "Artificial intelligence is revolutionizing healthcare in unprecedented ways. From diagnosis to treatment planning, AI tools are becoming invaluable assets to medical professionals.\n\nRecent studies show that AI can detect certain conditions with accuracy comparable to human specialists. This could lead to earlier interventions and better patient outcomes, especially in underserved regions.\n\nHowever, challenges remain regarding ethics, data privacy, and integration with existing systems. As technology advances, addressing these concerns will be crucial for widespread adoption.",
          created_at: "2023-04-15",
        },
        {
          id: 2,
          headline: "Sustainable Business Practices",
          content:
            "Companies worldwide are increasingly adopting sustainable business models to address environmental concerns while meeting stakeholder expectations.\n\nImplementing green initiatives not only helps protect the planet but can also lead to cost savings and improved brand reputation. Many organizations are finding that sustainability and profitability can go hand in hand.\n\nConsumers are becoming more environmentally conscious, creating market demand for eco-friendly products and services. Businesses that adapt to this shift may find competitive advantages in the changing landscape.",
          created_at: "2023-04-12",
        },
        {
          id: 3,
          headline: "The Remote Work Revolution",
          content:
            "The pandemic has permanently altered how we think about work, with remote and hybrid models becoming the new normal for many industries.\n\nStudies indicate that remote work can increase productivity and employee satisfaction when implemented thoughtfully. Organizations are now investing in tools and policies to support distributed teams effectively.\n\nHowever, challenges around collaboration, company culture, and work-life boundaries continue to evolve. The most successful companies will be those that can balance flexibility with meaningful connection.",
          created_at: "2023-04-08",
        },
      ];

      setSummaries(mockSummaries);
      setSelectedSummary(mockSummaries[0]);
      setEditedHeadline(mockSummaries[0].headline || "");
      setEditedContent(mockSummaries[0].content || "");
    } finally {
      setLoading(false);
    }
  };

  // Fetch summaries on component mount
  useEffect(() => {
    fetchSummaries();
  }, []);

  // Update edited content when selected summary changes
  useEffect(() => {
    if (selectedSummary) {
      setEditedHeadline(selectedSummary.headline || "");
      setEditedContent(selectedSummary.content || "");
    }
  }, [selectedSummary]);

  const handleRefreshSummaries = () => {
    setError(null); // Clear any previous errors
    fetchSummaries();
  };

  const templates = [
    {
      id: 0,
      name: "Business Template",
      description:
        "A professional newsletter template with traditional styling, perfect for business updates and corporate communications.",
      features: [
        "Clean and professional layout",
        "Traditional black and white styling",
        "Ideal for business communications",
      ],
      component: Template1,
    },
    {
      id: 1,
      name: "Modern Green",
      description:
        "A fresh, modern template with green accents, suitable for environmental organizations, wellness companies, and sustainability initiatives.",
      features: [
        "Earth-friendly green color scheme",
        "Modern typography",
        "Warm and inviting design",
      ],
      component: Template2,
    },
    {
      id: 2,
      name: "Grid Layout",
      description:
        "A clean, organized grid-based template that allows for multiple sections of content in a modern, responsive layout.",
      features: [
        "Responsive grid design",
        "Multiple content areas",
        "Modern and minimal aesthetic",
      ],
      component: Template3,
    },
    {
      id: 3,
      name: "Aqua Breeze",
      description:
        "A refreshing template with a modern aqua theme, perfect for tech or lifestyle newsletters.",
      features: [
        "Aqua color scheme",
        "Modern typography",
        "Clean and minimal design",
      ],
      component: Template4,
    },
    {
      id: 4,
      name: "Vibrant Purple",
      description:
        "A bold and vibrant template with a purple theme, ideal for creative industries.",
      features: [
        "Vibrant purple color scheme",
        "Dynamic layout",
        "Eye-catching design",
      ],
      component: Template5,
    },
    {
      id: 5,
      name: "Dual Column Layout",
      description:
        "A professional dual-column layout, great for B2B newsletters or detailed content.",
      features: [
        "Dual-column design",
        "Professional look",
        "Ideal for detailed content",
      ],
      component: Template6,
    },
  ];

  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    setActiveView("preview");
  };

  const handleBackToSelection = () => {
    setActiveView("selection");
  };

  const handleUseTemplate = () => {
    if (!selectedSummary) {
      // Show error if no summary is selected
      setError("Please select a summary first");
      return;
    }

    try {
      // Create a data object with selected template and summary
      // Use the edited content if available
      const templateData = {
        templateId: selectedTemplate,
        templateName: templates[selectedTemplate].name,
        summaryId: selectedSummary.id,
        summaryHeadline: editedHeadline || selectedSummary.headline,
        summaryContent: editedContent || selectedSummary.content,
      };

      // Store template data in session storage for the editor to use
      sessionStorage.setItem("templateData", JSON.stringify(templateData));

      // Show success message
      setSnackbar({
        open: true,
        message: `Template "${templateData.templateName}" selected with summary "${templateData.summaryHeadline}"`,
        severity: "success",
      });

      // Navigate to the editor page after a short delay to show the snackbar
      setTimeout(() => {
        navigate("/editor", { state: { templateData } });
      }, 1000);

      console.log(
        `Using template: ${templateData.templateName} with summary: ${templateData.summaryHeadline}`
      );
    } catch (err) {
      console.error("Error navigating to editor:", err);
      setError("Failed to use template. Please try again.");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSummaryChange = (event) => {
    const summaryId = event.target.value;
    const summary = summaries.find((s) => s.id === summaryId);
    setSelectedSummary(summary);
    // Set the edited content immediately when summary changes
    if (summary) {
      setEditedHeadline(summary.headline || "");
      // Check for either content or summary field
      setEditedContent(summary.content || summary.summary || "");
      console.log("Selected summary:", summary);
      console.log(
        "Setting edited content to:",
        summary.content || summary.summary || ""
      );
    }
    // Reset editing state when changing summary
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Save the edited content to the selected summary
      if (selectedSummary) {
        const updatedSummary = {
          ...selectedSummary,
          headline: editedHeadline,
          content: editedContent,
        };

        // Update the summary in the summaries array
        const updatedSummaries = summaries.map((s) =>
          s.id === selectedSummary.id ? updatedSummary : s
        );

        setSummaries(updatedSummaries);
        setSelectedSummary(updatedSummary);

        // Show success message
        setSnackbar({
          open: true,
          message: "Preview changes saved successfully",
          severity: "success",
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleHeadlineChange = (event) => {
    setEditedHeadline(event.target.value);
  };

  const handleContentChange = (event) => {
    setEditedContent(event.target.value);
  };

  // Custom templates that accept content as props
  const TemplateWithContent = ({ Component, summary }) => {
    if (!summary) {
      // More informative message when no summary is selected
      return (
        <Box
          sx={{
            padding: "40px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "text.secondary",
          }}
        >
          <Typography variant="h5" gutterBottom>
            No Summary Selected
          </Typography>
          <Typography variant="body1" paragraph>
            Please select a summary from the dropdown above to preview in this
            template.
          </Typography>
          <Typography variant="body2">
            If you haven't created any summaries yet, go to the AI Summary page
            first.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/ai-summary")}
            sx={{ mt: 2 }}
          >
            Create Summary
          </Button>
        </Box>
      );
    }

    // Use edited content when editing, otherwise use summary data
    const headline = isEditing ? editedHeadline : summary.headline || "";
    const content = isEditing ? editedContent : summary.content || "";

    // Debug logging to identify content issues
    console.log("TemplateWithContent - Summary:", summary);
    console.log("TemplateWithContent - Content:", content);
    console.log("TemplateWithContent - Content type:", typeof content);
    console.log("TemplateWithContent - Edited content:", editedContent);

    // Handle different property names that might be used in the API response
    let finalContent = content;
    if (!finalContent && summary.summary) {
      finalContent = summary.summary;
      console.log("Using summary.summary instead of summary.content");
    }

    // For Template1 (Business)
    if (Component === Template1) {
      return (
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
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                value={editedHeadline}
                onChange={handleHeadlineChange}
                placeholder="Enter headline"
                sx={{ mb: 2 }}
                inputProps={{
                  style: {
                    fontSize: "28px",
                    fontWeight: "bold",
                    textAlign: "center",
                  },
                }}
              />
            ) : (
              <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "bold" }}>
                {headline || "BUSINESS"}
              </h1>
            )}
            <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
              NEWSLETTER
            </h2>
          </div>
          <div style={{ padding: "20px", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", marginBottom: "20px" }}>
              <div style={{ width: "100%" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>
                  Latest Updates
                </h2>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    variant="outlined"
                    value={editedContent}
                    onChange={handleContentChange}
                    placeholder="Enter content"
                  />
                ) : (
                  <p
                    className="par1"
                    style={{ fontSize: "15px", whiteSpace: "pre-line" }}
                  >
                    {finalContent || "No content available"}
                  </p>
                )}
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
    }

    // For Template2 (Modern Green)
    if (Component === Template2) {
      return (
        <div
          style={{
            fontFamily: "Georgia, serif",
            color: "#2E7D32",
            backgroundColor: "#E8F5E9",
            padding: "20px",
          }}
        >
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div
              style={{
                width: "100%",
                height: "50px",
                backgroundColor: "#388E3C",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                value={editedHeadline}
                onChange={handleHeadlineChange}
                placeholder="Enter headline"
                sx={{ mb: 2 }}
                inputProps={{
                  style: {
                    fontSize: "28px",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#1B5E20",
                  },
                }}
              />
            ) : (
              <h1 style={{ fontSize: "36px", color: "#1B5E20", margin: "0" }}>
                {headline || "Your title"}
              </h1>
            )}
            <p style={{ fontSize: "14px", color: "#1B5E20", margin: "5px 0" }}>
              Official newsletter
            </p>
          </div>

          <div style={{ padding: "20px 0" }}>
            <h2 style={{ fontSize: "24px", color: "#1B5E20" }}>
              Featured Content
            </h2>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                value={editedContent}
                onChange={handleContentChange}
                placeholder="Enter content"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#1B5E20",
                    },
                    "&:hover fieldset": {
                      borderColor: "#2E7D32",
                    },
                  },
                }}
              />
            ) : (
              <p
                className="par1"
                style={{
                  fontSize: "16px",
                  color: "#1B5E20",
                  whiteSpace: "pre-line",
                }}
              >
                {finalContent || "No content available"}
              </p>
            )}
          </div>
          <div style={{ padding: "20px 0", backgroundColor: "#C8E6C9" }}>
            <h3 style={{ fontSize: "18px", color: "#1B5E20" }}>
              Connect with us
            </h3>
            <div
              style={{
                padding: "10px",
                textAlign: "center",
              }}
            >
              <p style={{ margin: "0", fontSize: "12px" }}>Follow us on:</p>
              <p style={{ margin: "0", fontSize: "12px" }}>
                <a href="https://facebook.com" style={{ margin: "0 5px" }}>
                  Facebook
                </a>{" "}
                |
                <a href="https://twitter.com" style={{ margin: "0 5px" }}>
                  Twitter
                </a>{" "}
                |
                <a href="https://linkedin.com" style={{ margin: "0 5px" }}>
                  LinkedIn
                </a>
              </p>
              <p style={{ margin: "0", fontSize: "12px" }}>
                Footer information
              </p>
            </div>
          </div>
        </div>
      );
    }

    // For Template3 (Grid Layout)
    if (Component === Template3) {
      // Split the content into three sections
      const paragraphs = finalContent
        ? finalContent.split("\n\n")
        : ["", "", ""];
      const section1 = paragraphs[0] || "No content available";
      const section2 =
        paragraphs.length > 1 ? paragraphs[1] : "No content available";
      const section3 =
        paragraphs.length > 2 ? paragraphs[2] : "No content available";

      return (
        <div
          style={{
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
          `,
          }}
        >
          <div
            style={{
              gridArea: "header",
              backgroundColor: "#4a4a4a",
              color: "white",
              padding: "20px",
              textAlign: "center",
              borderRadius: "5px",
            }}
          >
            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                value={editedHeadline}
                onChange={handleHeadlineChange}
                placeholder="Enter headline"
                inputProps={{
                  style: {
                    fontSize: "28px",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "white",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "white",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "white",
                  },
                }}
              />
            ) : (
              <h1 style={{ margin: "0", fontSize: "36px", fontWeight: "bold" }}>
                {headline || "Newsletter Title"}
              </h1>
            )}
          </div>

          {isEditing ? (
            <div
              style={{
                gridArea: "section1 / section1 / section3 / section3",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "5px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  borderBottom: "2px solid #4a4a4a",
                  paddingBottom: "10px",
                }}
              >
                Content
              </h2>
              <TextField
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                value={editedContent}
                onChange={handleContentChange}
                placeholder="Enter content (separate paragraphs with blank lines for the three-column layout)"
                helperText="Content will be split into three sections based on paragraphs"
              />
            </div>
          ) : (
            <>
              <div
                style={{
                  gridArea: "section1",
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h2
                  style={{
                    borderBottom: "2px solid #4a4a4a",
                    paddingBottom: "10px",
                  }}
                >
                  Section 1
                </h2>
                <p style={{ lineHeight: "1.6" }}>{section1}</p>
              </div>

              <div
                style={{
                  gridArea: "section2",
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h2
                  style={{
                    borderBottom: "2px solid #4a4a4a",
                    paddingBottom: "10px",
                  }}
                >
                  Section 2
                </h2>
                <p style={{ lineHeight: "1.6" }}>{section2}</p>
              </div>

              <div
                style={{
                  gridArea: "section3",
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h2
                  style={{
                    borderBottom: "2px solid #4a4a4a",
                    paddingBottom: "10px",
                  }}
                >
                  Section 3
                </h2>
                <p style={{ lineHeight: "1.6" }}>{section3}</p>
              </div>
            </>
          )}

          <div
            style={{
              gridArea: "footer",
              backgroundColor: "#333",
              color: "#fff",
              padding: "15px",
              textAlign: "center",
              borderRadius: "5px",
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
            <p style={{ margin: "5px 0", fontSize: "12px" }}>
              © 2024 Your Company Name
            </p>
          </div>
        </div>
      );
    }

    // Fallback case
    return <Component />;
  };

  const TemplateSelectionView = () => (
    <>
      <Typography
        variant="h4"
        className="heading-primary"
        gutterBottom
        sx={{
          textAlign: "left",
          mb: "var(--spacing-lg)",
        }}
      >
        Newsletter Templates
      </Typography>

      <Typography variant="body1" sx={{ mb: "var(--spacing-lg)" }}>
        Choose a template format for your newsletter. You can customize colors,
        content, and layout after selection.
      </Typography>

      <Grid container spacing={4}>
        {templates.map((template) => (
          <Grid item xs={12} md={4} key={template.id}>
            <Card
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "var(--shadow-lg)",
                },
              }}
            >
              <CardActionArea onClick={() => handleTemplateSelect(template.id)}>
                <Box
                  sx={{
                    height: "200px",
                    overflow: "hidden",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <Box
                    sx={{
                      transform: "scale(0.5)",
                      transformOrigin: "top center",
                    }}
                  >
                    {React.createElement(template.component)}
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    {template.features.map((feature, idx) => (
                      <Typography
                        component="li"
                        variant="body2"
                        key={idx}
                        sx={{ mb: 0.5 }}
                      >
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );

  const TemplatePreviewView = () => {
    const ActiveTemplate = templates[selectedTemplate].component;

    return (
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "var(--spacing-lg)",
          }}
        >
          <Box>
            <Typography variant="h4" className="heading-primary">
              {templates[selectedTemplate].name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preview the template with your recent summaries
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleBackToSelection}
            sx={{
              borderColor: "var(--primary)",
              color: "var(--primary)",
              "&:hover": {
                borderColor: "var(--primary-dark)",
                backgroundColor: "rgba(var(--primary-rgb), 0.04)",
              },
            }}
          >
            Back to Templates
          </Button>
        </Box>

        <Box
          sx={{
            mb: "var(--spacing-md)",
            p: 2,
            backgroundColor: "rgba(var(--primary-rgb), 0.05)",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" paragraph>
            <strong>How it works:</strong> Select one of your saved summaries
            from the dropdown below to see how it would look in this template.
          </Typography>
          <Typography variant="body2">
            Once you've found the perfect combination, click "Use This Template"
            to proceed to the editor where you can make further customizations.
            You can also click the Edit button to make changes to the headline
            and content directly in this preview.
          </Typography>
        </Box>

        {/* Summary Selection */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: "var(--spacing-lg)",
          }}
        >
          <FormControl fullWidth sx={{ flexGrow: 1 }}>
            <InputLabel id="summary-select-label">Select a Summary</InputLabel>
            <Select
              labelId="summary-select-label"
              id="summary-select"
              value={selectedSummary?.id || ""}
              label="Select a Summary"
              onChange={handleSummaryChange}
              disabled={loading || !summaries.length || isEditing}
            >
              {summaries.length > 0 ? (
                summaries.map((summary) => (
                  <MenuItem key={summary.id} value={summary.id}>
                    {summary.headline || `Summary #${summary.id}`}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No summaries available</MenuItem>
              )}
            </Select>
          </FormControl>
          <Tooltip title="Refresh summaries list">
            <IconButton
              onClick={handleRefreshSummaries}
              disabled={loading || isEditing}
              sx={{ ml: 1 }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isEditing ? "Save changes" : "Edit content"}>
            <IconButton
              color={isEditing ? "success" : "primary"}
              onClick={handleToggleEdit}
              disabled={!selectedSummary}
              sx={{ ml: 1 }}
            >
              {isEditing ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        ) : (
          <Box
            sx={{
              border: "1px solid var(--border-color)",
              borderRadius: "var(--border-radius-md)",
              height: "auto",
              minHeight: "500px",
              mb: "var(--spacing-lg)",
              overflow: "auto",
            }}
          >
            <TemplateWithContent
              Component={ActiveTemplate}
              summary={selectedSummary}
            />
          </Box>
        )}

        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUseTemplate}
              disabled={!selectedSummary || isEditing}
              sx={{
                backgroundColor: "var(--primary)",
                "&:hover": {
                  backgroundColor: "var(--primary-dark)",
                },
              }}
            >
              Use This Template
            </Button>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "var(--bg-primary)",
        padding: "var(--spacing-xl)",
        overflowY: "auto",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: "var(--spacing-xl)",
          maxWidth: "1200px",
          margin: "0 auto",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          borderRadius: "var(--border-radius-lg)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {activeView === "selection" ? (
          <TemplateSelectionView />
        ) : (
          <TemplatePreviewView />
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Template;
