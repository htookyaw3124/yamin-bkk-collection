import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./lib/store";
import { ProductList } from "./pages/ProductList";
import "./index.css";
import "./lib/i18n"; // Initialize i18next

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
