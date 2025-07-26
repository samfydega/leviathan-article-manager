export default function TableHeader({ children, icon, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300 ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        {children}
      </div>
    </th>
  );
}
