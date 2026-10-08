import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";                                                                                                                                                  
import { useState, useEffect } from "react";
import Travel from "./Components/Travel";
import Blog from "./Components/Blog";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      setIsLoggedIn(true); // Update the state based on localStorage
    }
  }, []);

  return (
    <div className="App">
      <Routes>
        {/* Default route, showing Travel component */}
        <Route path="*" element={<Travel />} />
        <Route path="/travel" element={<Travel />} />

        {/* Blog route is protected, only accessible if the user is logged in */}
        <Route
          path="/blog"
          element={isLoggedIn ? <Blog /> : <Navigate to="/login" />}
        />

        {/* Public routes for login and registration */}
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/register" element={<SignUp />} />
      </Routes>
    </div>
  );
}

export default App;
