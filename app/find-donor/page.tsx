"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { useVoiceSearch } from "@/lib/useVoiceSearch";

interface Donor {
  id: number;
  name: string;
  bloodGroup: string;
  city: string;
  distance: number;
  reliabilityScore: number;
  totalDonations: number;
  badgeLevel: "Bronze" | "Silver" | "Gold";
  priorityScore: number;
}

// Extended mock dataset with diverse data
const allDonors: Donor[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    bloodGroup: "O+",
    city: "Mumbai",
    distance: 2.1,
    reliabilityScore: 95,
    totalDonations: 12,
    badgeLevel: "Gold",
    priorityScore: 0,
  },
  {
    id: 2,
    name: "Priya Patel",
    bloodGroup: "A+",
    city: "Mumbai",
    distance: 3.5,
    reliabilityScore: 88,
    totalDonations: 8,
    badgeLevel: "Silver",
    priorityScore: 0,
  },
  {
    id: 3,
    name: "Amit Kumar",
    bloodGroup: "B+",
    city: "Delhi",
    distance: 5.2,
    reliabilityScore: 92,
    totalDonations: 15,
    badgeLevel: "Gold",
    priorityScore: 0,
  },
  {
    id: 4,
    name: "Sneha Reddy",
    bloodGroup: "O+",
    city: "Bangalore",
    distance: 7.8,
    reliabilityScore: 75,
    totalDonations: 5,
    badgeLevel: "Bronze",
    priorityScore: 0,
  },
  {
    id: 5,
    name: "Vikram Singh",
    bloodGroup: "AB+",
    city: "Mumbai",
    distance: 4.3,
    reliabilityScore: 90,
    totalDonations: 10,
    badgeLevel: "Silver",
    priorityScore: 0,
  },
  {
    id: 6,
    name: "Anjali Mehta",
    bloodGroup: "A-",
    city: "Pune",
    distance: 6.1,
    reliabilityScore: 80,
    totalDonations: 7,
    badgeLevel: "Silver",
    priorityScore: 0,
  },
  {
    id: 7,
    name: "Karan Verma",
    bloodGroup: "O-",
    city: "Delhi",
    distance: 1.5,
    reliabilityScore: 98,
    totalDonations: 20,
    badgeLevel: "Gold",
    priorityScore: 0,
  },
  {
    id: 8,
    name: "Neha Gupta",
    bloodGroup: "B-",
    city: "Mumbai",
    distance: 8.2,
    reliabilityScore: 70,
    totalDonations: 3,
    badgeLevel: "Bronze",
    priorityScore: 0,
  },
  {
    id: 9,
    name: "Rohan Das",
    bloodGroup: "AB-",
    city: "Bangalore",
    distance: 3.0,
    reliabilityScore: 85,
    totalDonations: 9,
    badgeLevel: "Gold",
    priorityScore: 0,
  },
  {
    id: 10,
    name: "Pooja Singh",
    bloodGroup: "O+",
    city: "Pune",
    distance: 4.8,
    reliabilityScore: 82,
    totalDonations: 6,
    badgeLevel: "Silver",
    priorityScore: 0,
  },
];

// Calculate priority score based on distance, reliability, and donations
const calculatePriorityScore = (donor: Donor): number => {
  // Distance score: closer is better (max 10km, inverted)
  const distanceScore = Math.max(0, (10 - donor.distance) / 10) * 30;
  
  // Reliability score: direct percentage contribution
  const reliabilityContribution = (donor.reliabilityScore / 100) * 40;
  
  // Donations score: more donations is better (capped at 20)
  const donationsScore = Math.min(donor.totalDonations / 20, 1) * 30;
  
  // Total score out of 100
  const totalScore = distanceScore + reliabilityContribution + donationsScore;
  
  return Math.round(totalScore);
};

