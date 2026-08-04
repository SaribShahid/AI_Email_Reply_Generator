import toast from "react-hot-toast";

function CopyButton({ reply }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(reply);
    toast.success("Copied!");
  };

  return (
    <button
      onClick={handleCopy}
      className="bg-green-600 text-white px-4 py-2 rounded-lg"
    >
       Copy
    </button>
  );
}

export default CopyButton;