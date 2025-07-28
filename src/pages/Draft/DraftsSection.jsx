import { useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import DraftsList from "./DraftsList";

export default function DraftsSection({
  entities,
  loading,
  error,
  progressData,
  onRefresh,
  onSelectDocument,
}) {
  const [showList, setShowList] = useState(false);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-inter font-medium text-black tracking-tighter">
          Drafts ({entities.length})
        </h2>
        <button
          onClick={() => setShowList(!showList)}
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
              Loading drafted entities...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-600 font-inter">
              Error loading drafted entities: {error}
            </div>
          )}

          {/* Entities List */}
          {!loading && !error && (
            <>
              {entities.length === 0 ? (
                <div className="text-left text-gray-500 font-inter">
                  No drafted entities available.
                </div>
              ) : (
                <DraftsList
                  entities={entities}
                  progressData={progressData}
                  onRefresh={onRefresh}
                  onSelectDocument={onSelectDocument}
                />
              )}
            </>
          )}

          {/* Refresh button for drafted entities */}
          <div className="mt-4 flex justify-start">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </>
      )}
    </div>
  );
}
