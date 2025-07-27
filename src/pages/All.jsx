import { useState, useEffect } from "react";
import { Trash2, Copy, Check } from "lucide-react";

export default function All() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingEntities, setDeletingEntities] = useState(new Set());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [filters, setFilters] = useState({
    state: "",
    entityType: "",
  });

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

  // Function to get status color based on state and phase
  const getStatusColor = (status) => {
    if (!status || typeof status !== "object") {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }

    const { state, phase } = status;

    // Define colors based on state
    const stateColors = {
      queue: "bg-yellow-100 text-yellow-800 border-yellow-200",
      researching: "bg-blue-100 text-blue-800 border-blue-200",
      researched: "bg-green-100 text-green-800 border-green-200",
      backlog: "bg-gray-100 text-gray-800 border-gray-200",
      backlogged: "bg-gray-100 text-gray-800 border-gray-200",
      ignore: "bg-red-100 text-red-800 border-red-200",
      ignored: "bg-red-100 text-red-800 border-red-200",
      notability: "bg-pink-100 text-pink-800 border-pink-200",
      drafting_sections: "bg-purple-100 text-purple-800 border-purple-200",
      drafted_sections: "bg-indigo-100 text-indigo-800 border-indigo-200",
      drafting_article: "bg-orange-100 text-orange-800 border-orange-200",
      finished: "bg-emerald-100 text-emerald-800 border-emerald-200",
      published: "bg-teal-100 text-teal-800 border-teal-200",
      review: "bg-amber-100 text-amber-800 border-amber-200",
      editing: "bg-cyan-100 text-cyan-800 border-cyan-200",
    };

    return stateColors[state] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Function to get entity type color
  const getEntityTypeColor = (entityType) => {
    if (!entityType) {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }

    // Define colors based on NER entity types
    const entityTypeColors = {
      // Person entities
      PERSON: "bg-blue-100 text-blue-800 border-blue-200",
      person: "bg-blue-100 text-blue-800 border-blue-200",

      // Organization entities
      ORG: "bg-purple-100 text-purple-800 border-purple-200",
      organization: "bg-purple-100 text-purple-800 border-purple-200",
      company: "bg-purple-100 text-purple-800 border-purple-200",

      // Location entities
      LOC: "bg-green-100 text-green-800 border-green-200",
      location: "bg-green-100 text-green-800 border-green-200",
      place: "bg-green-100 text-green-800 border-green-200",

      // Date/Time entities
      DATE: "bg-orange-100 text-orange-800 border-orange-200",
      date: "bg-orange-100 text-orange-800 border-orange-200",
      time: "bg-orange-100 text-orange-800 border-orange-200",

      // Money/Financial entities
      MONEY: "bg-emerald-100 text-emerald-800 border-emerald-200",
      money: "bg-emerald-100 text-emerald-800 border-emerald-200",
      currency: "bg-emerald-100 text-emerald-800 border-emerald-200",

      // Percentage entities
      PERCENT: "bg-teal-100 text-teal-800 border-teal-200",
      percent: "bg-teal-100 text-teal-800 border-teal-200",
      percentage: "bg-teal-100 text-teal-800 border-teal-200",

      // Product entities
      PRODUCT: "bg-indigo-100 text-indigo-800 border-indigo-200",
      product: "bg-indigo-100 text-indigo-800 border-indigo-200",

      // Event entities
      EVENT: "bg-pink-100 text-pink-800 border-pink-200",
      event: "bg-pink-100 text-pink-800 border-pink-200",

      // Work of Art entities
      WORK_OF_ART: "bg-rose-100 text-rose-800 border-rose-200",
      work_of_art: "bg-rose-100 text-rose-800 border-rose-200",
      artwork: "bg-rose-100 text-rose-800 border-rose-200",

      // Law entities
      LAW: "bg-slate-100 text-slate-800 border-slate-200",
      law: "bg-slate-100 text-slate-800 border-slate-200",
      legal: "bg-slate-100 text-slate-800 border-slate-200",

      // Language entities
      LANGUAGE: "bg-amber-100 text-amber-800 border-amber-200",
      language: "bg-amber-100 text-amber-800 border-amber-200",

      // Quantity entities
      QUANTITY: "bg-cyan-100 text-cyan-800 border-cyan-200",
      quantity: "bg-cyan-100 text-cyan-800 border-cyan-200",

      // Cardinal entities
      CARDINAL: "bg-violet-100 text-violet-800 border-violet-200",
      cardinal: "bg-violet-100 text-violet-800 border-violet-200",
      number: "bg-violet-100 text-violet-800 border-violet-200",

      // Ordinal entities
      ORDINAL: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      ordinal: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",

      // Facility entities
      FAC: "bg-lime-100 text-lime-800 border-lime-200",
      facility: "bg-lime-100 text-lime-800 border-lime-200",

      // GPE (Geo-Political Entity) entities
      GPE: "bg-sky-100 text-sky-800 border-sky-200",
      gpe: "bg-sky-100 text-sky-800 border-sky-200",

      // NORP (Nationality, Religious, Political Group) entities
      NORP: "bg-stone-100 text-stone-800 border-stone-200",
      norp: "bg-stone-100 text-stone-800 border-stone-200",

      // Default for unknown types
      unknown: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      entityTypeColors[entityType] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  // Function to format status display
  const formatStatus = (status) => {
    if (!status || typeof status !== "object") {
      return "Unknown";
    }

    const { state, phase } = status;

    if (phase) {
      return `${state} (${phase})`;
    }

    return state || "Unknown";
  };

  // Function to get unique states from entities
  const getUniqueStates = () => {
    const states = new Set();
    entities.forEach((entity) => {
      if (entity.status && entity.status.state) {
        states.add(entity.status.state);
      }
    });
    return Array.from(states).sort();
  };

  // Function to get unique entity types from entities
  const getUniqueEntityTypes = () => {
    const types = new Set();
    entities.forEach((entity) => {
      if (entity.entity_type) {
        types.add(entity.entity_type);
      }
    });
    return Array.from(types).sort();
  };

  // Function to filter entities based on current filters
  const getFilteredEntities = () => {
    return entities.filter((entity) => {
      const stateMatch =
        !filters.state ||
        (entity.status && entity.status.state === filters.state);
      const typeMatch =
        !filters.entityType || entity.entity_type === filters.entityType;

      return stateMatch && typeMatch;
    });
  };

  // Function to handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Function to clear all filters
  const clearFilters = () => {
    setFilters({
      state: "",
      entityType: "",
    });
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

      {/* Filter Bar */}
      <div className="mt-8 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="state-filter"
              className="text-sm font-inter font-medium text-gray-700"
            >
              State:
            </label>
            <select
              id="state-filter"
              value={filters.state}
              onChange={(e) => handleFilterChange("state", e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All States</option>
              {getUniqueStates().map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="type-filter"
              className="text-sm font-inter font-medium text-gray-700"
            >
              Type:
            </label>
            <select
              id="type-filter"
              value={filters.entityType}
              onChange={(e) => handleFilterChange("entityType", e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {getUniqueEntityTypes().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {(filters.state || filters.entityType) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors duration-150"
            >
              Clear Filters
            </button>
          )}

          <div className="ml-auto text-sm text-gray-500 font-inter">
            {getFilteredEntities().length} of {entities.length} entities
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-4 gap-6">
          {getFilteredEntities().map((entity) => (
            <div
              key={entity.id}
              className="border border-gray-200 bg-white rounded-lg p-4 pb-12 transition-all duration-200 hover:shadow-md relative"
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

              {/* Type and Status - Side by side */}
              <div className="mb-3 flex gap-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-inter border ${getEntityTypeColor(
                    entity.entity_type
                  )}`}
                >
                  {entity.entity_type || "Unknown"}
                </span>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-inter border ${getStatusColor(
                    entity.status
                  )}`}
                >
                  {formatStatus(entity.status)}
                </span>
              </div>

              {/* Context - Limited to 2 lines */}
              <div className="mb-3">
                <p
                  className="text-sm font-inter text-gray-700 leading-relaxed overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    textOverflow: "ellipsis",
                  }}
                >
                  {entity.context}
                </p>
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

        {getFilteredEntities().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-inter">
              {entities.length === 0
                ? "No entities found."
                : "No entities match the current filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
