import { useState, useEffect, useRef, useCallback } from "react";
import { getStreamUrl } from "../services/RiffService";

const BAR_COUNT = 40;

/**
 * Reusable waveform player card.
 * Props:
 *   riff        – riff object
 *   children    – optional footer slot (reactions, delete button, etc.)
 *   className   – extra class on the wrapper
 */
const RiffWaveformCard = ({ riff, children, className = "" }) => {
  const [isPlaying, setIsPlaying]         = useState(false);
  const [currentTime, setCurrentTime]     = useState(0);
  const [duration, setDuration]           = useState(0);
  const [waveform, setWaveform]           = useState(Array(BAR_COUNT).fill(0.1));
  const [waveformReady, setWaveformReady] = useState(false);
  const audioRef = useRef(null);

  const buildWaveform = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res     = await fetch(getStreamUrl(riff.id), { headers });
      const buf     = await res.arrayBuffer();
      const ctx     = new (window.AudioContext || window.webkitAudioContext)();
      const decoded = await ctx.decodeAudioData(buf);
      ctx.close();

      const raw       = decoded.getChannelData(0);
      const blockSize = Math.floor(raw.length / BAR_COUNT);
      const bars      = Array.from({ length: BAR_COUNT }, (_, i) => {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) sum += Math.abs(raw[i * blockSize + j]);
        return sum / blockSize;
      });
      const max = Math.max(...bars, 0.001);
      setWaveform(bars.map((v) => Math.max(v / max, 0.05)));
      setWaveformReady(true);
    } catch {
      setWaveform(Array(BAR_COUNT).fill(0.15));
      setWaveformReady(true);
    }
  }, [riff.id]);

  useEffect(() => { buildWaveform(); }, [buildWaveform]);

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
    else           { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  const handleWaveformClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect   = e.currentTarget.getBoundingClientRect();
    const ratio  = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const seekTo = ratio * duration;
    audio.currentTime = seekTo;
    setCurrentTime(seekTo);
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const progress   = duration ? (currentTime / duration) * 100 : 0;
  const formatTime = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

  return (
    <div className={`riff-card ${className}`}>
      <div
        className={`riff-card__waveform ${waveformReady ? "ready" : "loading"}`}
        onClick={handleWaveformClick}
      >
        <div className="riff-card__progress" style={{ width: `${progress}%` }} />
        {waveform.map((v, i) => (
          <div
            key={i}
            className="riff-card__bar"
            style={{ height: `${v * 100}%`, opacity: (i / BAR_COUNT) * 100 < progress ? 1 : 0.45 }}
          />
        ))}
      </div>

      <div className="riff-card__controls">
        <button className="riff-card__play" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          }
        </button>
        <span className="riff-card__time">
          {formatTime(currentTime)}{duration > 0 && ` / ${formatTime(duration)}`}
        </span>
        {children}
      </div>

      <audio ref={audioRef} src={getStreamUrl(riff.id)} preload="auto" />
    </div>
  );
};

export default RiffWaveformCard;