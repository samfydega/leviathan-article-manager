import { useState, useRef } from "react";
import { ArrowLeft, ChevronRight, Trash2 } from "lucide-react";
import EntityReviewList from "./EntityReviewList";

export default function CreateEntity({ onBack }) {
  const [entityText, setEntityText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [detectedEntities, setDetectedEntities] = useState(null);
  const [originalText, setOriginalText] = useState("");

  const [processedEntities, setProcessedEntities] = useState(new Set());
  const [showNoEntitiesMessage, setShowNoEntitiesMessage] = useState(false);
  const noEntitiesTimeoutRef = useRef(null);

  // Function to clear results and start new analysis
  const handleNewAnalysis = () => {
    // Clear any pending timeout
    if (noEntitiesTimeoutRef.current) {
      clearTimeout(noEntitiesTimeoutRef.current);
      noEntitiesTimeoutRef.current = null;
    }

    setDetectedEntities(null);
    setOriginalText("");
    setErrorMessage("");
    setProcessedEntities(new Set());
    setShowNoEntitiesMessage(false);
  };

  // Function to handle successful entity processing
  const handleEntityProcessed = (entityIndex) => {
    setProcessedEntities((prev) => new Set([...prev, entityIndex]));
  };

  // Check if all entities are triaged
  const allEntitiesTriaged = detectedEntities
    ? processedEntities.size === detectedEntities.length
    : true;

  // Helper function for processing entities
  const processEntity = async (text) => {
    try {
      const response = await fetch("http://localhost:8000/entities/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${
            errorText ? ` - ${errorText}` : ""
          }`
        );
      }

      const data = await response.json();

      // Log the entities for debugging
      console.log("Detected entities:", data.entities);

      return {
        success: true,
        entities: data.entities,
        message: `Found ${data.entities.length} entities`,
      };
    } catch (error) {
      // Handle network errors, JSON parsing errors, etc.
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          `Unable to connect to NER service. Please ensure the server is running on localhost:8000. Error: ${error.message}`
        );
      }
      throw error;
    }
  };

  const handleProcess = async () => {
    if (!entityText.trim()) return;

    setIsProcessing(true);
    setErrorMessage("");
    setProcessedEntities(new Set()); // Reset processed entities for new batch

    try {
      const result = await processEntity(entityText);

      // Log success message
      console.log(result.message);

      // Store the detected entities and original text for review
      setDetectedEntities(result.entities);
      setOriginalText(entityText);

      // If no entities found, show message for 3 seconds
      if (result.entities.length === 0) {
        setShowNoEntitiesMessage(true);
        noEntitiesTimeoutRef.current = setTimeout(() => {
          setShowNoEntitiesMessage(false);
          setDetectedEntities(null);
          setOriginalText("");
          noEntitiesTimeoutRef.current = null;
        }, 3000);
      }

      // Reset form after successful processing
      setEntityText("");
    } catch (error) {
      console.error("Error processing entity:", error);
      setErrorMessage(
        error.message || "An error occurred while processing the entity"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-8">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center px-2 py-1 rounded-md text-sm font-inter transition-colors duration-150 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      {/* Text Area */}
      <div className="mb-4">
        <textarea
          value={entityText}
          onChange={(e) => setEntityText(e.target.value)}
          disabled={isProcessing || !allEntitiesTriaged}
          className="w-full h-32 p-4 border border-gray-300 rounded-sm text-sm font-inter resize-none disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none"
          placeholder={
            !allEntitiesTriaged
              ? "Complete entity triage before adding new text..."
              : "Paste text here..."
          }
        />
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={isProcessing || !entityText.trim() || !allEntitiesTriaged}
        className="flex items-center px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md text-sm font-inter transition-colors duration-150 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-900"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          "Process"
        )}
      </button>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 text-sm text-red-600 font-inter">
          {errorMessage}
        </div>
      )}

      {/* Entity Review List */}
      {detectedEntities &&
        originalText &&
        (!allEntitiesTriaged || showNoEntitiesMessage) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            {detectedEntities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-inter">
                <div className="text-lg mb-2">No entities to triage! :)</div>
                <div className="text-sm">
                  The text was processed but no entities were detected.
                </div>
              </div>
            ) : (
              <EntityReviewList
                entities={detectedEntities}
                originalText={originalText}
                onEntityProcessed={handleEntityProcessed}
                onCancel={handleNewAnalysis}
              />
            )}
          </div>
        )}
    </div>
  );
}
