import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation, useLogoutMutation } from "../auth/authApi";
import { setCredentials } from "../auth/authSlice";

export default function KitchenLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const result = await login(form).unwrap();
      if (result.user.role !== "kitchen") {
        await logoutApi().unwrap();
        setMessage("This is not a Kitchen Partner account. Use the customer portal to sign in.");
        return;
      }
      dispatch(setCredentials(result));
      navigate("/");
    } catch (error) {
      setMessage(error.data?.message || "We could not sign you in. Check your email and password.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-10">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-xl shadow-orange-100 border border-orange-100">
        <section className="bg-brand-700 text-white p-8 sm:p-12">
          <p className="text-sm font-semibold tracking-widest uppercase text-orange-200">Fresh Feast Partner</p>
          <h1 className="text-4xl font-bold mt-4 leading-tight">Run your kitchen with confidence.</h1>
          <p className="mt-4 text-orange-100">Manage your menu, control availability, and keep every customer order in one focused workspace.</p>
          <div className="mt-10 space-y-4 text-sm">
            <p className="flex gap-3"><span>✓</span> Create and update dishes with photos</p>
            <p className="flex gap-3"><span>✓</span> Mark dishes available or sold out instantly</p>
            <p className="flex gap-3"><span>✓</span> Track incoming orders and preparation status</p>
          </div>
        </section>
        <section className="p-8 sm:p-12">
          <p className="text-sm font-medium text-brand-600">KITCHEN PORTAL</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Welcome back</h2>
          <p className="text-gray-500 mt-2 mb-7">Sign in to manage your kitchen.</p>
          <form onSubmit={submit} className="space-y-4">
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Kitchen account email" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {message && <p className="text-sm text-red-600">{message}</p>}
            <button disabled={isLoading} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60">{isLoading ? "Signing in..." : "Sign in to Kitchen Portal"}</button>
          </form>
          <p className="text-sm text-gray-500 mt-6">New kitchen partner? <Link to="/register" className="font-semibold text-brand-600">Create your kitchen account</Link></p>
        </section>
      </div>
    </div>
  );
}
