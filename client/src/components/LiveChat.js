import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

function LiveChat({ user, projectId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;

    const db = getFirestore();
    const messagesRef = collection(db, "projects", projectId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse();
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && projectId) {
      const db = getFirestore();
      const messagesRef = collection(db, "projects", projectId, "messages");
      await addDoc(messagesRef, {
        text: newMessage,
        sender: user.email,
        timestamp: new Date(),
      });
      setNewMessage("");
    }
  };

  if (!projectId) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Live Chat
      </h2>
      <div className="h-64 overflow-y-auto mb-4 bg-gray-100 dark:bg-gray-700 p-2 rounded">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {message.sender}:{" "}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              {message.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-600 dark:text-white"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition duration-300"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

export default LiveChat;
