import { useEffect, useState } from "react";
import axios from "axios";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const InvestorVerification = () => {

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {

    try {

      console.log(
        "Fetching Investor Requests..."
      );

      // Future API

      /*
      const response = await axios.get(
        "http://127.0.0.1:8000/api/investor-verification/all"
      );

      setRequests(response.data.data);
      */

      setRequests([
        {
          id: 1,
          full_name: "Bhavesh Rathod",
          investor_type: "Angel Investor",
          organization_name: "BR Ventures",
        },
      ]);

      console.log(
        "Investor Requests Loaded"
      );

    } catch (error) {

      console.error(
        "Request Error:",
        error.response?.data || error.message
      );

    }
  };

  const approveInvestor = async (
    requestId
  ) => {

    try {

      console.log(
        "Approving:",
        requestId
      );

      // future api

      alert(
        "Investor Approved"
      );

    } catch (error) {

      console.error(
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

          <h1 className="text-2xl font-bold mb-5">
            Investor Verification Requests
          </h1>

          <div className="space-y-4">

            {requests.map((request) => (

              <div
                key={request.id}
                className="bg-white rounded-xl shadow p-5"
              >

                <h2 className="font-bold text-lg">
                  {request.full_name}
                </h2>

                <p>
                  {request.investor_type}
                </p>

                <p>
                  {request.organization_name}
                </p>

                <button
                  onClick={() =>
                    approveInvestor(
                      request.id
                    )
                  }
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Approve
                </button>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default InvestorVerification;