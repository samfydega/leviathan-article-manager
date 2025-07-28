import { useState } from "react";
import ArticleExporter from "../components/ArticleExporter";

// Example usage of the ArticleExporter component
export default function ExportExample() {
  const [documentData, setDocumentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Example document data structure (matching your new schema)
  const exampleDocumentData = {
    id: "brett-gibson",
    type: "venture_capitalist",
    statuses: {
      early_life_id: "openai_response_id_1",
      career_id: "openai_response_id_2",
      notable_investments_id: "openai_response_id_3",
      personal_life_id: "openai_response_id_4",
      person_infobox_id: "openai_response_id_5",
      lead_id: "openai_response_id_6",
    },
    results: {
      early_life: {
        blocks: [
          {
            type: "heading",
            content: "Early Life and Education",
          },
          {
            type: "paragraph",
            content:
              "Brett Gibson was born in San Francisco, California in 1985. He attended Stanford University where he studied computer science and graduated with honors in 2007.",
            citations: [{ id: 1 }],
          },
        ],
        references: [
          {
            id: 1,
            title: "Stanford University Alumni Directory",
            url: "https://alumni.stanford.edu",
            author: "Stanford University",
            publisher: "Stanford University",
            date: "2023",
          },
        ],
      },
      career: {
        blocks: [
          {
            type: "heading",
            content: "Professional Career",
          },
          {
            type: "paragraph",
            content:
              "After graduating from Stanford, Gibson joined Google as a software engineer where he worked on various projects including Google Maps and Google Search.",
            citations: [{ id: 2 }],
          },
        ],
        references: [
          {
            id: 2,
            title: "Brett Gibson LinkedIn Profile",
            url: "https://linkedin.com/in/brett-gibson",
            author: "Brett Gibson",
            publisher: "LinkedIn",
            date: "2023",
          },
        ],
      },
      person_infobox: {
        blocks: [
          {
            type: "paragraph",
            content: {
              name: "Brett Gibson",
              born: {
                year: "1985",
                city: "San Francisco",
                country: "United States",
              },
              education: [
                {
                  institution: "Stanford University",
                  degrees: ["Bachelor of Science in Computer Science"],
                },
              ],
              title: [
                {
                  position: "Managing Partner",
                  organization: "Founders Fund",
                },
              ],
            },
          },
        ],
        references: [],
      },
    },
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T14:45:00Z",
  };

  const handleSwitchToEdit = () => {
    console.log("Switching to edit mode");
    // Your edit mode logic here
  };

  const loadExampleData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDocumentData(exampleDocumentData);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Article Export Example</h1>

      {!documentData ? (
        <div className="text-center">
          <button
            onClick={loadExampleData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load Example Article"}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 p-4 bg-gray-100 rounded-md">
            <h2 className="font-semibold mb-2">Export Options:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong>Export React:</strong> Uses React's renderToString to
                generate clean HTML
              </li>
              <li>
                <strong>Capture DOM:</strong> Captures the actual rendered DOM
                with computed styles
              </li>
              <li>
                Both methods will download an HTML file that you can open in any
                browser
              </li>
            </ul>
          </div>

          <ArticleExporter
            documentData={documentData}
            onSwitchToEdit={handleSwitchToEdit}
          />
        </div>
      )}
    </div>
  );
}
