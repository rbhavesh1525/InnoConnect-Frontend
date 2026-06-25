import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  TrendingUp,
  Clock,
  BadgeCheck,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const BASE_URL = "http://127.0.0.1:8000/api/auth";

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-5 transition-all hover:shadow-md ${
      onClick ? "cursor-pointer" : ""
    }`}
  >
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      {value === null ? (
        <div className="w-10 h-7 mt-1 bg-slate-100 animate-pulse rounded" />
      ) : (
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      )}
    </div>
    {onClick && (
      <ArrowRight size={16} className="ml-auto text-slate-300" />
    )}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_users:        null,
    total_investors:    null,
    pending_requests:   null,
    approved_investors: null,
  });

  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setFetching(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/admin-stats`);
      if (res.data.success) {
        setStats(res.data);
      } else {
        setError(res.data.message || "Failed to load stats");
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError("Could not reach the server.");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Overview of InnoConnect platform
              </p>
            </div>
            <button
              onClick={fetchStats}
              disabled={fetching}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.total_users}
              color="bg-indigo-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Investors"
              value={stats.total_investors}
              color="bg-purple-500"
            />
            <StatCard
              icon={Clock}
              label="Pending Requests"
              value={stats.pending_requests}
              color="bg-amber-500"
              onClick={() => navigate("/admin/investor-verification")}
            />
            <StatCard
              icon={BadgeCheck}
              label="Approved Investors"
              value={stats.approved_investors}
              color="bg-emerald-500"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-base font-bold text-slate-700 mb-4">
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/admin/investor-verification")}
                className="flex items-center justify-between bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm rounded-2xl p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <BadgeCheck size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      Review Investor Requests
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Approve or reject pending verifications
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-slate-300 group-hover:text-indigo-500 transition-colors"
                />
              </button>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Users size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      Manage Users
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;