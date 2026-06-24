import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkSimilarity, submitProject, getAIGuidance, sendChatMessage } from "../services/projectApi";
import { sendCollaborationRequest } from "../services/collaborationApi";
import MarkdownMessage from "../Components/MarkdownMessage";

const STATUS_STYLES = {
  duplicate: {
    badge: "bg-red-100 text-red-800 border-red-200",
    label: "Likely duplicate",
  },
  possibly_similar: {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    label: "Possibly similar",
  },
  related: {
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Related idea",
  },
};

// Word-count fields that require min/max validation
const WORD_COUNT_FIELDS = [
  "project_title",
  "description",
  "problem_statement",
  "solution_overview",
];
const MIN_WORDS = 5;
const MAX_WORDS = 500;

const countWords = (text) =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

const PostProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_title: "",
    description: "",
    problem_statement: "",
    solution_overview: "",
    industry_category: "",
  });

  const [similarResults, setSimilarResults] = useState(null);
  const [hasCheckedSimilarity, setHasCheckedSimilarity] = useState(false);
  const [loading, setLoading] = useState({ check: false, submit: false, guidance: false });
  const [collaborationLoading, setCollaborationLoading] = useState({});
  const [sentRequests, setSentRequests] = useState({});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [guidance, setGuidance] = useState(null);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasCheckedSimilarity(false);
    setSimilarResults(null);
    setSuccessMessage("");
    setGuidance(null);
    setChatOpen(false);
    setChatMessages([]);

    // Clear per-field error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const buildPayload = () => ({
    project_title: formData.project_title.trim(),
    description: formData.description.trim(),
    problem_statement: formData.problem_statement.trim(),
    solution_overview: formData.solution_overview.trim(),
    industry_category: formData.industry_category.trim(),
  });

  const validateForm = () => {
    const payload = buildPayload();
    const errors = {};

    // Check all fields are filled
    Object.entries(payload).forEach(([key, value]) => {
      if (!value) {
        errors[key] = `${key.replace(/_/g, " ")} is required.`;
      }
    });

    // Check word counts for text fields
    WORD_COUNT_FIELDS.forEach((field) => {
      if (payload[field]) {
        const wc = countWords(payload[field]);
        if (wc < MIN_WORDS) {
          errors[field] = `Must be at least ${MIN_WORDS} words (currently ${wc}).`;
        } else if (wc > MAX_WORDS) {
          errors[field] = `Must be at most ${MAX_WORDS} words (currently ${wc}).`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields before continuing.");
      return false;
    }

    setFieldErrors({});
    setError("");
    return true;
  };

  const handleCheckSimilarity = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading((prev) => ({ ...prev, check: true }));
    setError("");
    setSuccessMessage("");

    try {
      const results = await checkSimilarity(buildPayload());
      setSimilarResults(results);
      setHasCheckedSimilarity(true);
    } catch (err) {
      setSimilarResults(null);
      setHasCheckedSimilarity(false);
      setError(
        err.response?.data?.detail ||
          "Failed to check for similar ideas. Is the backend running?"
      );
    } finally {
      setLoading((prev) => ({ ...prev, check: false }));
    }
  };

  const handleSubmitProject = async () => {
    if (!validateForm()) return;

    setLoading((prev) => ({ ...prev, submit: true }));
    setError("");
    setSuccessMessage("");

    try {
      const response = await submitProject(buildPayload());
      setSuccessMessage(
        `Project submitted successfully! (ID: ${response.project_id})`
      );
      setFormData({
        project_title: "",
        description: "",
        problem_statement: "",
        solution_overview: "",
        industry_category: "",
      });
      setSimilarResults(null);
      setHasCheckedSimilarity(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to submit project. Please try again."
      );
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleGetAIGuidance = async () => {
    if (!validateForm()) return;

    setLoading((prev) => ({ ...prev, guidance: true }));
    setError("");
    setGuidance(null);

    try {
      const result = await getAIGuidance(buildPayload());
      setGuidance(result);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to get AI guidance. Please try again."
      );
    } finally {
      setLoading((prev) => ({ ...prev, guidance: false }));
    }
  };

  const handleSendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg = { role: "user", content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const data = await sendChatMessage({
        project: buildPayload(),
        similarProjects: filteredResults,
        message: text,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", content: data.reply },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            err.response?.data?.detail ||
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatOpen]);

  // Only show results with similarity >= 35%
  const filteredResults = similarResults?.filter(
    (item) => item.similarity >= 0.35
  ) ?? [];

  // True when any visible result has similarity > 75%
  const hasDuplicates = filteredResults.some(
    (item) => item.similarity > 0.75
  );

  const handleSendCollaborationRequest = async (item) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!item.owner_id || !item.project_id) {
      setError("This project cannot receive collaboration requests.");
      return;
    }

    const requestKey = `${item.owner_id}-${item.project_id}`;
    setCollaborationLoading((prev) => ({ ...prev, [requestKey]: true }));
    setError("");

    try {
      const response = await sendCollaborationRequest(
        item.owner_id,
        item.project_id
      );

      if (response.data?.success === false) {
        setError(response.data.message || "Request could not be sent.");
        if (response.data.message === "Request already exists") {
          setSentRequests((prev) => ({ ...prev, [requestKey]: true }));
        }
        return;
      }

      setSentRequests((prev) => ({ ...prev, [requestKey]: true }));
      setSuccessMessage(
        `Collaboration request sent to ${item.owner} for "${item.project_title}".`
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to send collaboration request. Please log in and try again."
      );
    } finally {
      setCollaborationLoading((prev) => ({ ...prev, [requestKey]: false }));
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-full max-w-3xl space-y-6">
        <form
          onSubmit={handleCheckSimilarity}
          className="bg-white p-8 rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.4)] border-blue-100"
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">
            Post Your Project
          </h2>
          <p className="text-gray-500 text-center mb-6 text-sm">
            Fill in your idea details, check for similar projects, then submit.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm">
              {successMessage}
            </div>
          )}

          {/* ── Project Title ── */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              Project Title
            </label>
            <input
              type="text"
              name="project_title"
              placeholder="Enter your project title"
              value={formData.project_title}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                fieldErrors.project_title ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.project_title ? (
                <p className="text-xs text-red-600">{fieldErrors.project_title}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ml-auto ${
                  countWords(formData.project_title) > MAX_WORDS
                    ? "text-red-500 font-semibold"
                    : countWords(formData.project_title) >= MIN_WORDS
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {countWords(formData.project_title)} / {MAX_WORDS} words
              </span>
            </div>
          </div>

          {/* ── Project Description ── */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              Project Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your project idea or goals"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                fieldErrors.description ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.description ? (
                <p className="text-xs text-red-600">{fieldErrors.description}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ml-auto ${
                  countWords(formData.description) > MAX_WORDS
                    ? "text-red-500 font-semibold"
                    : countWords(formData.description) >= MIN_WORDS
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {countWords(formData.description)} / {MAX_WORDS} words
              </span>
            </div>
          </div>

          {/* ── Problem Statement ── */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              Problem Statement
            </label>
            <textarea
              name="problem_statement"
              placeholder="What problem does your project solve?"
              value={formData.problem_statement}
              onChange={handleChange}
              rows="3"
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                fieldErrors.problem_statement ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.problem_statement ? (
                <p className="text-xs text-red-600">{fieldErrors.problem_statement}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ml-auto ${
                  countWords(formData.problem_statement) > MAX_WORDS
                    ? "text-red-500 font-semibold"
                    : countWords(formData.problem_statement) >= MIN_WORDS
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {countWords(formData.problem_statement)} / {MAX_WORDS} words
              </span>
            </div>
          </div>

          {/* ── Solution Overview ── */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2">
              Solution Overview
            </label>
            <textarea
              name="solution_overview"
              placeholder="How does your project address the problem?"
              value={formData.solution_overview}
              onChange={handleChange}
              rows="3"
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                fieldErrors.solution_overview ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.solution_overview ? (
                <p className="text-xs text-red-600">{fieldErrors.solution_overview}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ml-auto ${
                  countWords(formData.solution_overview) > MAX_WORDS
                    ? "text-red-500 font-semibold"
                    : countWords(formData.solution_overview) >= MIN_WORDS
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {countWords(formData.solution_overview)} / {MAX_WORDS} words
              </span>
            </div>
          </div>

          {/* ── Industry Category ── */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Industry Category
            </label>
            <select
              name="industry_category"
              value={formData.industry_category}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                fieldErrors.industry_category ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Select category</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="EdTech">EdTech</option>
              <option value="FinTech">FinTech</option>
              <option value="Environment">Environment</option>
              <option value="Social Impact">Social Impact</option>
              <option value="Technology">Technology</option>
            </select>
            {fieldErrors.industry_category && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.industry_category}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading.check}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading.check ? "Checking..." : "Check for Similar Ideas"}
          </button>
        </form>

        {hasCheckedSimilarity && (
          <div className="bg-white p-8 rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.2)] border-blue-100">
            <h3 className="text-xl font-bold text-blue-700 mb-2">
              Similar Ideas Found
            </h3>

            {hasDuplicates && (
              <p className="text-sm text-red-600 mb-4">
                ⚠️ One or more projects are over 75% similar to yours. Submission has been blocked — consider reaching out to collaborate.
              </p>
            )}

            {filteredResults.length === 0 ? (
              <p className="text-gray-600 text-sm mb-6">
                No similar projects found in the database. Your idea looks
                unique!
              </p>
            ) : (
              <div className="space-y-4 mb-6">
                {filteredResults.map((item, index) => {
                  const style =
                    STATUS_STYLES[item.status] || STATUS_STYLES.related;
                  const requestKey = `${item.owner_id}-${item.project_id}`;
                  const isSent = sentRequests[requestKey];
                  const isSending = collaborationLoading[requestKey];

                  return (
                    <div
                      key={`${item.project_title}-${index}`}
                      className="border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {item.project_title}
                        </h4>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Similarity:</span>{" "}
                          {(item.similarity * 100).toFixed(1)}%
                        </p>
                        <p>
                          <span className="font-medium">Owner:</span>{" "}
                          {item.owner}
                        </p>
                        <p>
                          <span className="font-medium">Industry:</span>{" "}
                          {item.industry}
                        </p>
                        {item.collaboration_message && (
                          <p className="text-blue-700 mt-2">
                            {item.collaboration_message}
                          </p>
                        )}
                      </div>

                      {item.owner_id && item.project_id && (
                        <button
                          type="button"
                          onClick={() => handleSendCollaborationRequest(item)}
                          disabled={isSent || isSending}
                          className="mt-3 w-full sm:w-auto bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSending
                            ? "Sending..."
                            : isSent
                              ? "Request Sent"
                              : "Send Collaboration Request"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {hasDuplicates && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-500 text-lg leading-none mt-0.5">⛔</span>
                <p className="text-sm text-red-700">
                  <span className="font-semibold">Submission blocked:</span> One or more existing projects have over 75% similarity with yours. Please review the matches above and consider collaborating instead.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleGetAIGuidance}
                disabled={loading.guidance}
                className="flex-1 bg-purple-600 text-white font-medium py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading.guidance ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating Guidance...
                  </>
                ) : (
                  <>
                    <span>✨</span> Get AI Guidance
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSubmitProject}
                disabled={loading.submit || hasDuplicates}
                className="flex-1 bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.submit
                  ? "Submitting..."
                  : hasDuplicates
                    ? "Submission Blocked — Too Similar"
                    : "Submit Project"}
              </button>
            </div>
          </div>
        )}

        {/* ── AI Guidance Panel ── */}
        {guidance && (
          <div className="bg-white p-8 rounded-2xl shadow-[0_0_15px_rgba(147,51,234,0.2)] border border-purple-100 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✨</span>
              <h3 className="text-xl font-bold text-purple-700">AI Innovation Guidance</h3>
            </div>

            {/* Similarity Analysis */}
            {guidance.guidance?.similarity_analysis && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-purple-700 mb-1 uppercase tracking-wide">Similarity Analysis</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{guidance.guidance.similarity_analysis}</p>
              </div>
            )}

            {/* Improved Title */}
            {guidance.guidance?.improved_title && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-700 mb-1 uppercase tracking-wide">Suggested Title</h4>
                <p className="text-gray-800 font-medium text-base">💡 {guidance.guidance.improved_title}</p>
              </div>
            )}

            {/* Differentiators & Unique Features side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guidance.guidance?.differentiators?.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">Differentiators</h4>
                  <ul className="space-y-1">
                    {guidance.guidance.differentiators.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-amber-500 shrink-0">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {guidance.guidance?.unique_features?.length > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-green-700 mb-2 uppercase tracking-wide">Unique Features</h4>
                  <ul className="space-y-1">
                    {guidance.guidance.unique_features.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-green-500 shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Rewritten Solution */}
            {guidance.guidance?.rewritten_solution && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Refined Solution Overview</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{guidance.guidance.rewritten_solution}</p>
              </div>
            )}

            {/* Raw fallback */}
            {guidance.guidance?.raw_response && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Raw AI Response</h4>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">{guidance.guidance.raw_response}</pre>
              </div>
            )}

            {/* Chat button — always visible at the bottom of the guidance panel */}
            <button
              type="button"
              onClick={() => {
                setChatOpen(true);
                if (chatMessages.length === 0) {
                  setChatMessages([{
                    role: "ai",
                    content: "Hi! I'm your Innovation Assistant 🚀 I've reviewed your project idea and the similar projects. Ask me anything — how to differentiate, unique angles, target audiences, business models, or how to improve your pitch!",
                  }]);
                }
              }}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with Innovation Assistant
            </button>
          </div>
        )}

        {/* ── Innovation Assistant Chat Modal ── */}
        {chatOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                 style={{ maxHeight: "85vh" }}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-indigo-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">AI</div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-tight">Innovation Assistant</p>
                    <p className="text-purple-200 text-xs">Helping you refine your idea</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-white/70 hover:text-white transition text-xl leading-none"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>

              {/* Context pill */}
              <div className="px-4 py-2 bg-purple-50 border-b border-purple-100">
                <p className="text-xs text-purple-600 truncate">
                  💡 <span className="font-medium">Context:</span>{" "}
                  {formData.project_title || "Your project idea"} · {formData.industry_category || "Unknown industry"}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "ai" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-0.5">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                      }`}
                    >
                      <MarkdownMessage content={msg.content} />
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {chatLoading && (
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      AI
                    </div>
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Suggested prompts — show only at start */}
              {chatMessages.length <= 1 && (
                <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100 bg-white">
                  {[
                    "How can I make this more unique?",
                    "Suggest a business model",
                    "Who is my target audience?",
                    "How can I improve my problem statement?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setChatInput(prompt)}
                      className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-1 hover:bg-purple-100 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2 items-end">
                <textarea
                  rows={1}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  placeholder="Ask anything about your project idea..."
                  className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 max-h-28 overflow-y-auto"
                  style={{ lineHeight: "1.4" }}
                />
                <button
                  type="button"
                  onClick={handleSendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-2.5 transition shrink-0"
                  aria-label="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostProject;
