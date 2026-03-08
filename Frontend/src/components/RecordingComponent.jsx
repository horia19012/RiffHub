import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Trash2, Upload } from "lucide-react";
import "./RecordingComponent.css";
import RiffService from "../services/RiffService";
import { getCurrentUser } from "../services/UserService";
import { useNavigate } from "react-router-dom";

const BAR_COUNT = 40;

export default function RecordingComponent() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState(Array(BAR_COUNT).fill(0.05));
  const [recordedWaveform, setRecordedWaveform] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const chunksRef = useRef([]);
  const waveformHistoryRef = useRef([]);
  const recordingStartTimeRef = useRef(null);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) navigate("/auth");
  }, [navigate]);

  const startVisualization = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    analyserRef.current.smoothingTimeConstant = 0.85;
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    waveformHistoryRef.current = [];
    const draw = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const step = Math.floor(bufferLength / BAR_COUNT);
      const bars = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        const v = dataArray[i * step] / 255;
        bars.push(Math.max(v, 0.05));
      }
      waveformHistoryRef.current.push([...bars]);
      setWaveformData(bars);
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const processRecordedWaveform = () => {
    const history = waveformHistoryRef.current;
    if (history.length === 0) { setRecordedWaveform(Array(BAR_COUNT).fill(0.05)); return; }
    const segmentSize = Math.ceil(history.length / BAR_COUNT);
    const processed = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      const start = i * segmentSize;
      const end = Math.min(start + segmentSize, history.length);
      if (start >= history.length) { processed.push(0.05); continue; }
      let maxAmplitude = 0;
      for (let j = start; j < end; j++) {
        const avg = history[j].reduce((sum, val) => sum + val, 0) / history[j].length;
        maxAmplitude = Math.max(maxAmplitude, avg);
      }
      processed.push(Math.max(maxAmplitude, 0.05));
    }
    setRecordedWaveform(processed);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      recordingStartTimeRef.current = Date.now();
      setRecordingTime(0);
      setUploadStatus(null);
      setUploadMessage("");

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((Date.now() - recordingStartTimeRef.current) / 1000);
      }, 100);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        cancelAnimationFrame(animationFrameRef.current);
        if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
        processRecordedWaveform();
        setWaveformData(Array(BAR_COUNT).fill(0.05));
      };

      startVisualization(stream);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Mic permission required");
    }
  };

  const stopRecording = () => { mediaRecorderRef.current.stop(); setIsRecording(false); };
  const playAudio = () => { audioRef.current.play(); setIsPlaying(true); };
  const pauseAudio = () => { audioRef.current.pause(); setIsPlaying(false); };

  const retryRecording = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null); setAudioBlob(null); setIsPlaying(false);
    setCurrentTime(0); setDuration(0); setRecordingTime(0);
    setWaveformData(Array(BAR_COUNT).fill(0.05)); setRecordedWaveform(null);
    setUploadStatus(null); setUploadMessage("");
    waveformHistoryRef.current = [];
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
  };

  const handleWaveformClick = (index) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = (index / BAR_COUNT) * duration;
    if (!isPlaying) playAudio();
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    setUploadStatus("uploading");
    setUploadMessage("Saving your riff...");
    try {
      const result = await RiffService.uploadRecording(audioBlob);
      setUploadStatus("success");
      setUploadMessage("Riff saved! Redirecting to your profile...");
      const user = getCurrentUser();
      setTimeout(() => navigate(`/user/${user.id}`), 1500);
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error.message || "Upload failed. Please try again.");
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const ended = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", ended);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", ended);
    };
  }, [audioURL]);

  const formatTime = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  const getProgressPercentage = () => (!duration ? 0 : (currentTime / duration) * 100);

  return (
    <div className="voice-recorder-container">
      <div className="voice-recorder-wrapper">
        <div className="voice-recorder-card">
          <div className="recorder-header">
            <h2 className="recorder-title">
              {isRecording ? "Recording..." : audioURL ? "Your Recording" : "Riff Recorder"}
            </h2>
            <p className="recorder-subtitle">
              {isRecording ? "Play something!" : audioURL ? "Click waveform to seek" : "Tap mic to start"}
            </p>
          </div>

          <div className={`waveform-container ${audioURL ? "clickable" : ""}`}>
            {audioURL && <div className="waveform-progress" style={{ width: `${getProgressPercentage()}%` }} />}
            {(audioURL ? recordedWaveform || waveformData : waveformData).map((v, i) => (
              <div
                key={i}
                className={`waveform-bar ${audioURL ? "interactive" : ""}`}
                style={{ height: `${v * 120}px`, opacity: isRecording ? 1 : audioURL ? 0.8 : 0.6 }}
                onClick={() => audioURL && handleWaveformClick(i)}
              />
            ))}
          </div>

          {(isRecording || audioURL) && (
            <div className="time-display">
              <p className="time-text">
                {isRecording ? formatTime(recordingTime) : formatTime(currentTime)}
                {audioURL && duration > 0 && ` / ${formatTime(duration)}`}
              </p>
            </div>
          )}

          <div className="controls-container">
            {!audioURL ? (
              !isRecording ? (
                <button onClick={startRecording} className="btn-record"><Mic size={32} /></button>
              ) : (
                <button onClick={stopRecording} className="btn-stop"><Square size={32} /></button>
              )
            ) : (
              <div className="playback-controls">
                <button onClick={retryRecording} className="btn-retry"><RotateCcw size={24} /></button>
                <button onClick={isPlaying ? pauseAudio : playAudio} className="btn-play">
                  {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                </button>
                <button onClick={retryRecording} className="btn-delete"><Trash2 size={24} /></button>
                <button
                  onClick={handleUpload}
                  className={`btn-save ${uploadStatus === "uploading" ? "btn-save--loading" : ""} ${uploadStatus === "success" ? "btn-save--success" : ""}`}
                  disabled={uploadStatus === "uploading" || uploadStatus === "success"}
                >
                  <Upload size={18} />
                  {uploadStatus === "uploading" ? "Saving..." : uploadStatus === "success" ? "Saved!" : "Save"}
                </button>
              </div>
            )}
          </div>

          {uploadMessage && (
            <div className={`upload-status upload-status--${uploadStatus}`}>{uploadMessage}</div>
          )}

          {audioURL && <audio ref={audioRef} src={audioURL} className="hidden-audio" />}
        </div>
        <div className="instructions">
          <p>{!audioURL ? "Click mic to record" : "Click waveform to jump to any moment"}</p>
        </div>
      </div>
    </div>
  );
}