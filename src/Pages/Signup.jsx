import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

  const navigate = useNavigate();
  const interestsList = ["Collab", "Investment", "ProjectPost"];

  // Input change handler
  const handleChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  // Checkbox change handler
  const handleCheckboxChange = (interest) => {
    setSignupData((prev) => {
      const current = prev.interests || [];
      return current.includes(interest)
        ? { ...prev, interests: current.filter((i) => i !== interest) }
        : { ...prev, interests: [...current, interest] };
    });
  };

  // Form submit handler
  const handleRegisterButton = async (e) => {
    e.preventDefault();
    console.log("Handler triggered");
    console.log("Signup Data:", signupData);

    // Password match check
    if (signupData.password.trim() !== signupData.confirmpassword.trim()) {
      console.log("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/signup",
        signupData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.message === "User created successfully") {
        console.log("Signup successful!");
        navigate("/login");
      } else {
        console.log(res.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Axios error:", error);
      if (error.response) {
        console.log("Backend error response:", error.response.data);
        console.log(error.response.data.detail || "Something went wrong");
      } else {
        console.log("Network error");
      }
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

        <form onSubmit={handleRegisterButton} className="space-y-4 mt-6">
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
            className="w-full bg-blue-900 text-white rounded-md py-2 font-semibold hover:bg-blue-800 transition mt-3"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
