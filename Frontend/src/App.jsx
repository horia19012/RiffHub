import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Routes, Route , useLocation } from "react-router-dom";
import './index.css';
import RecordingPage from "./pages/RecordingPage";
import AuthPage from "./pages/AuthPage";

function App() {
  const location = useLocation();

  const hideNavbar = location.pathname === "/auth";
  return (
    <>
      {!hideNavbar && <Navbar />}  

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recording" element={<RecordingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </>
  );
}

export default App;
