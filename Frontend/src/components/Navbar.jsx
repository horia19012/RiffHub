import { Guitar, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

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
          <a href="#explore">Explore</a>
          <a href="#trending">Trending</a>
          <a href="#support">Support Artists</a>
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
        <a href="#explore" onClick={() => setMobileMenuOpen(false)}>Explore</a>
        <a href="#trending" onClick={() => setMobileMenuOpen(false)}>Trending</a>
        <a href="#support" onClick={() => setMobileMenuOpen(false)}>Support Artists</a>
      </div>
    </nav>
  );
};

export default Navbar;
