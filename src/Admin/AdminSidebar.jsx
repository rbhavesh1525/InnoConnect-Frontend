import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BadgeCheck,
} from "lucide-react";

const AdminSidebar = () => {
  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white">

      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          InnoConnect
        </h1>

        <p className="text-slate-400 text-sm">
          Admin Panel
        </p>
      </div>

      <div className="p-4 space-y-2">

        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          to="/admin/investor-verification"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
        >
          <BadgeCheck size={20} />
          Investor Verification
        </Link>

      </div>
    </div>
  );
};

export default AdminSidebar;