import { useDispatch } from "react-redux";
import { addItem } from "../features/user/cartSlice";

export default function DishCard({ dish }) {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(
      addItem({
        dishId: dish._id,
        name: dish.name,
        price: dish.price,
        kitchenId: dish.kitchen._id,
        kitchenName: dish.kitchen.name,
      })
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-36 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        {dish.imageUrl ? (
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          "No image"
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`w-3 h-3 rounded-sm border ${
              dish.isVeg ? "border-green-600" : "border-red-600"
            }`}
          >
            <span
              className={`block w-1.5 h-1.5 m-auto mt-0.5 rounded-full ${
                dish.isVeg ? "bg-green-600" : "bg-red-600"
              }`}
            />
          </span>
          <h3 className="font-semibold text-gray-800">{dish.name}</h3>
        </div>
        <p className="text-xs text-gray-500 mb-1">{dish.kitchen?.name}</p>
        <p className="text-sm text-gray-500 flex-1 line-clamp-2">{dish.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-brand-700">₹{dish.price}</span>
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
