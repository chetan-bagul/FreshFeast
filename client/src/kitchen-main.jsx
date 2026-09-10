import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import KitchenPortal from "./KitchenPortal";
import { store } from "./app/store";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Provider store={store}><BrowserRouter><KitchenPortal /></BrowserRouter></Provider></React.StrictMode>
);
