import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Zap } from "lucide-react";

import { motion, AnimatePresence } from "motion/react";
import PageTransition from "./components/PageTransition";

// Components
import Navbar from "./components/Navbar";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DosenDashboard from "./pages/DosenDashboard";
import PortfolioPage from "./pages/PortfolioPage";

const AppContent = ({
  currentUser,
  setCurrentUser,
  token,
  handleLogin,
  logout,
  updateProfile,
  darkMode,
  setDarkMode,
}: any) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isLandingPage = location.pathname === "/";

  return (
    <div className={`${darkMode ? "dark" : ""} bg-[#f8fdfc] dark:bg-slate-950 min-h-screen font-sans antialiased text-teal-950 dark:text-slate-200 transition-colors`}>
      {(!isLoginPage && !isLandingPage) && <Navbar user={currentUser} onLogout={logout} />}
      
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
            path="/admin"
            element={
              token && currentUser?.role === "ADMIN" ? (
                <PageTransition>
                  <AdminDashboard
                    token={token}
                    currentUser={currentUser}
                    onUserUpdate={(data) => setCurrentUser({...currentUser, ...data})}
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

      {/* Dark Mode Toggle */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-8 left-8 w-12 h-12 bg-white dark:bg-slate-800 border border-teal-50 dark:border-slate-700 rounded-full flex items-center justify-center shadow-xl z-50 text-teal-500 dark:text-teal-400 hover:scale-110 transition-all"
      >
        {darkMode ? <Zap className="w-5 h-5 fill-current" /> : <Zap className="w-5 h-5" />}
      </button>
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
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

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
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </BrowserRouter>
  );
}
