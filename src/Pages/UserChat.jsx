import React, { useState } from "react";
import { Send, Search } from "lucide-react";
import {Navbar} from "../Components/CompIndex";
const UserChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState({});

  // Dummy user list (replace with API data)
  const users = [
    { id: 1, name: "Aarav Patel" },
    { id: 2, name: "Sneha Sharma" },
    { id: 3, name: "Rahul Mehta" },
    { id: 4, name: "Priya Desai" },
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!selectedUser || message.trim() === "") return;

    setChat((prev) => ({
      ...prev,
      [selectedUser.id]: [
        ...(prev[selectedUser.id] || []),
        { text: message, sender: "me", time: new Date().toLocaleTimeString() },
      ],
    }));
    setMessage("");
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex justify-center items-center bg-gray-50 py-2 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md border border-blue-300 shadow-blue-200 flex overflow-hidden">
        {/* LEFT PANEL - USER LIST */}
        <div className="w-1/3 border-r border-blue-200 p-4 flex flex-col">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Messages
          </h2>

          {/* Search Bar */}
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search user..."
              className="bg-transparent border-none outline-none px-2 flex-1 text-sm"
            />
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-3 rounded-xl mb-2 cursor-pointer transition ${
                  selectedUser?.id === user.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-gray-100"
                }`}
              >
                {user.name}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - CHAT WINDOW */}
        <div className="w-2/3 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-blue-200 px-5 py-3 flex justify-between items-center bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-700">
                  {selectedUser.name}
                </h3>
                <span className="text-xs text-gray-500">Online</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
                {(chat[selectedUser.id] || []).map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    } mb-3`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-sm ${
                        msg.sender === "me"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-xs block text-gray-300 mt-1 text-right">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSend}
                className="flex items-center border-t border-blue-200 px-4 py-3 bg-white"
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 border border-blue-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="ml-3 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex justify-center items-center text-gray-500">
              Select a user to start chatting 💬
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default UserChat;
