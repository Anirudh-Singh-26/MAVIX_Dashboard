import "./Settings.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [settingsData, setSettingsData] = useState(null);
  const [editField, setEditField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");

  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ---------------- FETCH USER SETTINGS ----------------
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/settings`, {
          withCredentials: true,
        });
        console.log("✅ API /api/settings response:", res.data);
        setSettingsData(res.data);
      } catch (err) {
        console.error("❌ Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  // ---------------- START EDITING ----------------
  const handleEdit = (field, currentValue) => {
    if (field === "role" || field === "subscriptionPlan") return;
    setEditField(field);
    setFieldValue(currentValue);
  };

  // ---------------- SAVE FIELD ----------------
  const handleSave = async (field) => {
    try {
      const updateData = { [field]: fieldValue };
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/settings/update`,
        updateData,
        { withCredentials: true }
      );

      setSettingsData((prev) => ({
        ...prev,
        [activeSection]: {
          ...prev[activeSection],
          [field]: fieldValue,
        },
      }));

      setEditField(null);
      setFieldValue("");
    } catch (err) {
      console.error("❌ Error updating field:", err);
    }
  };

  // ---------------- CHANGE PASSWORD ----------------
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return alert("Please fill all fields");
    }
    if (newPassword !== confirmPassword) {
      return alert("New password and confirm password do not match");
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/settings/change-password`,
        { oldPassword, newPassword },
        { withCredentials: true }
      );

      alert(res.data.message); // Success message

      // Clear inputs
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Password change failed");
    }
  };

  // ---------------- RENDER FIELD ----------------
  const renderField = (field, label) => {
    if (!settingsData) return null;

    const sectionData = settingsData[activeSection] || {};
    const isEditing = editField === field;
    const value = sectionData[field] ?? "";
    const isReadOnly = field === "role" || field === "subscriptionPlan";

    return (
      <div className="fieldLabelWrap">
        <div className="labelTitle">{label}</div>
        {isEditing ? (
          <div className="editRowInline">
            <input
              className="fieldInput"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
            />
            <button className="saveBtn" onClick={() => handleSave(field)}>
              Save
            </button>
            <button className="cancelBtn" onClick={() => setEditField(null)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="displayRow">
            <div className="displayValue">
              {value ? value.toString() : "(empty)"}
            </div>
            {!isReadOnly && (
              <button
                className="editBtn"
                onClick={() => handleEdit(field, value)}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ---------------- RENDER SECTION ----------------
  const renderSection = () => {
    if (!settingsData) return <p>Loading...</p>;

    switch (activeSection) {
      case "profile":
        const name = settingsData.profile.name || "";
        const profileInitials = name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div className="sectionContent profileSection">
            <div className="profileLeft">
              {renderField("name", "Name")}
              {renderField("email", "Email")}
              {renderField("role", "Role")}
              {renderField("subscriptionPlan", "Subscription Plan")}
            </div>
            <div className="profileRight">
              <div className="profileCircleContainer">
                <div className="profileCircle">{profileInitials}</div>
                <div className="profileName">{name}</div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="sectionContent">
            <h2>Privacy Settings</h2>
            <p>No privacy settings yet.</p>
          </div>
        );

      case "notifications":
        return (
          <div className="sectionContent">
            <h2>Notifications</h2>
            <p>No notification settings yet.</p>
          </div>
        );

      case "security":
        return (
          <div className="sectionContent">
            <h2>Password & Authentication</h2>

            <div className="securityFieldWrap">
              <div className="labelTitle">Old Password</div>
              <div className="editRowInline">
                <input
                  type={showOldPassword ? "text" : "password"}
                  className="fieldInput"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button
                  className="toggleViewBtn"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="securityFieldWrap">
              <div className="labelTitle">New Password</div>
              <div className="editRowInline">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="fieldInput"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  className="toggleViewBtn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="securityFieldWrap">
              <div className="labelTitle">Confirm New Password</div>
              <div className="editRowInline">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="fieldInput"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  className="toggleViewBtn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="saveBtn" onClick={handleChangePassword}>
              Save Password
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const sections = [
    { id: "profile", name: "Public profile" },
    { id: "security", name: "Password & Authentication" },
    { id: "privacy", name: "Privacy" },
    { id: "notifications", name: "Notifications" },
  ];

  return (
    <div className="settingsPage">
      <header className="settingsHeader">
        <div className="headerText">
          <h1>Settings</h1>
          <p>
            Manage your account, profile, privacy, notifications, and security
            settings.
          </p>
        </div>
        <button className="closeBtn" onClick={() => navigate("/")}>
          &times;
        </button>
      </header>

      <div className="settingsContainer">
        <div className="settingsSidebar">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className={`sidebarItem ${
                activeSection === sec.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(sec.id)}
            >
              {sec.name}
            </div>
          ))}
        </div>
        <div className="settingsMain">{renderSection()}</div>
      </div>
    </div>
  );
}

export default Settings;
