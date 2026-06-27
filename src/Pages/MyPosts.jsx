import React, { useState, useEffect } from "react";
import { getUserProjects } from "../services/projectApi";
import {
  Heart, MessageCircle, HandCoins, Users, Building2, Briefcase, Send
} from "lucide-react";
import { sendFundRequest } from "../services/fundRequestApi";

function MyPosts() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static tracking for likes and comments
  const [likes, setLikes] = useState({});
  const [showComments, setShowComments] = useState({});
  const [commentsList, setCommentsList] = useState({});
  const [newComment, setNewComment] = useState({});

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = storedUser?.role;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        setError("User ID not found");
        setLoading(false);
        return;
      }
      const data = await getUserProjects(userId);
      setProjects(data || []);
      
      // Initialize static counts for new projects
      const initialCommentsList = {};
      (data || []).forEach(p => {
        const id = p.id || p.project_id;
        initialCommentsList[id] = [
          { user: "Alex D.", text: "This looks very promising!" },
          { user: "Sarah K.", text: "Would love to see a demo of this." }
        ];
      });
      setCommentsList(initialCommentsList);
      
    } catch (err) {
      console.error(err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, projectId) => {
    if (action === "like") {
      setLikes(prev => ({ ...prev, [projectId]: !prev[projectId] }));
    } else if (action === "comment") {
      setShowComments(prev => ({ ...prev, [projectId]: !prev[projectId] }));
    } else if (action === "fund") {
      try {
        const project = projects.find(p => (p.project_id || p.id) === projectId);
        const ownerId = project?.owner_id || project?.user?.id;
        if (!ownerId) {
          console.error("Owner ID not found for project", projectId);
          alert("Could not identify the project owner.");
          return;
        }
        await sendFundRequest(ownerId, projectId);
        alert("Fund request sent successfully!");
      } catch (err) {
        console.error("Failed to send fund request:", err);
        alert("Failed to send fund request.");
      }
    }
  };

  const handleAddComment = (projectId) => {
    const text = newComment[projectId];
    if (!text || text.trim() === "") return;
    
    setCommentsList(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), { user: "You", text: text.trim() }]
    }));
    
    setNewComment(prev => ({ ...prev, [projectId]: "" }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Building2 size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">No projects found</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-gray-50 py-8">
      <div className="w-full max-w-3xl space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-6">My Projects</h2>
        
        {projects.map((project) => {
          const ownerName = project.owner || "InnoConnect";
          const industry = project.industry_category || project.industry;
          const projectId = project.id || project.project_id;
          
          return (
            <div
              key={projectId}
              className="bg-white rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.15)] border border-blue-100 p-6 transition hover:shadow-[0_0_25px_rgba(37,99,235,0.25)] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {ownerName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <button className="text-base font-semibold text-blue-700 hover:underline">
                    {ownerName}
                  </button>
                </div>
              </div>

              {/* Project info */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {project.project_title}
              </h3>
              <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                {project.description || project.problem_statement}
              </p>

              {/* Industry tag */}
              {industry && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Building2 size={13} />
                    {industry}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-around border-t border-gray-100 pt-3 text-gray-500">
                <button
                  onClick={() => handleAction("like", projectId)}
                  className={`flex items-center gap-2 transition-colors text-sm ${likes[projectId] ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                  <Heart size={18} fill={likes[projectId] ? "currentColor" : "none"} /> Like
                </button>
                <button
                  onClick={() => handleAction("comment", projectId)}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors text-sm"
                >
                  <MessageCircle size={18} /> Comment
                </button>
                {role === "investor" && (
                  <button
                    onClick={() => handleAction("fund", projectId)}
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors text-sm"
                  >
                    <HandCoins size={18} /> Fund
                  </button>
                )}
                {role !== "investor" && (
                  <button
                    onClick={() => handleAction("collaborate", projectId)}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors text-sm"
                  >
                    <Users size={18} /> Collaborate
                  </button>
                )}
              </div>

              {/* Comment Section */}
              {showComments[projectId] && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                      value={newComment[projectId] || ""}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [projectId]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(projectId)}
                    />
                    <button 
                      onClick={() => handleAddComment(projectId)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto pr-2">
                    {(commentsList[projectId] || []).map((c, i) => (
                      <div key={i} className="bg-slate-50 p-3 rounded-xl">
                        <span className="font-semibold text-sm text-slate-800">{c.user}</span>
                        <p className="text-sm text-slate-600 mt-0.5">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyPosts;