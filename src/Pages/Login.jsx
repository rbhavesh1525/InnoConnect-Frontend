import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/images/Innoconnect.png";

function Login() {
  const [logindata, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
  const res = await axios.post(
    "http://127.0.0.1:8000/api/auth/login",
    logindata,
    { headers: { "Content-Type": "application/json" } }
  );

  console.log("Response from backend:", res.data);

  if (res.data.success) {
    // ✅ Successful login
    localStorage.setItem("token", res.data.token);
    setSuccessMessage(res.data.message || "Login successful!");
    setTimeout(() => navigate("/"), 1500);
  } else {
    // ❌ Invalid credentials or other issue
    setError(res.data.message || "Login failed. Please try again.");
  }
} catch (error) {
  console.error("Axios error:", error);
  if (error.response) {
    setError(error.response.data.message || "Server error. Please try again.");
  } else {
    setError("Network error. Please check your connection.");
  }
}

  };

  const handleChange = (e) => {
    setLoginData({ ...logindata, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <img src={Logo} alt="InnoConnect Logo" className="w-16" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-800">
          Welcome to InnoConnect
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to continue
        </p>

        {/* Success & Error Messages */}
        {successMessage && (
          <div className="mb-4 text-green-600 bg-green-100 border border-green-200 rounded-md p-2 text-center">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={logindata.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={logindata.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white rounded-md py-2 font-semibold hover:bg-blue-800 transition"
          >
            Sign in
          </button>
        </form>

        {/* Footer links */}
        <div className="flex justify-between items-center mt-6 text-sm">
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => console.log("Forgot password flow")}
          >
            Forgot password?
          </button>
          <span>
            Need an account?{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
