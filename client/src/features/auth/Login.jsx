import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "./authApi";
import { setCredentials } from "./authSlice";

export default function Login({ requiredRole, registerPath = "/register", title = "Welcome back" }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [roleError, setRoleError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form).unwrap();
      if (requiredRole && res.user.role !== requiredRole) {
        setRoleError(`This account is a ${res.user.role} account. Please use the correct portal.`);
        return;
      }
      dispatch(setCredentials(res));
      navigate("/");
    } catch (err) {
      // error state is already surfaced via `error` below
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {error && (
          <p className="text-sm text-red-600">{error.data?.message || "Login failed"}</p>
        )}
        {roleError && <p className="text-sm text-red-600">{roleError}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-md font-medium disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        New here?{" "}
        <Link to={registerPath} className="text-brand-600 font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}
