import { useEffect, useState } from "react";
import axios from "axios";

import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const AdminDashboard = () => {

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvestors: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {

    try {

      console.log(
        "Fetching Dashboard Stats..."
      );

      // Future API

      /*
      const response = await axios.get(
        "http://127.0.0.1:8000/admin/stats"
      );

      setStats(response.data);
      */

      setStats({
        totalUsers: 120,
        totalInvestors: 18,
      });

      console.log(
        "Dashboard Stats Loaded"
      );

    } catch (error) {

      console.error(
        "Dashboard Error:",
        error.response?.data || error.message
      );

    }
  };

  return (
    <div className="flex bg-slate-100">

      <AdminSidebar />

      <div className="flex-1">

        <AdminNavbar />

        <div className="p-6">

          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-white rounded-xl shadow p-6">

              <h3 className="text-gray-500">
                Total Users
              </h3>

              <h1 className="text-4xl font-bold mt-2">
                {stats.totalUsers}
              </h1>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

              <h3 className="text-gray-500">
                Total Investors
              </h3>

              <h1 className="text-4xl font-bold mt-2">
                {stats.totalInvestors}
              </h1>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;