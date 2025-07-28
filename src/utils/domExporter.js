// Function to capture the actual rendered DOM and convert to HTML
export const captureDOMAsHTML = (selector = "body", includeStyles = true) => {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found`);
    }

    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true);

    // Remove any interactive elements or scripts
    const interactiveElements = clonedElement.querySelectorAll(
      "button, input, select, textarea, script, [onclick], [onchange]"
    );
    interactiveElements.forEach((el) => {
      if (el.tagName === "SCRIPT") {
        el.remove();
      } else {
        // Remove event handlers but keep the element
        el.removeAttribute("onclick");
        el.removeAttribute("onchange");
        el.removeAttribute("oninput");
        el.removeAttribute("onfocus");
        el.removeAttribute("onblur");
      }
    });

    // Get computed styles for the element and its children
    const getComputedStyles = (el) => {
      const styles = window.getComputedStyle(el);
      const styleArray = [];

      for (let i = 0; i < styles.length; i++) {
        const property = styles[i];
        const value = styles.getPropertyValue(property);
        if (value && value !== "initial" && value !== "normal") {
          styleArray.push(`${property}: ${value};`);
        }
      }

      return styleArray.join(" ");
    };

    // Apply computed styles as inline styles
    const applyInlineStyles = (el) => {
      const styles = getComputedStyles(el);
      if (styles) {
        el.setAttribute("style", styles);
      }

      // Recursively apply to children
      Array.from(el.children).forEach((child) => {
        applyInlineStyles(child);
      });
    };

    if (includeStyles) {
      applyInlineStyles(clonedElement);
    }

    // Create a complete HTML document
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Captured Content</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        /* Base styles */
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        
        /* Typography */
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .font-light { font-weight: 300; }
        
        /* Spacing */
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-8 { margin-top: 2rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .py-1.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        
        /* Layout */
        .w-full { width: 100%; }
        .max-w-none { max-width: none; }
        .mx-none { margin-left: 0; margin-right: 0; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        
        /* Colors */
        .bg-white { background-color: #ffffff; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-700 { color: #374151; }
        .text-gray-900 { color: #111827; }
        .text-[#554348] { color: #554348; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-gray-300 { border-color: #d1d5db; }
        
        /* Borders */
        .border { border-width: 1px; }
        .border-b { border-bottom-width: 1px; }
        .border-t { border-top-width: 1px; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-md { border-radius: 0.375rem; }
        
        /* Typography utilities */
        .tracking-tighter { letter-spacing: -0.05em; }
        .leading-10 { line-height: 2.5rem; }
        .leading-relaxed { line-height: 1.625; }
        
        /* Interactive elements */
        .transition-colors { transition-property: color, background-color, border-color; }
        .duration-150 { transition-duration: 150ms; }
        .hover\\:bg-gray-50:hover { background-color: #f9fafb; }
        
        /* Specific component styles */
        .border-gray-100 { border-color: #f3f4f6; }
        
        /* InfoBox styles */
        .infobox {
            border: 1px solid #e5e7eb;
            background-color: #ffffff;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 2rem;
        }
        
        .infobox-row {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }
        
        .infobox-label {
            font-weight: 500;
            color: #374151;
            min-width: 80px;
            flex-shrink: 0;
        }
        
        .infobox-value {
            color: #111827;
            flex: 1;
        }
        
        /* Reference link styles */
        .reference-link {
            color: #2563eb;
            text-decoration: underline;
            font-size: 0.875rem;
        }
        
        /* Divider */
        hr {
            border: none;
            border-top: 1px solid #d1d5db;
            margin: 1rem 0;
        }
        
        /* References section */
        .references {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
        }
        
        .references h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #111827;
        }
        
        .reference-item {
            margin-bottom: 0.75rem;
            padding-left: 1rem;
        }
        
        .reference-number {
            font-weight: 500;
            color: #2563eb;
        }
        
        /* Table styles */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        
        .table th,
        .table td {
            border: 1px solid #e5e7eb;
            padding: 0.75rem;
            text-align: left;
        }
        
        .table th {
            background-color: #f9fafb;
            font-weight: 600;
        }
        
        /* Ensure images are properly sized */
        img {
            max-width: 100%;
            height: auto;
        }
        
        /* Remove any remaining interactive styles */
        button, input, select, textarea {
            pointer-events: none;
            user-select: none;
        }
    </style>
</head>
<body>
    ${clonedElement.outerHTML}
</body>
</html>`;

    return htmlContent;
  } catch (error) {
    console.error("Error capturing DOM as HTML:", error);
    throw error;
  }
};

// Function to capture a specific React component's DOM
export const captureReactComponentAsHTML = (
  componentRef,
  includeStyles = true
) => {
  if (!componentRef || !componentRef.current) {
    throw new Error("Component reference is required");
  }

  return captureDOMAsHTML(componentRef.current, includeStyles);
};

// Function to capture the entire page
export const capturePageAsHTML = (includeStyles = true) => {
  return captureDOMAsHTML("body", includeStyles);
};

// Function to capture just the main content area
export const captureMainContentAsHTML = (includeStyles = true) => {
  return captureDOMAsHTML("main", includeStyles);
};
