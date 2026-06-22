import React, { useState, useEffect } from "react";
import { Pencil, Globe, Github, Linkedin, Mail, Phone } from "lucide-react";
import { Navbar, ProfileSideBar,InvestorVerificationForm } from "../Components/CompIndex";
import axios from "axios";
import {
  AccountSettings,
  CollaborationRequests,
  HelpPage,
  MyNetwork,
  MyPosts,
} from "./PageIndex";

function UserProfile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [showVerificationForm,
setShowVerificationForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    name: "",
    role: "",
    headline: "",
    bio: "",

    website_url: "",
    linkedin_url: "",
    github_url: "",

    profile_image: "",
    cover_image: "",

    verification_status: false,

    followers_count: 0,
    following_count: 0,
    projects_count: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("user_id");

      const response = await axios.get(
        `http://127.0.0.1:8000/api/user/profile/${userId}`
      );
      console.log("Profile data fetched", response.data);

      setUser(response?.data?.data || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
  try {
    const userId = localStorage.getItem("user_id");

    await axios.put(
      `http://127.0.0.1:8000/api/user/update-profile/${userId}`,
      user
    );
    console.log("Profile updated successfully");
    console.log("info sending",user);

    setEditing(false);
    fetchProfile();

  } catch (error) {
    console.error(error);
  }
};

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

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <h2 className="text-xl font-semibold">Loading Profile...</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-slate-100">
        <ProfileSideBar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 p-6">
          {/* PROFILE CARD */}
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            {/* COVER IMAGE */}
            <div className="relative h-60 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              {user?.cover_image && (
                <img
                  src={user.cover_image}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              )}

              <button
                onClick={() => setEditing(true)}
                className="absolute top-4 right-4 bg-white p-3 rounded-full shadow hover:scale-105 transition"
              >
                <Pencil size={18} />
              </button>
            </div>

            {/* PROFILE INFO */}
            <div className="px-8  pt-16 pb-8">
              <div className="-mt-16 flex flex-col md:flex-row md:items-end gap-5">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-purple-600">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{user?.name}</h1>

                    {user?.role === "investor" && user?.verification_status && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        ✓ Verified Investor
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-purple-600 font-medium capitalize">
                      {user?.role}
                    </p>
                  </div>

                  <p className="text-gray-500 mt-1">{user?.headline}</p>

                  {user?.role === "investor" && !user?.verification_status && (
                    <button
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      onClick={() => {
                       setShowVerificationForm(true);
                      }}
                    >
                      Verify Yourself as Investor
                    </button>
                  )}
                </div>
              </div>

              {/* ABOUT */}
              <div className="mt-8">
                <h2 className="font-bold text-xl mb-3">About</h2>

                <p className="text-gray-600 leading-relaxed">{user?.bio}</p>
              </div>

              {/* LINKS */}
              <div className="mt-8">
                <h2 className="font-bold text-xl mb-4">Links</h2>

                <div className="grid md:grid-cols-3 gap-4">
                  <a
                    href={user?.website_url || "#"}
                    className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-100"
                  >
                    <Globe size={20} />
                    Website
                  </a>

                  <a
                    href={user?.linkedin_url || "#"}
                    className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-100"
                  >
                    <Linkedin size={20} />
                    LinkedIn
                  </a>

                  <a
                    href={user?.github_url || "#"}
                    className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 hover:bg-slate-100"
                  >
                    <Github size={20} />
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="mt-6">{renderContent()}</div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-5">Edit Profile</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={user?.name || ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    name: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Headline"
                value={user?.headline || ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    headline: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Website URL"
                value={user?.website_url || ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    website_url: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="LinkedIn URL"
                value={user?.linkedin_url || ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    linkedin_url: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="GitHub URL"
                value={user?.github_url || ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    github_url: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />
            </div>

            <textarea
              rows="4"
              placeholder="Bio"
              value={user?.bio || ""}
              onChange={(e) =>
                setUser({
                  ...user,
                  bio: e.target.value,
                })
              }
              className="border p-3 rounded-lg w-full mt-4"
            />

            <div className="mt-4">
              <label className="font-medium block mb-2">Profile Image</label>

              <input
                type="file"
                onChange={(e) =>
                  setUser({
                    ...user,
                    profile_image: URL.createObjectURL(e.target.files[0]),
                  })
                }
              />
            </div>

            <div className="mt-4">
              <label className="font-medium block mb-2">Cover Image</label>

              <input
                type="file"
                onChange={(e) =>
                  setUser({
                    ...user,
                    cover_image: URL.createObjectURL(e.target.files[0]),
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-lg"
                onClick={() => {
                  handleUpdateProfile();
                  
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {
 showVerificationForm && (
   <InvestorVerificationForm
      onClose={() =>
        setShowVerificationForm(false)
      }
   />
 )
}
    </>
  );
}

export default UserProfile;
