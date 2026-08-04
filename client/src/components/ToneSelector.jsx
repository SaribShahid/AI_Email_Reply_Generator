function ToneSelector({ tone, setTone ,darkMode }) {
  return (
    <div>
      <label className="block mb-2 font-semibold">
        Tone
      </label>

      <select
  className={`w-full rounded-lg border p-3 ${
    darkMode
      ? "bg-gray-700 text-white border-gray-600"
      : "bg-white text-black border-gray-300"
  }`}
>
        <option>Professional</option>
        <option>Friendly</option>
        <option>Formal</option>
        <option>Casual</option>
        <option>Confident</option>
      </select>
    </div>
  );
}

export default ToneSelector;