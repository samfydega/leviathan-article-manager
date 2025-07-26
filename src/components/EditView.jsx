import { useState, useEffect } from "react";
import { Save, X, Eye } from "lucide-react";

export default function EditView({
  documentData,
  onSave,
  onClose,
  onSwitchToView,
}) {
  // Define the correct order for sections
  const getSectionOrder = () => [
    "lead",
    "early_life",
    "career",
    "notable_investments",
    "personal_life",
  ];
  const [document, setDocument] = useState(null);
  const [saving, setSaving] = useState(false);

  // Initialize document
  useEffect(() => {
    if (documentData) {
      setDocument(documentData);
    }
  }, [documentData]);

  // Handle saving the document
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(document);
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle content editing
  const handleContentEdit = (sectionName, blockIndex, newContent) => {
    setDocument((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionName]: {
          ...prev.sections[sectionName],
          blocks: prev.sections[sectionName].blocks.map((block, index) =>
            index === blockIndex ? { ...block, content: newContent } : block
          ),
        },
      },
    }));
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Edit Document
            </h1>
            <p className="text-sm text-gray-500">{document.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToView}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Edit Content */}
      <div className="max-w-none mx-auto py-8 px-2 bg-white">
        {/* Document Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Title
          </label>
          <input
            type="text"
            value={document.id}
            onChange={(e) =>
              setDocument((prev) => ({ ...prev, id: e.target.value }))
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Document Sections */}
        {(() => {
          const sectionOrder = getSectionOrder();
          const orderedSections = sectionOrder
            .filter((sectionName) => document.sections[sectionName])
            .map((sectionName) => [
              sectionName,
              document.sections[sectionName],
            ]);

          // Add any remaining sections that aren't in the predefined order
          const remainingSections = Object.entries(document.sections).filter(
            ([sectionName]) =>
              sectionName !== "person_infobox" &&
              !sectionOrder.includes(sectionName)
          );

          const allSections = [...orderedSections, ...remainingSections];

          return allSections.map(([sectionName, section]) => {
            // Skip person_infobox for now (can add later if needed)
            if (sectionName === "person_infobox") return null;

            return (
              <div key={sectionName} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {sectionName.replace(/_/g, " ")}
                </h3>
                <div className="space-y-4">
                  {section.blocks &&
                    section.blocks.map((block, blockIndex) => (
                      <div
                        key={blockIndex}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {block.type}
                          </span>
                        </div>
                        <textarea
                          value={
                            typeof block.content === "object"
                              ? block.content.text || block.content.title || ""
                              : block.content || ""
                          }
                          onChange={(e) =>
                            handleContentEdit(
                              sectionName,
                              blockIndex,
                              e.target.value
                            )
                          }
                          className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                          placeholder={`Enter ${block.type} content...`}
                        />
                        {block.citations && block.citations.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            Citations:{" "}
                            {block.citations.map((c) => c.id).join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
