import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, logout as logoutAction } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApi";
import { selectCartItems } from "../features/user/cartSlice";

export default function Navbar() {
  const user = useSelector(selectCurrentUser);
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } finally {
      dispatch(logoutAction());
      navigate("/login");
    }
  };

  const dashboardLink = () => {
    if (!user) return null;
    if (user.role === "kitchen") return "/kitchen/dashboard";
    if (user.role === "delivery") return "/delivery/tasks";
    if (user.role === "admin") return "/admin/dashboard";
    return "/";
  };

  return (
    <nav className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-brand-600">
          Fresh Feast
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user && user.role === "user" && (
            <Link to="/cart" className="relative text-gray-700 hover:text-brand-600">
              Cart
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </Link>
          )}

          {user && user.role === "user" && (
            <Link to="/orders" className="text-gray-700 hover:text-brand-600">
              My Orders
            </Link>
          )}

          {user && user.role === "user" && (
            <Link to="/profile" className="text-gray-700 hover:text-brand-600">
              Profile
            </Link>
          )}

          {user && dashboardLink() && user.role !== "user" && (
            <Link to={dashboardLink()} className="text-gray-700 hover:text-brand-600">
              Dashboard
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Logout ({user.name.split(" ")[0]})
            </button>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-brand-600">
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
