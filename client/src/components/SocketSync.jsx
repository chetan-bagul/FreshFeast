import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { apiSlice } from "../features/api/apiSlice";

export default function SocketSync() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { withCredentials: true });
    const refreshData = () => dispatch(apiSlice.util.invalidateTags(["Order", "DeliveryTask", "Kitchen", "Dish", "Admin"]));
    socket.on("connect", () => { if (user?.id) socket.emit("join:user", user.id); });
    ["order:new", "order:statusUpdate", "delivery:assigned", "delivery:availableChanged", "admin:dataChanged"].forEach((event) => socket.on(event, refreshData));
    return () => socket.disconnect();
  }, [dispatch, user?.id]);
  return null;
}
