import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Trash2 } from "lucide-react";
import RiffService, { getStreamUrl } from "../services/RiffService";
import "./AccountPage.css";

const BAR_COUNT = 40;

const RiffCard = ({ riff, onDelete }) => {
  const [isPlaying, setIsPlaying]     = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [waveform, setWaveform]       = useState(Array(BAR_COUNT).fill(0.1));
  const [waveformReady, setWaveformReady] = useState(false);
  const audioRef = useRef(null);

  const buildWaveform = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(getStreamUrl(riff.id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const arrayBuffer = await res.arrayBuffer();
      const audioCtx    = new (window.AudioContext || window.webkitAudioContext)();
      const decoded     = await audioCtx.decodeAudioData(arrayBuffer);
      audioCtx.close();

      const rawData   = decoded.getChannelData(0);
      const blockSize = Math.floor(rawData.length / BAR_COUNT);
      const bars      = [];

      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[i * blockSize + j]);
        }
        bars.push(sum / blockSize);
      }

      const max = Math.max(...bars, 0.001);
      setWaveform(bars.map((v) => Math.max(v / max, 0.05)));
      setWaveformReady(true);
    } catch {
      setWaveform(Array(BAR_COUNT).fill(0.15));
      setWaveformReady(true);
    }
  }, [riff.id]);

  useEffect(() => {
    buildWaveform();
  }, [buildWaveform]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd  = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else           { audio.play();  setIsPlaying(true);  }
  };

  const handleWaveformClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect    = e.currentTarget.getBoundingClientRect();
    const ratio   = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const seekTo  = ratio * duration;
    audio.currentTime = seekTo;
    setCurrentTime(seekTo);
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const progress    = duration ? (currentTime / duration) * 100 : 0;
  const formatTime  = (t) =>
    `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

  return (
    <div className="riff-card">
      <div className="riff-card__meta">
        <span className="riff-card__date">
          {new Date(riff.createdAt).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
          })}
        </span>
        <span className="riff-card__stats">
          🔥 {riff.likeCount ?? 0} &nbsp; 💬 {riff.commentIds?.length ?? 0}
        </span>
      </div>

      <div
        className={`riff-card__waveform ${waveformReady ? "ready" : "loading"}`}
        onClick={handleWaveformClick}
      >
        <div className="riff-card__progress" style={{ width: `${progress}%` }} />
        {waveform.map((v, i) => {
          const barProgress = (i / BAR_COUNT) * 100;
          return (
            <div
              key={i}
              className="riff-card__bar"
              style={{
                height: `${v * 100}%`,
                opacity: barProgress < progress ? 1 : 0.45,
              }}
            />
          );
        })}
      </div>

      <div className="riff-card__controls">
        <button className="riff-card__play" onClick={togglePlay}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <span className="riff-card__time">
          {formatTime(currentTime)}
          {duration > 0 && ` / ${formatTime(duration)}`}
        </span>
        <button className="riff-card__delete" onClick={() => onDelete(riff.id)}>
          <Trash2 size={15} />
        </button>
      </div>

      <audio ref={audioRef} src={getStreamUrl(riff.id)} preload="auto" />
    </div>
  );
};

const AccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [riffs, setRiffs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const token  = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) { navigate("/auth"); return; }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ id: userId, username: payload.unique_name, email: payload.email });
    } catch {
      navigate("/auth");
      return;
    }

    const loadRiffs = async () => {
      try {
        const uid  = localStorage.getItem("userId");
        const data = await RiffService.getRiffsByUser(uid);
        setRiffs(data ?? []);
      } catch {
        setError("Failed to load your riffs.");
      } finally {
        setLoading(false);
      }
    };
    loadRiffs();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleDelete = async (riffId) => {
    if (!window.confirm("Delete this riff?")) return;
    try {
      await RiffService.deleteRiff(riffId);
      setRiffs((prev) => prev.filter((r) => r.id !== riffId));
    } catch {
      alert("Failed to delete riff.");
    }
  };

  return (
    <div className="account">
      <div className="account__container">
        {user && (
          <div className="account__profile">
            <div className="account__avatar">{user.username?.[0]?.toUpperCase() ?? "?"}</div>
            <div className="account__info">
              <h2 className="account__username">{user.username}</h2>
              <p className="account__email">{user.email}</p>
            </div>
            <button className="account__logout" onClick={handleLogout}>Log Out</button>
          </div>
        )}

        <div className="account__stats">
          <div className="account__stat">
            <span className="account__stat-value">{riffs.length}</span>
            <span className="account__stat-label">Riffs</span>
          </div>
          <div className="account__stat">
            <span className="account__stat-value">{riffs.reduce((acc, r) => acc + (r.likeCount ?? 0), 0)}</span>
            <span className="account__stat-label">Likes</span>
          </div>
          <div className="account__stat">
            <span className="account__stat-value">{riffs.reduce((acc, r) => acc + (r.commentIds?.length ?? 0), 0)}</span>
            <span className="account__stat-label">Comments</span>
          </div>
        </div>

        <h3 className="account__section-title">My Riffs</h3>

        {loading && <div className="account__state"><div className="account__spinner" /><p>Loading your riffs...</p></div>}
        {error && <div className="account__state account__state--error"><p>{error}</p></div>}
        {!loading && !error && riffs.length === 0 && (
          <div className="account__state">
            <p>You haven't uploaded any riffs yet.</p>
            <button className="account__cta" onClick={() => navigate("/recording")}>Record your first riff</button>
          </div>
        )}
        {!loading && !error && riffs.length > 0 && (
          <div className="account__grid">
            {riffs.map((riff) => (
              <RiffCard key={riff.id} riff={riff} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;