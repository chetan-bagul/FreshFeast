import { useState } from "react";
import { useGetKitchenDishesQuery, useCreateDishMutation, useToggleDishAvailabilityMutation, useUpdateDishMutation, useDeleteDishMutation } from "./kitchenApi";

const EMPTY_DISH = { name: "", price: "", category: "", description: "", imageUrl: "", isVeg: true };

function DishForm({ initial = EMPTY_DISH, submitLabel, onSubmit, busy }) {
  const [form, setForm] = useState(initial);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    await onSubmit({ ...form, price: Number(form.price) });
    if (submitLabel === "Add dish") setForm(EMPTY_DISH);
  };
  return <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
    <input name="name" placeholder="Dish name" value={form.name} onChange={change} required className="border border-gray-300 rounded-md px-3 py-2" />
    <input name="price" type="number" min="1" placeholder="Price (₹)" value={form.price} onChange={change} required className="border border-gray-300 rounded-md px-3 py-2" />
    <input name="category" placeholder="Category (e.g. Thali)" value={form.category || ""} onChange={change} className="border border-gray-300 rounded-md px-3 py-2" />
    <input name="imageUrl" type="url" placeholder="Dish image URL (optional)" value={form.imageUrl || ""} onChange={change} className="border border-gray-300 rounded-md px-3 py-2" />
    <input name="description" placeholder="Description" value={form.description || ""} onChange={change} className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2" />
    <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.isVeg} onChange={(event) => setForm({ ...form, isVeg: event.target.checked })} /> Vegetarian</label>
    <button disabled={busy} className="bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-md font-medium disabled:opacity-60">{busy ? "Saving..." : submitLabel}</button>
  </form>;
}

export default function DishManager({ kitchenId }) {
  const { data, isLoading } = useGetKitchenDishesQuery(kitchenId);
  const [createDish, { isLoading: isCreating }] = useCreateDishMutation();
  const [toggleAvailability] = useToggleDishAvailabilityMutation();
  const [updateDish, { isLoading: isUpdating }] = useUpdateDishMutation();
  const [deleteDish] = useDeleteDishMutation();
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const notify = (success, fallback) => setMessage(success || fallback);
  const saveNew = async (dish) => { try { await createDish({ kitchenId, ...dish }).unwrap(); notify("Dish added to your menu."); } catch (error) { notify(error.data?.message, "Could not add the dish."); } };
  const saveEdit = async (dish) => { try { await updateDish({ dishId: editing._id, ...dish }).unwrap(); setEditing(null); notify("Dish updated."); } catch (error) { notify(error.data?.message, "Could not update the dish."); } };
  const remove = async (dish) => { if (!window.confirm(`Delete ${dish.name}? This cannot be undone.`)) return; try { await deleteDish(dish._id).unwrap(); notify("Dish deleted."); } catch (error) { notify(error.data?.message, "Could not delete the dish."); } };
  return <div>
    <section className="bg-white rounded-xl border border-gray-100 p-4 mb-6"><h2 className="font-semibold text-gray-800 mb-3">Add a dish</h2><DishForm submitLabel="Add dish" onSubmit={saveNew} busy={isCreating} /></section>
    {message && <p className="mb-4 text-sm text-brand-700">{message}</p>}
    {isLoading && <p className="text-gray-500">Loading dishes...</p>}
    <div className="space-y-3">{data?.dishes.map((dish) => <section key={dish._id} className="bg-white rounded-xl border border-gray-100 p-4">
      {editing?._id === dish._id ? <><h3 className="font-medium mb-3">Edit dish</h3><DishForm initial={editing} submitLabel="Save changes" onSubmit={saveEdit} busy={isUpdating} /><button onClick={() => setEditing(null)} className="mt-3 text-sm text-gray-500">Cancel</button></> : <div className="flex gap-4 items-start">
        {dish.imageUrl && <img src={dish.imageUrl} alt={dish.name} className="w-20 h-20 rounded-lg object-cover" />}
        <div className="flex-1"><p className="font-medium text-gray-800">{dish.name}</p><p className="text-sm text-gray-500">₹{dish.price} · {dish.category || "General"}</p><p className="text-sm text-gray-500 mt-1">{dish.description}</p></div>
        <div className="flex flex-col gap-2 items-end"><button onClick={() => toggleAvailability({ dishId: dish._id, isAvailable: !dish.isAvailable })} className={`px-3 py-1.5 text-sm rounded-md ${dish.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{dish.isAvailable ? "Available" : "Sold out"}</button><button onClick={() => setEditing(dish)} className="text-sm text-brand-700">Edit</button><button onClick={() => remove(dish)} className="text-sm text-red-600">Delete</button></div>
      </div>}
    </section>)}</div>
  </div>;
}
