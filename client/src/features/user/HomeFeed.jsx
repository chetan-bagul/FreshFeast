import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetHomeFeedQuery } from "./userApi";
import DishCard from "../../components/DishCard";
import { selectCurrentUser } from "../auth/authSlice";

export default function HomeFeed() {
  const [search, setSearch] = useState("");
  const user = useSelector(selectCurrentUser);
  const [pincode, setPincode] = useState(user?.pincode || "");
  const validPincode = /^\d{6}$/.test(pincode);
  const { data, isLoading, isError } = useGetHomeFeedQuery(
    { search, pincode: validPincode ? pincode : undefined }
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">What are you craving today?</h1>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 max-w-2xl">
          <input
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Delivery pincode"
            inputMode="numeric"
            className="sm:w-44 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {pincode && !validPincode && <p className="mt-2 text-xs text-amber-700">Enter a 6-digit pincode to filter nearby kitchens.</p>}
        {validPincode && <p className="mt-2 text-sm text-gray-500">Showing kitchens that deliver to {pincode}.</p>}
        {!pincode && <p className="mt-2 text-sm text-gray-500">Showing all available dishes. Enter your pincode to see nearby kitchens only.</p>}
      </div>

      {isLoading && <p className="text-gray-500">Loading menu...</p>}
      {isError && <p className="text-red-600">Could not load the menu. Is the API running?</p>}

      {data && data.dishes.length === 0 && (
        <p className="text-gray-500">No dishes found. Try a different search, or check back once kitchens are approved.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data?.dishes.map((dish) => (
          <DishCard key={dish._id} dish={dish} />
        ))}
      </div>
    </div>
  );
}
