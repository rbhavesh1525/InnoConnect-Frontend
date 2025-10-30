import React, { useState } from "react";
import { Search } from "lucide-react";

const SearchProjects = () => {
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState([]);

  const categories = [
    "Healthcare",
    "Education",
    "Fintech",
    "Technology",
    "Environment",
    "AI & ML",
    "Agriculture",
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      // Example API request
      const response = await fetch(
        `https://your-backend-api.com/api/projects/search?name=${projectName}&category=${category}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10 px-4">
      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-4xl bg-white rounded-2xl p-5 shadow-md border border-blue-300 shadow-blue-200 flex flex-col md:flex-row items-center gap-4 md:gap-6"
      >
        {/* Project Name Input */}
        <input
          type="text"
          placeholder="Enter project name..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="flex-1 border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none w-full"
          required
        />

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none w-full md:w-auto"
          required
        >
          <option value="">Category...</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Search Button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
        >
          <Search size={18} /> Search
        </button>
      </form>

      {/* Results Section */}
      <div className="w-full max-w-3xl mt-10">
        {results.length > 0 ? (
          results.map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md border border-blue-200 mb-6 shadow-blue-100"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg text-blue-700">
                  {project.userName}
                </h3>
                <button className="text-sm text-blue-600 border border-blue-400 px-3 py-1 rounded-lg hover:bg-blue-50 transition">
                  Follow
                </button>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                {project.title}
              </h2>
              <p className="text-gray-600 mb-3">{project.description}</p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Seeking for:</span>{" "}
                {project.seeking?.join(", ")}
              </p>
              {project.image && (
                <img
                  src={project.image}
                  alt="project"
                  className="rounded-lg mb-3 w-full object-cover"
                />
              )}
              {project.video && (
                <video
                  src={project.video}
                  controls
                  className="rounded-lg w-full"
                />
              )}
              <div className="flex justify-around mt-4 text-gray-600">
                <button className="hover:text-blue-500">👍 Like</button>
                <button className="hover:text-blue-500">💬 Comment</button>
                <button className="hover:text-blue-500">💰 Fund</button>
                <button className="hover:text-blue-500">🤝 Collaborate</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-8">
            No projects found. Try searching above.
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchProjects;
