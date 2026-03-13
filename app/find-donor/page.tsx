"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";

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
    console.log("Searching for:", bloodGroup, city);
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
                <Button className="w-full" size="md">
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
