import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../api/client";
import { isEmail, minLength } from "../utils/validation";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
      await apiClient.post("/auth/register", { email, password, name });
      toast.success("Account created. Please login.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card glass max-w-md w-full p-8">
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input input-bordered w-full"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input input-bordered w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input input-bordered w-full"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className={`btn btn-primary btn-block ${loading ? "loading" : ""}`}
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
