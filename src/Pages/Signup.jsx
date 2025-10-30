import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

function Signup() {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
    interests: [],
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const interestsList = ["Collab", "Investment", "ProjectPost"];

  const handleChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (interest) => {
    setSignupData((prev) => {
      const current = prev.interests || [];
      return current.includes(interest)
        ? { ...prev, interests: current.filter((i) => i !== interest) }
        : { ...prev, interests: [...current, interest] };
    });
  };

  const handleRegisterButton = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Frontend validation
    if (signupData.password.trim() !== signupData.confirmpassword.trim()) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (signupData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/signup",
        signupData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        setSuccessMessage("Account created successfully!");
        setErrorMessage("");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setErrorMessage(res.data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      if (error.response) {
        setErrorMessage(error.response.data.message || "Server error occurred.");
      } else {
        setErrorMessage("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <button
          onClick={() => navigate("/login")}
          className="text-blue-500 hover:underline mb-2 flex items-center space-x-1"
        >
          ← <span>Back to sign in</span>
        </button>

        <h2 className="text-2xl font-bold text-center mb-2">
          Create your account
        </h2>

        {/* Success message */}
        {successMessage && (
          <p className="text-green-600 text-center mb-3 font-medium">
            {successMessage}
          </p>
        )}

        {/* Error message */}
        {errorMessage && (
          <p className="text-red-600 text-center mb-3 font-medium">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleRegisterButton} className="space-y-4 mt-4">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              value={signupData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-blue-400"
              placeholder="Your Name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <EmailIcon />
              </div>
              <input
                name="email"
                type="email"
                value={signupData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-blue-400"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <LockIcon />
              </div>
              <input
                name="password"
                type="password"
                value={signupData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-blue-400"
                placeholder="Min. 8 characters"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <LockIcon />
              </div>
              <input
                name="confirmpassword"
                type="password"
                value={signupData.confirmpassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-blue-400"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Interested In</label>
            <div className="flex flex-col gap-2">
              {interestsList.map((interest) => (
                <label key={interest} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={signupData.interests.includes(interest)}
                    onChange={() => handleCheckboxChange(interest)}
                    className="accent-blue-600"
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white rounded-md py-2 font-semibold transition mt-3 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-900 hover:bg-blue-800"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
