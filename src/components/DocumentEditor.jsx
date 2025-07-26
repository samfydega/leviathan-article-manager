import { useState } from "react";
import ArticleView from "./ArticleView";
import EditView from "./EditView";

export default function DocumentEditor({
  documentData,
  onSave,
  onClose,
  onRedraft,
  redraftLoading,
}) {
  const [currentView, setCurrentView] = useState("article"); // "article" or "edit"

  const handleSwitchToEdit = () => {
    setCurrentView("edit");
  };

  const handleSwitchToArticle = () => {
    setCurrentView("article");
  };

  const handleSave = async (updatedDocument) => {
    await onSave(updatedDocument);
    setCurrentView("article"); // Switch back to article view after saving
  };

  if (currentView === "edit") {
    return (
      <EditView
        documentData={documentData}
        onSave={handleSave}
        onClose={onClose}
        onSwitchToView={handleSwitchToArticle}
      />
    );
  }

  return (
    <ArticleView
      documentData={documentData}
      onSwitchToEdit={handleSwitchToEdit}
    />
  );
}
