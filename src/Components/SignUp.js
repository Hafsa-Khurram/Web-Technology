import "../Assets/css/SignUp.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function SignUp() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  const togglePassword = (id) => {
    if (id === "password") {
      setPasswordVisible(!passwordVisible);
    } else if (id === "confirmPassword") {
      setConfirmPasswordVisible(!confirmPasswordVisible);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    // Check if password and confirm password match
    if (password === confirmPassword) {
      // Save to localStorage
      localStorage.setItem(
        "userData",
        JSON.stringify({ username, email, password })
      );
      alert("Sign up successful!");

      // Navigate to login page after successful sign up
      navigate("/login"); // This will navigate to the login page
    } else {
      alert("Passwords do not match!");
    }
  };

  return (
    <div className="sign-up-wrapper">
      <div className="sign-up-form active">
        <form onSubmit={handleSubmit}>
          <h1 className="sign-up-title">Sign Up</h1>
          <div className="sign-up-input-box">
            <input
              className="sign-up-input"
              type="text"
              name="username"
              placeholder="Username"
              required
            />
            <i className="bx bxs-user sign-up-icon"></i>
          </div>
          <div className="sign-up-input-box">
            <input
              className="sign-up-input"
              type="email"
              name="email"
              placeholder="Email"
              required
            />
            <i className="bx bxs-envelope sign-up-icon"></i>
          </div>
          <div className="sign-up-input-box">
            <input
              className="sign-up-input"
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Password"
              required
            />
            <i
              className="bx bxs-lock sign-up-icon"
              onClick={() => togglePassword("password")}
            ></i>
          </div>
          <div className="sign-up-input-box">
            <input
              className="sign-up-input"
              type={confirmPasswordVisible ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
            />
            <i
              className="bx bxs-lock-alt sign-up-icon"
              onClick={() => togglePassword("confirmPassword")}
            ></i>
          </div>
          <div className="sign-up-remember-forget">
            <label className="sign-up-remember">
              <input type="checkbox" /> I agree to the terms and conditions
            </label>
          </div>
          <button type="submit" className="sign-up-button">
            Sign Up
          </button>
          <div className="sign-up-register-link">
            <p>
              Already have an account?{" "}
              <a href="/login" className="sign-up-register">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
