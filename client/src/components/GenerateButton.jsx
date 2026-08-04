function GenerateButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
    >
      {loading ? "Generating..." : " Generate Reply"}
    </button>
  );
}

export default GenerateButton;