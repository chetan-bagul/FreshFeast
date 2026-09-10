import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectCartItems, selectCartTotal, selectCartKitchen, addItem, decreaseItem } from "./cartSlice";

const DELIVERY_CHARGE = 20;

export default function Cart() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const kitchen = useSelector(selectCartKitchen);
  const dispatch = useDispatch();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link to="/" className="text-brand-600 font-medium">
          Browse the menu →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Your Cart</h1>
      <p className="text-sm text-gray-500 mb-6">From {kitchen.name}</p>

      <div className="bg-white rounded-xl border border-gray-100 divide-y">
        {items.map((item) => (
          <div key={item.dishId} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">₹{item.price} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(decreaseItem(item.dishId))}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                −
              </button>
              <span className="w-5 text-center">{item.qty}</span>
              <button
                onClick={() =>
                  dispatch(
                    addItem({
                      dishId: item.dishId,
                      name: item.name,
                      price: item.price,
                      kitchenId: kitchen.id,
                      kitchenName: kitchen.name,
                    })
                  )
                }
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 text-lg font-semibold text-gray-800">
        <span>Food subtotal</span>
        <span>₹{total}</span>
      </div>

      <div className="flex items-center justify-between mt-2 text-gray-700"><span>Delivery charge</span><span>Rs. {DELIVERY_CHARGE}</span></div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t text-lg font-semibold text-gray-800"><span>Order total</span><span>Rs. {total + DELIVERY_CHARGE}</span></div>

      <Link
        to="/checkout"
        className="block text-center mt-4 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-md font-medium"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
