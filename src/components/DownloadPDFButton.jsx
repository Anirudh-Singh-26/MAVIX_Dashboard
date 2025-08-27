import axios from "axios";

function DownloadPDFButton({ threadId }) {
  const handleDownload = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/download`,

        { threadId },
        { responseType: "blob" },
        { withCredentials: true } // important for binary file
      );

      // Create a URL for the blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat_${threadId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  };

  return <button onClick={handleDownload}>Download Chat</button>;
}

export default DownloadPDFButton;
