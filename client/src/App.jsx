import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import CustomerLogin from "./features/auth/CustomerLogin";
import CustomerRegister from "./features/auth/CustomerRegister";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";

import HomeFeed from "./features/user/HomeFeed";
import Cart from "./features/user/Cart";
import Checkout from "./features/user/Checkout";
import OrderHistory from "./features/user/OrderHistory";
import Profile from "./features/user/Profile";

import KitchenDashboard from "./features/kitchen/KitchenDashboard";


import TaskList from "./features/delivery/TaskList";
import AdminDashboard from "./features/admin/AdminDashboard";
import SocketSync from "./components/SocketSync";

export default function App() {
  return (
    <div className="min-h-screen">
      <SocketSync />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeFeed />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/delivery/login" element={<Login requiredRole="delivery" registerPath="/delivery/register" title="Delivery partner sign in" />} />
        <Route path="/delivery/register" element={<Register lockedRole="delivery" loginPath="/delivery/login" title="Create delivery partner account" />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={["user"]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute roles={["user"]}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["user"]}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProtectedRoute roles={["user"]}><Profile /></ProtectedRoute>} />

        <Route
          path="/kitchen/dashboard"
          element={
            <ProtectedRoute roles={["kitchen"]}>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery/tasks"
          element={
            <ProtectedRoute roles={["delivery"]}>
              <TaskList />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<div className="text-center py-16 text-gray-500">Page not found</div>} />
      </Routes>
    </div>
  );
}
