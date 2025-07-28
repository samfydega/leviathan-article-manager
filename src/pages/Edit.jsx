import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import DocumentEditor from "../components/DocumentEditor";
import ArticleExporter from "../components/ArticleExporter";

export default function Edit() {
  // Completed writing entities state (ready for editing)
  const [completedEntities, setCompletedEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState({});

  // Document editor state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState(null);

  // Loading state for re-draft actions
  const [redraftLoading, setRedraftLoading] = useState(false);

  // Section collapse state
  const [showList, setShowList] = useState(true);

  // Fetch completed writing entities (ready for editing)
  const fetchCompletedEntities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/entities/status?state=draft_writing&phase=completed"
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setCompletedEntities(data);
      setError(null);

      // Fetch progress for all completed entities
      if (data.length > 0) {
        await fetchProgressForCompletedEntities(data);
      }
    } catch (error) {
      console.error("Error fetching completed entities:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get progress for completed entities when refreshing
  const fetchProgressForCompletedEntities = async (entities) => {
    const progressPromises = entities.map(async (entity) => {
      try {
        const response = await fetch(
          `http://localhost:8000/drafts/writing/${entity.id}/progress`
        );
        if (response.ok) {
          const data = await response.json();
          return { entityId: entity.id, data };
        }
      } catch (error) {
        console.error(
          `Error fetching progress for completed entity ${entity.id}:`,
          error
        );
      }
      return { entityId: entity.id, data: null };
    });

    const progressResults = await Promise.all(progressPromises);
    const newProgressData = {};
    progressResults.forEach(({ entityId, data }) => {
      if (data) {
        newProgressData[entityId] = data;
      }
    });
    setProgressData(newProgressData);
  };

  // Fetch document content for selected entity
  const fetchDocumentContent = async (entityId) => {
    try {
      setLoadingDocument(true);
      setDocumentError(null);

      const response = await fetch(
        `http://localhost:8000/drafts/articles/${entityId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      // Parse the document data if it's in the old format
      if (data.text) {
        try {
          const parsedContent = JSON.parse(data.text);
          setDocumentContent(parsedContent);
        } catch (parseError) {
          console.error("Error parsing document content:", parseError);
          setDocumentError("Error parsing document content");
        }
      } else {
        // Assume it's already in the new format
        setDocumentContent(data);
      }
    } catch (error) {
      console.error(
        `Error fetching document content for entity ${entityId}:`,
        error
      );
      setDocumentError(error.message);
    } finally {
      setLoadingDocument(false);
    }
  };

  // Handle selecting a document
  const handleSelectDocument = (entity) => {
    setSelectedDoc(entity);
    setDocumentContent(null);
    fetchDocumentContent(entity.id);
  };

  // Handle Re-draft action
  const handleRedraft = async (entityId) => {
    setRedraftLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/drafts/${entityId}/draft-document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log(`Re-draft successful for entity ${entityId}`);
      // Refresh the document content to show the new draft
      await fetchDocumentContent(entityId);
    } catch (error) {
      console.error(`Error re-drafting for entity ${entityId}:`, error);
    } finally {
      setRedraftLoading(false);
    }
  };

  // Handle saving document changes
  const handleSaveDocument = async (updatedDocument) => {
    try {
      const response = await fetch(
        `http://localhost:8000/drafts/articles/${selectedDoc.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedDocument),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log("Document saved successfully");
      // Update the local document content
      setDocumentContent(updatedDocument);
    } catch (error) {
      console.error("Error saving document:", error);
      throw error; // Re-throw to let the DocumentEditor handle the error
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchCompletedEntities();
  }, [fetchCompletedEntities]);

  return (
    <div className="p-14">
      <h1 className="text-4xl font-playfair font-semibold text-[#554348] mb-2 tracking-tighter">
        Edit
      </h1>
      <p className="font-inter font-light">
        Edit and manage completed articles.
      </p>

      {/* Show sections list or selected document view */}
      {!selectedDoc ? (
        <>
          {/* Completed Articles Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-inter font-medium text-black tracking-tighter">
                Completed Articles ({completedEntities.length})
              </h2>
              <button
                onClick={() => setShowList(!showList)}
                className="flex items-center gap-1 px-2 py-1 text-sm font-inter text-gray-600 hover:text-gray-900 transition-colors duration-150"
              >
                {showList ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {showList ? "Hide" : "Show"}
              </button>
            </div>

            {showList && (
              <>
                {loading && (
                  <div className="flex items-center gap-2 p-4 text-gray-500 font-inter">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading completed articles...</span>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 font-inter">
                    Error loading completed articles: {error}
                  </div>
                )}

                {!loading && !error && completedEntities.length === 0 && (
                  <div className="p-4 text-gray-500 font-inter">
                    No completed articles available for editing.
                  </div>
                )}

                {!loading && !error && completedEntities.length > 0 && (
                  <div className="space-y-3">
                    {completedEntities.map((entity) => {
                      return (
                        <div
                          key={entity.id}
                          className="border border-gray-200 bg-white rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-inter font-medium text-gray-900">
                              {entity.name}
                            </span>
                            <span className="text-sm font-inter text-green-600 bg-green-50 px-2 py-1 rounded">
                              Ready for editing
                            </span>
                          </div>

                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <button
                              className="px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                              onClick={() => handleSelectDocument(entity)}
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Refresh button for completed entities */}
                <div className="mt-4 flex justify-start">
                  <button
                    onClick={fetchCompletedEntities}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Selected document content */}
          <div className="mt-4">
            {loadingDocument && (
              <div className="flex items-center gap-2 p-4 text-gray-500 font-inter">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading document content...</span>
              </div>
            )}

            {documentError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 font-inter">
                Error loading document: {documentError}
              </div>
            )}

            {!loadingDocument && !documentError && documentContent && (
              <DocumentEditor
                documentData={documentContent}
                onSave={handleSaveDocument}
                onClose={() => setSelectedDoc(null)}
                onRedraft={() => handleRedraft(selectedDoc.id)}
                redraftLoading={redraftLoading}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
