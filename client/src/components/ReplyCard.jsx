import { useState } from "react";
import RegenerateButton from "./RegenerateButton";
import CopyButton from "./CopyButton";

function ReplyCard({
  reply,
  setReply,
  darkMode,
  onRegenerate,
  onSend,
  sendLoading,
  sendMessage,
  onDraft,
  draftLoading,
  draftMessage,
}) {
  const [copyMessage, setCopyMessage] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reply);

      setCopyMessage("Reply copied to clipboard!");

      setTimeout(() => {
        setCopyMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setCopyMessage("Failed to copy reply.");
    }
  };

  return (
    <div
      className={`rounded-xl shadow-2xl p-6 mt-8 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2
        className={`text-xl font-bold mb-4 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        AI Reply
      </h2>

      {reply ? (
        <>
          <textarea
            className={`w-full border rounded-2xl p-4 ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            }`}
             rows={10}
  value={reply || ""}
  onChange={(e) => setReply(e.target.value)}
          />

          <div className="flex justify-end gap-3 mt-4 flex-wrap">

            <RegenerateButton onRegenerate={onRegenerate} />

            <button
              onClick={handleCopy}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg"
            >
              📋 Copy
            </button>

            <button
              onClick={onSend}
              disabled={sendLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
            >
              {sendLoading ? "Sending..." : "📤 Send Reply"}
            </button>

            <button
              onClick={onDraft}
              disabled={draftLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg"
            >
              {draftLoading
                ? "Creating Draft..."
                : " Save Draft"}
            </button>

          </div>

          {/* Copy message */}
          {copyMessage && (
            <p className="mt-3 text-center text-sm">
              {copyMessage}
            </p>
          )}

          {/* Send message */}
          {sendMessage && (
            <p className="mt-3 text-center text-sm">
              {sendMessage}
            </p>
          )}

          {/* Draft message */}
          {draftMessage && (
            <p className="mt-3 text-center text-sm">
              {draftMessage}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">
              Your AI-generated reply will appear here.
            </p>

            <p className="text-sm mt-2">
              Select an email and click{" "}
              <strong>Generate Reply</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReplyCard;