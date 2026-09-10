import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "./authApi";
import { setCredentials } from "./authSlice";

export default function CustomerLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const result = await login(form).unwrap();
      if (result.user.role !== "user") {
        setMessage("This is a partner account. Please use the Fresh Feast Kitchen portal.");
        return;
      }
      dispatch(setCredentials(result));
      navigate("/");
    } catch (error) {
      setMessage(error.data?.message || "Incorrect email or password.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-100 p-8">
        <p className="text-sm font-semibold tracking-widest uppercase text-brand-600">Fresh Feast</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Welcome back</h1>
        <p className="text-gray-500 mt-2 mb-7">Sign in to order meals from kitchens near you.</p>
        <form onSubmit={submit} className="space-y-4">
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          {message && <p className="text-sm text-red-600">{message}</p>}
          <button disabled={isLoading} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60">{isLoading ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="text-sm text-gray-500 mt-6">New to Fresh Feast? <Link to="/register" className="font-semibold text-brand-600">Create customer account</Link></p>
      </div>
    </div>
  );
}
