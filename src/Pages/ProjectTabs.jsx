import React, { useState } from "react";
import { Home, Search, PlusCircle } from "lucide-react";
import {UserFeed,PostProject,SearchProject} from "./PageIndex"
function ProjectTabs() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <UserFeed />;
      case "search":
        return <SearchProject />;
      case "post":
        return <PostProject />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex justify-around bg-white rounded-2xl p-2 mt-4 border">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
            activeTab === "home"
              ? "bg-blue-500 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Home size={20} />
          <span className="text-sm font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
            activeTab === "search"
              ? "bg-blue-500 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Search size={20} />
          <span className="text-sm font-medium">Search</span>
        </button>

        <button
          onClick={() => setActiveTab("post")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
            activeTab === "post"
              ? "bg-blue-500 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <PlusCircle size={20} />
          <span className="text-sm font-medium">Post Project</span>
        </button>
      </div>

      {/* Render content below */}
      <div className="mt-6  ">
        {renderContent()}
      </div>
    </div>
  );
}

export default ProjectTabs;
