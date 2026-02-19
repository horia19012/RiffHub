import { Guitar, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const loggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Guitar className="icon" />
          <span>RIFFHUB</span>
        </div>

        <div className="nav-links desktop-only">
          <Link to="/">Home</Link>
          {loggedIn ? (
            <>
              <Link to="/recording">Record</Link>
              <Link to="/explore">Explore</Link>
              <Link to="/trending">Trending</Link>
              <Link to="/account">Account</Link>
              <button onClick={handleLogout} className="logout-btn">
                Log Out
              </button>
            </>
          ) : (
            <Link to="/auth">Sign In</Link>
          )}
        </div>

        <div
          className="mobile-menu-toggle mobile-only"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="icon" />
        </div>
      </div>

      <div
        className={`mobile-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <div
          className="mobile-menu-close"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="icon" />
        </div>

        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
          Home
        </Link>

        {loggedIn ? (
          <>
            <Link to="/recording" onClick={() => setMobileMenuOpen(false)}>
              Record
            </Link>
            <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>
              Explore
            </Link>
            <Link to="/trending" onClick={() => setMobileMenuOpen(false)}>
              Trending
            </Link>
            <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
              Account
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
