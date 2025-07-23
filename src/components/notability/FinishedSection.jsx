import FinishedList from "./FinishedList";

export default function FinishedSection({
  entities,
  loading,
  error,
  showList,
  onToggleList,
  onStatusUpdate,
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-inter font-medium text-black mb-4 tracking-tighter">
          Researched
        </h2>
        <button
          onClick={onToggleList}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
        >
          {showList ? "Collapse" : "Show"}
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

          {/* Researched Entities List */}
          {!loading && !error && (
            <>
              {entities.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-inter">
                  No finished researched
                </div>
              ) : (
                <FinishedList entities={entities} onStatusUpdate={onStatusUpdate} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
