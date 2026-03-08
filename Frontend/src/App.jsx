import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Routes, Route, useLocation } from "react-router-dom";
import './index.css';
import RecordingPage from "./pages/RecordingPage";
import AuthPage from "./pages/AuthPage";
import ExplorePage from "./pages/ExplorePage";
import TrendingPage from "./pages/TrendingPage";
import AccountPage from "./pages/AccountPage";

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/auth";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/recording" element={<RecordingPage />} />
        <Route path="/auth"      element={<AuthPage />} />
        <Route path="/explore"   element={<ExplorePage />} />
        <Route path="/trending"  element={<TrendingPage />} />
        <Route path="/account"   element={<AccountPage />} />
      </Routes>
    </>
  );
}

export default App;