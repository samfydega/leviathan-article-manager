import { useState } from "react";
import DocumentEditor from "../components/DocumentEditor";

// Sample document data for testing
const sampleDocument = {
  id: "test-person",
  status: "drafted",
  sections: {
    early_life: {
      blocks: [
        {
          type: "heading",
          content: "Early Life",
          citations: [],
        },
        {
          type: "paragraph",
          content:
            "This is a test paragraph about early life. It contains some interesting information about the subject's background and upbringing.",
          citations: [],
        },
        {
          type: "subheading",
          content: "Education",
          citations: [],
        },
        {
          type: "paragraph",
          content:
            "The subject attended several prestigious institutions including Harvard University and Stanford University. Their academic achievements were notable.",
          citations: [
            {
              id: 1,
              start: 89,
              end: 108,
            },
            {
              id: 2,
              start: 113,
              end: 132,
            },
          ],
        },
      ],
      references: [
        {
          id: 1,
          title: "Harvard University Official Website",
          url: "https://www.harvard.edu",
          author: "Harvard University",
          publisher: "Harvard University",
          date: "2024-01-01",
        },
        {
          id: 2,
          title: "Stanford University Official Website",
          url: "https://www.stanford.edu",
          author: "Stanford University",
          publisher: "Stanford University",
          date: "2024-01-01",
        },
      ],
    },
    career: {
      blocks: [
        {
          type: "heading",
          content: "Career",
          citations: [],
        },
        {
          type: "paragraph",
          content:
            "The subject has had a distinguished career in technology and business. They founded several successful companies and served in leadership roles at major corporations.",
          citations: [],
        },
      ],
      references: [],
    },
    notable_investments: {
      blocks: [
        {
          type: "infobox",
          content: {
            title: "Notable Investments",
            columns: [
              "company_name",
              "year",
              "round",
              "amount_invested",
              "outcome",
            ],
            rows: [
              {
                company_name: "Test Company A",
                year: 2020,
                round: "Series A",
                amount_invested: "$10M",
                outcome: "IPO (2023)",
              },
              {
                company_name: "Test Company B",
                year: 2021,
                round: "Series B",
                amount_invested: "$25M",
                outcome: "Still Private",
              },
            ],
          },
        },
      ],
      references: [],
    },
    personal_life: {
      blocks: [
        {
          type: "heading",
          content: "Personal Life",
          citations: [],
        },
        {
          type: "paragraph",
          content:
            "Details about the subject's personal life are limited in publicly available sources.",
          citations: [],
        },
      ],
      references: [],
    },
    person_infobox: {
      name: "Test Person",
      born: {
        day: 15,
        month: 6,
        year: 1980,
        city: "New York",
        state: "NY",
        country: "USA",
      },
      education: [
        {
          institution: "Harvard University",
          degrees: ["BS Computer Science (2002)"],
        },
        {
          institution: "Stanford University",
          degrees: ["MS Computer Science (2004)"],
        },
      ],
      title: [
        {
          position: "CEO",
          organization: "Test Corporation",
        },
      ],
      spouse_name: "Jane Doe",
      number_of_children: 2,
    },
  },
  created_at: "2025-01-20T10:00:00.000000",
  updated_at: "2025-01-20T10:00:00.000000",
};

export default function TestDocumentEditor() {
  const [showEditor, setShowEditor] = useState(false);
  const [documentData, setDocumentData] = useState(sampleDocument);

  const handleSave = async (updatedDocument) => {
    console.log("Saving document:", updatedDocument);
    setDocumentData(updatedDocument);
    // In a real app, you would send this to your backend
    alert("Document saved successfully!");
  };

  const handleClose = () => {
    setShowEditor(false);
  };

  const handleRedraft = () => {
    console.log("Re-drafting document");
    alert("Re-draft functionality would be called here!");
  };

  return (
    <div className="p-14">
      <h1 className="text-4xl font-playfair font-semibold text-[#554348] mb-2 tracking-tighter">
        Document Editor Test
      </h1>
      <p className="font-inter font-light mb-8">
        Test the DocumentEditor component with sample data.
      </p>

      {!showEditor ? (
        <div className="space-y-4">
          <button
            onClick={() => setShowEditor(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Open Document Editor
          </button>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Sample Document Structure:
            </h3>
            <pre className="text-sm text-gray-600 overflow-auto">
              {JSON.stringify(documentData, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <DocumentEditor
          documentData={documentData}
          onSave={handleSave}
          onClose={handleClose}
          onRedraft={handleRedraft}
          redraftLoading={false}
        />
      )}
    </div>
  );
}
