import { useEffect, useRef } from "react";
import { ExternalLink, Loader2, Archive } from "lucide-react";

export default function ProcessingList({
  entities,
  onStatusUpdate,
  onArchive,
}) {
  const pollIntervals = useRef(new Map());

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

  // Function to poll research status
  const pollResearchStatus = async (entityId) => {
    try {
      const response = await fetch(
        "http://localhost:8000/notability/research/status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: entityId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // If research is complete, trigger a status update to refresh the parent data
        if (data.status === "completed" || data.completed === true) {
          // Clear the polling interval for this entity
          const intervalId = pollIntervals.current.get(entityId);
          if (intervalId) {
            clearInterval(intervalId);
            pollIntervals.current.delete(entityId);
          }

          // Trigger parent refresh
          if (onStatusUpdate) {
            onStatusUpdate();
          }
        }
      }
    } catch (error) {
      console.error(`Error polling status for entity ${entityId}:`, error);
    }
  };

  // Start polling for each entity
  useEffect(() => {
    entities.forEach((entity) => {
      // Only start polling if not already polling this entity
      if (!pollIntervals.current.has(entity.id)) {
        const intervalId = setInterval(() => {
          pollResearchStatus(entity.id);
        }, 10000); // Poll every 10 seconds

        pollIntervals.current.set(entity.id, intervalId);
      }
    });

    // Cleanup function to clear intervals for entities no longer in the list
    return () => {
      const currentEntityIds = new Set(entities.map((e) => e.id));

      for (const [entityId, intervalId] of pollIntervals.current.entries()) {
        if (!currentEntityIds.has(entityId)) {
          clearInterval(intervalId);
          pollIntervals.current.delete(entityId);
        }
      }
    };
  }, [entities, onStatusUpdate]);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      for (const intervalId of pollIntervals.current.values()) {
        clearInterval(intervalId);
      }
      pollIntervals.current.clear();
    };
  }, []);

  return (
    <div className="space-y-4">
      {entities.map((entity) => {
        const context = getEntityContext(entity.name, entity.context);

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

              <div className="flex items-center gap-3">
                {/* Research status indicator */}
                <div className="flex items-center gap-2 text-sm text-blue-600 font-inter">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Researching...
                </div>

                {/* Archive button */}
                <button
                  onClick={() => onArchive(entity.id)}
                  className="flex items-center gap-1 px-2 py-1 text-sm font-inter text-gray-600 hover:text-red-600 transition-colors duration-150 border border-gray-300 hover:border-red-300 rounded"
                  title="Archive this entity"
                >
                  <Archive className="w-3 h-3" />
                  Archive
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
          </div>
        );
      })}
    </div>
  );
}
