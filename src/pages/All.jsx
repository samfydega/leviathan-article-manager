import { useState, useEffect } from "react";
import { Trash2, Copy, Check } from "lucide-react";

export default function All() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingEntities, setDeletingEntities] = useState(new Set());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch all entities on component mount
  useEffect(() => {
    fetchAllEntities();
  }, []);

  // Restore scroll position after data refresh
  useEffect(() => {
    if (!loading && scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [entities, loading, scrollPosition]);

  const fetchAllEntities = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/entities/");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setEntities(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching entities:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to copy ID to clipboard
  const handleCopyId = async (entityId) => {
    try {
      await navigator.clipboard.writeText(entityId);
      setCopiedId(entityId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy ID:", err);
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    const statusColors = {
      queue: "bg-yellow-100 text-yellow-800 border-yellow-200",
      researching: "bg-blue-100 text-blue-800 border-blue-200",
      researched: "bg-green-100 text-green-800 border-green-200",
      backlog: "bg-gray-100 text-gray-800 border-gray-200",
      ignore: "bg-red-100 text-red-800 border-red-200",
      drafting_sections: "bg-purple-100 text-purple-800 border-purple-200",
      drafted_sections: "bg-indigo-100 text-indigo-800 border-indigo-200",
      drafting_article: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Function to delete an entity
  const handleDeleteEntity = async (entityId) => {
    try {
      // Save current scroll position before deletion
      setScrollPosition(window.scrollY);

      setDeletingEntities((prev) => new Set([...prev, entityId]));

      const response = await fetch(
        `http://localhost:8000/entities/${entityId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      // Refresh the entities list to reflect the deletion
      await fetchAllEntities();
    } catch (err) {
      console.error("Error deleting entity:", err);
      // You could add a toast notification here if you want to show the error to the user
    } finally {
      setDeletingEntities((prev) => {
        const newSet = new Set(prev);
        newSet.delete(entityId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="p-14">
        <h1 className="text-4xl font-playfair font-semibold text-[#554348] mb-2 tracking-tighter">
          All
        </h1>
        <p className="font-inter font-light">
          View all content and entities in one place.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-14">
        <h1 className="text-4xl font-playfair font-semibold text-[#554348] mb-2 tracking-tighter">
          All
        </h1>
        <p className="font-inter font-light">
          View all content and entities in one place.
        </p>
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-inter">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-14">
      <h1 className="text-4xl font-playfair font-semibold text-[#554348] mb-2 tracking-tighter">
        All
      </h1>
      <p className="font-inter font-light">
        View all content and entities in one place.
      </p>

      <div className="mt-8">
        <div className="grid grid-cols-4 gap-6">
          {entities.map((entity) => (
            <div
              key={entity.id}
              className="border border-gray-200 bg-white rounded-lg p-4 transition-all duration-200 hover:shadow-md relative"
            >
              {/* Name - Clickable to copy ID */}
              <div className="mb-3">
                <button
                  onClick={() => handleCopyId(entity.id)}
                  className="group flex items-center gap-2 hover:cursor-pointer w-full text-left"
                  title="Click to copy ID"
                >
                  <h3 className="text-lg font-inter font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-150">
                    {entity.name}
                  </h3>
                  {copiedId === entity.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-150" />
                  )}
                </button>
              </div>

              {/* Context - Limited to 2 lines */}
              <div className="mb-3">
                <p className="text-sm font-inter text-gray-700 leading-relaxed line-clamp-2">
                  {entity.context}
                </p>
              </div>

              {/* Status */}
              <div className="mb-3">
                <span className="text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-inter border ${getStatusColor(
                      entity.status
                    )}`}
                  >
                    {entity.status}
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={() => handleDeleteEntity(entity.id)}
                  disabled={deletingEntities.has(entity.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete entity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {entities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-inter">No entities found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
