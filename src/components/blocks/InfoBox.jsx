export default function InfoBox({ children, image, imageAlt, imageCaption }) {
  return (
    <div className="float-right ml-6 mb-4 w-72 border border-gray-300 bg-gray-50 p-4 text-sm font-libre">
      {image && (
        <div className="text-center mb-3">
          <img
            src={image}
            alt={imageAlt}
            className="w-full max-w-64 h-auto border border-gray-300"
          />
          {imageCaption && (
            <div className="text-xs text-gray-600 mt-1 italic">
              {imageCaption}
            </div>
          )}
        </div>
      )}
      <table className="w-full text-sm">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
