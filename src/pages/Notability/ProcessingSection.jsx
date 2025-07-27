import { ChevronDown, ChevronRight } from "lucide-react";
import ProcessingList from "./ProcessingList";

export default function ProcessingSection({
  entities,
  loading,
  error,
  showList,
  onToggleList,
  onStatusUpdate,
  onArchive,
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-inter font-medium text-black tracking-tighter">
          Processing ({entities.length})
        </h2>
        <button
          onClick={onToggleList}
          className="flex items-center gap-1 px-2 py-1 text-sm font-inter text-gray-600 hover:text-gray-900 transition-colors duration-150"
        >
          {showList ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          {showList ? "Hide" : "Show"}
        </button>
      </div>

      {showList && (
        <>
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8 text-gray-500 font-inter">
              Loading entities...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-600 font-inter">
              Error loading entities: {error}
            </div>
          )}

          {/* Researching Entities List */}
          {!loading && !error && (
            <>
              {entities.length === 0 ? (
                <div className="text-left text-gray-500 font-inter">
                  No researching in progress
                </div>
              ) : (
                <ProcessingList
                  entities={entities}
                  onStatusUpdate={onStatusUpdate}
                  onArchive={onArchive}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
