import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminDashboard.css";
import Loader from "./Loader.jsx"; // 🔹 added loader import

function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // 🔹 loader state

  const initials = (fullName) =>
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const handleUserClick = (user) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  // Fetch users and upgrade requests
  useEffect(() => {
    const fetchUpgradeRequests = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/upgrade/requests`,
          { withCredentials: true }
        );
        setUpgradeRequests(res.data);
      } catch (err) {
        console.error("Failed to fetch upgrade requests:", err);
      } finally {
        setLoading(false); // 🔹 hide loader
      }
    };

    const fetchAllUsers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
          { withCredentials: true }
        );
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false); // 🔹 hide loader
      }
    };

    fetchUpgradeRequests();
    fetchAllUsers();
  }, []);

  // Upgrade request actions
  const handleApprove = async (userId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/upgrade/approve/${userId}`,
        {},
        { withCredentials: true }
      );
      setUpgradeRequests(upgradeRequests.filter((u) => u._id !== userId));
      toast.success("Upgrade approved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve upgrade.");
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/upgrade/reject/${userId}`,
        {},
        { withCredentials: true }
      );
      setUpgradeRequests(upgradeRequests.filter((u) => u._id !== userId));
      toast.info("Upgrade rejected!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject upgrade.");
    }
  };

  // Modal button actions
  const toggleUserStatus = async (user) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/user/${user._id}/status`,
        { isActive: !user.isActive },
        { withCredentials: true }
      );
      setUsers(
        users.map((u) =>
          u._id === user._id ? { ...u, isActive: !u.isActive } : u
        )
      );
      setSelectedUser({ ...user, isActive: !user.isActive });
      toast.success(`User ${user.isActive ? "deactivated" : "activated"}!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status.");
    }
  };

  const toggleUserRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/user/${user._id}/role`,
        { role: newRole },
        { withCredentials: true }
      );
      setUsers(
        users.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
      setSelectedUser({ ...user, role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user role.");
    }
  };

  const changePlan = async (user, newPlan) => {
    if (user.subscriptionPlan === newPlan) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/user/${user._id}/plan`,
        { plan: newPlan },
        { withCredentials: true }
      );
      setUsers(
        users.map((u) =>
          u._id === user._id ? { ...u, subscriptionPlan: newPlan } : u
        )
      );
      setSelectedUser({ ...user, subscriptionPlan: newPlan });
      toast.success(`User plan changed to ${newPlan}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to change subscription plan.");
    }
  };

  // Separate lists
  const premiumUsers = users.filter(
    (u) => u.subscriptionPlan === "Pro" || u.subscriptionPlan === "Premium"
  );
  const freeUsers = users.filter((u) => u.subscriptionPlan === "Free");

  // 🔹 Show loader while fetching
  if (loading) return <Loader />;

  return (
    <div className="adminDashboard">
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <button
        className="closeBtn"
        onClick={() => navigate(-1)}
        aria-label="Close"
      >
        ×
      </button>

      <header className="adminHeader">
        <div className="headerText">
          <h1>Admin Dashboard</h1>
          <p>
            Manage users, plans, and account settings. Click any user to see
            details.
          </p>
        </div>
      </header>

      <main className="adminContent">
        {/* Premium Users */}
        <section className="userSection">
          <div className="sectionHeader">
            <h2>Premium Users</h2>
            <span className="countBadge">{premiumUsers.length}</span>
          </div>
          <ul className="userList">
            {premiumUsers.map((u) => (
              <li
                key={u._id}
                className="userRow"
                onClick={() => handleUserClick(u)}
              >
                <div className="avatar">{initials(u.name)}</div>
                <div className="userMeta">
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                </div>
                <span className="userTag premium">{u.subscriptionPlan}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Free Users */}
        <section className="userSection">
          <div className="sectionHeader">
            <h2>Free Users</h2>
            <span className="countBadge neutral">{freeUsers.length}</span>
          </div>
          <ul className="userList">
            {freeUsers.map((u) => (
              <li
                key={u._id}
                className="userRow"
                onClick={() => handleUserClick(u)}
              >
                <div className="avatar">{initials(u.name)}</div>
                <div className="userMeta">
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                </div>
                <span className="userTag free">{u.subscriptionPlan}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Upgrade Requests */}
        <section className="userSection">
          <div className="sectionHeader">
            <h2>Upgrade Requests</h2>
            <span className="countBadge request">{upgradeRequests.length}</span>
          </div>
          <ul className="userList">
            {upgradeRequests.map((u) => (
              <li key={u._id} className="userRow">
                <div className="avatar">{initials(u.name)}</div>
                <div className="userMeta">
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                </div>
                <div className="actionButtons">
                  <small>
                    <strong>Requested Plan:</strong> {u.upgradeRequest}
                  </small>
                  <div>
                    <button
                      className="approveBtn"
                      onClick={() => handleApprove(u._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="rejectBtn"
                      onClick={() => handleReject(u._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* User Modal */}
      {selectedUser && (
        <div className="userModalOverlay" onClick={closeModal}>
          <div className="userModalCard" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" onClick={closeModal}>
              ×
            </button>
            <div className="modalAvatar">{initials(selectedUser.name)}</div>
            <h3>{selectedUser.name}</h3>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Account Type:</strong> {selectedUser.subscriptionPlan}
            </p>
            {selectedUser.planExpiry && (
              <p>
                <strong>Plan Expiry:</strong>{" "}
                {new Date(selectedUser.planExpiry).toLocaleDateString()}
              </p>
            )}
            <p>
              <strong>Role:</strong> {selectedUser.role}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {selectedUser.isActive ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Date Joined:</strong>{" "}
              {new Date(selectedUser.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Last Login:</strong>{" "}
              {selectedUser.lastLogin
                ? new Date(selectedUser.lastLogin).toLocaleString()
                : "-"}
            </p>
            <p>
              <strong>Threads:</strong> {selectedUser.threadCount || 0}
            </p>

            <div className="modalActions">
              <button onClick={() => toggleUserStatus(selectedUser)}>
                {selectedUser.isActive ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => toggleUserRole(selectedUser)}>
                {selectedUser.role === "admin"
                  ? "Demote to User"
                  : "Promote to Admin"}
              </button>
              {["Free", "Pro", "Premium"].map((plan) => (
                <button
                  key={plan}
                  disabled={selectedUser.subscriptionPlan === plan}
                  onClick={() => changePlan(selectedUser, plan)}
                >
                  Set {plan} Plan
                </button>
              ))}
            </div>

            {selectedUser.upgradeRequest && (
              <p>
                <strong>Requested Upgrade:</strong>{" "}
                {selectedUser.upgradeRequest}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
