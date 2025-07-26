export default function Paragraph({ children, className = "" }) {
  return (
    <p
      className={`text-black leading-relaxed mb-4 font-libre text-md ${className}`}
    >
      {children}
    </p>
  );
}
