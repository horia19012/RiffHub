import { Guitar, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Guitar className="icon" />
          <span>RIFFHUB</span>
        </div>

        <div className="nav-links desktop-only">
          <Link to="/">Home</Link>
          <Link to="/recording">Record</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/trending">Trending</Link>
          <Link to="/support">Support Artists</Link>
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
        <Link to="/recording" onClick={() => setMobileMenuOpen(false)}>
          Record
        </Link>
        <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>
          Explore
        </Link>
        <Link to="/trending" onClick={() => setMobileMenuOpen(false)}>
          Trending
        </Link>
        <Link to="/support" onClick={() => setMobileMenuOpen(false)}>
          Support
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
