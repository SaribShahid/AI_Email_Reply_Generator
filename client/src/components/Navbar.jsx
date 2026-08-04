function Navbar({ darkMode, setDarkMode }) {
  return (
    <nav
      className={
        darkMode
          ? "bg-gray-800 shadow-md"
          : "bg-blue-600 shadow-md"
      }
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-white">
           AI Email Reply Generator
        </h1>
        <p className="text-sm text-gray-300">
    Powered by Gemini AI
</p>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-white text-black px-4 py-2 rounded-lg"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;