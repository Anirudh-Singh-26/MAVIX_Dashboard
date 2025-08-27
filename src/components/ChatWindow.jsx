import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const THREADS_UPDATED_EVENT = "threads-updated";

function ChatWindow() {
  const {
    reply,
    setReply,
    prompt,
    setPrompt,
    currThread,
    setPrevChats,
    setNewChat,
    newChat,
    role,
  } = useContext(MyContext);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const gptDropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isGptOpen, setIsGptOpen] = useState(false);
  const [selectedAiVersion, setSelectedAiVersion] = useState("MAVIX-3.5");
  const [controller, setController] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Stop loading when newChat is triggered
  useEffect(() => {
    if (newChat) setLoading(false);
  }, [newChat]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (
        gptDropdownRef.current &&
        !gptDropdownRef.current.contains(event.target)
      ) {
        setIsGptOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getReply = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setNewChat(false);
    setIsGenerating(true);

    const abortController = new AbortController();
    setController(abortController);

    const data = {
      threadId: currThread,
      messages: prompt,
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, data, {
        withCredentials: true,
        signal: abortController.signal,
      });
      setReply(res.data.reply.response);
      window.dispatchEvent(new Event(THREADS_UPDATED_EVENT));
    } catch (e) {
      if (axios.isCancel(e)) console.log("Request cancelled");
      else console.log(e);
    } finally {
      setLoading(false);
      setController(null);
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    if (controller) {
      controller.abort();
      setIsGenerating(false);
      setLoading(false);
    }
  };

  // Append new chat to prevChats
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prev) => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: reply },
      ]);
    }
    setPrompt("");
  }, [reply]);

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleGptClick = (e) => {
    e.stopPropagation();
    setIsGptOpen(!isGptOpen);
  };

  const handleUpgradeClick = () => {
    navigate("/upgrade");
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setIsOpen(false);
  };

  const handleLogoutClick = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      // Clear state
      setReply("");
      setPrompt("");
      setPrevChats([]);
      setNewChat(true);

      // ✅ Show toast for logout
      toast.info("Logged out successfully!", {
        className: "dashboard-toast",
      });

      // Redirect after small delay
      setTimeout(() => {
        window.location.href = import.meta.env.VITE_LANDING_PAGE_URL;
      }, 1500);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("❌ Logout failed. Try again.", {
        className: "dashboard-toast",
      });
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        {/* GPT Dropdown */}
        <span
          className={`gptDropdownSpan ${isGptOpen ? "selected" : ""}`}
          onClick={handleGptClick}
          ref={gptDropdownRef}
        >
          MAVIX <i className="fa-solid fa-angle-down"></i>
        </span>

        {/* GPT dropdown menu */}
        {isGptOpen && (
          <div className="gptDropDown" ref={gptDropdownRef}>
            {["MAVIX-3.5", "MAVIX-4", "MAVIX-4 Turbo"].map((version) => (
              <div
                key={version}
                className="dropDownItem"
                onClick={() => {
                  setSelectedAiVersion(version);
                  setIsGptOpen(false);
                }}
              >
                {version}
                {selectedAiVersion === version && (
                  <span className="tick">
                    <i style={{color: "rgb(122, 235, 52)"}} class="fa-solid fa-check"></i>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="rightOptions">
          {role === "admin" && (
            <button className="adminBtn" onClick={() => navigate("/admin")}>
              Admin Pannel
            </button>
          )}

          <div
            className={`userIconDiv ${isOpen ? "selected" : ""}`}
            onClick={handleProfileClick}
            ref={dropdownRef}
          >
            <span className="userIcon">
              <i className="fa-solid fa-user"></i>
            </span>
          </div>
        </div>
      </div>

      {/* User dropdown */}
      {isOpen && (
        <div className="dropDown" ref={dropdownRef}>
          <div className="dropDownItem" onClick={handleUpgradeClick}>
            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade Plan
          </div>
          <div className="dropDownItem" onClick={handleSettingsClick}>
            <i className="fa-solid fa-gear"></i> Settings
          </div>
          <div className="dropDownItem" onClick={handleLogoutClick}>
            <i className="fa-solid fa-right-from-bracket"></i> Log out
          </div>
        </div>
      )}

      {/* Chat body is never unmounted */}
      <div className="chatBody">
        <Chat />
      </div>

      {/* Loader overlay */}
      {loading && !newChat && (
        <div className="gptDiv typingLoaderWrapper">
          <div className="typingLoader">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p className="loaderSentence">Assistant is Thinking...</p>
        </div>
      )}

      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask anything"
            className="input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getReply()}
          />
          <div
            id="submit"
            onClick={isGenerating ? handleStop : getReply}
            title={isGenerating ? "Stop generating" : "Send"}
          >
            {isGenerating ? (
              <i className="fa-solid fa-stop"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
          </div>
        </div>
        <p className="info">
          MAVIX can make mistakes. Check important info. See Cookie Preferences.
        </p>
      </div>

      {/* ✅ Toast Container */}
      {/* <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        draggable
        pauseOnHover
        toastClassName="dashboard-toast"
      /> */}
    </div>
  );
}

export default ChatWindow;
