import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RiffService from "../services/RiffService";
import { getCurrentUser } from "../services/UserService";
import RiffWaveformCard from "../components/RiffWaveformCard";
import "./TrendingPage.css";

const RiffCard = ({ riff, rank, onReact }) => {
  const user = getCurrentUser();

  return (
    <div className="trend-card">
      <div className="trend-card__rank">
        <span className={`trend-rank-num ${rank <= 3 ? "trend-rank-num--top" : ""}`}>
          #{rank}
        </span>
      </div>

      <div className="trend-card__body">
        <div className="trend-card__header">
          <Link to={`/user/${riff.userId}`} className="trend-card__username">
            {riff.username}
          </Link>
          <span className="trend-card__date">
            {new Date(riff.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>

        <RiffWaveformCard riff={riff}>
          <div className="trend-card__reactions">
            <button
              className="trend-react-btn trend-react-btn--like"
              onClick={() => onReact(riff.id, 1)}
              disabled={!user}
              title={user ? "Like" : "Sign in to react"}
            >
              🔥 {riff.likeCount}
            </button>
            <button
              className="trend-react-btn trend-react-btn--dislike"
              onClick={() => onReact(riff.id, 2)}
              disabled={!user}
              title={user ? "Dislike" : "Sign in to react"}
            >
              👎 {riff.dislikeCount}
            </button>
            <span className="trend-comment-count">💬 {riff.commentIds?.length ?? 0}</span>
          </div>
        </RiffWaveformCard>
      </div>
    </div>
  );
};

const TrendingPage = () => {
  const [riffs, setRiffs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = async () => {
    try {
      const data = await RiffService.getTrending(20);
      setRiffs(data ?? []);
    } catch {
      setError("Failed to load trending riffs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReact = async (riffId, type) => {
    try {
      await RiffService.reactToRiff(riffId, type);
      await load();
    } catch (err) {
      console.error("React failed:", err);
    }
  };

  return (
    <div className="trending">
      <div className="trending__header">
        <h1 className="trending__title">🔥 <span className="text-gradient">TRENDING</span></h1>
        <p className="trending__subtitle">Top riffs ranked by community reactions</p>
      </div>
      <div className="trending__content">
        {loading && <div className="trending__state"><div className="trending__spinner" /><p>Loading...</p></div>}
        {error && <div className="trending__state trending__state--error"><p>{error}</p></div>}
        {!loading && !error && riffs.length === 0 && (
          <div className="trending__state"><p>No riffs yet. Be the first to upload!</p></div>
        )}
        {!loading && !error && riffs.length > 0 && (
          <div className="trending__list">
            {riffs.map((riff, index) => (
              <RiffCard key={riff.id} riff={riff} rank={index + 1} onReact={handleReact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;