import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import RiffService from "../services/RiffService";
import "./Home.css";

const RiffCard = ({ riff }) => (
  <div className="riff-card">
    <div className="riff-card__meta">
      <span className="riff-card__date">
        {new Date(riff.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
      </span>
      <span className="riff-card__reactions">
        🔥 {riff.reactionIds?.length ?? 0} &nbsp; 💬 {riff.commentIds?.length ?? 0}
      </span>
    </div>
    <audio className="riff-card__audio" src={riff.url} controls preload="none" />
  </div>
);

const Home = () => {
  const [riffs, setRiffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiffs = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setError("You are not logged in. Sign in to see riffs."); setLoading(false); return; }
      try {
        const data = await RiffService.getAllRiffs();
        setRiffs(data ?? []);
      } catch (err) {
        setError("Failed to load riffs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchRiffs();
  }, []);

  return (
    <div className="home">
      <Hero />
    </div>
  );
};

export default Home;