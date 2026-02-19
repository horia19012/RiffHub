import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import RiffService from "../services/RiffService";

const Home = () => {
  const [riffs, setRiffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiffs = async () => {
      const token = localStorage.getItem("token"); // get JWT from local storage
      if (!token) {
        setError("You are not logged in");
        setLoading(false);
        return;
      }

      try {
        const data = await RiffService.getAllRiffs(token);
        if (!data || data.length === 0) {
          setRiffs([]);
        } else {
          setRiffs(data);
        }
      } catch (err) {
        console.error("Failed to fetch riffs:", err);
        setError("Failed to load riffs");
      } finally {
        setLoading(false);
      }
    };

    fetchRiffs();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <Hero />

      <h2 className="text-2xl font-bold mt-8 mb-4">Riffs</h2>

      {loading && <p>Loading riffs...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && riffs.length === 0 && !error && (
        <p className="text-gray-500">No riffs available yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riffs.map((riff) => (
          <div
            key={riff.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold">{riff.id || "Untitled Riff"}</h3>
            <p className="text-gray-700">{riff.url || "No description"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
