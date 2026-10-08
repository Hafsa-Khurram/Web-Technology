import "../Assets/css/Login.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Login({ setIsLoggedIn }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    // Retrieve stored user data from localStorage
    const storedData = JSON.parse(localStorage.getItem("userData"));

    console.log("Entered Username:", username);
    console.log("Entered Password:", password);
    console.log("Stored Username:", storedData?.username);
    console.log("Stored Password:", storedData?.password);

    // Check if the entered credentials match the stored data
    if (
      storedData &&
      storedData.username === username &&
      storedData.password === password
    ) {
      alert("Login successful!");

      // Update the global state in App.js to reflect that the user is logged in
      setIsLoggedIn(true); // Update the React state

      // Navigate to the "Travel" page after successful login
      navigate("/travel"); // This will navigate to the Travel page
    } else {
      alert("Invalid username or password!");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-form active">
        <form onSubmit={handleSubmit}>
          <h1 className="login-title">Login</h1>
          <div className="login-input-box">
            <input
              className="login-input"
              type="text"
              name="username"
              placeholder="Username"
              required
            />
            <i className="bx bxs-user login-icon"></i>
          </div>
          <div className="login-input-box">
            <input
              className="login-input"
              type={passwordVisible ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Password"
              required
            />
            <i className="bx bxs-lock login-icon" onClick={togglePassword}></i>
          </div>
          <div className="login-remember-forget">
            <label className="login-remember">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#" className="login-forget-link">
              Forgot Password
            </a>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          <div className="login-register-link">
            <p>
              Don't have an account?{" "}
              <a href="/register" className="login-register">
                Register
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
