import { useState, useEffect } from "react";
import { Archive, Trash2, Play, ExternalLink } from "lucide-react";

export default function QueuedEntitiesList() {
  const [queuedEntities, setQueuedEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entityErrors, setEntityErrors] = useState({});
  const [processedEntities, setProcessedEntities] = useState(new Set());

  // Fetch queued entities on component mount
  useEffect(() => {
    fetchQueuedEntities();
  }, []);

  const fetchQueuedEntities = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/entities/status/queue"
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setQueuedEntities(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching queued entities:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to extract context around entity name (similar to EntityReviewList)
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

  // Helper function to make API calls
  const submitEntityAction = async (entityId, entityIndex, action) => {
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
            status: action,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Success - mark entity as processed and clear any previous errors
      setProcessedEntities((prev) => new Set([...prev, entityIndex]));
      setEntityErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[entityIndex];
        return newErrors;
      });

      // Refresh the queue after successful action
      await fetchQueuedEntities();
    } catch (error) {
      console.error(`Error performing ${action} on entity ${entityId}:`, error);
      setEntityErrors((prev) => ({
        ...prev,
        [entityIndex]: error.message,
      }));
    }
  };

  // Action functions
  const handleBacklog = (entityId, entityIndex) => {
    submitEntityAction(entityId, entityIndex, "backlog");
  };

  const handleIgnore = (entityId, entityIndex) => {
    submitEntityAction(entityId, entityIndex, "ignore");
  };

  const handleRequeue = (entityId, entityIndex) => {
    submitEntityAction(entityId, entityIndex, "queue");
  };

  // Helper function to generate Wikipedia URL
  const getWikipediaUrl = (entityName) => {
    const formattedName = entityName.replace(/\s+/g, "_");
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(formattedName)}`;
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-playfair font-semibold text-black mb-4 tracking-tighter">
          Queued
        </h2>
        <div className="text-center text-gray-500 font-inter py-8">
          Loading queued entities...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-inter font-semibold text-black mb-4 tracking-tighter">
          Queued
        </h2>
        <div className="text-center text-red-600 font-inter py-8">
          Error loading queued entities: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-inter font-medium text-black mb-4 tracking-tighter">
        Queued
      </h2>

      {queuedEntities.length === 0 ? (
        <div className="text-center text-gray-500 font-inter py-8">
          🎉 No entities in queue!
        </div>
      ) : (
        <div className="space-y-4">
          {queuedEntities.map((entity, index) => {
            const context = getEntityContext(entity.name, entity.context);
            const isProcessed = processedEntities.has(index);

            // Don't render processed entities
            if (isProcessed) return null;

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
                </div>

                {/* Context snippet */}
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm font-inter leading-relaxed">
                  <span className="text-gray-600">{context.before}</span>
                  <span className="bg-yellow-200 font-medium text-gray-900 px-1 rounded">
                    {context.entity}
                  </span>
                  <span className="text-gray-600">{context.after}</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRequeue(entity.id, index)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-green-50 hover:text-green-700 transition-colors duration-150 group"
                  >
                    <Play className="w-4 h-4 text-green-600 group-hover:text-green-700 transition-colors duration-150" />
                    Re-queue
                  </button>

                  <button
                    onClick={() => handleBacklog(entity.id, index)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 group"
                  >
                    <Archive className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors duration-150" />
                    Backlog
                  </button>

                  <button
                    onClick={() => handleIgnore(entity.id, index)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors duration-150 group"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700 transition-colors duration-150" />
                    Ignore
                  </button>
                </div>

                {/* Error Message */}
                {entityErrors[index] && (
                  <div className="mt-3 text-sm text-red-600 font-inter bg-red-50 border border-red-200 rounded p-2">
                    {entityErrors[index]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
