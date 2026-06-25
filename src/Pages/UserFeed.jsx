import React, { useEffect, useState } from "react";
import {
  Heart, MessageCircle, HandCoins, Users,
  Sparkles, TrendingUp, Layers, Building2,
} from "lucide-react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const UserFeed = () => {
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isPersonalised, setIsPersonalised] = useState(false);

  // followMap: { [targetUserId]: boolean }
  const [followMap, setFollowMap]         = useState({});
  const [followLoading, setFollowLoading] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role       = storedUser?.role;
  const userId     = localStorage.getItem("user_id");

  useEffect(() => {
    if (role === "investor" && userId) {
      fetchInvestorFeed();
    } else {
      fetchGenericFeed();
    }
  }, []);

  // ── Investor personalised feed ───────────────────────────────────
  const fetchInvestorFeed = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/investor-feed/${userId}`);
      if (res.data.success) {
        setProjects(res.data.data ?? []);
        setIsPersonalised(res.data.personalised ?? false);
      }
    } catch (err) {
      console.error("Investor feed error:", err.response?.data || err.message);
      // Fall back to generic feed on error
      await fetchGenericFeed();
    } finally {
      setLoading(false);
    }
  };

  // ── Generic feed (innovators / logged-out) ───────────────────────
  const fetchGenericFeed = async () => {
    setLoading(true);
    try {
      // TODO: replace with real projects API when available
      setProjects([
        {
          project_id: "demo-1",
          owner: "Aarav Mehta",
          owner_id: "u1",
          project_title: "AI Mental Health Assistant",
          description:
            "A virtual companion that uses NLP to detect emotional patterns and suggest coping strategies.",
          industry: "HealthTech",
          similarity: null,
        },
        {
          project_id: "demo-2",
          owner: "Sara Khan",
          owner_id: "u2",
          project_title: "EcoTrack – Smart Waste Management",
          description:
            "IoT-enabled bins that optimize garbage collection routes for cities.",
          industry: "Clean Energy",
          similarity: null,
        },
      ]);
    } catch (err) {
      console.error("Feed error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Follow handler ───────────────────────────────────────────────
  const handleFollow = async (targetUserId) => {
    const myId = localStorage.getItem("user_id");
    if (!myId || !targetUserId || myId === targetUserId) return;

    setFollowLoading(targetUserId);
    try {
      await axios.post(
        `${BASE_URL}/api/follow/${targetUserId}`,
        { follower_id: myId }
      );
      setFollowMap((prev) => ({ ...prev, [targetUserId]: true }));
    } catch (err) {
      console.error("Follow error:", err.response?.data || err.message);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleAction = (action, projectId) => {
    console.log(`${action} clicked for project ${projectId}`);
  };

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm">
            {role === "investor" ? "Finding projects matching your interests…" : "Loading feed…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-gray-50 py-8">
      <div className="w-full max-w-3xl space-y-6">

        {/* Personalised banner for investors */}
        {role === "investor" && isPersonalised && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl px-5 py-3">
            <Sparkles size={18} className="text-indigo-500 flex-shrink-0" />
            <p className="text-sm text-indigo-700">
              <span className="font-semibold">Personalised feed</span> — Projects ranked by relevance to your investment interests
            </p>
          </div>
        )}

        {role === "investor" && !isPersonalised && projects.length > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
            <TrendingUp size={18} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Get verified as an investor to see projects tailored to your interests.
            </p>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Building2 size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No projects found</p>
          </div>
        )}

        {/* Project cards */}
        {projects.map((project) => {
          const ownerId   = project.owner_id || project.user?.id || null;
          const ownerName = project.owner || project.user?.name || "InnoConnect";

          return (
            <div
              key={project.project_id || project.id}
              className="bg-white rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.15)] border border-blue-100 p-6 transition hover:shadow-[0_0_25px_rgba(37,99,235,0.25)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {ownerName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <button
                    onClick={() => console.log("Navigate to profile:", ownerId)}
                    className="text-base font-semibold text-blue-700 hover:underline"
                  >
                    {ownerName}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Similarity badge for investors */}
                  {project.similarity !== null && project.similarity !== undefined && (
                    <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {Math.round(project.similarity * 100)}% match
                    </span>
                  )}

                  {ownerId && (
                    <button
                      onClick={() => handleFollow(ownerId)}
                      disabled={followLoading === ownerId || followMap[ownerId]}
                      className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-colors ${
                        followMap[ownerId]
                          ? "bg-green-600"
                          : "bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                      }`}
                    >
                      {followLoading === ownerId ? "…" : followMap[ownerId] ? "Following ✓" : "Follow"}
                    </button>
                  )}
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
              {project.industry && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Building2 size={13} />
                    {project.industry}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-around border-t border-gray-100 pt-3 text-gray-500">
                <button
                  onClick={() => handleAction("like", project.project_id)}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors text-sm"
                >
                  <Heart size={18} /> Like
                </button>
                <button
                  onClick={() => handleAction("comment", project.project_id)}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors text-sm"
                >
                  <MessageCircle size={18} /> Comment
                </button>
                <button
                  onClick={() => handleAction("fund", project.project_id)}
                  className="flex items-center gap-2 hover:text-indigo-600 transition-colors text-sm"
                >
                  <HandCoins size={18} /> Fund
                </button>
                <button
                  onClick={() => handleAction("collaborate", project.project_id)}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors text-sm"
                >
                  <Users size={18} /> Collaborate
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserFeed;
