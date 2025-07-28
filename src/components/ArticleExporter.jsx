import { useState, useRef } from "react";
import { Download, FileText, Camera } from "lucide-react";
import ArticleView from "./ArticleView";
import {
  exportComponentAsHTML,
  downloadHTML,
  saveHTMLToFolder,
} from "../utils/htmlExporter";
import { captureDOMAsHTML } from "../utils/domExporter";

export default function ArticleExporter({ documentData, onSwitchToEdit }) {
  const [isExporting, setIsExporting] = useState(false);
  const articleRef = useRef(null);

  const handleExport = async (exportType = "download", method = "react") => {
    if (!documentData) {
      alert("No document data available for export");
      return;
    }

    setIsExporting(true);

    try {
      let htmlContent;
      let filename = `${documentData.id}-article.html`;

      if (method === "react") {
        // Method 1: React renderToString approach
        const ArticleContentOnly = ({ documentData }) => (
          <div className="w-full bg-white">
            {/* Article Content */}
            <main className="max-w-none mx-none py-8 bg-white">
              {/* Document Title */}
              <div className="mb-4">
                <h1 className="text-4xl leading-10 tracking-tighter text-[#554348] font-semibold font-playfair mb-2">
                  {documentData.id
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </h1>
                <hr className="border-gray-300 mb-4" />
              </div>

              {/* Person Infobox */}
              {documentData.results?.person_infobox && (
                <div className="mb-8">
                  {/* Render person infobox content */}
                  <div className="border border-gray-200 bg-white rounded-lg p-4">
                    <h3 className="text-lg font-inter font-medium text-gray-700 mb-3">
                      {documentData.results.person_infobox.name ||
                        "Person Information"}
                    </h3>
                    {/* Add more person infobox rendering logic here */}
                  </div>
                </div>
              )}

              {/* Document Sections */}
              {(() => {
                const sectionOrder = [
                  "lead",
                  "early_life",
                  "career",
                  "notable_investments",
                  "personal_life",
                ];

                const orderedSections = sectionOrder
                  .filter((sectionName) => documentData.results?.[sectionName])
                  .map((sectionName) => [
                    sectionName,
                    documentData.results[sectionName],
                  ]);

                const remainingSections = Object.entries(
                  documentData.results || {}
                ).filter(
                  ([sectionName]) =>
                    sectionName !== "person_infobox" &&
                    !sectionOrder.includes(sectionName)
                );

                const allSections = [...orderedSections, ...remainingSections];

                return allSections.map(([sectionName, section]) => {
                  if (sectionName === "person_infobox") return null;

                  return (
                    <div key={sectionName} className="mb-8">
                      <div className="space-y-4">
                        {section.blocks &&
                          section.blocks.map((block, blockIndex) => (
                            <div key={blockIndex}>
                              {renderBlock(block, sectionName, blockIndex)}
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </main>
          </div>
        );

        htmlContent = exportComponentAsHTML(ArticleContentOnly, {
          documentData,
        });
        filename = `${documentData.id}-react-export.html`;
      } else if (method === "dom") {
        // Method 2: DOM capture approach
        if (!articleRef.current) {
          throw new Error(
            "Article reference not found. Please ensure the article is rendered."
          );
        }

        htmlContent = captureDOMAsHTML(articleRef.current, true);
        filename = `${documentData.id}-dom-capture.html`;
      }

      if (exportType === "download") {
        downloadHTML(htmlContent, filename);
      } else if (exportType === "save") {
        await saveHTMLToFolder(htmlContent, filename);
        alert("HTML file saved successfully!");
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to render blocks (simplified version)
  const renderBlock = (block, sectionName, blockIndex) => {
    const blockContent = block.content;
    const isContentObject =
      typeof blockContent === "object" && blockContent !== null;

    switch (block.type) {
      case "heading":
        return (
          <div className="mb-4">
            <h2 className="text-2xl font-inter font-medium text-black tracking-tighter">
              {isContentObject ? blockContent.title : blockContent}
            </h2>
            <hr className="border-gray-300 mb-4" />
          </div>
        );

      case "subheading":
        return (
          <div className="mb-3">
            <h3 className="text-lg font-inter font-medium text-gray-700">
              {isContentObject ? blockContent.title : blockContent}
            </h3>
          </div>
        );

      case "paragraph":
        return (
          <div className="mb-4">
            <p className="font-inter text-gray-900 leading-relaxed">
              {isContentObject ? blockContent.text || "" : blockContent}
            </p>
          </div>
        );

      default:
        return (
          <div className="mb-4">
            <p className="font-inter text-gray-900 leading-relaxed">
              {isContentObject ? blockContent.text || "" : blockContent}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Export buttons */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            >
              <FileText className="w-4 h-4" />
              Edit Article
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport("download", "react")}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
              title="Export using React rendering (cleaner HTML)"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Export React"}
            </button>

            <button
              onClick={() => handleExport("download", "dom")}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
              title="Export by capturing actual DOM (preserves exact styling)"
            >
              <Camera className="w-4 h-4" />
              {isExporting ? "Capturing..." : "Capture DOM"}
            </button>
          </div>
        </div>
      </div>

      {/* Article View with ref */}
      <div ref={articleRef}>
        <ArticleView
          documentData={documentData}
          onSwitchToEdit={onSwitchToEdit}
        />
      </div>
    </div>
  );
}
