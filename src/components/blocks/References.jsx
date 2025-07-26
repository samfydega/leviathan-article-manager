import React from "react";

export default function References({ references }) {
  const formatMLACitation = (ref) => {
    const { author, title, publisher, url, date } = ref;

    // Format the citation in MLA style
    const parts = [];

    // Author
    if (author && author !== "—") {
      parts.push(`${author}. `);
    }

    // Title in quotes
    parts.push(`"${title}." `);

    // Publisher
    if (publisher && publisher !== "—") {
      parts.push(`${publisher}, `);
    }

    // Date
    if (date) {
      parts.push(`${date}, `);
    }

    // URL
    if (url) {
      // Extract domain from URL
      const domain = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
      parts.push(
        <a
          key="url"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline truncate block"
          title={domain}
        >
          {domain}
        </a>
      );
    }

    // Access date (hardcoded for now)
    parts.push(". Accessed 25 July 2025.");

    return parts;
  };

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-normal font-playfair text-gray-900 mb-6">
        References
      </h2>
      <div className="text-black leading-relaxed font-libre text-[14px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {references.map((ref) => (
          <div key={ref.globalId} id={`ref-${ref.globalId}`} className="mb-4">
            <span className="text-blue-600 font-semibold">
              [{ref.globalId}]
            </span>{" "}
            {formatMLACitation(ref)}
          </div>
        ))}
      </div>
    </div>
  );
}
