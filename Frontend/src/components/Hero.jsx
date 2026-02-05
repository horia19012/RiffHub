import { Flame } from "lucide-react";
import heroBg from "../assets/hero-bg.jpg";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="badge">
          <Flame className="icon-small" />
          Where Guitar Legends Share Their Sound
        </div>

        <h1>
          SHARE YOUR <span className="text-gradient">RIFFS</span>
        </h1>

        <p>
          Record, share, and support your favorite guitar artists. Get feedback and access tabs & tutorials.
        </p>
      </div>
    </section>
  );
};

export default Hero;
