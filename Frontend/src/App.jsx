import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import './index.css';
import RecordingPage from "./pages/RecordingPage";

function App() {
  return (
    <>
      <Navbar /> 

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recording" element={<RecordingPage />} />
      </Routes>
    </>
  );
}

export default App;
