import React, { useState } from "react";
import {
  X,
  User,
  Building2,
  Link2,
  TrendingUp,
  Layers,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/investor-verification";

const industries = [
  "FinTech", "HealthTech", "EdTech", "AI/ML",
  "Agriculture", "E-Commerce", "Clean Energy", "SaaS",
];

const stages = ["Idea", "Prototype", "MVP", "Seed", "Series A"];

const investorTypes = [
  "Angel Investor",
  "Venture Capitalist",
  "Corporate Investor",
  "Accelerator",
];

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
      <Icon size={16} className="text-indigo-600" />
    </div>
    <h3 className="font-bold text-slate-700 text-base">{title}</h3>
  </div>
);

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none px-3.5 py-2.5 rounded-xl text-sm text-slate-800 transition-all placeholder:text-slate-400";

const ChipCheckbox = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all select-none ${
      checked
        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
    }`}
  >
    {checked && <CheckCircle2 size={13} className="inline mr-1 -mt-0.5" />}
    {label}
  </button>
);

function InvestorVerificationForm({ onClose }) {
  const [formData, setFormData] = useState({
    full_name: "",
    organization_name: "",
    designation: "",
    investor_type: "",
    linkedin_url: "",
    organization_website: "",
    preferred_industries: [],
    startup_stages: [],
    min_investment: "",
    max_investment: "",
    open_for_opportunities: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");

  const set = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const toggleList = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.investor_type) {
      setError("Please select an investor type.");
      return;
    }
    if (formData.preferred_industries.length === 0) {
      setError("Please select at least one preferred industry.");
      return;
    }
    if (formData.startup_stages.length === 0) {
      setError("Please select at least one startup stage.");
      return;
    }

    setSubmitting(true);
    try {
      const userId = localStorage.getItem("user_id");
      const payload = {
        ...formData,
        min_investment: Number(formData.min_investment) || 0,
        max_investment: Number(formData.max_investment) || 0,
      };
      await axios.post(
        `${BASE_URL}/submit/${userId}`,
        payload
      );
      setSuccess(true);
    } catch (err) {
      console.error("Verification Error:", err.response?.data || err.message);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to submit. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Investor Verification</h2>
              <p className="text-xs text-slate-400">Get verified to unlock investor features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Success State ── */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h3>
            <p className="text-slate-500 max-w-sm">
              Your verification request has been submitted. Our admin team will review it shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">

            {/* ── Basic Info ── */}
            <section>
              <SectionTitle icon={User} title="Basic Information" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={inputCls}
                    required
                    value={formData.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                  />
                </Field>
                <Field label="Organization Name">
                  <input
                    type="text"
                    placeholder="Acme Ventures"
                    className={inputCls}
                    required
                    value={formData.organization_name}
                    onChange={(e) => set("organization_name", e.target.value)}
                  />
                </Field>
                <Field label="Designation">
                  <input
                    type="text"
                    placeholder="Managing Partner"
                    className={inputCls}
                    required
                    value={formData.designation}
                    onChange={(e) => set("designation", e.target.value)}
                  />
                </Field>
                <Field label="Investor Type">
                  <select
                    className={inputCls}
                    value={formData.investor_type}
                    onChange={(e) => set("investor_type", e.target.value)}
                  >
                    <option value="">Select type…</option>
                    {investorTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* ── Links ── */}
            <section>
              <SectionTitle icon={Link2} title="Verification Links" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="LinkedIn URL">
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    className={inputCls}
                    required
                    value={formData.linkedin_url}
                    onChange={(e) => set("linkedin_url", e.target.value)}
                  />
                </Field>
                <Field label="Organization Website">
                  <input
                    type="url"
                    placeholder="https://yourfirm.com"
                    className={inputCls}
                    required
                    value={formData.organization_website}
                    onChange={(e) => set("organization_website", e.target.value)}
                  />
                </Field>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* ── Industries ── */}
            <section>
              <SectionTitle icon={Building2} title="Preferred Industries" />
              <div className="flex flex-wrap gap-2">
                {industries.map((ind) => (
                  <ChipCheckbox
                    key={ind}
                    label={ind}
                    checked={formData.preferred_industries.includes(ind)}
                    onChange={() => toggleList("preferred_industries", ind)}
                  />
                ))}
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* ── Stages ── */}
            <section>
              <SectionTitle icon={Layers} title="Startup Stages" />
              <div className="flex flex-wrap gap-2">
                {stages.map((s) => (
                  <ChipCheckbox
                    key={s}
                    label={s}
                    checked={formData.startup_stages.includes(s)}
                    onChange={() => toggleList("startup_stages", s)}
                  />
                ))}
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* ── Investment Range ── */}
            <section>
              <SectionTitle icon={TrendingUp} title="Investment Range (₹)" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Minimum Investment">
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    className={inputCls}
                    min={0}
                    required
                    value={formData.min_investment}
                    onChange={(e) => set("min_investment", e.target.value)}
                  />
                </Field>
                <Field label="Maximum Investment">
                  <input
                    type="number"
                    placeholder="e.g. 5000000"
                    className={inputCls}
                    min={0}
                    required
                    value={formData.max_investment}
                    onChange={(e) => set("max_investment", e.target.value)}
                  />
                </Field>
              </div>
            </section>

            <div className="border-t border-slate-100" />

            {/* ── Open for Opportunities ── */}
            <section>
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <div
                  onClick={() => set("open_for_opportunities", !formData.open_for_opportunities)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.open_for_opportunities ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.open_for_opportunities ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Open for Opportunities</p>
                  <p className="text-xs text-slate-400">Allow startups to reach out to you</p>
                </div>
              </label>
            </section>

            {/* ── Error ── */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 pt-2 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-7 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? "Submitting…" : "Submit Verification"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

export default InvestorVerificationForm;