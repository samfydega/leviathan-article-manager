import { RefreshCw, Loader2, Pencil } from "lucide-react";

export default function ResearchingList({
  entities,
  progressData,
  onRefresh,
  isCompleted = false,
  onStartWriting,
  startWritingLoading,
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
              {!isCompleted && (
                <span className="text-sm font-inter text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Researching
                </span>
              )}
            </div>

            {isCompleted ? (
              // Completed section - just show Write button
              <div className="mt-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => onStartWriting(entity.id)}
                  disabled={startWritingLoading[entity.id]}
                  className="px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Write
                </button>
              </div>
            ) : (
              // In-progress section - show progress and refresh
              <>
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
                        {progress.progress_percentage.toFixed(1)}% complete
                      </span>
                      <span>{progress.pending_sections} pending</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={onRefresh}
                        className="px-3 py-1.5 text-sm font-inter text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-inter text-gray-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Loading progress...</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={onRefresh}
                        className="px-3 py-1.5 text-sm font-inter text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
