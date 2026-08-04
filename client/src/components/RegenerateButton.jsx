function RegenerateButton({ onRegenerate }) {
  return (
    <button
      onClick={onRegenerate}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
    >
      🔄 Regenerate
    </button>
  );
}

export default RegenerateButton;