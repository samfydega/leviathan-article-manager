export default function ReferenceLink({ href, number, className = "" }) {
  return (
    <sup>
      <a
        href={href}
        className={`text-blue-600 hover:text-blue-800 underline text-xs ${className}`}
        onClick={(e) => {
          e.preventDefault();
          document
            .getElementById(href.substring(1))
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        [{number}]
      </a>
    </sup>
  );
}
