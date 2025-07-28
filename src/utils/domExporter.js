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
    <style>
        /* Base styles for better rendering */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
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