export default function FindDonor() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [donors, setDonors] = useState<Donor[]>([]);

  // Voice search — autofill blood group + city from speech
  const handleVoiceResult = useCallback(
    (result: { blood_group: string; city: string }) => {
      if (result.blood_group) setBloodGroup(result.blood_group);
      if (result.city) setCity(result.city);
    },
    []
  );

  const { listening, transcript, finalTranscript, aiStatus, detectedLang, startListening, stopListening, speak } =
    useVoiceSearch(handleVoiceResult);

  // Filter and sort donors whenever filters change
  useEffect(() => {
    let filtered = [...allDonors];

    // Filter by blood group
    if (bloodGroup) {
      filtered = filtered.filter((donor) => donor.bloodGroup === bloodGroup);
    }

    // Filter by city (case-insensitive partial match)
    if (city.trim()) {
      filtered = filtered.filter((donor) =>
        donor.city.toLowerCase().includes(city.toLowerCase().trim())
      );
    }

    // Calculate priority scores
    filtered = filtered.map((donor) => ({
      ...donor,
      priorityScore: calculatePriorityScore(donor),
    }));

    // Sort by priority score (highest first)
    filtered.sort((a, b) => b.priorityScore - a.priorityScore);

    setDonors(filtered);
  }, [bloodGroup, city]);

  const handleSearch = () => {
    // Trigger re-filter (already handled by useEffect)
    const bg = bloodGroup || "any blood group";
    const ct = city.trim() || "all cities";
    speak(`Found ${donors.length} donors for ${bg} in ${ct}`);
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 85) return { label: "High Priority Match", color: "text-green-600" };
    if (score >= 70) return { label: "Good Match", color: "text-blue-600" };
    return { label: "Available Match", color: "text-gray-600" };
  };

  const getPriorityBarColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    return "bg-gray-400";
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Find Blood Donors
          </h1>
          <p className="text-lg text-gray-600">
            Search for available donors near you
          </p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                Search Donors
              </Button>
            </div>
          </div>
        </Card>

        {/* ── Voice AI Search Button ───────────────────────────────────── */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border-2 transition-all shadow-sm ${
              listening
                ? "bg-red-600 border-red-600 text-white shadow-red-200 shadow-md"
                : "bg-white border-red-500 text-red-600 hover:bg-red-50"
            }`}
          >
            {listening ? (
              <>
                {/* Animated waveform */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2"  y="9"  width="2" height="6"  rx="1" />
                  <rect x="6"  y="6"  width="2" height="12" rx="1" />
                  <rect x="10" y="3"  width="2" height="18" rx="1" />
                  <rect x="14" y="6"  width="2" height="12" rx="1" />
                  <rect x="18" y="9"  width="2" height="6"  rx="1" />
                </svg>
                Stop Listening
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z"
                  />
                </svg>
                🤖 Search by Voice AI
              </>
            )}
          </button>

          {/* Subtle hint text */}
          {!listening && aiStatus === "idle" && (
            <span className="text-xs text-gray-400">
              Say e.g. "B positive in Delhi" or "O negative Mumbai urgent"
            </span>
          )}
        </div>

        {/* Voice status strip — only visible when active */}
        {(listening || aiStatus !== "idle") && (
          <div className={`mb-6 flex items-start gap-3 px-4 py-3 rounded-lg text-sm font-medium border transition-all ${
            listening
              ? "bg-red-50 border-red-200 text-red-700"
              : aiStatus === "processing"
              ? "bg-yellow-50 border-yellow-200 text-yellow-700"
              : aiStatus === "done"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {/* Icon */}
            <span className="mt-0.5 shrink-0">
              {listening && (
                <span className="flex h-4 w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
              {!listening && aiStatus === "processing" && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {!listening && aiStatus === "done" && (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!listening && (aiStatus === "error" || aiStatus === "no-match") && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              )}
            </span>

            {/* Message */}
            <span className="flex flex-col gap-0.5">
              {listening && (
                <>
                  <span>{detectedLang === "hi" ? "🎤 Sun raha hoon… blood group aur city bolein" : "🎤 Listening… speak your blood group and city"}</span>
                  {transcript && (
                    <span className="text-xs font-normal opacity-80 italic">"{transcript}"</span>
                  )}
                </>
              )}
              {!listening && aiStatus === "processing" && (
                <span>{detectedLang === "hi" ? "⏳ Samajh raha hoon…" : "⏳ Processing your voice input…"}</span>
              )}
              {!listening && aiStatus === "done" && finalTranscript && (
                <>
                  <span>{detectedLang === "hi" ? "✅ Form fill ho gaya" : "✅ Form filled from voice"}</span>
                  <span className="text-xs font-normal opacity-80 italic">
                    {detectedLang === "hi" ? "Suna: " : "Heard: "}"{finalTranscript}"
                  </span>
                </>
              )}
              {!listening && aiStatus === "no-match" && (
                <>
                  <span>
                    {detectedLang === "hi"
                      ? "Samajh nahi aaya. Blood group aur city bolein."
                      : "Could not detect blood group or city."}
                  </span>
                  {finalTranscript && (
                    <span className="text-xs font-normal opacity-80">
                      {detectedLang === "hi"
                        ? `Suna: "${finalTranscript}" — jaise bolein: B positive Delhi mein`
                        : `Heard: "${finalTranscript}" — try saying e.g. "B positive in Delhi"`}
                    </span>
                  )}
                </>
              )}
              {!listening && aiStatus === "error" && (
                <span>
                  {detectedLang === "hi"
                    ? "Microphone mein problem hai. Dobara try karein."
                    : "Microphone error. Please check permissions and try again."}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold text-gray-900">{donors.length}</span>{" "}
            donors
          </p>
        </div>

        {/* Donor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor) => {
            const priorityInfo = getPriorityLabel(donor.priorityScore);
            return (
              <Card key={donor.id} hover>
                {/* Priority Indicator */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${priorityInfo.color}`}>
                      {priorityInfo.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {donor.priorityScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getPriorityBarColor(
                        donor.priorityScore
                      )}`}
                      style={{ width: `${donor.priorityScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Donor Info */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
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
                          donor.badgeLevel
                        )}`}
                      >
                        {donor.badgeLevel}
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <svg
                          className="w-4 h-4 text-gray-600"
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
                      </div>
                      <div className="text-xs font-semibold text-gray-900">
                        {donor.distance} km
                      </div>
                      <div className="text-xs text-gray-500">Distance</div>
                    </div>

                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <svg
                          className="w-4 h-4 text-gray-600"
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
                      </div>
                      <div className="text-xs font-semibold text-gray-900">
                        {donor.reliabilityScore}%
                      </div>
                      <div className="text-xs text-gray-500">Reliability</div>
                    </div>

                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <svg
                          className="w-4 h-4 text-gray-600"
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
                      <div className="text-xs font-semibold text-gray-900">
                        {donor.totalDonations}
                      </div>
                      <div className="text-xs text-gray-500">Donations</div>
                    </div>
                  </div>
                </div>

                {/* Request Button */}
                <Button
                  className="w-full"
                  size="md"
                  onClick={() =>
                    speak(
                      `${donor.name} is a ${donor.badgeLevel} donor with blood group ${donor.bloodGroup} located in ${donor.city}, ${donor.distance} kilometers away, with a reliability score of ${donor.reliabilityScore} percent and ${donor.totalDonations} total donations.`
                    )
                  }
                >
                  Request Donation
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {donors.length === 0 && (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No donors found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search filters to find more donors
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
