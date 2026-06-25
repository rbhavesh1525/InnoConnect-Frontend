import { useState } from "react";
import Navbar from "../Components/Navbar";
import ProjectTabs from "./ProjectTabs";
import InvestorVerificationForm from "../Components/InvestorVerificationForm";
import { BadgeCheck, ShieldAlert, X } from "lucide-react";

function HomePage() {
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Read user from localStorage (set during login)
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = storedUser?.role;
  const isVerified = storedUser?.verification_status;

  const showBanner =
    !bannerDismissed &&
    role === "investor" &&
    !isVerified;

  return (
    <>
      <Navbar />

      {/* Investor Verification Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  Your investor account is not verified yet
                </p>
                <p className="text-xs text-indigo-200">
                  Complete verification to unlock investor features and connect with startups
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowVerificationForm(true)}
                className="flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors"
              >
                <BadgeCheck size={15} />
                Get Verified
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="text-indigo-200 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <ProjectTabs />

      {showVerificationForm && (
        <InvestorVerificationForm
          onClose={() => setShowVerificationForm(false)}
        />
      )}
    </>
  );
}

export default HomePage;