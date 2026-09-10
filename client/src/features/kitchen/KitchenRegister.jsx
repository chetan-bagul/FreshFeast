import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../auth/authApi";
import { setCredentials } from "../auth/authSlice";
import { useCreateKitchenMutation } from "./kitchenApi";

const EMPTY_FORM = { ownerName: "", email: "", phone: "", password: "", kitchenName: "", description: "", address: "", city: "", pincode: "", coverImageUrl: "" };

export default function KitchenRegister() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [registerUser, { isLoading: registering }] = useRegisterMutation();
  const [createKitchen, { isLoading: creatingKitchen }] = useCreateKitchenMutation();
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
      const auth = await registerUser({ name: form.ownerName, email: form.email, phone: form.phone, password: form.password, role: "kitchen", pincode: form.pincode }).unwrap();
      dispatch(setCredentials(auth));
      await createKitchen({ name: form.kitchenName, description: form.description, coverImageUrl: form.coverImageUrl, location: { address: form.address, city: form.city, pincode: form.pincode } }).unwrap();
      navigate("/");
    } catch (error) {
      setMessage(error.data?.message || error.error || "We could not create your kitchen account. Please try again.");
    }
  };
  const busy = registering || creatingKitchen;
  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-orange-100 shadow-xl shadow-orange-100 p-6 sm:p-10">
        <p className="text-sm font-semibold tracking-widest uppercase text-brand-600">Fresh Feast Partner</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Create your kitchen</h1>
        <p className="text-gray-500 mt-2 mb-7">One form creates your partner account and your live kitchen profile.</p>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <h2 className="sm:col-span-2 font-semibold text-gray-800">Owner details</h2>
          <input name="ownerName" value={form.ownerName} onChange={update} placeholder="Owner name" required className="border border-gray-300 rounded-xl px-4 py-3" />
          <input name="phone" value={form.phone} onChange={update} placeholder="Phone number" required className="border border-gray-300 rounded-xl px-4 py-3" />
          <input name="email" type="email" value={form.email} onChange={update} placeholder="Email address" required className="border border-gray-300 rounded-xl px-4 py-3" />
          <input name="password" type="password" value={form.password} onChange={update} placeholder="Password (minimum 6 characters)" minLength="6" required className="border border-gray-300 rounded-xl px-4 py-3" />
          <h2 className="sm:col-span-2 font-semibold text-gray-800 mt-3">Kitchen details</h2>
          <input name="kitchenName" value={form.kitchenName} onChange={update} placeholder="Kitchen name" required className="border border-gray-300 rounded-xl px-4 py-3" />
          <input name="city" value={form.city} onChange={update} placeholder="City" required className="border border-gray-300 rounded-xl px-4 py-3" />
          <input name="address" value={form.address} onChange={update} placeholder="Kitchen address" required className="border border-gray-300 rounded-xl px-4 py-3" />
          <input name="pincode" value={form.pincode} onChange={update} placeholder="6-digit delivery pincode" inputMode="numeric" pattern="\d{6}" required className="border border-gray-300 rounded-xl px-4 py-3" />
          <input name="coverImageUrl" type="url" value={form.coverImageUrl} onChange={update} placeholder="Cover image URL (optional)" className="sm:col-span-2 border border-gray-300 rounded-xl px-4 py-3" />
          <textarea name="description" value={form.description} onChange={update} placeholder="What makes your kitchen special?" rows="3" className="sm:col-span-2 border border-gray-300 rounded-xl px-4 py-3" />
          {message && <p className="sm:col-span-2 text-sm text-red-600">{message}</p>}
          <button disabled={busy} className="sm:col-span-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60">{busy ? "Creating your kitchen..." : "Create kitchen and open dashboard"}</button>
        </form>
        <p className="text-sm text-gray-500 mt-6">Already registered? <Link to="/login" className="font-semibold text-brand-600">Sign in to Kitchen Portal</Link></p>
      </div>
    </div>
  );
}
