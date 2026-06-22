import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

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

    expertise: [],

    open_for_opportunities: true,
  });

  const industries = [
    "FinTech",
    "HealthTech",
    "EdTech",
    "AI/ML",
    "Agriculture",
    "E-Commerce",
    "Clean Energy",
    "SaaS",
  ];

  const stages = [
    "Idea",
    "Prototype",
    "MVP",
    "Seed",
    "Series A",
  ];

  const expertiseOptions = [
    "Business Strategy",
    "Marketing",
    "Technology",
    "Finance",
    "Product Development",
  ];

  const handleCheckboxChange = (
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(
            (item) => item !== value
          )
        : [...prev[field], value],
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    const userId = localStorage.getItem("user_id");

    const response = await axios.post(
      `http://127.0.0.1:8000/api/investor-verification/submit/${userId}`,
      formData
    );

    console.log("Verification Response:", response.data);

    alert("Verification Request Submitted");

    onClose();

  } catch (error) {

    console.error(
      "Verification Error:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      "Failed to submit verification request"
    );
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Investor Verification
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC INFO */}

          <div>
            <h3 className="font-bold text-lg mb-3">
              Basic Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Full Name"
                className="border p-3 rounded-lg"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    full_name:
                      e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Organization Name"
                className="border p-3 rounded-lg"
                value={
                  formData.organization_name
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    organization_name:
                      e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Designation"
                className="border p-3 rounded-lg"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    designation:
                      e.target.value,
                  })
                }
              />

              <select
                className="border p-3 rounded-lg"
                value={
                  formData.investor_type
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investor_type:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Investor Type
                </option>

                <option>
                  Angel Investor
                </option>

                <option>
                  Venture Capitalist
                </option>

                <option>
                  Corporate Investor
                </option>

                <option>
                  Accelerator
                </option>
              </select>

            </div>
          </div>

          {/* LINKS */}

          <div>
            <h3 className="font-bold text-lg mb-3">
              Verification Links
            </h3>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                type="url"
                placeholder="LinkedIn URL"
                className="border p-3 rounded-lg"
                value={
                  formData.linkedin_url
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    linkedin_url:
                      e.target.value,
                  })
                }
              />

              <input
                type="url"
                placeholder="Organization Website"
                className="border p-3 rounded-lg"
                value={
                  formData.organization_website
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    organization_website:
                      e.target.value,
                  })
                }
              />

            </div>
          </div>

          {/* INDUSTRIES */}

          <div>
            <h3 className="font-bold text-lg mb-3">
              Preferred Industries
            </h3>

            <div className="flex flex-wrap gap-3">

              {industries.map(
                (industry) => (
                  <label
                    key={industry}
                    className="flex gap-2"
                  >
                    <input
                      type="checkbox"
                      onChange={() =>
                        handleCheckboxChange(
                          "preferred_industries",
                          industry
                        )
                      }
                    />
                    {industry}
                  </label>
                )
              )}

            </div>
          </div>

          {/* STAGES */}

          <div>
            <h3 className="font-bold text-lg mb-3">
              Startup Stages
            </h3>

            <div className="flex flex-wrap gap-3">

              {stages.map((stage) => (
                <label
                  key={stage}
                  className="flex gap-2"
                >
                  <input
                    type="checkbox"
                    onChange={() =>
                      handleCheckboxChange(
                        "startup_stages",
                        stage
                      )
                    }
                  />
                  {stage}
                </label>
              ))}

            </div>
          </div>

          {/* INVESTMENT */}

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="number"
              placeholder="Minimum Investment"
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Maximum Investment"
              className="border p-3 rounded-lg"
            />

          </div>

          {/* SUBMIT */}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="border px-5 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Submit Verification
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default InvestorVerificationForm;