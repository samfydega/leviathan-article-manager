import { useState, useEffect } from "react";
import { Loader2, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import DocumentEditor from "../components/DocumentEditor";

export default function Draft() {
  // Drafting entities state
  const [draftingEntities, setDraftingEntities] = useState([]);
  const [loadingDrafting, setLoadingDrafting] = useState(true);
  const [draftingError, setDraftingError] = useState(null);
  const [progressData, setProgressData] = useState({});

  // Drafted entities state
  const [draftedEntities, setDraftedEntities] = useState([]);
  const [loadingDrafted, setLoadingDrafted] = useState(true);
  const [draftedError, setDraftedError] = useState(null);

  // Section collapse states
  const [researchingCollapsed, setResearchingCollapsed] = useState(false);
  const [draftsCollapsed, setDraftsCollapsed] = useState(false);

  // Loading state for draft into document actions per entity
  const [draftDocumentLoading, setDraftDocumentLoading] = useState({});
  // Loading state for re-draft actions
  const [redraftLoading, setRedraftLoading] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState(null);

  // Fetch drafting entities
  const fetchDraftingEntities = async () => {
    try {
      setLoadingDrafting(true);
      const response = await fetch(
        "http://localhost:8000/entities?status=drafting_sections"
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setDraftingEntities(data);
      setDraftingError(null);

      // Fetch progress for all entities
      if (data.length > 0) {
        await fetchProgressForEntities(data);
      }
    } catch (error) {
      console.error("Error fetching drafting entities:", error);
      setDraftingError(error.message);
    } finally {
      setLoadingDrafting(false);
    }
  };

  // Fetch drafted entities
  const fetchDraftedEntities = async () => {
    try {
      setLoadingDrafted(true);
      const response = await fetch(
        "http://localhost:8000/entities?status=drafted_sections"
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setDraftedEntities(data);
      setDraftedError(null);
    } catch (error) {
      console.error("Error fetching drafted entities:", error);
      setDraftedError(error.message);
    } finally {
      setLoadingDrafted(false);
    }
  };

  // Get progress for drafting entities when refreshing
  const fetchProgressForEntities = async (entities) => {
    const progressPromises = entities.map(async (entity) => {
      try {
        const response = await fetch(
          `http://localhost:8000/drafts/${entity.id}/check-progress`
        );
        if (response.ok) {
          const data = await response.json();
          return { entityId: entity.id, data };
        }
      } catch (error) {
        console.error(
          `Error fetching progress for entity ${entity.id}:`,
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

  // Handle Draft into Document action
  const handleDraftIntoDocument = async (entityId) => {
    setDraftDocumentLoading((prev) => ({ ...prev, [entityId]: true }));

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

      console.log(`Draft into document successful for entity ${entityId}`);
      // Refresh both lists since the entity might move to drafted status
      await fetchDraftingEntities();
      await fetchDraftedEntities();
    } catch (error) {
      console.error(
        `Error drafting into document for entity ${entityId}:`,
        error
      );
    } finally {
      setDraftDocumentLoading((prev) => ({ ...prev, [entityId]: false }));
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchDraftingEntities();
    fetchDraftedEntities();
  }, []);

  return (
    <div className="p-14">
      <h1 className="text-4xl font-playfair font-semibold text-[#554348] mb-2 tracking-tighter">
        Drafts
      </h1>
      <p className="font-inter font-light">Manage your draft documents here.</p>

      {/* Show sections list or selected document view */}
      {!selectedDoc ? (
        <>
          {/* Drafting Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-inter font-medium text-black">
                Researching Sections
              </h2>
              <button
                onClick={() => setResearchingCollapsed(!researchingCollapsed)}
                className="flex items-center gap-1 px-2 py-1 text-sm font-inter text-gray-600 hover:text-gray-900 transition-colors duration-150"
              >
                {researchingCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {researchingCollapsed ? "Show" : "Hide"}
              </button>
            </div>

            {!researchingCollapsed && (
              <>
                {loadingDrafting && (
                  <div className="flex items-center gap-2 p-4 text-gray-500 font-inter">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading drafting entities...</span>
                  </div>
                )}

                {draftingError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 font-inter">
                    Error loading drafting entities: {draftingError}
                  </div>
                )}

                {!loadingDrafting &&
                  !draftingError &&
                  draftingEntities.length === 0 && (
                    <div className="p-4 text-gray-500 font-inter">
                      No entities currently being drafted.
                    </div>
                  )}

                {!loadingDrafting &&
                  !draftingError &&
                  draftingEntities.length > 0 && (
                    <div className="space-y-3">
                      {draftingEntities.map((entity) => {
                        const progress = progressData[entity.id];
                        return (
                          <div
                            key={entity.id}
                            className="border border-gray-200 bg-white rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-inter font-medium text-gray-900">
                                {entity.name}
                              </span>
                              {progress && (
                                <span className="text-sm font-inter text-gray-500">
                                  {progress.completed_sections}/
                                  {progress.total_sections} sections
                                </span>
                              )}
                            </div>

                            {progress ? (
                              <div className="space-y-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${progress.progress_percentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs font-inter text-gray-600">
                                  <span>
                                    {progress.progress_percentage.toFixed(1)}%
                                    complete
                                  </span>
                                  <span>
                                    {progress.pending_sections} pending
                                  </span>
                                </div>

                                {progress.is_complete && (
                                  <div className="mt-3 pt-2 border-t border-gray-100">
                                    <button
                                      className="px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                      onClick={() =>
                                        handleDraftIntoDocument(entity.id)
                                      }
                                      disabled={draftDocumentLoading[entity.id]}
                                    >
                                      {draftDocumentLoading[entity.id] && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      )}
                                      Draft into document
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm font-inter text-gray-500">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Loading progress...</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                {/* Refresh button */}
                <div className="mt-4 flex justify-start">
                  <button
                    onClick={fetchDraftingEntities}
                    disabled={loadingDrafting}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        loadingDrafting ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Drafted Sections */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-inter font-medium text-black">
                Drafts
              </h2>
              <button
                onClick={() => setDraftsCollapsed(!draftsCollapsed)}
                className="flex items-center gap-1 px-2 py-1 text-sm font-inter text-gray-600 hover:text-gray-900 transition-colors duration-150"
              >
                {draftsCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {draftsCollapsed ? "Show" : "Hide"}
              </button>
            </div>

            {!draftsCollapsed && (
              <>
                {loadingDrafted && (
                  <div className="flex items-center gap-2 p-4 text-gray-500 font-inter">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading drafted entities...</span>
                  </div>
                )}

                {draftedError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 font-inter">
                    Error loading drafted entities: {draftedError}
                  </div>
                )}

                {!loadingDrafted &&
                  !draftedError &&
                  draftedEntities.length === 0 && (
                    <div className="p-4 text-gray-500 font-inter">
                      No drafted entities available.
                    </div>
                  )}

                {!loadingDrafted &&
                  !draftedError &&
                  draftedEntities.length > 0 && (
                    <div className="space-y-3">
                      {draftedEntities.map((entity) => (
                        <div
                          key={entity.id}
                          className="border border-gray-200 bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                          onClick={() => handleSelectDocument(entity)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-inter font-medium text-gray-900">
                              {entity.name}
                            </span>
                            <span className="text-sm font-inter text-green-600 bg-green-50 px-2 py-1 rounded">
                              Ready for editing
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Refresh button for drafted entities */}
                <div className="mt-4 flex justify-start">
                  <button
                    onClick={fetchDraftedEntities}
                    disabled={loadingDrafted}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        loadingDrafted ? "animate-spin" : ""
                      }`}
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
