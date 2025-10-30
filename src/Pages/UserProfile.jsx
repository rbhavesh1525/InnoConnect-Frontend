import React, { useState } from "react";
import { ProfileSideBar } from "../Components/CompIndex";
import {
  AccountSettings,
  CollaborationRequests,
  HelpPage,
  MyNetwork,
  MyPosts,
} from "./PageIndex";
import { Pencil } from "lucide-react";
import {Navbar} from "../Components/CompIndex";

function UserProfile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState({
    name: "Bhavesh Rathod",
    role: "Innovator • Collaborator",
    image: "",
  });

  // Dynamic page rendering
  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return <MyPosts />;
      case "collaboration":
        return <CollaborationRequests />;
      case "connections":
        return <MyNetwork />;
      case "settings":
        return <AccountSettings />;
      case "help":
        return <HelpPage />;
      default:
        return <MyPosts />;
    }
  };

  return (
    <>
    <Navbar />
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Sidebar */}
      <ProfileSideBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl text-white p-6 shadow-lg relative">
          <button
            onClick={() => setEditing(!editing)}
            className="absolute top-5 right-5 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-all"
          >
            <Pencil size={18} />
          </button>

          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-purple-600 shadow-md">
              {user.image ? (
                <img
                  src={user.image}
                  alt="profile"
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-sm opacity-90">{user.role}</p>
            </div>
          </div>

          {/* Edit Info Form */}
          {editing && (
            <div className="mt-4 bg-white text-gray-700 p-4 rounded-xl shadow-md">
              <label className="block mb-2 font-medium">Update Name</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="border w-full p-2 rounded-md mb-3"
              />

              <label className="block mb-2 font-medium">Upload Image</label>
              <input
                type="file"
                onChange={(e) =>
                  setUser({ ...user, image: URL.createObjectURL(e.target.files[0]) })
                }
                className="mb-3"
              />

              <button
                onClick={() => setEditing(false)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-md hover:opacity-90"
              >
                Save Info
              </button>
            </div>
          )}
        </div>

        {/* Rendered Page Section */}
        <div className="mt-6">{renderContent()}</div>
      </div>
    </div>
    </>
  );
}

export default UserProfile;
