import './App.css';
import './Responsive.css';
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import { MyContext } from "./components/MyContext.jsx";
import UpgradePlan from "./components/UpgradePlan.jsx";
import Settings from "./components/Settings.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader.jsx";

import { v1 as uuidv1 } from "uuid";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThread, setCurrThread] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [role, setRole] = useState(null); // "user" | "admin" | "guest"
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user role from backend
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me/role`, {
          withCredentials: true, // ✅ send cookies
        });
        setRole(res.data.role); 
        console.log("Role fetched:", res.data.role);
      } catch (err) {
        console.error("Failed to fetch role:", err);
        setRole("user"); // fallback if not logged in
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThread,
    setCurrThread,
    prevChats,
    setPrevChats,
    newChat,
    setNewChat,
    allThreads,
    setAllThreads,
    role,
    setRole,
  };

  // 🔹 Show loader while fetching user role
  if (loading) return <Loader />;

  return (
    <MyContext.Provider value={providerValues}>
      <div className="app">
        <Sidebar />
        <Routes>
          <Route
            path="/"
            element={<ProtectedRoute><ChatWindow /></ProtectedRoute>}
          />
          <Route
            path="/upgrade"
            element={<ProtectedRoute><UpgradePlan /></ProtectedRoute>}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute><Settings /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
          />
        </Routes>
      </div>
    </MyContext.Provider>
  );
}

export default App;
