import { renderToString } from "react-dom/server";
import { createElement } from "react";

// Function to capture React component as static HTML
export const exportComponentAsHTML = (component, props = {}) => {
  try {
    // Render the React component to HTML string
    const htmlString = renderToString(createElement(component, props));

    // Create a complete HTML document with necessary styles and scripts
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Article</title>
    <style>
        /* Include your CSS styles here */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* Add any additional styles your component needs */
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .text-4xl { font-size: 2.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-lg { font-size: 1.125rem; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-8 { margin-bottom: 2rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .border-b { border-bottom-width: 1px; }
        .border-gray-200 { border-color: #e5e7eb; }
        .bg-white { background-color: #ffffff; }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-[#554348] { color: #554348; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .w-full { width: 100%; }
        .max-w-none { max-width: none; }
        .mx-none { margin-left: 0; margin-right: 0; }
        .sticky { position: sticky; }
        .top-0 { top: 0; }
        .z-10 { z-index: 10; }
        .mt-8 { margin-top: 2rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .border-gray-300 { border-color: #d1d5db; }
        .border { border-width: 1px; }
        .rounded-md { border-radius: 0.375rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .py-1.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
        .text-sm { font-size: 0.875rem; }
        .transition-colors { transition-property: color, background-color, border-color; }
        .duration-150 { transition-duration: 150ms; }
        .hover\\:bg-gray-50:hover { background-color: #f9fafb; }
        .leading-10 { line-height: 2.5rem; }
        
        /* Add more styles as needed for your specific components */
    </style>
</head>
<body>
    ${htmlString}
</body>
</html>`;

    return fullHTML;
  } catch (error) {
    console.error("Error exporting component as HTML:", error);
    throw error;
  }
};

// Function to download the HTML as a file
export const downloadHTML = (
  htmlContent,
  filename = "exported-article.html"
) => {
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// Function to save HTML to a specific folder (requires backend support)
export const saveHTMLToFolder = async (
  htmlContent,
  filename = "exported-article.html"
) => {
  try {
    const response = await fetch("/api/export-html", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        filename: filename,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save HTML file");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error saving HTML to folder:", error);
    throw error;
  }
};
