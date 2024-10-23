// index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./components/Auth/AuthProvider";

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById("root")
);
