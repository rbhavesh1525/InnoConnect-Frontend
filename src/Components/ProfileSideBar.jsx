import React from "react";
import { LogOut, User, HelpCircle, Settings, Users, FileText } from "lucide-react";

const Sidebar = ({ setActiveTab, activeTab }) => {
  const tabs = [
    { id: "posts", label: "My Posts", icon: <FileText size={18} /> },
    { id: "collaboration", label: "Collaboration Requests", icon: <Users size={18} /> },
    { id: "connections", label: "My Connections", icon: <User size={18} /> },
    { id: "settings", label: "Account Settings", icon: <Settings size={18} /> },
    { id: "help", label: "Help Page", icon: <HelpCircle size={18} /> },
  ];

  return (
    <div className="w-64 bg-white shadow-lg rounded-r-2xl p-5">
      <h2 className="text-xl font-bold mb-6 text-gray-700">Dashboard</h2>
      <ul className="space-y-3">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                : "hover:bg-blue-50 text-gray-600"
            }`}
          >
            {tab.icon}
            {tab.label}
          </li>
        ))}
      </ul>
      <button className="mt-10 flex items-center gap-3 text-red-500 hover:bg-red-50 p-3 rounded-xl w-full transition-all">
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
};

export default Sidebar;
