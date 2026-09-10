import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "./authApi";
import { setCredentials } from "./authSlice";

export default function CustomerRegister() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", pincode: "", password: "" });
  const [message, setMessage] = useState("");
  const [registerUser, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const update = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: name === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value });
  };
  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const result = await registerUser({ ...form, role: "user" }).unwrap();
      dispatch(setCredentials(result));
      navigate("/");
    } catch (error) {
      setMessage(error.data?.message || error.error || "We could not create your account.");
    }
  };
  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-100 p-8">
        <p className="text-sm font-semibold tracking-widest uppercase text-brand-600">Fresh Feast</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Create your account</h1>
        <p className="text-gray-500 mt-2 mb-7">Find fresh meals from kitchens that deliver to you.</p>
        <form onSubmit={submit} className="space-y-4">
          <input name="name" value={form.name} onChange={update} placeholder="Full name" required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          <input name="email" type="email" value={form.email} onChange={update} placeholder="Email address" required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          <input name="phone" value={form.phone} onChange={update} placeholder="Phone number" required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          <input name="pincode" value={form.pincode} onChange={update} placeholder="6-digit delivery pincode" inputMode="numeric" pattern="\d{6}" required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          <input name="password" type="password" value={form.password} onChange={update} placeholder="Password (minimum 6 characters)" minLength="6" required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          {message && <p className="text-sm text-red-600">{message}</p>}
          <button disabled={isLoading} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60">{isLoading ? "Creating account..." : "Create customer account"}</button>
        </form>
        <p className="text-sm text-gray-500 mt-6">Already a customer? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link></p>
      </div>
    </div>
  );
}
