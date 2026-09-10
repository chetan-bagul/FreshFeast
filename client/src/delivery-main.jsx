import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import DeliveryPortal from "./DeliveryPortal";
import { store } from "./app/store";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><Provider store={store}><BrowserRouter><DeliveryPortal /></BrowserRouter></Provider></React.StrictMode>);
