import { useState, useEffect, useCallback } from "react";
import QueueSection from "./QueueSection";
import ResearchingSection from "./ResearchingSection";
import WritingSection from "./WritingSection";

export default function Draft() {
  // Queue entities state (entities waiting to be researched)
  const [queueEntities, setQueueEntities] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState(null);

  // Researching entities state (entities being researched)
  const [researchingInProgress, setResearchingInProgress] = useState([]);
  const [researchingCompleted, setResearchingCompleted] = useState([]);
  const [loadingResearching, setLoadingResearching] = useState(true);
  const [researchingError, setResearchingError] = useState(null);

  // Writing entities state (entities being written)
  const [writingInProgress, setWritingInProgress] = useState([]);
  const [loadingWriting, setLoadingWriting] = useState(true);
  const [writingError, setWritingError] = useState(null);
  const [progressData, setProgressData] = useState({});

  // Loading states for actions
  const [startResearchLoading, setStartResearchLoading] = useState({});
  const [startWritingLoading, setStartWritingLoading] = useState({});

  // Fetch queue entities
  const fetchQueueEntities = useCallback(async () => {
    try {
      setLoadingQueue(true);
      const response = await fetch(
        "http://localhost:8000/entities/status?state=draft_research&phase=queued"
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setQueueEntities(data);
      setQueueError(null);
    } catch (error) {
      console.error("Error fetching queue entities:", error);
      setQueueError(error.message);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  // Fetch researching entities
  const fetchResearchingEntities = useCallback(async () => {
    try {
      setLoadingResearching(true);

      // Fetch in-progress entities
      const inProgressResponse = await fetch(
        "http://localhost:8000/entities/status?state=draft_research&phase=processing"
      );

      // Fetch completed entities
      const completedResponse = await fetch(
        "http://localhost:8000/entities/status?state=draft_research&phase=completed"
      );

      if (!inProgressResponse.ok || !completedResponse.ok) {
        throw new Error("Failed to fetch researching entities");
      }

      const [inProgressData, completedData] = await Promise.all([
        inProgressResponse.json(),
        completedResponse.json(),
      ]);

      setResearchingInProgress(inProgressData);
      setResearchingCompleted(completedData);
      setResearchingError(null);
    } catch (error) {
      console.error("Error fetching researching entities:", error);
      setResearchingError(error.message);
    } finally {
      setLoadingResearching(false);
    }
  }, []);

  // Fetch writing entities (only in-progress)
  const fetchWritingEntities = useCallback(async () => {
    try {
      setLoadingWriting(true);

      // Fetch only in-progress entities
      const inProgressResponse = await fetch(
        "http://localhost:8000/entities/status?state=draft_writing&phase=processing"
      );

      if (!inProgressResponse.ok) {
        throw new Error("Failed to fetch writing entities");
      }

      const inProgressData = await inProgressResponse.json();

      setWritingInProgress(inProgressData);
      setWritingError(null);

      // Fetch progress for in-progress entities
      if (inProgressData.length > 0) {
        await fetchProgressForWritingEntities(inProgressData);
      }
    } catch (error) {
      console.error("Error fetching writing entities:", error);
      setWritingError(error.message);
    } finally {
      setLoadingWriting(false);
    }
  }, []);

  // Get progress for drafting entities when refreshing
  const fetchProgressForEntities = useCallback(async (entities) => {
    const progressPromises = entities.map(async (entity) => {
      try {
        const response = await fetch(
          `http://localhost:8000/drafts/research/${entity.id}/progress`
        );
        if (response.ok) {
          const data = await response.json();
          return { entityId: entity.id, data };
        }
      } catch (error) {
        console.error(
          `Error fetching progress for entity ${entity.id}:`,
          error
        );
      }
      return { entityId: entity.id, data: null };
    });

    const progressResults = await Promise.all(progressPromises);
    const newProgressData = {};
    progressResults.forEach(({ entityId, data }) => {
      if (data) {
        newProgressData[entityId] = data;
      }
    });
    setProgressData(newProgressData);
  }, []);

  // Get progress for writing entities when refreshing
  const fetchProgressForWritingEntities = useCallback(async (entities) => {
    const progressPromises = entities.map(async (entity) => {
      try {
        const response = await fetch(
          `http://localhost:8000/drafts/writing/${entity.id}/progress`
        );
        if (response.ok) {
          const data = await response.json();
          return { entityId: entity.id, data };
        }
      } catch (error) {
        console.error(
          `Error fetching progress for writing entity ${entity.id}:`,
          error
        );
      }
      return { entityId: entity.id, data: null };
    });

    const progressResults = await Promise.all(progressPromises);
    const newProgressData = {};
    progressResults.forEach(({ entityId, data }) => {
      if (data) {
        newProgressData[entityId] = data;
      }
    });
    setProgressData((prev) => ({ ...prev, ...newProgressData }));
  }, []);

  // Fetch progress for researching entities
  const fetchResearchingProgress = useCallback(async () => {
    const allResearchingEntities = [
      ...researchingInProgress,
      ...researchingCompleted,
    ];
    if (allResearchingEntities.length > 0) {
      await fetchProgressForEntities(allResearchingEntities);
    }
  }, [researchingInProgress, researchingCompleted]);

  // Handle Start Research action
  const handleStartResearch = async (entityId) => {
    setStartResearchLoading((prev) => ({ ...prev, [entityId]: true }));

    try {
      const response = await fetch(
        `http://localhost:8000/drafts/research/${entityId}/start`,
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

      console.log(`Start research successful for entity ${entityId}`);

      // Refresh all sections to move the entity from queue to researching
      await Promise.all([fetchQueueEntities(), fetchResearchingEntities()]);
    } catch (error) {
      console.error(`Error starting research for entity ${entityId}:`, error);
    } finally {
      setStartResearchLoading((prev) => ({ ...prev, [entityId]: false }));
    }
  };

  // Handle Start Writing action
  const handleStartWriting = async (entityId) => {
    setStartWritingLoading((prev) => ({ ...prev, [entityId]: true }));

    try {
      // First, create the writing draft
      const createResponse = await fetch(
        `http://localhost:8000/drafts/writing/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: entityId,
            type: "venture_capitalist", // This should come from the entity data
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error(
          `HTTP ${createResponse.status}: ${await createResponse.text()}`
        );
      }

      // Then, start the writing process
      const startResponse = await fetch(
        `http://localhost:8000/drafts/writing/${entityId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!startResponse.ok) {
        throw new Error(
          `HTTP ${startResponse.status}: ${await startResponse.text()}`
        );
      }

      console.log(`Start writing successful for entity ${entityId}`);

      // Refresh all sections to move the entity from researching to writing
      await Promise.all([fetchResearchingEntities(), fetchWritingEntities()]);
    } catch (error) {
      console.error(`Error starting writing for entity ${entityId}:`, error);
    } finally {
      setStartWritingLoading((prev) => ({ ...prev, [entityId]: false }));
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchQueueEntities();
    fetchResearchingEntities();
    fetchWritingEntities();
  }, [fetchQueueEntities, fetchResearchingEntities, fetchWritingEntities]);

  return (
    <div className="p-14">
      <h1 className="text-4xl font-playfair font-semibold text-[#554348] mb-2 tracking-tighter">
        Drafts
      </h1>
      <p className="font-inter font-light">Manage your draft documents here.</p>

      <QueueSection
        entities={queueEntities}
        loading={loadingQueue}
        error={queueError}
        onStartResearch={handleStartResearch}
        startResearchLoading={startResearchLoading}
      />

      <ResearchingSection
        inProgressEntities={researchingInProgress}
        completedEntities={researchingCompleted}
        loading={loadingResearching}
        error={researchingError}
        progressData={progressData}
        onRefresh={fetchResearchingProgress}
        onStartWriting={handleStartWriting}
        startWritingLoading={startWritingLoading}
      />

      <WritingSection
        inProgressEntities={writingInProgress}
        loading={loadingWriting}
        error={writingError}
        progressData={progressData}
        onRefresh={fetchWritingEntities}
      />
    </div>
  );
}
