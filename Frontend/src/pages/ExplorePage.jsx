import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RiffService from "../services/RiffService";
import RiffWaveformCard from "../components/RiffWaveformCard";
import "./ExplorePage.css";

const ExplorePage = () => {
  const [riffs, setRiffs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await RiffService.getAllRiffs();
        setRiffs(data ?? []);
      } catch {
        setError("Failed to load riffs.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = riffs.filter((r) =>
    r.username?.toLowerCase().includes(search.toLowerCase()) ||
    r.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="explore">
      <div className="explore__header">
        <h1 className="explore__title">EXPLORE <span className="text-gradient">RIFFS</span></h1>
        <p className="explore__subtitle">Discover guitar riffs from the community</p>
        <input
          className="explore__search"
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="explore__content">
        {loading && <div className="explore__state"><div className="explore__spinner" /><p>Loading riffs...</p></div>}
        {error && <div className="explore__state explore__state--error"><p>{error}</p></div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="explore__state"><p>No riffs found.</p></div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="explore__grid">
            {filtered.map((riff) => (
              <div key={riff.id} className="explore__card">
                <div className="explore__card-meta">
                  <Link to={`/user/${riff.userId}`} className="explore__card-username">
                    {riff.username}
                  </Link>
                  <span className="explore__card-date">
                    {new Date(riff.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                <RiffWaveformCard riff={riff}>
                  <span className="explore__card-stats">
                    🔥 {riff.likeCount ?? 0} &nbsp; 💬 {riff.commentIds?.length ?? 0}
                  </span>
                </RiffWaveformCard>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;