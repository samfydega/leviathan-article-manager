export default function InfoBoxRow({ icon, label, children }) {
  return (
    <tr>
      <td className="font-semibold py-1 pr-2 text-gray-700 align-top">
        <div className="flex items-center gap-1.5">
          {icon}
          {label}
        </div>
      </td>
      <td className="py-1">{children}</td>
    </tr>
  );
}
