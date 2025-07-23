import { useState, useEffect, useRef } from "react";
import { ExternalLink, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function FinishedList({ entities, onStatusUpdate }) {
  const [entitySources, setEntitySources] = useState({});
  const [loadingSources, setLoadingSources] = useState({});
  const [sourceErrors, setSourceErrors] = useState({});
  const [expandedEntities, setExpandedEntities] = useState({});
  const notabilityPollIntervals = useRef(new Map());

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

  // Function to fetch sources for an entity
  const fetchEntitySources = async (entityId) => {
    if (loadingSources[entityId] || entitySources[entityId]) return;

    try {
      setLoadingSources(prev => ({ ...prev, [entityId]: true }));
      
      const response = await fetch(`http://localhost:8000/notability/${entityId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setEntitySources(prev => ({ ...prev, [entityId]: data.sources || [] }));
      setSourceErrors(prev => ({ ...prev, [entityId]: null }));
    } catch (error) {
      console.error(`Error fetching sources for entity ${entityId}:`, error);
      setSourceErrors(prev => ({ ...prev, [entityId]: error.message }));
    } finally {
      setLoadingSources(prev => ({ ...prev, [entityId]: false }));
    }
  };

  // Toggle entity expansion and fetch sources if needed
  const toggleEntity = (entityId) => {
    const isExpanded = expandedEntities[entityId];
    setExpandedEntities(prev => ({ ...prev, [entityId]: !isExpanded }));
    
    if (!isExpanded) {
      fetchEntitySources(entityId);
    }
  };

  // Get reliability color and icon
  const getReliabilityIndicator = (reliability) => {
    switch (reliability) {
      case "HIGH_QUALITY":
        return { color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle };
      case "MIXED":
        return { color: "text-yellow-600", bgColor: "bg-yellow-50", icon: AlertTriangle };
      case "QUESTIONABLE":
      case "UNRELIABLE":
        return { color: "text-red-600", bgColor: "bg-red-50", icon: XCircle };
      default:
        return { color: "text-gray-600", bgColor: "bg-gray-50", icon: AlertTriangle };
    }
  };

  // Function to poll notability status for entities with null notability values
  const pollNotabilityStatus = async (entityId) => {
    try {
      const response = await fetch("http://localhost:8000/notability/notability/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: entityId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Notability polling response for entity ${entityId}:`, data);
        
        // If notability is completed, trigger a status update to refresh the parent data
        if (data.status === 'completed') {
          console.log(`Notability completed for entity ${entityId}. API returned:`, {
            notability_status: data.notability_status,
            rationale: data.rationale
          });
          console.log('Refreshing parent data to get updated entity with notability_status and notability_rationale fields...');
          
          // Refresh the parent data to get updated entity information
          if (onStatusUpdate) {
            onStatusUpdate();
          }
        }
      } else {
        console.log(`Notability polling failed for entity ${entityId}:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error(`Error polling notability status for entity ${entityId}:`, error);
    }
  };

  // Check if entity needs notability polling (has null notability_status or notability_rationale)
  const needsNotabilityPolling = (entity) => {
    return entity.notability_status === null || entity.notability_status === undefined || 
           entity.notability_rationale === null || entity.notability_rationale === undefined;
  };

  // Start notability polling for entities that need it
  useEffect(() => {
    entities.forEach((entity) => {
      if (needsNotabilityPolling(entity)) {
        // Only start polling if not already polling this entity
        if (!notabilityPollIntervals.current.has(entity.id)) {
          const intervalId = setInterval(() => {
            pollNotabilityStatus(entity.id);
          }, 10000); // Poll every 10 seconds

          notabilityPollIntervals.current.set(entity.id, intervalId);
        }
      } else {
        // Stop polling if notability is determined
        const intervalId = notabilityPollIntervals.current.get(entity.id);
        if (intervalId) {
          clearInterval(intervalId);
          notabilityPollIntervals.current.delete(entity.id);
        }
      }
    });

    // Cleanup function to clear intervals for entities no longer in the list
    return () => {
      const currentEntityIds = new Set(entities.map(e => e.id));
      
      for (const [entityId, intervalId] of notabilityPollIntervals.current.entries()) {
        if (!currentEntityIds.has(entityId)) {
          clearInterval(intervalId);
          notabilityPollIntervals.current.delete(entityId);
        }
      }
    };
  }, [entities, onStatusUpdate]);

  // Cleanup all notability polling intervals on unmount
  useEffect(() => {
    return () => {
      for (const intervalId of notabilityPollIntervals.current.values()) {
        clearInterval(intervalId);
      }
      notabilityPollIntervals.current.clear();
    };
  }, []);

  return (
    <div className="space-y-4">
      {entities.map((entity) => {
        const context = getEntityContext(entity.name, entity.context);
        const isExpanded = expandedEntities[entity.id];
        const sources = entitySources[entity.id] || [];
        const isLoading = loadingSources[entity.id];
        const error = sourceErrors[entity.id];

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
              
              {/* Expand/Collapse button */}
              <button
                onClick={() => toggleEntity(entity.id)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150"
              >
                {isExpanded ? "Hide Sources" : "Show Sources"}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
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
            <div className="mb-4">
              {needsNotabilityPolling(entity) ? (
                // Still determining notability
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm font-inter">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-blue-700">Determining notability...</span>
                </div>
              ) : (
                // Notability determined
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 p-3 rounded text-sm font-inter ${
                    entity.notability_status === "exceeds" 
                      ? "bg-green-50 border border-green-200" 
                      : entity.notability_status === "meets"
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-red-50 border border-red-200"
                  }`}>
                    {entity.notability_status === "exceeds" ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700">Exceeds Notability</span>
                      </>
                    ) : entity.notability_status === "meets" ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-700">Meets Notability</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-700">Fails Notability</span>
                      </>
                    )}
                  </div>
                  
                  {entity.notability_rationale && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm font-inter leading-relaxed">
                      <span className="font-medium text-gray-700">Rationale:</span>
                      <p className="mt-1 text-gray-600">{entity.notability_rationale}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sources section */}
            {isExpanded && (
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
                      const reliability = getReliabilityIndicator(source.reliability);
                      const ReliabilityIcon = reliability.icon;

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
                            
                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${reliability.color} ${reliability.bgColor}`}>
                              <ReliabilityIcon className="w-3 h-3" />
                              {source.reliability.replace('_', ' ')}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 font-inter">
                            <div><span className="font-medium">Published:</span> {source.publish_date}</div>
                            <div><span className="font-medium">Independence:</span> {source.independence.replace('_', ' ')}</div>
                            <div><span className="font-medium">Proximity:</span> {source.proximity}</div>
                            <div><span className="font-medium">Depth:</span> {source.depth}</div>
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