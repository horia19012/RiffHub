import { Guitar } from "lucide-react";
import "./Navbar.css"; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <Guitar className="icon" />
          <span>RIFFHUB</span>
        </div>
        <div className="nav-links">
          <a href="#explore">Explore</a>
          <a href="#trending">Trending</a>
          <a href="#support">Support Artists</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
