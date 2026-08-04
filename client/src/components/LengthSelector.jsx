function LengthSelector({ length, setLength ,darkMode }) {
  return (
    <div>
      <label className="block mb-2 font-semibold">
        Length
      </label>

      <select
        value={length}
        onChange={(e) => setLength(e.target.value)}
       className={`w-full rounded-lg border p-3 ${
    darkMode
      ? "bg-gray-700 text-white border-gray-600"
      : "bg-white text-black border-gray-300"
  }`}
      >
        <option>Short</option>
        <option>Medium</option>
        <option>Long</option>
      </select>
    </div>
  );
}

export default LengthSelector;