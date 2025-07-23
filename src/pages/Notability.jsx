import { useState, useEffect } from "react";

export default function Notability() {
  const [processingEntities, setProcessingEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch processing entities on component mount
  useEffect(() => {
    fetchProcessingEntities();
  }, []);

  const fetchProcessingEntities = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/entities/status/processing"
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setProcessingEntities(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching processing entities:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-14">
      <h1 className="text-4xl font-playfair font-semibold text-black mb-2 tracking-tighter">
        Notability
      </h1>
      <p className="font-inter font-light">
        Manage notability evaluations and make article creation decisions.
      </p>

      <div className="mt-8">
        <h2 className="text-2xl font-playfair font-medium text-gray-800 mb-4">
          Ready to process
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-gray-500 font-inter">
            Loading processing entities...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8 text-red-600 font-inter">
            Error loading entities: {error}
          </div>
        )}

        {/* Entities List */}
        {!loading && !error && (
          <>
            {processingEntities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-inter">
                🎉 No entities ready for processing!
              </div>
            ) : (
              <div className="space-y-4">
                {processingEntities.map((entity, index) => (
                  <div
                    key={entity.id}
                    className="border border-gray-200 bg-white rounded-lg p-4 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-inter font-medium text-gray-900">
                        {entity.name}
                      </span>
                    </div>

                    {/* Context snippet */}
                    <div className="mb-4 p-3 bg-gray-50 rounded text-sm font-inter leading-relaxed">
                      <span className="text-gray-600">{entity.context}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
