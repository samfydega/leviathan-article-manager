import { Loader2, RefreshCw } from "lucide-react";

export default function DraftsList({
  entities,
  progressData,
  onRefresh,
  onSelectDocument,
}) {
  return (
    <div className="space-y-3">
      {entities.map((entity) => {
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
              {progress && !progress.is_complete && (
                <span className="text-sm font-inter text-gray-500">
                  {progress.completed_sections}/{progress.total_sections}{" "}
                  sections
                </span>
              )}
            </div>

            {progress ? (
              <div className="space-y-2">
                {progress.is_complete ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-inter text-green-600 bg-green-50 px-2 py-1 rounded">
                      Ready for editing
                    </span>
                    <button
                      className="px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => onSelectDocument(entity)}
                    >
                      Open
                    </button>
                  </div>
                ) : (
                  <>
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
                        {progress.progress_percentage.toFixed(1)}% complete
                      </span>
                      <span>{progress.pending_sections} pending</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={onRefresh}
                        className="px-3 py-1.5 text-sm font-inter text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-inter text-green-600 bg-green-50 px-2 py-1 rounded">
                  Ready for editing
                </span>
                <button
                  className="px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => onSelectDocument(entity)}
                >
                  Open
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
