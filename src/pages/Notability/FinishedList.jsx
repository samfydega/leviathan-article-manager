import { useState, useEffect } from "react";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Archive,
} from "lucide-react";

export default function FinishedList({ entities, onStatusUpdate }) {
  const [entityData, setEntityData] = useState({}); // Stores both notability and sources
  const [loadingData, setLoadingData] = useState({});
  const [dataErrors, setDataErrors] = useState({});
  const [expandedPanel, setExpandedPanel] = useState({});
  // Selected document type per entity for drafting (person or company)
  const [docTypes, setDocTypes] = useState({});
  // Error messages for draft action per entity
  const [draftErrors, setDraftErrors] = useState({});
  // Loading state for draft actions per entity
  const [draftLoading, setDraftLoading] = useState({});
  // Loading state for archive actions per entity
  const [archiveLoading, setArchiveLoading] = useState({});

  // Function to extract context around entity name
  const getEntityContext = (entityName, context) => {
    const index = context.toLowerCase().indexOf(entityName.toLowerCase());

    if (index === -1)
      return {
        before: "",
        entity: entityName,
        after: "",
      };

    // Calculate context boundaries (100 chars max on each side)
    const contextStart = Math.max(0, index - 100);
    const contextEnd = Math.min(
      context.length,
      index + entityName.length + 100
    );

    // Check if we truncated text (need ellipses)
    const truncatedLeft = index - 100 > 0;
    const truncatedRight = index + entityName.length + 100 < context.length;

    let before = context.substring(contextStart, index);
    const entity = context.substring(index, index + entityName.length);
    let after = context.substring(index + entityName.length, contextEnd);

    // Add ellipses if we truncated
    if (truncatedLeft) before = "..." + before;
    if (truncatedRight) after = after + "...";

    return { before, entity, after };
  };

  // Helper function to generate Wikipedia URL
  const getWikipediaUrl = (entityName) => {
    const formattedName = entityName.replace(/\s+/g, "_");
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(formattedName)}`;
  };

  // Function to fetch notability data and sources for an entity
  const fetchEntityData = async (entityId) => {
    if (loadingData[entityId] || entityData[entityId]) return;

    try {
      setLoadingData((prev) => ({ ...prev, [entityId]: true }));

      const response = await fetch(
        `http://localhost:8000/notability/${entityId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setEntityData((prev) => ({
        ...prev,
        [entityId]: {
          is_notable: data.is_notable,
          sources: data.sources || [],
        },
      }));
      setDataErrors((prev) => ({ ...prev, [entityId]: null }));
    } catch (error) {
      console.error(`Error fetching data for entity ${entityId}:`, error);
      setDataErrors((prev) => ({ ...prev, [entityId]: error.message }));
    } finally {
      setLoadingData((prev) => ({ ...prev, [entityId]: false }));
    }
  };

  // Get meets standards color and icon
  const getMeetsStandardsIndicator = (meetsStandards) => {
    if (meetsStandards) {
      return {
        color: "text-green-600",
        bgColor: "bg-green-50",
        icon: CheckCircle,
        text: "Meets Standards",
      };
    } else {
      return {
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: XCircle,
        text: "Doesn't Meet Standards",
      };
    }
  };

  // Handle toggling document type selection (single select only)
  const handleDocTypeChange = (entityId, type) => {
    setDocTypes((prev) => ({
      ...prev,
      [entityId]: type,
    }));
    setDraftErrors((prev) => ({ ...prev, [entityId]: null }));
  };

  // Handle Archive action
  const handleArchive = async (entityId) => {
    setArchiveLoading((prev) => ({ ...prev, [entityId]: true }));

    try {
      const response = await fetch(
        `http://localhost:8000/entities/${entityId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: entityId,
            status: {
              phase: null,
              state: "archived",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log(`Entity ${entityId} archived to backlog`);
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error(`Error archiving entity ${entityId}:`, error);
    } finally {
      setArchiveLoading((prev) => ({ ...prev, [entityId]: false }));
    }
  };

  // Handle Draft Article action with validation
  const handleDraft = async (entityId) => {
    const selectedType = docTypes[entityId];
    if (!selectedType) {
      setDraftErrors((prev) => ({
        ...prev,
        [entityId]: "Choose one of the options.",
      }));
      return;
    }

    setDraftErrors((prev) => ({ ...prev, [entityId]: null }));
    setDraftLoading((prev) => ({ ...prev, [entityId]: true }));

    try {
      // First, update entity status for draft
      const entityResponse = await fetch(
        `http://localhost:8000/entities/${entityId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: entityId,
            status: {
              phase: "queued",
              state: "draft_research",
            },
          }),
        }
      );

      if (!entityResponse.ok) {
        throw new Error(
          `HTTP ${entityResponse.status}: ${await entityResponse.text()}`
        );
      }

      // Then, call the drafts endpoint
      const draftResponse = await fetch(`http://localhost:8000/drafts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: entityId,
          type: selectedType,
        }),
      });

      if (!draftResponse.ok) {
        throw new Error(
          `HTTP ${draftResponse.status}: ${await draftResponse.text()}`
        );
      }

      // On success, refresh the parent data to update the entity list
      console.log(
        `Draft article successful for entity ${entityId} as ${selectedType}`
      );
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error(`Error drafting article for entity ${entityId}:`, error);
      setDraftErrors((prev) => ({ ...prev, [entityId]: error.message }));
    } finally {
      setDraftLoading((prev) => ({ ...prev, [entityId]: false }));
    }
  };

  // Toggle between showing 'notability' or 'sources' panel; mutually exclusive
  const handleTogglePanel = (entityId, panel) => {
    const current = expandedPanel[entityId];
    const isOpening = current !== panel;
    if (isOpening) {
      fetchEntityData(entityId);
    }
    setExpandedPanel((prev) => ({
      ...prev,
      [entityId]: isOpening ? panel : null,
    }));
    setDraftErrors((prev) => ({ ...prev, [entityId]: null }));
  };

  return (
    <div className="space-y-4">
      {entities.map((entity) => {
        const context = getEntityContext(entity.name, entity.context);
        const panel = expandedPanel[entity.id];
        const showSources = panel === "sources";
        const showNotability = panel === "notability";
        const entityInfo = entityData[entity.id];
        const sources = entityInfo?.sources || [];
        const isLoading = loadingData[entity.id];
        const error = dataErrors[entity.id];

        return (
          <div
            key={entity.id}
            className="border border-gray-200 bg-white rounded-lg p-4 transition-all duration-200"
          >
            {/* Entity header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-inter font-medium text-gray-900">
                  {entity.name}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={getWikipediaUrl(entity.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors duration-150"
                    title={`Search Wikipedia for "${entity.name}"`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Panel tabs */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => handleTogglePanel(entity.id, "notability")}
                >
                  Notability
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => handleTogglePanel(entity.id, "sources")}
                >
                  Sources
                </button>
              </div>
            </div>

            {/* Context snippet */}
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm font-inter leading-relaxed">
              <span className="text-gray-600">{context.before}</span>
              <span className="bg-yellow-200 font-medium text-gray-900 px-1 rounded">
                {context.entity}
              </span>
              <span className="text-gray-600">{context.after}</span>
            </div>

            {/* Notability Status */}
            {showNotability && (
              <div className="mb-4">
                {isLoading ? (
                  // Loading notability data
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm font-inter">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-blue-700">
                      Loading notability data...
                    </span>
                  </div>
                ) : error ? (
                  // Error loading notability data
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm font-inter">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-700">
                      Error loading notability data: {error}
                    </span>
                  </div>
                ) : entityInfo ? (
                  // Notability data loaded
                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 p-3 rounded text-sm font-inter ${
                        entityInfo.is_notable
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {entityInfo.is_notable ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-700">
                            Meets Notability Standards
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-700">
                            Does Not Meet Notability Standards
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          onClick={() => handleDraft(entity.id)}
                          disabled={draftLoading[entity.id]}
                        >
                          {draftLoading[entity.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          Draft
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          onClick={() => handleArchive(entity.id)}
                          disabled={archiveLoading[entity.id]}
                        >
                          {archiveLoading[entity.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                          Archive
                        </button>
                      </div>

                      {/* Type selection (single choice) */}
                      <div className="flex items-center gap-6">
                        {[
                          "venture_capitalist",
                          // "startup_founder",
                          // "startup_company",
                          "venture_firm",
                        ].map((type) => (
                          <label
                            key={type}
                            className="inline-flex items-center gap-1"
                          >
                            <input
                              type="radio"
                              name={`docType-${entity.id}`}
                              value={type}
                              checked={docTypes[entity.id] === type}
                              onChange={() =>
                                handleDocTypeChange(entity.id, type)
                              }
                              className="form-radio"
                            />
                            <span className="text-sm font-inter text-gray-700">
                              {type
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </div>
                      {draftErrors[entity.id] && (
                        <div className="text-red-600 text-sm">
                          {draftErrors[entity.id]}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // No data loaded yet
                  <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm font-inter">
                    <span className="text-gray-700">
                      Click "Notability" to load notability data
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Sources section */}
            {showSources && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                {isLoading && (
                  <div className="text-center py-4 text-gray-500 font-inter">
                    Loading sources...
                  </div>
                )}

                {error && (
                  <div className="text-center py-4 text-red-600 font-inter">
                    Error loading sources: {error}
                  </div>
                )}

                {!isLoading && !error && sources.length === 0 && (
                  <div className="text-center py-4 text-gray-500 font-inter">
                    No sources found
                  </div>
                )}

                {!isLoading && !error && sources.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-inter font-medium text-gray-900 mb-3">
                      Research Sources ({sources.length})
                    </h4>

                    {sources.map((source, index) => {
                      const meetsStandards = getMeetsStandardsIndicator(
                        source.meets_standards
                      );
                      const MeetsStandardsIcon = meetsStandards.icon;

                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow duration-150"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              {source.page_title}
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${meetsStandards.color} ${meetsStandards.bgColor}`}
                            >
                              <MeetsStandardsIcon className="w-3 h-3" />
                              {meetsStandards.text}
                            </div>
                          </div>

                          <div className="text-sm text-gray-600 font-inter mt-2">
                            <div className="font-medium mb-1">Explanation:</div>
                            <div className="leading-relaxed">
                              {source.explanation}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
