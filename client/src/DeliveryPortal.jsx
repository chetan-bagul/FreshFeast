import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import TaskList from "./features/delivery/TaskList";
import ProtectedRoute from "./components/ProtectedRoute";
import { logout as logoutAction, selectCurrentUser } from "./features/auth/authSlice";
import { useLogoutMutation } from "./features/auth/authApi";
import SocketSync from "./components/SocketSync";

function DeliveryHeader() {
  const user = useSelector(selectCurrentUser); const dispatch = useDispatch(); const navigate = useNavigate(); const [logoutApi] = useLogoutMutation();
  const signOut = async () => { try { await logoutApi().unwrap(); } finally { dispatch(logoutAction()); navigate("/login"); } };
  return <nav className="bg-white border-b border-gray-200 shadow-sm"><div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between"><Link to="/" className="text-xl font-bold text-brand-600">Fresh Feast Delivery</Link>{user && <button onClick={signOut} className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm text-gray-700">Logout</button>}</div></nav>;
}
export default function DeliveryPortal() { return <div className="min-h-screen bg-gray-50"><SocketSync /><DeliveryHeader /><Routes><Route path="/login" element={<Login requiredRole="delivery" registerPath="/register" title="Delivery partner sign in" />} /><Route path="/register" element={<Register lockedRole="delivery" loginPath="/login" title="Create delivery partner account" />} /><Route path="/*" element={<ProtectedRoute roles={["delivery"]} unauthorizedTo="/login"><TaskList /></ProtectedRoute>} /></Routes></div>; }
