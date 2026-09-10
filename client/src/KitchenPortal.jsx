import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import KitchenLogin from "./features/kitchen/KitchenLogin";
import KitchenRegister from "./features/kitchen/KitchenRegister";
import KitchenProfilePage from "./features/kitchen/KitchenProfilePage";
import KitchenDashboard from "./features/kitchen/KitchenDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { logout as logoutAction, selectCurrentUser } from "./features/auth/authSlice";
import { useLogoutMutation } from "./features/auth/authApi";
import SocketSync from "./components/SocketSync";

function KitchenHeader() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const signOut = async () => {
    try { await logoutApi().unwrap(); } finally { dispatch(logoutAction()); navigate("/login"); }
  };
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-brand-600">Fresh Feast Kitchen</Link>
        <div className="flex items-center gap-3">
          {user && <Link to="/profile" className="px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-sm text-white">Kitchen Profile</Link>}
          {user && <button onClick={signOut} className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm text-gray-700">Logout</button>}
        </div>
      </div>
    </nav>
  );
}

export default function KitchenPortal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SocketSync />
      <KitchenHeader />
      <Routes>
        <Route path="/login" element={<KitchenLogin />} />
        <Route path="/register" element={<KitchenRegister />} />
        <Route path="/profile" element={<ProtectedRoute roles={["kitchen"]} unauthorizedTo="/login"><KitchenProfilePage /></ProtectedRoute>} />
        <Route path="/*" element={<ProtectedRoute roles={["kitchen"]} unauthorizedTo="/login"><KitchenDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
