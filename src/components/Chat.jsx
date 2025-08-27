import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import DownloadPDFButton from "./DownloadPDFButton"; // <-- import button

function Chat() {
  const { newChat, prevChats, reply, currThread } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);
  const [showDownload, setShowDownload] = useState(false);
  const chatsRef = useRef(null);

  // Control when the download button appears
  useEffect(() => {
    if (!newChat && currThread) {
      if (prevChats.length === 0) {
        setShowDownload(false);
        const timer = setTimeout(() => setShowDownload(true), 10000);
        return () => clearTimeout(timer);
      } else {
        setShowDownload(true);
      }
    } else {
      setShowDownload(false);
    }
  }, [newChat, currThread, prevChats.length]);

  // Typing effect (fixed: prevent initial full render flash)
  useEffect(() => {
    // If there's no reply, show the full last message normally
    if (!reply) {
      setLatestReply(null);
      return;
    }

    // Immediately switch to the "typing" branch (no full-content flash)
    setLatestReply("");

    const words = reply.split(" ");
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      setLatestReply(words.slice(0, idx).join(" "));
      if (idx >= words.length) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [reply]); // depends only on reply so it doesn't restart due to prevChats updates

  // Auto-scroll
  useEffect(() => {
    chatsRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [prevChats, latestReply]);

  return (
    <div className="chatContainer">
      {/* Top-right Download PDF Button */}
      {showDownload && (
        <div className="downloadButtonWrapper">
          <DownloadPDFButton threadId={currThread} />
        </div>
      )}

      {newChat && <h1 className="newChatText">✨ Start a New Chat ✨</h1>}

      <div className="chats" ref={chatsRef}>
        {prevChats?.slice(0, -1).map((chat, idx) => (
          <div
            className={chat.role === "user" ? "userDiv" : "gptDiv"}
            key={idx}
          >
            {chat.role === "user" ? (
              <p className="userMessage">{chat.content}</p>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {chat.content}
              </ReactMarkdown>
            )}
          </div>
        ))}

        {prevChats.length > 0 && (
          <>
            {latestReply === null ? (
              // Not typing -> show the last message fully
              <div className="gptDiv" key={"non-typing"}>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
              </div>
            ) : (
              // Typing -> show incremental content (starts as empty string)
              <div className="gptDiv" key={"typing"}>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {latestReply}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}
        <div style={{ height: "4rem" }}></div>
      </div>
    </div>
  );
}

export default Chat;
