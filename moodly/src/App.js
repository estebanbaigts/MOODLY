import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EmployeeProfile from "./components/Employee/EmployeeProfile";
import EmployeeHome from "./components/Employee/EmployeeHome";
import ManagerHome from "./components/AdminPannel/ManagerHome";
import LoadingScreen from "./components/Loader/LoadingScreen";
import CreateEmployee from "./components/Employee/CreateEmployee";
import Login from "./components/Login";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/CreateEmployee" element={<CreateEmployee />} />
          <Route path="/EmployeeHome" element={<EmployeeHome />} />
          <Route path="/EmployeeProfile" element={<EmployeeProfile />} />
          <Route path="/ManagerHome" element={<ManagerHome />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
