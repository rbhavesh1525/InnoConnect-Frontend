import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Logo from "../assets/images/Innoconnect.png";

function Login() {
  const [logindata, setLoginData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handlesubmit = async (e) => {
    e.preventDefault();
    setLoginData("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        logindata,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response from backend:", res.data);

      if (res.data.token) {
        console.log("Login Successful:", res.data);
       navigate("/")
      } else {
        console.log("Login Failed:", res.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Axios error:", error);
      if (error.response) {
        console.log("Backend error response:", error.response.data);
      } else {
        console.log("Network error");
      }
    }

  };

  const handleGoogleLogin = () => {
    console.log("Google login not implemented");
  };

  const handlechange = (e) => {
    setLoginData({ ...logindata, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <img src={Logo} alt="Logo" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">
          Welcome to InnoConnect
        </h2>
        <p className="text-center text-gray-500 mb-6">Sign in to continue</p>

        <button
          type="button"
          className="w-full flex items-center justify-center border border-gray-200 rounded-md py-2 mb-6 bg-white hover:bg-gray-100 transition"
          onClick={handleGoogleLogin}
        >
          <span className="mr-2">🌐</span>
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <span className="flex-1 h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 font-medium">OR</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handlesubmit}>
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
              onChange={handlechange}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-blue-400"
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
              onChange={handlechange}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-900 text-white rounded-md py-2 font-semibold hover:bg-blue-800 transition"
          >
            Sign in
          </button>
        </form>

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
