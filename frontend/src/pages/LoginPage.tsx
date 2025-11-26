import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../api/client";
import { isEmail, minLength } from "../utils/validation";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email))
      return toast.error("Please enter a valid email address");
    if (!minLength(password, 6))
      return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { token } = res.data;
      localStorage.setItem("authToken", token);
      if (remember) localStorage.setItem("rememberMe", "1");
      toast.success("Logged in");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-5">
      <div className="hidden lg:block lg:col-span-3 bg-gradient-to-br from-primary/60 via-secondary/40 to-accent/30 p-12">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-4">Welcome back</h1>
          <p className="opacity-90">Sign in to continue to your agency payment tracker.</p>
        </div>
      </div>
      <div className="col-span-1 lg:col-span-2 flex items-center justify-center p-6">
        <div className="card glass bg-base-100/30 backdrop-blur-xl w-full max-w-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              aria-label="Email address"
              className="input input-bordered w-full"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              aria-label="Password"
              className="input input-bordered w-full"
              placeholder="Your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="checkbox"
              />
              <span>Remember me</span>
            </label>
            <div className="flex items-center justify-between">
              <a className="link" href="#">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className={`btn btn-primary btn-block ${
                loading ? "loading" : ""
              }`}
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
