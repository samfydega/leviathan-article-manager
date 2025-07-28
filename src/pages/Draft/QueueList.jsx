import { RefreshCw, Play } from "lucide-react";

export default function QueueList({
  entities,
  onStartResearch,
  startResearchLoading,
}) {
  return (
    <div className="space-y-3">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className="border border-gray-200 bg-white rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-inter font-medium text-gray-900">
              {entity.name}
            </span>
            <span className="text-sm font-inter text-gray-500">
              Waiting for research
            </span>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => onStartResearch(entity.id)}
              disabled={startResearchLoading[entity.id]}
              className="px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start research
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
