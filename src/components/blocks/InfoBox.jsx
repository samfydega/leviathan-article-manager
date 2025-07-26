export default function InfoBox({ children, image, imageAlt, imageCaption }) {
  return (
    <div className="w-full mb-4 border border-gray-300 bg-gray-50 p-4 text-sm font-libre lg:float-right lg:ml-6 lg:w-72">
      {image && (
        <div className="text-center mb-3">
          <img
            src={image}
            alt={imageAlt}
            className="mx-auto w-full max-w-64 h-auto border border-gray-300 lg:mx-0"
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
