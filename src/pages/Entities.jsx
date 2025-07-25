import { useState } from "react";
import { Plus } from "lucide-react";
import CreateEntity from "../components/CreateEntity";
import QueuedEntitiesList from "../components/QueuedEntitiesList";

export default function Entities() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleBackClick = () => {
    setIsCreating(false);
  };

  return (
    <div className="p-14">
      <h1 className="text-4xl font-playfair font-semibold text-[#554348] mb-2 tracking-tighter">
        Entities
      </h1>
      <p className="font-inter font-light">Create and approve entities here.</p>

      {!isCreating ? (
        <>
          <div className="mt-8">
            <button
              onClick={handleCreateClick}
              className="border border-gray-300 flex items-center px-3 py-2 rounded-md text-sm font-libre transition-colors duration-150 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <Plus className="w-4 h-4 mr-3" />
              Create new entities
            </button>
          </div>

          <QueuedEntitiesList />
        </>
      ) : (
        <CreateEntity onBack={handleBackClick} />
      )}
    </div>
  );
}
