import { useState } from "react";
import { Check, Archive, Trash2, ExternalLink } from "lucide-react";

export default function EntityReviewList({
  entities,
  originalText,
  onEntityProcessed,
  onCancel,
}) {
  const [entityErrors, setEntityErrors] = useState({});
  const [processedEntities, setProcessedEntities] = useState(new Set());
  // Color mapping for entity types
  const typeColors = {
    PERSON: "bg-blue-100 text-blue-800 border-blue-200",
    NORP: "bg-green-100 text-green-800 border-green-200",
    FAC: "bg-purple-100 text-purple-800 border-purple-200",
    ORG: "bg-orange-100 text-orange-800 border-orange-200",
    GPE: "bg-red-100 text-red-800 border-red-200",
    LOC: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PRODUCT: "bg-pink-100 text-pink-800 border-pink-200",
    EVENT: "bg-indigo-100 text-indigo-800 border-indigo-200",
    WORK_OF_ART: "bg-rose-100 text-rose-800 border-rose-200",
    LAW: "bg-gray-100 text-gray-800 border-gray-200",
    LANGUAGE: "bg-teal-100 text-teal-800 border-teal-200",
    DATE: "bg-emerald-100 text-emerald-800 border-emerald-200",
    TIME: "bg-cyan-100 text-cyan-800 border-cyan-200",
    PERCENT: "bg-lime-100 text-lime-800 border-lime-200",
    MONEY: "bg-amber-100 text-amber-800 border-amber-200",
    QUANTITY: "bg-violet-100 text-violet-800 border-violet-200",
    ORDINAL: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    CARDINAL: "bg-sky-100 text-sky-800 border-sky-200",
  };

  // Function to extract context around entity
  const getEntityContext = (entityValue, text) => {
    // Quick fix: Use first occurrence of entity (works for most cases)
    const index = text.toLowerCase().indexOf(entityValue.toLowerCase());

    if (index === -1)
      return {
        before: "",
        entity: entityValue,
        after: "",
      };

    // Calculate context boundaries (100 chars max on each side)
    const contextStart = Math.max(0, index - 100);
    const contextEnd = Math.min(text.length, index + entityValue.length + 100);

    // Check if we truncated text (need ellipses)
    const truncatedLeft = index - 100 > 0;
    const truncatedRight = index + entityValue.length + 100 < text.length;

    let before = text.substring(contextStart, index);
    const entity = text.substring(index, index + entityValue.length);
    let after = text.substring(index + entityValue.length, contextEnd);

    // Add ellipses if we truncated
    if (truncatedLeft) before = "..." + before;
    if (truncatedRight) after = after + "...";

    return { before, entity, after };
  };

  // Helper function to make API calls
  const submitEntity = async (entityIndex, status) => {
    const entity = entities[entityIndex];
    const context = getEntityContext(entity.value, originalText);

    try {
      const response = await fetch("http://localhost:8000/entities/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entity_name: entity.value,
          entity_context:
            `${context.before}${context.entity}${context.after}`.trim(),
          status: status,
        }),
      });

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

      // Notify parent component that entity was processed
      if (onEntityProcessed) {
        onEntityProcessed(entityIndex);
      }
    } catch (error) {
      console.error(`Error submitting entity ${entityIndex}:`, error);
      setEntityErrors((prev) => ({
        ...prev,
        [entityIndex]: error.message,
      }));
    }
  };

  // Action functions
  const handleQueue = (entityIndex) => {
    submitEntity(entityIndex, "queue");
  };

  const handleBacklog = (entityIndex) => {
    submitEntity(entityIndex, "backlog");
  };

  const handleIgnore = (entityIndex) => {
    submitEntity(entityIndex, "ignore");
  };

  // Helper function to generate Wikipedia URL
  const getWikipediaUrl = (entityValue) => {
    const formattedName = entityValue.replace(/\s+/g, "_");
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(formattedName)}`;
  };

  if (!entities || entities.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500 font-inter">
        No entities detected
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-inter font-semibold text-gray-900">
          Detected Entities ({processedEntities.size}/{entities.length} triaged)
        </h3>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
        >
          <Trash2 className="w-4 h-4" />
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        {entities.map((entity, index) => {
          const context = getEntityContext(entity.value, originalText);
          const colorClass =
            typeColors[entity.type] ||
            "bg-gray-100 text-gray-800 border-gray-200";
          const isTriaged = processedEntities.has(index);
          const isProcessed = processedEntities.has(index);

          // Don't render processed entities
          if (isProcessed) return null;

          return (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isTriaged
                  ? "border-green-200 bg-green-50 opacity-60"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Entity header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-inter font-medium text-gray-900">
                    {entity.value}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-inter border ${colorClass}`}
                    >
                      {entity.type}
                    </span>
                    <a
                      href={getWikipediaUrl(entity.value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors duration-150"
                      title={`Search Wikipedia for "${entity.value}"`}
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
                {isTriaged ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-green-700">
                    <Check className="w-4 h-4" />
                    <span>Triaged</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleQueue(index)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-green-50 hover:text-green-700 transition-colors duration-150 group"
                    >
                      <Check className="w-4 h-4 text-green-600 group-hover:text-green-700 transition-colors duration-150" />
                      Queue
                    </button>

                    <button
                      onClick={() => handleBacklog(index)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 group"
                    >
                      <Archive className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors duration-150" />
                      Backlog
                    </button>

                    <button
                      onClick={() => handleIgnore(index)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors duration-150 group"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700 transition-colors duration-150" />
                      Ignore
                    </button>
                  </>
                )}
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
    </div>
  );
}
