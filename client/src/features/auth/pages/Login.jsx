import "../authForm.scss";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { loading, handleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      window.alert("Please enter both email and password.");
      return;
    }

    try {
      await handleLogin({ email: email.trim(), password });
      navigate("/workspace");
    } catch (err) {
      const message =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please check your credentials and try again.";

      window.alert(message);
    }
  };

  if (loading) {
    return (
      <main>
        <h1>Loading.....</h1>
      </main>
    );
  }

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              id="email"
              value={email}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              name="password"
              id="password"
              value={password}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="button-primary-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Dont have an Account? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
