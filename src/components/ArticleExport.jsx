import { useState, useEffect } from "react";
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

export default function ArticleExport({ documentData }) {
  const [document, setDocument] = useState(null);
  const [globalReferences, setGlobalReferences] = useState([]);

  // Initialize document and process references
  useEffect(() => {
    if (documentData) {
      setDocument(documentData);
      processGlobalReferences(documentData);
    }
  }, [documentData]);

  // Define the correct order for sections
  const getSectionOrder = () => [
    "lead",
    "early_life",
    "career",
    "notable_investments",
    "personal_life",
  ];

  // Convert text to sentence case (first letter capitalized, rest lowercase)
  const toSentenceCase = (text) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Process all references from all sections and create global reference list
  const processGlobalReferences = (doc) => {
    const allReferences = [];
    const referenceMap = new Map();

    // Collect all references from all sections
    if (doc.results) {
      Object.values(doc.results).forEach((section) => {
        if (section && section.references) {
          section.references.forEach((ref) => {
            const key = `${ref.title}-${ref.url}`;
            if (!referenceMap.has(key)) {
              referenceMap.set(key, {
                ...ref,
                globalId: allReferences.length + 1,
              });
              allReferences.push({
                ...ref,
                globalId: allReferences.length + 1,
              });
            }
          });
        }
      });
    }

    setGlobalReferences(allReferences);
  };

  // Get global reference ID for a citation
  const getGlobalReferenceId = (sectionName, localId) => {
    if (!document || !document.results || !document.results[sectionName])
      return localId;

    const sectionRef = document.results[sectionName].references?.find(
      (r) => r.id === localId
    );
    if (!sectionRef) return localId;

    const globalRef = globalReferences.find(
      (r) => r.title === sectionRef.title && r.url === sectionRef.url
    );

    return globalRef ? globalRef.globalId : localId;
  };

  // Render paragraph with inline citations and lead section highlighting
  const renderParagraphWithCitations = (content, citations, sectionName) => {
    let processedContent = content;

    // Apply lead section highlighting if this is the lead section
    if (sectionName === "lead") {
      const titleWords = document.id
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
      const titleWordCount = titleWords.length;

      // Split content into words
      const words = content.split(/(\s+)/);
      const titleWordsToHighlight = titleWordCount;

      // Apply semibold formatting to the first N words
      const highlightedWords = words.map((word, index) => {
        const wordIndex = Math.floor(index / 2); // Account for spaces
        if (wordIndex < titleWordsToHighlight && word.trim()) {
          return (
            <span key={index} className="font-semibold">
              {word}
            </span>
          );
        }
        return word;
      });

      processedContent = <>{highlightedWords}</>;
    }

    if (!citations || citations.length === 0) {
      return processedContent;
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
        {processedContent} {citationLinks}
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
                {toSentenceCase(
                  isContentObject ? blockContent.title : blockContent
                )}
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
            <div className="mb-4">
              <div className="flex items-center gap-2 group">
                <SectionHeader>Notable investments</SectionHeader>
              </div>
              <Divider />
            </div>
            <NotableInvestmentsTable
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
        image={personData.image_url || personData.image || null}
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
      {/* Article Content */}
      <main className="max-w-none mx-none py-8 bg-white">
        {/* Document Title */}
        <div className="mb-4">
          <h1 className="text-4xl leading-10 tracking-tighter text-[#554348] font-semibold font-playfair mb-2">
            {document.id
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </h1>
          <Divider />
        </div>

        {/* Person Infobox */}
        {document.results?.person_infobox &&
          renderPersonInfobox(document.results.person_infobox)}

        {/* Document Sections */}
        {(() => {
          const sectionOrder = getSectionOrder();
          const orderedSections = sectionOrder
            .filter((sectionName) => document.results?.[sectionName])
            .map((sectionName) => [sectionName, document.results[sectionName]]);

          // Add any remaining sections that aren't in the predefined order
          const remainingSections = Object.entries(
            document.results || {}
          ).filter(
            ([sectionName]) =>
              sectionName !== "person_infobox" &&
              !sectionOrder.includes(sectionName)
          );

          const allSections = [...orderedSections, ...remainingSections];

          return allSections.map(([sectionName, section]) => {
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
          });
        })()}

        {/* Global References */}
        {globalReferences.length > 0 && (
          <References references={globalReferences} />
        )}
      </main>
    </div>
  );
}
