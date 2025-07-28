import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import ResearchingList from "./ResearchingList";

export default function ResearchingSection({
  inProgressEntities,
  completedEntities,
  loading,
  error,
  progressData,
  onRefresh,
  onStartWriting,
  startWritingLoading,
}) {
  const [showList, setShowList] = useState(false);

  // Fetch progress once when section is opened and there are in-progress entities
  useEffect(() => {
    if (showList && inProgressEntities.length > 0) {
      // Initial fetch only
      onRefresh();
    }
  }, [showList, inProgressEntities.length, onRefresh]);

  const totalEntities = inProgressEntities.length + completedEntities.length;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-inter font-medium text-black tracking-tighter">
          Researching ({totalEntities})
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
              Loading researching entities...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-600 font-inter">
              Error loading researching entities: {error}
            </div>
          )}

          {/* Entities List */}
          {!loading && !error && (
            <>
              {totalEntities === 0 ? (
                <div className="text-left text-gray-500 font-inter">
                  No entities currently being researched.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* In-Progress Section */}
                  {inProgressEntities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-inter font-medium text-gray-700 mb-3">
                        In-Progress ({inProgressEntities.length})
                      </h3>
                      <ResearchingList
                        entities={inProgressEntities}
                        progressData={progressData}
                        onRefresh={onRefresh}
                        isCompleted={false}
                        onStartWriting={onStartWriting}
                        startWritingLoading={startWritingLoading}
                      />
                    </div>
                  )}

                  {/* Completed Section */}
                  {completedEntities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-inter font-medium text-gray-700 mb-3">
                        Complete ({completedEntities.length})
                      </h3>
                      <ResearchingList
                        entities={completedEntities}
                        progressData={progressData}
                        onRefresh={onRefresh}
                        isCompleted={true}
                        onStartWriting={onStartWriting}
                        startWritingLoading={startWritingLoading}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
