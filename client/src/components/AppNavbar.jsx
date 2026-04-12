import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import "./style/AppNavbar.scss";

const AppNavbar = () => {
  const navigate = useNavigate();
  const { user, loading, handleLogout } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `app-navbar__link ${isActive ? "is-active" : ""}`;
  const homePath = user ? "/workspace" : "/";

  const onLogout = async () => {
    try {
      await handleLogout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="app-navbar">
      <div className="app-navbar__container">
        <Link to="/" className="app-navbar__brand">
          PrepWise
        </Link>

        <nav className="app-navbar__nav" aria-label="Main navigation">
          <NavLink to={homePath} className={navLinkClass}>
            Home
          </NavLink>

          {user ? (
            <>
              <NavLink to="/workspace" className={navLinkClass}>
                Workspace
              </NavLink>

              <NavLink
                to="/workspace/interview-report"
                className={navLinkClass}
              >
                My Reports
              </NavLink>

              <span className="app-navbar__user" title={user.email}>
                Hi, {user.username}
              </span>

              <button
                type="button"
                className="app-navbar__logout-btn"
                onClick={onLogout}
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppNavbar;
