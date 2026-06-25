import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, HandCoins, Users } from "lucide-react";
import axios from "axios";

const UserFeed = () => {
  const [projects, setProjects] = useState([]);
  // followMap: { [targetUserId]: boolean }
  const [followMap, setFollowMap] = useState({});
  const [followLoading, setFollowLoading] = useState(null); // stores userId being followed

  // Fetch projects from backend (replace with your API)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        
        // TEMP demo data
        setProjects([
          {
            id: 1,
            user: { name: "Aarav Mehta", id: "u1" },
            title: "AI Mental Health Assistant",
            description:
              "A virtual companion that uses NLP to detect emotional patterns and suggest coping strategies.",
            seeking: ["Collaboration", "Funding"],
            image: "https://source.unsplash.com/800x400/?ai,healthcare",
            video: "",
          },
          {
            id: 2,
            user: { name: "Sara Khan", id: "u2" },
            title: "EcoTrack – Smart Waste Management",
            description:
              "IoT-enabled bins that optimize garbage collection routes for cities.",
            seeking: ["Feedback", "Collaboration"],
            image: "",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
        ]);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleFollow = async (targetUserId) => {
    const myId = localStorage.getItem("user_id");
    if (!myId || !targetUserId || myId === targetUserId) return;

    setFollowLoading(targetUserId);
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/follow/${targetUserId}`,
        { follower_id: myId }
      );
      setFollowMap((prev) => ({ ...prev, [targetUserId]: true }));
    } catch (error) {
      console.error("FOLLOW ERROR:", error.response?.data || error.message);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleAction = (action, projectId) => {
    console.log(`${action} clicked for project ${projectId}`);
  };

  return (
    <div className="flex justify-center bg-gray-50 py-8">
      <div className="w-full max-w-3xl space-y-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-200 p-6 transition hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => console.log("Navigate to profile:", project.user.id)}
                className="text-lg font-semibold text-blue-700 hover:underline"
              >
                {project.user.name}
              </button>
             <button
  onClick={() => handleFollow(project.user.id)}
  disabled={followLoading === project.user.id || followMap[project.user.id]}
  className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
    followMap[project.user.id]
      ? "bg-green-600"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {followLoading === project.user.id
    ? "Following..."
    : followMap[project.user.id]
    ? "Following ✓"
    : "Follow"}
</button>
            </div>

            {/* Project Info */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {project.title}
            </h3>
            <p className="text-gray-600 mb-3">{project.description}</p>

            {/* Seeking Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.seeking.map((item) => (
                <span
                  key={item}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Image / Video */}
            {project.image && (
              <img
                src={project.image}
                alt="Project visual"
                className="w-full rounded-lg mb-4"
              />
            )}
            {project.video && (
              <video
                controls
                className="w-full rounded-lg mb-4"
                src={project.video}
              ></video>
            )}

            {/* Actions */}
            <div className="flex justify-around border-t border-gray-200 pt-3 text-gray-600">
              <button
                onClick={() => handleAction("like", project.id)}
                className="flex items-center gap-2 hover:text-blue-600"
              >
                <Heart size={20} /> <span>Like</span>
              </button>

              <button
                onClick={() => handleAction("comment", project.id)}
                className="flex items-center gap-2 hover:text-blue-600"
              >
                <MessageCircle size={20} /> <span>Comment</span>
              </button>

              <button
                onClick={() => handleAction("fund", project.id)}
                className="flex items-center gap-2 hover:text-blue-600"
              >
                <HandCoins size={20} /> <span>Fund Request</span>
              </button>

              <button
                onClick={() => handleAction("collaborate", project.id)}
                className="flex items-center gap-2 hover:text-blue-600"
              >
                <Users size={20} /> <span>Collaborate</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserFeed;
