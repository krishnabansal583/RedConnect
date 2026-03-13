"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { requestAPI } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

// City coordinates for matching
const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  Delhi: { latitude: 28.7041, longitude: 77.1025 },
  Noida: { latitude: 28.5355, longitude: 77.3910 },
  Ghaziabad: { latitude: 28.6692, longitude: 77.4538 },
  Gurgaon: { latitude: 28.4595, longitude: 77.0266 },
  Mumbai: { latitude: 19.0760, longitude: 72.8777 },
  Bangalore: { latitude: 12.9716, longitude: 77.5946 },
  Pune: { latitude: 18.5204, longitude: 73.8567 },
};

interface MatchedDonor {
  _id: string;
  name: string;
  bloodGroup: string;
  city: string;
  donationCount: number;
  reliabilityScore: number;
  distance: number;
  priorityScore: number;
  badgeLevel?: string;
  phone?: string;
}

export default function RequestBlood() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    hospitalName: "",
    city: "",
    urgencyLevel: "Normal",
    contactNumber: "",
    additionalNotes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState<MatchedDonor[]>([]);
  const [showMatches, setShowMatches] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.patientName.trim()) newErrors.patientName = true;
    if (!formData.bloodGroup) newErrors.bloodGroup = true;
    if (!formData.hospitalName.trim()) newErrors.hospitalName = true;
    if (!formData.city.trim()) newErrors.city = true;
    if (!formData.contactNumber.trim()) newErrors.contactNumber = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!isAuthenticated) {
      alert("Please login to submit a blood request");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // Get coordinates for the city
      const coordinates = cityCoordinates[formData.city] || cityCoordinates.Delhi;

      // Submit request with location
      const response = await requestAPI.createRequest({
        ...formData,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      // Show success message
      setSubmitted(true);
      setShowMatches(true);

      // Set matched donors
      if (response.matchedDonors && response.matchedDonors.length > 0) {
        setMatchedDonors(response.matchedDonors);
      }

      // Clear form
      setFormData({
        patientName: "",
        bloodGroup: "",
        hospitalName: "",
        city: "",
        urgencyLevel: "Normal",
        contactNumber: "",
        additionalNotes: "",
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error: any) {
      console.error("Error submitting request:", error);
      alert(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeLevel = (donor: MatchedDonor) => {
    if (donor.badgeLevel) return donor.badgeLevel;
    if (donor.donationCount >= 8) return "Gold";
    if (donor.donationCount >= 4) return "Silver";
    return "Bronze";
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case "Gold":
        return "bg-yellow-100 text-yellow-700";
      case "Silver":
        return "bg-gray-100 text-gray-700";
      case "Bronze":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Request Blood
          </h1>
          <p className="text-lg text-gray-600">
            Submit your blood requirement details
          </p>
        </div>

        {/* Emergency Alert */}
        <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-red-600 mr-3 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Emergency Blood Request
              </h3>
              <p className="text-sm text-red-700">
                For life-threatening emergencies, please select "Emergency" urgency
                level. Your request will be prioritized and sent to nearby donors
                immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-600 p-4 rounded-lg animate-fade-in">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-600 mr-3 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  Blood request submitted successfully!
                </h3>
                <p className="text-sm text-green-700">
                  Request sent to top matching donors. You will receive responses shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Request Form */}
        <Card>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Patient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.patientName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter patient name"
                />
                {errors.patientName && (
                  <p className="text-sm text-red-600 mt-1">
                    Patient name is required
                  </p>
                )}
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group Required <span className="text-red-600">*</span>
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.bloodGroup ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                {errors.bloodGroup && (
                  <p className="text-sm text-red-600 mt-1">
                    Blood group is required
                  </p>
                )}
              </div>

              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.hospitalName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter hospital name"
                />
                {errors.hospitalName && (
                  <p className="text-sm text-red-600 mt-1">
                    Hospital name is required
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-600">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select City</option>
                  {Object.keys(cityCoordinates).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-sm text-red-600 mt-1">City is required</p>
                )}
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.urgencyLevel === "Normal"
                        ? "border-red-600 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgencyLevel"
                      value="Normal"
                      checked={formData.urgencyLevel === "Normal"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="font-medium">Normal</span>
                  </label>
                  <label
                    className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.urgencyLevel === "Emergency"
                        ? "border-red-600 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgencyLevel"
                      value="Emergency"
                      checked={formData.urgencyLevel === "Emergency"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="font-medium text-red-600">Emergency</span>
                  </label>
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.contactNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter contact number"
                />
                {errors.contactNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    Contact number is required
                  </p>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Any additional information (optional)"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Blood Request"}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Matched Donors Section */}
        {showMatches && matchedDonors.length > 0 && (
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Top Matching Donors Near You
              </h2>
              <p className="text-gray-600">
                We found {matchedDonors.length} compatible donors in your area
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matchedDonors.map((donor, index) => {
                const badgeLevel = getBadgeLevel(donor);
                return (
                  <Card key={donor._id} hover>
                    <div className="mb-4">
                      {/* Priority Score */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="primary">Match #{index + 1}</Badge>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${getPriorityColor(donor.priorityScore)}`}>
                            Priority: {donor.priorityScore}
                          </div>
                        </div>
                      </div>

                      {/* Donor Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {donor.name}
                          </h3>
                          <p className="text-sm text-gray-600">{donor.city}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-2xl font-bold text-red-600">
                            {donor.bloodGroup}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(
                              badgeLevel
                            )}`}
                          >
                            {badgeLevel}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-900">
                            {donor.distance} km
                          </div>
                          <div className="text-xs text-gray-500">Distance</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-900">
                            {donor.reliabilityScore}%
                          </div>
                          <div className="text-xs text-gray-500">Reliability</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-900">
                            {donor.donationCount}
                          </div>
                          <div className="text-xs text-gray-500">Donations</div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Button */}
                    <Button className="w-full" size="sm">
                      Contact Donor
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Matches Message */}
        {showMatches && matchedDonors.length === 0 && (
          <Card className="mt-8 text-center py-8">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No matching donors found
            </h3>
            <p className="text-gray-600">
              We'll notify you when compatible donors become available in your area
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
