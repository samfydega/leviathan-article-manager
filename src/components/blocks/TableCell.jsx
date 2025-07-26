export default function TableCell({ children, className = "" }) {
  return (
    <td
      className={`px-4 py-3 text-sm text-gray-900 border-b border-gray-200 ${className}`}
    >
      {children}
    </td>
  );
}
