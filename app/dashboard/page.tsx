"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { useAuth } from "@/lib/AuthContext";
import { authAPI, requestAPI, donationAPI, healthScreeningAPI } from "@/lib/api";

interface DonationHistory {
  id: number;
  date: string;
  location: string;
  bloodGroup: string;
}

interface EmergencyRequest {
  _id: string;
  hospitalName: string;
  bloodGroup: string;
  city: string;
  urgencyLevel: string;
  createdAt: string;
}

export default function DonorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [eligibility, setEligibility] = useState<any>(null);
  const [screeningStatus, setScreeningStatus] = useState<any>(null);

  // Mock donation history (can be replaced with API call later)
  const mockDonationHistory: DonationHistory[] = [
    {
      id: 1,
      date: "2024-02-15",
      location: "City Hospital, Mumbai",
      bloodGroup: user?.bloodGroup || "O+",
    },
    {
      id: 2,
      date: "2023-11-20",
      location: "Apollo Hospital, Mumbai",
      bloodGroup: user?.bloodGroup || "O+",
    },
    {
      id: 3,
      date: "2023-08-10",
      location: "Lilavati Hospital, Mumbai",
      bloodGroup: user?.bloodGroup || "O+",
    },
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        // Fetch user profile
        const profile = await authAPI.getProfile();
        setProfileData(profile);

        // Fetch eligibility status
        try {
          const eligibilityData = await donationAPI.getEligibility();
          setEligibility(eligibilityData);
        } catch (error) {
          console.error("Error fetching eligibility:", error);
        }

        // Fetch health screening status
        try {
          const screening = await healthScreeningAPI.getStatus();
          setScreeningStatus(screening);
        } catch (error) {
          console.error("Error fetching screening status:", error);
        }

        // Fetch emergency requests
        const requests = await requestAPI.getRequests({
          urgencyLevel: "Emergency",
        });
        setEmergencyRequests(requests.slice(0, 3)); // Show only 3
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const getBadgeLevel = () => {
    if (eligibility?.badgeLevel) return eligibility.badgeLevel;
    const count = profileData?.donationCount || 0;
    if (count >= 8) return "Gold";
    if (count >= 4) return "Silver";
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

  const calculateNextEligibleDate = () => {
    // If screening not done or failed → not applicable yet
    if (!screeningStatus?.isComplete) return "Complete screening first";
    if (screeningStatus?.eligible === false) return "Not eligible (screening)";

    // Screening passed — now check 90-day donation rule
    if (eligibility?.nextEligibleDate) {
      return new Date(eligibility.nextEligibleDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    if (eligibility?.eligible === false) {
      // Has a lastDonationDate but nextEligibleDate not returned — compute it
      const lastDonation = profileData?.lastDonationDate;
      if (lastDonation) {
        const nextDate = new Date(lastDonation);
        nextDate.setDate(nextDate.getDate() + 90);
        return nextDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    return "Eligible Now";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const donor = {
    name: profileData?.name || user?.name || "User",
    bloodGroup: profileData?.bloodGroup || user?.bloodGroup || "O+",
    city: profileData?.city || user?.city || "Unknown",
    badgeLevel: getBadgeLevel() as "Bronze" | "Silver" | "Gold",
    totalDonations: eligibility?.donationCount || profileData?.donationCount || 0,
    livesSaved: (eligibility?.donationCount || profileData?.donationCount || 0) * 3,
    nextEligibleDate: calculateNextEligibleDate(),
    reliabilityScore: eligibility?.reliabilityScore || profileData?.reliabilityScore || 50,
    // ── Eligibility: must pass BOTH health screening AND 90-day rule ──────
    // screeningStatus is null while loading — treat as pending (not eligible yet)
    screeningDone:      screeningStatus?.isComplete === true,
    screeningEligible:  screeningStatus?.eligible === true,
    // 90-day rule: eligible === true means passed, undefined/null means no donation yet (eligible)
    donationEligible:   eligibility?.eligible !== false,
    daysUntilEligible:  eligibility?.daysUntilEligible || 0,
    get isEligible() {
      return this.screeningDone && this.screeningEligible && this.donationEligible;
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Donor Dashboard
          </h1>
          <p className="text-lg text-gray-600">Welcome back, {donor.name}!</p>
        </div>

        {/* Health Screening Banner */}
        {screeningStatus && !screeningStatus.isComplete && (
          <div className="mb-6 flex items-start gap-4 bg-amber-50 border border-amber-300 rounded-xl p-4">
            <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-sm">Complete your Health Screening</p>
              <p className="text-amber-700 text-xs mt-0.5">
                You need to fill a quick health form to become an active donor and appear in search results.
              </p>
            </div>
            <Button size="sm" onClick={() => router.push("/health-screening")}>
              Start Now
            </Button>
          </div>
        )}

        {/* Screening ineligible notice */}
        {screeningStatus?.isComplete && screeningStatus.eligible === false && (
          <div className="mb-6 flex items-start gap-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-900 text-sm">Health Screening: Not Eligible</p>
              {screeningStatus.reasons?.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {screeningStatus.reasons.map((r: string, i: number) => (
                    <li key={i} className="text-xs text-red-700">• {r}</li>
                  ))}
                </ul>
              )}
            </div>
            <Button size="sm" onClick={() => router.push("/health-screening")}>
              Re-submit
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <div className="text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {donor.name}
                </h2>
                <p className="text-gray-600 mb-3">{donor.city}</p>
                {profileData?.campus && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center text-sm text-blue-700">
                      <svg
                        className="w-4 h-4 mr-2"
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
                      <span className="font-medium">
                        {profileData.campus.collegeName}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="text-3xl font-bold text-red-600">
                    {donor.bloodGroup}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(
                      donor.badgeLevel
                    )}`}
                  >
                    {donor.badgeLevel}
                  </span>
                </div>
                <Button className="w-full" size="sm">
                  Edit Profile
                </Button>
              </div>
            </Card>

            {/* Donation Stats */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Donation Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-8 h-8 text-red-600 mr-3"
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
                    <div>
                      <div className="text-sm text-gray-600">Total Donations</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {donor.totalDonations}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-8 h-8 text-green-600 mr-3"
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
                    <div>
                      <div className="text-sm text-gray-600">Lives Saved</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {donor.livesSaved}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-8 h-8 text-blue-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-600">Next Eligible</div>
                      <div className="text-lg font-bold text-gray-900">
                        {donor.nextEligibleDate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-8 h-8 text-purple-600 mr-3"
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
                      <div className="text-sm text-gray-600">Reliability Score</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {donor.reliabilityScore}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Eligibility status — driven by screening + 90-day rule ── */}
                {!donor.screeningDone && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-amber-900">
                          Screening Pending
                        </div>
                        <div className="text-xs text-amber-700 mt-1">
                          Complete health screening to activate donor status
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {donor.screeningDone && !donor.screeningEligible && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-red-900">
                          Not Eligible (Health)
                        </div>
                        <div className="text-xs text-red-700 mt-1">
                          Your health screening did not pass
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {donor.screeningDone && donor.screeningEligible && !donor.donationEligible && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-yellow-900">
                          Not Eligible Yet
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">
                          You can donate again in {donor.daysUntilEligible} days
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {donor.isEligible && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-green-900">
                          Eligible to Donate
                        </div>
                        <div className="text-xs text-green-700 mt-1">
                          Health screening passed · Ready to donate
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - History & Emergency Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Requests Panel */}
            {emergencyRequests.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Emergency Blood Requests
                  </h3>
                  <Badge variant="warning">
                    {emergencyRequests.length} Urgent
                  </Badge>
                </div>
                <div className="space-y-3">
                  {emergencyRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {request.hospitalName}
                          </h4>
                          <Badge variant="warning">High Priority</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
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
                            </svg>
                            {request.city}
                          </span>
                          <span className="font-semibold text-red-600">
                            {request.bloodGroup}
                          </span>
                        </div>
                      </div>
                      <Button size="sm">Respond</Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Donation History */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Donation History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Blood Group
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDonationHistory.map((donation) => (
                      <tr
                        key={donation.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(donation.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {donation.location}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                            {donation.bloodGroup}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
