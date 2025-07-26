import { useState, useEffect } from "react";
import { Edit3 } from "lucide-react";
import {
  Paragraph,
  SectionHeader,
  SubsectionHeader,
  NotableInvestmentsTable,
  References,
  InfoBox,
  InfoBoxRow,
  ReferenceLink,
} from "./blocks";
import { User, GraduationCap, Badge } from "lucide-react";

// Divider component
function Divider({ className = "mb-4" }) {
  return <hr className={`border-gray-300 ${className}`} />;
}

export default function ArticleView({ documentData, onSwitchToEdit }) {
  const [document, setDocument] = useState(null);
  const [globalReferences, setGlobalReferences] = useState([]);

  // Initialize document and process references
  useEffect(() => {
    if (documentData) {
      setDocument(documentData);
      processGlobalReferences(documentData);
    }
  }, [documentData]);

  // Process all references from all sections and create global reference list
  const processGlobalReferences = (doc) => {
    const allReferences = [];
    const referenceMap = new Map();

    // Collect all references from all sections
    Object.values(doc.sections).forEach((section) => {
      if (section.references) {
        section.references.forEach((ref) => {
          const key = `${ref.title}-${ref.url}`;
          if (!referenceMap.has(key)) {
            referenceMap.set(key, {
              ...ref,
              globalId: allReferences.length + 1,
            });
            allReferences.push({ ...ref, globalId: allReferences.length + 1 });
          }
        });
      }
    });

    setGlobalReferences(allReferences);
  };

  // Get global reference ID for a citation
  const getGlobalReferenceId = (sectionName, localId) => {
    if (!document || !document.sections[sectionName]) return localId;

    const sectionRef = document.sections[sectionName].references?.find(
      (r) => r.id === localId
    );
    if (!sectionRef) return localId;

    const globalRef = globalReferences.find(
      (r) => r.title === sectionRef.title && r.url === sectionRef.url
    );

    return globalRef ? globalRef.globalId : localId;
  };

  // Render paragraph with inline citations
  const renderParagraphWithCitations = (content, citations, sectionName) => {
    if (!citations || citations.length === 0) {
      return content;
    }

    // Simply add citations to the end of the content
    const citationLinks = citations.map((citation, index) => {
      const globalId = getGlobalReferenceId(sectionName, citation.id);
      return (
        <ReferenceLink
          key={`${sectionName}-${citation.id}-${index}`}
          href={`#ref-${globalId}`}
          number={globalId}
        />
      );
    });

    return (
      <>
        {content} {citationLinks}
      </>
    );
  };

  // Render a block based on its type
  const renderBlock = (block, sectionName, blockIndex) => {
    const blockContent = block.content;
    const isContentObject =
      typeof blockContent === "object" && blockContent !== null;

    switch (block.type) {
      case "heading":
        return (
          <div className="mb-4">
            <div className="flex items-center gap-2 group">
              <SectionHeader>
                {isContentObject ? blockContent.title : blockContent}
              </SectionHeader>
            </div>
            <Divider />
          </div>
        );

      case "subheading":
        return (
          <div className="mb-3">
            <div className="flex items-center gap-2 group">
              <SubsectionHeader>
                {isContentObject ? blockContent.title : blockContent}
              </SubsectionHeader>
            </div>
          </div>
        );

      case "paragraph":
        return (
          <div className="mb-4">
            <Paragraph>
              {renderParagraphWithCitations(
                isContentObject ? blockContent.text || "" : blockContent,
                block.citations,
                sectionName
              )}
            </Paragraph>
          </div>
        );

      case "infobox":
        return (
          <div className="mb-6">
            <NotableInvestmentsTable
              title={blockContent.title}
              columns={blockContent.columns}
              rows={blockContent.rows}
            />
          </div>
        );

      default:
        return (
          <div className="mb-4">
            <Paragraph>
              {renderParagraphWithCitations(
                isContentObject ? blockContent.text || "" : blockContent,
                block.citations,
                sectionName
              )}
            </Paragraph>
          </div>
        );
    }
  };

  // Render person infobox
  const renderPersonInfobox = (personData) => {
    if (!personData) return null;

    // Format birth information
    const formatBirthInfo = (born) => {
      if (!born) return null;
      const parts = [];
      if (born.year) parts.push(born.year);
      if (born.city) parts.push(born.city);
      if (born.country) parts.push(born.country);
      return parts.join(", ");
    };

    // Format education information
    const formatEducation = (education) => {
      if (!education || education.length === 0) return null;
      return education
        .map((edu) => {
          const parts = [edu.institution];
          if (edu.degrees && edu.degrees.length > 0) {
            parts.push(...edu.degrees);
          }
          return parts.join("\n");
        })
        .join("\n\n");
    };

    // Format current position
    const formatCurrentPosition = (title) => {
      if (!title || title.length === 0) return null;
      return title
        .map((t) => {
          return `${t.position}, ${t.organization}`;
        })
        .join("\n");
    };

    return (
      <InfoBox
        image={personData.image || null}
        imageAlt={personData.name}
        imageCaption={personData.name}
      >
        {personData.born && formatBirthInfo(personData.born) && (
          <InfoBoxRow icon={<User size={14} />} label="Born">
            {formatBirthInfo(personData.born)}
          </InfoBoxRow>
        )}

        {personData.education && personData.education.length > 0 && (
          <InfoBoxRow icon={<GraduationCap size={14} />} label="Education">
            {formatEducation(personData.education)}
          </InfoBoxRow>
        )}

        {personData.title && personData.title.length > 0 && (
          <InfoBoxRow icon={<Badge size={14} />} label="Title">
            {formatCurrentPosition(personData.title)}
          </InfoBoxRow>
        )}

        {personData.spouse_name && (
          <InfoBoxRow icon={<User size={14} />} label="Spouse">
            {personData.spouse_name}
          </InfoBoxRow>
        )}

        {personData.number_of_children && (
          <InfoBoxRow icon={<User size={14} />} label="Children">
            {personData.number_of_children}
          </InfoBoxRow>
        )}
      </InfoBox>
    );
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-4 z-10">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-inter text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            >
              <Edit3 className="w-4 h-4" />
              Edit Article
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <main className="max-w-none mx-auto py-8 px-2 bg-white">
        {/* Document Title */}
        <div className="mb-4">
          <h1 className="text-4xl leading-10 tracking-tighter text-[#554348] font-semibold font-playfair">
            {document.id
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </h1>
          <Divider />
        </div>

        {/* Person Infobox */}
        {document.sections.person_infobox &&
          renderPersonInfobox(document.sections.person_infobox)}

        {/* Document Sections */}
        {Object.entries(document.sections).map(([sectionName, section]) => {
          // Skip person_infobox as it's handled separately
          if (sectionName === "person_infobox") return null;

          return (
            <div key={sectionName} className="mb-8">
              <div className="space-y-4">
                {section.blocks &&
                  section.blocks.map((block, blockIndex) => (
                    <div key={blockIndex}>
                      {renderBlock(block, sectionName, blockIndex)}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}

        {/* Global References */}
        {globalReferences.length > 0 && (
          <References references={globalReferences} />
        )}
      </main>
    </div>
  );
}
