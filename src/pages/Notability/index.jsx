import { useState, useEffect } from "react";
import ReadyToProcessSection from "./ReadyToProcessSection";
import ProcessingSection from "./ProcessingSection";
import FinishedSection from "./FinishedSection";

export default function Notability() {
  const [queueEntities, setQueueEntities] = useState([]);
  const [researchingEntities, setResearchingEntities] = useState([]);
  const [researchedEntities, setResearchedEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [researchLoading, setResearchLoading] = useState({});
  const [researchMessages, setResearchMessages] = useState({});
  const [showQueue, setShowQueue] = useState(false);
  const [showResearching, setShowResearching] = useState(false);
  const [showResearched, setShowResearched] = useState(false);

  // Fetch all entities on component mount
  useEffect(() => {
    fetchAllEntities();
  }, []);

  const fetchAllEntities = async () => {
    try {
      setLoading(true);

      // Fetch queue entities (notability, queued)
      const queueResponse = await fetch(
        "http://localhost:8000/entities/status?state=notability&phase=queued"
      );

      // Fetch researching entities (notability, processing)
      const researchingResponse = await fetch(
        "http://localhost:8000/entities/status?state=notability&phase=processing"
      );

      // Fetch completed entities (notability, completed)
      const completedResponse = await fetch(
        "http://localhost:8000/entities/status?state=notability&phase=completed"
      );

      // Fetch failed entities (notability, failed)
      const failedResponse = await fetch(
        "http://localhost:8000/entities/status?state=notability&phase=failed"
      );

      if (
        !queueResponse.ok ||
        !researchingResponse.ok ||
        !completedResponse.ok ||
        !failedResponse.ok
      ) {
        throw new Error("Failed to fetch entities");
      }

      const [queueData, researchingData, completedData, failedData] =
        await Promise.all([
          queueResponse.json(),
          researchingResponse.json(),
          completedResponse.json(),
          failedResponse.json(),
        ]);

      // Log the completed entities response to see what we get
      console.log("Completed entities response:", completedData);

      // Combine completed and failed entities for the researched section
      const researchedData = [...completedData, ...failedData];

      setQueueEntities(queueData);
      setResearchingEntities(researchingData);
      setResearchedEntities(researchedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching entities:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResearch = async (entityId) => {
    try {
      setResearchLoading((prev) => ({ ...prev, [entityId]: true }));
      setResearchMessages((prev) => ({ ...prev, [entityId]: null }));

      const response = await fetch(
        `http://localhost:8000/notability/${entityId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      setResearchMessages((prev) => ({
        ...prev,
        [entityId]: { type: "success", text: "Job submitted" },
      }));

      // Refresh all entities to move this entity from Queue to Researching
      await fetchAllEntities();
    } catch (err) {
      console.error("Error submitting research job:", err);
      setResearchMessages((prev) => ({
        ...prev,
        [entityId]: { type: "error", text: err.message },
      }));
    } finally {
      setResearchLoading((prev) => ({ ...prev, [entityId]: false }));
    }
  };

  const handleArchive = async (entityId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/entities/${entityId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "backlog" }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      // Refresh all entities to remove this entity from Researching
      await fetchAllEntities();
    } catch (err) {
      console.error("Error archiving entity:", err);
      // You could add a toast notification here if you want to show the error to the user
    }
  };

  return (
    <div className="p-14">
      <h1 className="text-4xl font-playfair font-semibold text-[#554348] mb-2 tracking-tighter">
        Notability
      </h1>
      <p className="font-inter font-light">
        Manage notability evaluations and make article creation decisions.
      </p>

      <ReadyToProcessSection
        entities={queueEntities}
        loading={loading}
        error={error}
        researchLoading={researchLoading}
        researchMessages={researchMessages}
        onResearch={handleResearch}
        showList={showQueue}
        onToggleList={() => setShowQueue(!showQueue)}
      />

      <ProcessingSection
        entities={researchingEntities}
        loading={loading}
        error={error}
        showList={showResearching}
        onToggleList={() => setShowResearching(!showResearching)}
        onStatusUpdate={fetchAllEntities}
        onArchive={handleArchive}
      />

      <FinishedSection
        entities={researchedEntities}
        loading={loading}
        error={error}
        showList={showResearched}
        onToggleList={() => setShowResearched(!showResearched)}
        onStatusUpdate={fetchAllEntities}
      />
    </div>
  );
}
