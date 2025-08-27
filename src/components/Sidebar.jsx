import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";
import axios from "axios";
import { v1 as uuidv1 } from "uuid";
import SearchPopup from "./SearchPopup";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThread,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThread,
    setPrevChats,
  } = useContext(MyContext);

  const [collapsed, setCollapsed] = useState(false); // collapse state
  const [showSearch, setShowSearch] = useState(false);

  const getAllThreads = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/thread`, {
        withCredentials: true,
      });
      const filterData = response.data.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      setAllThreads(filterData);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch on thread change (your original logic)
  useEffect(() => {
    getAllThreads();
  }, [currThread]); // eslint-disable-line react-hooks/exhaustive-deps

  // NEW: also refresh when chatwindow notifies us that threads changed
  useEffect(() => {
    const handleThreadsUpdated = () => {
      getAllThreads();
    };
    window.addEventListener("threads-updated", handleThreadsUpdated);
    return () =>
      window.removeEventListener("threads-updated", handleThreadsUpdated);
  }, []); // mount once

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThread(uuidv1());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setCurrThread(newThreadId);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/thread/${newThreadId}`,
        { withCredentials: true }
      );
      setPrevChats(response.data);
      setNewChat(false);
      setReply(null);
    } catch (e) {
      console.log(e);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/thread/${threadId}`,
        {
          withCredentials: true,
        }
      );
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId)
      );
      if (threadId === currThread) createNewChat();
    } catch (e) {
      console.log(e);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <section className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* new chat button + collapse button combined */}
      <div className="topButtonsContainer">
        {/* First row: Logo + Collapse button */}
        <div className="topButtonWrapper">
          <img
            className={collapsed ? "newlogo hidden" : "newlogo"}
            src="flaticon.png"
            alt="Main Logo"
          />

          <div className="collapseBtn" onClick={toggleSidebar}>
            {collapsed ? (
              <i className="fa-solid fa-angle-right"></i>
            ) : (
              <i className="fa-solid fa-angle-left"></i>
            )}
          </div>
        </div>

        {/* Second row: New Chat button */}
        <div className="newChatWrapper">
          <button onClick={createNewChat} className="newChatBtn">
            <i class="fa-regular fa-comment logo"></i>
            {!collapsed && (
              <span>
                <p>New Chat</p>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search button (same style as New Chat) */}
      <div className="searchWrapper">
        <button
          onClick={() => setShowSearch(true)} // open popup
          className="searchBtn"
        >
          <i className="fa-solid fa-magnifying-glass logo"></i>
          {!collapsed && (
            <span>
              <p>Search</p>
            </span>
          )}
        </button>
      </div>

      {/* history */}
      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            className={
              !collapsed && thread.threadId === currThread ? "highlighted" : ""
            }
          >
            <span className="threadTitle">
              {!collapsed &&
                (thread.title.length > 25
                  ? thread.title.slice(0, 25) + "..."
                  : thread.title)}
            </span>
            {!collapsed && (
              <i
                className="fa-solid fa-trash"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.threadId);
                }}
              ></i>
            )}
          </li>
        ))}
      </ul>

      {/* popup here */}
      {showSearch && (
        <SearchPopup
          onClose={() => setShowSearch(false)}
          allThreads={allThreads}
          onSelectThread={changeThread} // reuse your existing changeThread
        />
      )}

      {/* Sign
      {!collapsed && (
        <div className="sign">
          <p>By Anirudh Singh Rathore &hearts;</p>
        </div>
      )} */}

      {!collapsed ? (
        <div className="sign">
          <p>By Anirudh Singh Rathore &hearts;</p>
        </div>
      ) : (
        <div className="sign">
          <p>Ani</p>
        </div>
      )}
    </section>
  );
}

export default Sidebar;
