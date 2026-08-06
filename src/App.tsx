import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Zap } from "lucide-react";

import { motion, AnimatePresence } from "motion/react";
import PageTransition from "./components/PageTransition";

// Components
import Navbar from "./components/Navbar";
import LoadingOverlay from "./components/LoadingOverlay";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DosenDashboard from "./pages/DosenDashboard";
import PortfolioPage from "./pages/PortfolioPage";
import GuidePage from "./pages/GuidePage";

const AppContent = ({
  currentUser,
  setCurrentUser,
  token,
  handleLogin,
  logout,
  updateProfile,
}: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const isLandingPage = location.pathname === "/";
  const isPortfolioPage = location.pathname === "/portfolio";
  const isGuidePage = location.pathname === "/guide" || location.pathname === "/panduan";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`bg-[#f8fdfc] min-h-screen font-sans antialiased text-teal-950 transition-colors`}>
      <AnimatePresence mode="wait">
        {!currentUser && !isLoginPage && !isLandingPage && !isPortfolioPage && !isGuidePage && <LoadingOverlay />}
      </AnimatePresence>
      
      {!isLoginPage && <Navbar user={currentUser} onLogout={handleLogout} />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to={currentUser?.role === "ADMIN" ? "/admin" : currentUser?.role === "DOSEN" ? "/dosen-dashboard" : "/dashboard"} />
              ) : (
                <PageTransition><LoginPage onLogin={handleLogin} /></PageTransition>
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              token && currentUser?.role === "STUDENT" ? (
                <PageTransition>
                  <Dashboard
                    user={currentUser}
                    token={token || ""}
                    onProfileUpdate={updateProfile}
                    onLogout={handleLogout}
                  />
                </PageTransition>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/dosen-dashboard"
            element={
              token && currentUser?.role === "DOSEN" ? (
                <PageTransition>
                  <DosenDashboard
                    user={currentUser}
                    token={token || ""}
                    onProfileUpdate={updateProfile}
                    onLogout={handleLogout}
                  />
                </PageTransition>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/portfolio"
            element={<PageTransition><PortfolioPage /></PageTransition>}
          />
          <Route
            path="/guide"
            element={<PageTransition><GuidePage /></PageTransition>}
          />
          <Route
            path="/panduan"
            element={<Navigate to="/guide" replace />}
          />
          <Route
            path="/admin"
            element={
              token && currentUser?.role === "ADMIN" ? (
                <PageTransition>
                  <AdminDashboard
                    token={token}
                    currentUser={currentUser}
                    onUserUpdate={(data) => setCurrentUser({...currentUser, ...data})}
                    onLogout={handleLogout}
                  />
                </PageTransition>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  const handleLogin = (newToken: string, newUser: any) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setCurrentUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setCurrentUser(null);
  };

  const updateProfile = (updatedData: any) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  return (
    <BrowserRouter>
      <AppContent
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        token={token}
        handleLogin={handleLogin}
        logout={logout}
        updateProfile={updateProfile}
      />
    </BrowserRouter>
  );
}
