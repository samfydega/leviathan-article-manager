export default function ErrorMessage({ message, className = "" }) {
  if (!message) return null;

  return (
    <div
      className={`text-sm text-red-600 font-inter bg-red-50 border border-red-200 rounded p-2 ${className}`}
    >
      {message}
    </div>
  );
}
