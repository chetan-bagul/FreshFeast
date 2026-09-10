import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useGetProfileQuery, useUpdateProfileMutation } from "../auth/authApi";
import { updateUser } from "../auth/authSlice";

export default function Profile() {
  const { data, isLoading, isError } = useGetProfileQuery();
  const [saveProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", pincode: "" });
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  useEffect(() => { if (data?.user) setForm(data.user); }, [data]);
  const update = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: name === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value });
  };
  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const result = await saveProfile(form).unwrap();
      dispatch(updateUser(result.user));
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.data?.message || error.error || "Could not update your profile.");
    }
  };
  if (isLoading) return <p className="max-w-xl mx-auto px-4 py-10 text-gray-500">Loading profile...</p>;
  if (isError) return <p className="max-w-xl mx-auto px-4 py-10 text-red-600">Could not load your profile. Please sign in again.</p>;
  return <div className="max-w-xl mx-auto px-4 py-10"><div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><p className="text-sm font-semibold text-brand-600">FRESH FEAST</p><h1 className="text-2xl font-bold text-gray-900 mt-1">My profile</h1><p className="text-sm text-gray-500 mt-1 mb-6">Update the details used for your orders and nearby kitchen menu.</p><form onSubmit={submit} className="space-y-4"><input name="name" value={form.name || ""} onChange={update} placeholder="Full name" required className="w-full border border-gray-300 rounded-xl px-4 py-3" /><input name="email" type="email" value={form.email || ""} onChange={update} placeholder="Email address" required className="w-full border border-gray-300 rounded-xl px-4 py-3" /><input name="phone" value={form.phone || ""} onChange={update} placeholder="Phone number" className="w-full border border-gray-300 rounded-xl px-4 py-3" /><input name="pincode" value={form.pincode || ""} onChange={update} placeholder="6-digit delivery pincode" inputMode="numeric" pattern="\d{6}" required className="w-full border border-gray-300 rounded-xl px-4 py-3" />{message && <p className={`text-sm ${message.includes("success") ? "text-green-700" : "text-red-600"}`}>{message}</p>}<button disabled={isSaving} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60">{isSaving ? "Saving..." : "Save profile"}</button></form></div></div>;
}
