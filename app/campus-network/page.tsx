"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { campusAPI } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface Campus {
  _id: string;
  collegeName: string;
  city: string;
  state: string;
  totalDonors: number;
  totalDonations: number;
}

export default function CampusNetwork() {
  const { isAuthenticated } = useAuth();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    collegeName: "",
    city: "",
    state: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    try {
      const data = await campusAPI.getCampuses();
      setCampuses(data);
    } catch (error) {
      console.error("Error fetching campuses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCampus = async (campusId: string) => {
    if (!isAuthenticated) {
      setErrorMessage("Please login to join a campus");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      await campusAPI.joinCampus(campusId);
      setSuccessMessage("Successfully joined campus!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchCampuses(); // Refresh campus list
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to join campus"
      );
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.collegeName.trim())
      errors.collegeName = "College name is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await campusAPI.createCampus(formData);
      setSuccessMessage("Campus added successfully!");
      setFormData({ collegeName: "", city: "", state: "" });
      setShowAddForm(false);
      fetchCampuses();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to add campus"
      );
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Campus Network
          </h1>
          <p className="text-lg text-gray-600">
            Colleges making a difference through blood donation
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Banner Section */}
        <Card className="mb-8 bg-gradient-to-r from-red-50 to-white border-2 border-red-200">
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <svg
                className="w-16 h-16 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Join the Campus Donor Community
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Be part of a life-saving network. Connect with fellow students,
              organize donation drives, and make a real impact in your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? "Cancel" : "Register Your College"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Add Campus Form */}
        {showAddForm && (
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Register New College
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors.collegeName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter college name"
                  />
                  {formErrors.collegeName && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.collegeName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter city"
                  />
                  {formErrors.city && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      formErrors.state ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter state"
                  />
                  {formErrors.state && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.state}</p>
                  )}
                </div>
              </div>
              <Button type="submit" size="md">
                Add College
              </Button>
            </form>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {campuses.length}+
              </div>
              <div className="text-sm text-gray-600">Colleges Joined</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {campuses
                  .reduce((sum, campus) => sum + campus.totalDonors, 0)
                  .toLocaleString()}
                +
              </div>
              <div className="text-sm text-gray-600">Student Donors</div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {campuses
                  .reduce((sum, campus) => sum + campus.totalDonations, 0)
                  .toLocaleString()}
                +
              </div>
              <div className="text-sm text-gray-600">Total Donations</div>
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campuses...</p>
          </div>
        )}

        {/* College Cards Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campuses.map((campus) => (
              <Card key={campus._id} hover>
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {campus.collegeName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {campus.city}, {campus.state}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {campus.totalDonors}
                      </div>
                      <div className="text-xs text-gray-600">Registered Donors</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {campus.totalDonations}
                      </div>
                      <div className="text-xs text-gray-600">Total Donations</div>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handleJoinCampus(campus._id)}
                >
                  Join Campus Network
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && campuses.length === 0 && (
          <Card className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No campuses yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to register your college!
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              Register Your College
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
