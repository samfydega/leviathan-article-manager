import { ExternalLink, Search } from "lucide-react";

export default function ReadyToProcessList({ 
  entities, 
  researchLoading, 
  researchMessages, 
  onResearch 
}) {
  // Function to extract context around entity name (similar to QueuedEntitiesList)
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
            </div>

            {/* Context snippet */}
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm font-inter leading-relaxed">
              <span className="text-gray-600">{context.before}</span>
              <span className="bg-yellow-200 font-medium text-gray-900 px-1 rounded">
                {context.entity}
              </span>
              <span className="text-gray-600">{context.after}</span>
            </div>

            {/* Research button */}
            <button
              onClick={() => onResearch(entity.id)}
              disabled={researchLoading[entity.id]}
              className="border border-gray-300 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-libre transition-colors duration-150 text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              {researchLoading[entity.id] ? "Submitting..." : "Research"}
            </button>

            {/* Research message */}
            {researchMessages[entity.id] && (
              <div className={`mt-2 text-sm font-inter ${
                researchMessages[entity.id].type === "error" 
                  ? "text-red-600" 
                  : "text-green-600"
              }`}>
                {researchMessages[entity.id].text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}