// src/components/SearchPopup.jsx
import { useState } from "react";
import "./SearchPopup.css";

function SearchPopup({ onClose, allThreads, onSelectThread }) {
  const [query, setQuery] = useState("");

  // filter threads
  const filtered = allThreads.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="searchOverlay" onClick={onClose}>
      <div
        className="searchModal"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="searchHeader">
          <input
            type="text"
            placeholder="Search any history..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="closeBtnn" onClick={onClose} aria-label="Close">
            {/* SVG close icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 
                   1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 
                   01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 
                   01-1.414-1.414L8.586 10 4.293 5.707a1 1 
                   0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <ul className="searchResults">
          {filtered.length > 0 ? (
            filtered.map((thread) => (
              <li
                key={thread.threadId}
                onClick={() => {
                  onSelectThread(thread.threadId);
                  onClose();
                }}
              >
                {thread.title}
              </li>
            ))
          ) : (
            <li className="noResults">No matching history</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default SearchPopup;
