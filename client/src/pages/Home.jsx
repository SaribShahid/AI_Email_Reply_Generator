import { useState, useEffect } from "react";
import ToneSelector from "../components/ToneSelector";
import LengthSelector from "../components/LengthSelector";
import GenerateButton from "../components/GenerateButton";
import ReplyCard from "../components/ReplyCard";
import Loading from "../components/Loading";


function Home({ darkMode }) {

const [email, setEmail] = useState("");
const [reply, setReply] = useState("");
const [loading, setLoading] = useState(false);
const [tone, setTone] = useState("Professional");
const [length, setLength] = useState("Medium");
const [emails, setEmails] = useState([]);
const [selectedEmail, setSelectedEmail] = useState(null);
const [draftLoading, setDraftLoading] = useState(false);
const [draftMessage, setDraftMessage] = useState("");
const [sendLoading, setSendLoading] = useState(false);
const [sendMessage, setSendMessage] = useState("");

useEffect(() => {
  fetchEmails();
}, []);

const fetchEmails = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/gmail/unread"
    );

    const data = await response.json();

    if (Array.isArray(data)) {
      setEmails(data);
    }
  } catch (error) {
    console.error("Error fetching emails:", error);
  }
};

const selectEmail = (selected) => {
  setSelectedEmail(selected);
  setEmail(selected.body);
  setReply("");
  setDraftMessage("");
};

const generateReply = async () => {
  if (!selectedEmail) return;

  setLoading(true);
  setReply("");
  setDraftMessage("");

  try {
    const response = await fetch(
      `http://localhost:5000/gmail/generate-reply/${selectedEmail.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tone,
          length,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
  setSendMessage("Reply sent successfully!");

  setTimeout(() => {
    setSendMessage("");
  }, 3000);
} else {
      console.error(data.error);
    }

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

const sendReply = async () => {
  if (!selectedEmail || !reply.trim()) return;

  setSendLoading(true);
  setSendMessage("");

  try {
    const response = await fetch(
      `http://localhost:5000/gmail/send/${selectedEmail.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reply: reply,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setSendMessage("Reply sent successfully!");
      setTimeout(() => {
    setSendMessage("");
  }, 3000);
    } else {
      setSendMessage("" + (data.error || "Failed to send reply."));
    }
  } catch (error) {
    console.error(error);
    setSendMessage("Failed to send reply.");
  } finally {
    setSendLoading(false);
  }
};

const createDraft = async () => {
  if (!selectedEmail || !reply.trim()) return;

  setDraftLoading(true);
  setDraftMessage("");

  try {
    const response = await fetch(
      `http://localhost:5000/gmail/draft/${selectedEmail.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reply: reply,
        }),
      }
    );

    const data = await response.json();

   if (response.ok && data.success) {
  setDraftMessage("Reply saved as Gmail draft!");

  setTimeout(() => {
    setDraftMessage("");
  }, 3000);
} else {
      setDraftMessage(
        " " +
          (data.error?.message ||
            data.error ||
            "Failed to create draft")
      );
    }
  } catch (error) {
    console.error(error);
    setDraftMessage(" Failed to create Gmail draft.");
  } finally {
    setDraftLoading(false);
  }
};

  return (
    <div className="max-w-5xl mx-auto p-8">

<div className="mb-6">
  {emails.map((item) => (
    <div
      key={item.id}
      onClick={() => selectEmail(item)}
      className={`p-4 mb-3 rounded-lg border cursor-pointer ${
        selectedEmail?.id === item.id
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300"
      }`}
    >
      <p className="font-semibold">
        {item.subject}
      </p>

      <p className="text-sm text-gray-600">
        {item.from}
      </p>

      <p className="text-sm mt-2">
        {item.body.substring(0, 150)}...
      </p>
    </div>
  ))}
</div>

      <div
  className={
    darkMode
      ? "bg-gray-800 rounded-xl shadow-lg p-8"
      : "bg-white rounded-xl shadow-lg p-8"
  }
>

        <h2
  className={`text-3xl font-bold mb-6 ${
    darkMode ? "text-white" : "text-black"
  }`}
>
  Generate Professional Email Replies
</h2>
        <textarea
  rows={8}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Paste your email here..."
  className={`w-full rounded-lg border p-4 mb-6 resize-none ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-black"
  }`}
/>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <ToneSelector
  tone={tone}
  setTone={setTone}
  darkMode={darkMode}
/>

<LengthSelector
  length={length}
  setLength={setLength}
  darkMode={darkMode}
/>
        </div>

        <GenerateButton
  onClick={generateReply}
  loading={loading}
/>

  </div>

      {loading ? (
    <Loading />
) : (
    <ReplyCard
  reply={reply}
  setReply={setReply}
  darkMode={darkMode}
  onRegenerate={generateReply}
  onSend={sendReply}
  sendLoading={sendLoading}
  sendMessage={sendMessage}
  onDraft={createDraft}
  draftLoading={draftLoading}
  draftMessage={draftMessage}
/>
)}

    </div>
  );
}

export default Home;