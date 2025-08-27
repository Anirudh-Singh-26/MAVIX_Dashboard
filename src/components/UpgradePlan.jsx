import "./UpgradePlan.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function UpgradePlan() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState("");
  const [confirmPlan, setConfirmPlan] = useState(null); // for modal

  const plans = [
    {
      name: "Free",
      price: "$0",
      features: [
        "Basic Chat",
        "Limited Messages per Day",
        "Community Support",
        "Access to MAVIX-3.5",
        "Limited Customization",
      ],
      recommended: false,
    },
    {
      name: "Pro",
      price: "$9.99/mo",
      features: [
        "Unlimited Chat",
        "Priority Replies",
        "Access to MAVIX-4 Features",
        "Custom Chat Themes",
        "Export Chat History",
        "Faster Response Times",
      ],
      recommended: true,
    },
    {
      name: "Premium",
      price: "$19.99/mo",
      features: [
        "Everything in Pro",
        "Dedicated Support",
        "Advanced MAVIX-4 Features",
        "Team Collaboration",
        "API Access",
        "Early Feature Access",
      ],
      recommended: false,
    },
  ];

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me/details`,
          { withCredentials: true }
        );
        setUser(data);
        if (data.upgradeRequest) setPendingPlan(data.upgradeRequest);
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };
    fetchUserDetails();
  }, []);

  const handleClose = () => navigate("/");

  const handleConfirmUpgrade = async () => {
    if (!confirmPlan || !user) return;

    setLoadingPlan(confirmPlan);

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/upgrade/request`,
        { plan: confirmPlan },
        { withCredentials: true }
      );

      setPendingPlan(confirmPlan);
      setLoadingPlan("");
      setConfirmPlan(null);
      toast.success(`✅ Upgrade request for ${confirmPlan} sent!`);
    } catch (err) {
      console.error(
        "Upgrade request failed:",
        err.response?.data || err.message
      );
      toast.error("❌ Failed to send upgrade request.");
      setLoadingPlan("");
      setConfirmPlan(null);
    }
  };

  if (!user) return <div className="loadingText">Loading...</div>;

  return (
    <div className="upgradePage">
      <header className="upgradeHeader">
        <div className="headerText">
          <h1>Upgrade Your Plan</h1>
          <p>
            Choose a plan that suits your needs and unlock premium features.
          </p>
        </div>
        <button className="closeBtn" onClick={handleClose}>
          &times;
        </button>
      </header>

      <div className="plansContainer">
        {plans.map((plan, idx) => {
          const isCurrent = plan.name === user.subscriptionPlan;
          const isPending = pendingPlan === plan.name;

          return (
            <div
              key={idx}
              className={`planCard ${
                plan.recommended && !isCurrent ? "recommended" : ""
              } ${isCurrent ? "currentPlanCard" : ""} ${
                isPending ? "pendingCard" : ""
              }`}
            >
              {plan.recommended && !isCurrent && (
                <div className="badge">Recommended</div>
              )}
              {isCurrent && <div className="currentBadge">Your Plan</div>}

              <h2 className="planName">{plan.name}</h2>
              <p className="planPrice">{plan.price}</p>
              <ul className="planFeatures">
                {plan.features.map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>

              {isCurrent ? (
                <button className="planButton current" disabled>
                  Current Plan
                </button>
              ) : isPending ? (
                <button className="planButton pending" disabled>
                  Pending
                </button>
              ) : (
                <button
                  className="planButton"
                  onClick={() => setConfirmPlan(plan.name)}
                  disabled={loadingPlan === plan.name}
                >
                  {loadingPlan === plan.name ? "Sending..." : "Choose Plan"}
                </button>
              )}

              {isPending && (
                <p className="pendingText">
                  Your account will be upgraded shortly after admin approval.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmPlan && (
        <div className="modalOverlay">
          <div className="modalBox">
            <h3>Confirm Upgrade</h3>
            <p>
              Are you sure you want to upgrade to{" "}
              <span className="highlight">{confirmPlan}</span>?
            </p>
            <div className="modalActions">
              <button
                className="modalBtn cancel"
                onClick={() => setConfirmPlan(null)}
              >
                Cancel
              </button>
              <button
                className="modalBtn confirm"
                onClick={handleConfirmUpgrade}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpgradePlan;
