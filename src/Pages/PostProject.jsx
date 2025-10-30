import React, { useState } from "react";

const PostProject = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    stage: "",
    seeking: [],
    image: null,
    video: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        seeking: checked
          ? [...prev.seeking, value]
          : prev.seeking.filter((item) => item !== value),
      }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: e.target.files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting project:", formData);

    // API-ready format for backend submission
    const projectData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) projectData.append(key, JSON.stringify(value));
      else projectData.append(key, value);
    });

    // Example: await axios.post(`${import.meta.env.VITE_API_URL}/projects`, projectData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.4)]  border-blue-100"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Post Your Project
        </h2>

        {/* Project Title */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">
            Project Title
          </label>
          <input
            type="text"
            name="title"
            placeholder="Enter your project title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">
            Project Description
          </label>
          <textarea
            name="description"
            placeholder="Describe your project idea or goals"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select category</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="FinTech">FinTech</option>
            <option value="Environment">Environment</option>
            <option value="Social Impact">Social Impact</option>
            <option value="Technology">Technology</option>
          </select>
        </div>

        {/* Stage */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">Stage</label>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select stage</option>
            <option value="Idea">Idea</option>
            <option value="Prototype">Prototype</option>
            <option value="Growth">Growth</option>
            <option value="Established">Established</option>
          </select>
        </div>

        {/* Seeking */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">
            What are you seeking for?
          </label>
          <div className="flex flex-wrap gap-4">
            {["Feedback", "Collaboration", "Funding"].map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="seeking"
                  value={option}
                  onChange={handleChange}
                  checked={formData.seeking.includes(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Uploads */}
        <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              name="image"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Video
            </label>
            <input
              type="file"
              accept="video/*"
              name="video"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Post Project
        </button>
      </form>
    </div>
  );
};

export default PostProject;
