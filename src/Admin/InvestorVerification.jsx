import { useEffect, useState } from "react";
import axios from "axios";
import {
  BadgeCheck,
  XCircle,
  Clock,
  Linkedin,
  Globe,
  TrendingUp,
  Users,
  RefreshCw,
  Building2,
  User,
  Layers,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const BASE_URL = "http://127.0.0.1:8000/api/investor-verification";

// Supabase can return JSON arrays as strings — parse safely
const safeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
};

/* ── Status badge ───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { cls: "bg-amber-100 text-amber-700 border-amber-300",   icon: <Clock size={12} />,     label: "Pending"  },
    approved: { cls: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: <BadgeCheck size={12} />, label: "Approved" },
    rejected: { cls: "bg-red-100 text-red-700 border-red-300",         icon: <XCircle size={12} />,   label: "Rejected" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
};

/* ── Single request card ────────────────────────────────── */
const RequestCard = ({ request, onApprove, onReject, loadingId }) => {
  const isBusy = loadingId === request.id;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Colored top strip by status */}
      <div className={`h-1 w-full ${
        request.status === "approved" ? "bg-emerald-500" :
        request.status === "rejected" ? "bg-red-500" :
        "bg-amber-400"
      }`} />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {request.full_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">
                {request.full_name}
              </h2>
              <p className="text-slate-500 text-sm">
                {request.designation} &middot; {request.organization_name}
              </p>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Industry / type chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
            {request.investor_type || "—"}
          </span>
          {safeArray(request.preferred_industries).map((ind) => (
            <span key={ind} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">
              {ind}
            </span>
          ))}
        </div>

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4">
          <div className="flex items-center gap-2 text-slate-600">
            <TrendingUp size={14} className="text-indigo-400 flex-shrink-0" />
            <span>
              <span className="font-medium text-slate-700">Investment: </span>
              ₹{(request.min_investment ?? 0).toLocaleString()} – ₹{(request.max_investment ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-start gap-2 text-slate-600">
            <Layers size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <span>
              <span className="font-medium text-slate-700">Stages: </span>
              {safeArray(request.startup_stages).join(", ") || "—"}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-600">
            <Users size={14} className="text-slate-400 flex-shrink-0" />
            <span>
              <span className="font-medium text-slate-700">Open: </span>
              <span className={request.open_for_opportunities ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                {request.open_for_opportunities ? "Yes" : "No"}
              </span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        {request.status === "pending" ? (
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => onApprove(request.id)}
              disabled={isBusy}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
            >
              {isBusy ? <RefreshCw size={15} className="animate-spin" /> : <BadgeCheck size={15} />}
              Approve
            </button>
            <button
              onClick={() => onReject(request.id)}
              disabled={isBusy}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 active:scale-95 disabled:opacity-50 text-red-600 border border-red-300 font-semibold py-2.5 rounded-xl transition-all text-sm"
            >
              {isBusy ? <RefreshCw size={15} className="animate-spin" /> : <XCircle size={15} />}
              Reject
            </button>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              This request has been <span className="font-semibold">{request.status}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main page ──────────────────────────────────────────── */
const InvestorVerification = () => {
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [filter, setFilter]     = useState("all");
  const [toast, setToast]       = useState(null);

  useEffect(() => { fetchRequests(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${BASE_URL}/all`);
      setRequests(res.data.data ?? []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      showToast("Failed to load requests", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleApprove = async (id) => {
    setLoadingId(id);
    try {
      await axios.put(`${BASE_URL}/approve/${id}`);
      setRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: "approved" } : r)
      );
      showToast("✅ Investor approved successfully!");
    } catch (err) {
      console.error("Approve error:", err.response?.data || err.message);
      showToast("Failed to approve investor", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setLoadingId(id);
    try {
      await axios.put(`${BASE_URL}/reject/${id}`);
      setRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r)
      );
      showToast("Investor request rejected.");
    } catch (err) {
      console.error("Reject error:", err.response?.data || err.message);
      showToast("Failed to reject request", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const counts = {
    all:      requests.length,
    pending:  requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const filtered = filter === "all"
    ? requests
    : requests.filter((r) => r.status === filter);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <main className="flex-1 p-6 overflow-y-auto">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Investor Verification Requests
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Review submitted requests and approve or reject them
              </p>
            </div>
            <button
              onClick={fetchRequests}
              disabled={fetching}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total",    key: "all",      bar: "bg-slate-600" },
              { label: "Pending",  key: "pending",  bar: "bg-amber-500" },
              { label: "Approved", key: "approved", bar: "bg-emerald-500" },
              { label: "Rejected", key: "rejected", bar: "bg-red-500" },
            ].map(({ label, key, bar }) => (
              <div
                key={key}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3"
              >
                <div className={`w-1.5 h-10 rounded-full ${bar}`} />
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-800">{counts[key]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filter tabs ── */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["all", "pending", "approved", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f} ({counts[f]})
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <RefreshCw size={32} className="animate-spin mb-3" />
              <p className="text-sm">Loading requests...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <BadgeCheck size={44} className="mb-3 opacity-25" />
              <p className="text-sm font-medium">
                No {filter !== "all" ? filter : ""} requests found
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  loadingId={loadingId}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
          toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default InvestorVerification;