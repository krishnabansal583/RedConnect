"use client";

import Card from "@/components/Card";
import Badge from "@/components/Badge";

interface Donor {
  rank: number;
  name: string;
  location: string;
  totalDonations: number;
  badgeLevel: "Bronze" | "Silver" | "Gold";
}

const mockDonors: Donor[] = [
  {
    rank: 1,
    name: "Amit Kumar",
    location: "IIT Mumbai",
    totalDonations: 15,
    badgeLevel: "Gold",
  },
  {
    rank: 2,
    name: "Priya Sharma",
    location: "Delhi University",
    totalDonations: 13,
    badgeLevel: "Gold",
  },
  {
    rank: 3,
    name: "Rahul Verma",
    location: "Mumbai",
    totalDonations: 12,
    badgeLevel: "Gold",
  },
  {
    rank: 4,
    name: "Sneha Patel",
    location: "BITS Pilani",
    totalDonations: 10,
    badgeLevel: "Gold",
  },
  {
    rank: 5,
    name: "Vikram Singh",
    location: "Pune",
    totalDonations: 9,
    badgeLevel: "Gold",
  },
  {
    rank: 6,
    name: "Anjali Reddy",
    location: "NIT Trichy",
    totalDonations: 7,
    badgeLevel: "Silver",
  },
  {
    rank: 7,
    name: "Karan Mehta",
    location: "Bangalore",
    totalDonations: 6,
    badgeLevel: "Silver",
  },
  {
    rank: 8,
    name: "Pooja Gupta",
    location: "Anna University",
    totalDonations: 5,
    badgeLevel: "Silver",
  },
  {
    rank: 9,
    name: "Arjun Nair",
    location: "Hyderabad",
    totalDonations: 4,
    badgeLevel: "Silver",
  },
  {
    rank: 10,
    name: "Divya Iyer",
    location: "VIT Vellore",
    totalDonations: 3,
    badgeLevel: "Bronze",
  },
];

export default function Leaderboard() {
  const getBadgeColor = (level: string) => {
    switch (level) {
      case "Gold":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Silver":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "Bronze":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getTopRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-400";
      case 3:
        return "bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-400";
      default:
        return "bg-white";
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex items-center justify-center w-12 h-12 bg-yellow-400 text-white rounded-full font-bold text-lg shadow-lg">
          🏆
        </div>
      );
    if (rank === 2)
      return (
        <div className="flex items-center justify-center w-12 h-12 bg-gray-400 text-white rounded-full font-bold text-lg shadow-lg">
          🥈
        </div>
      );
    if (rank === 3)
      return (
        <div className="flex items-center justify-center w-12 h-12 bg-orange-400 text-white rounded-full font-bold text-lg shadow-lg">
          🥉
        </div>
      );
    return (
      <div className="flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-700 rounded-full font-bold text-lg">
        {rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Donor Leaderboard
          </h1>
          <p className="text-lg text-gray-600">
            Celebrating our top life-savers
          </p>
        </div>

        {/* Badge Legend */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Badge Levels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 border border-orange-300">
                Bronze
              </span>
              <span className="text-sm text-gray-700">1-3 donations</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                Silver
              </span>
              <span className="text-sm text-gray-700">4-7 donations</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                Gold
              </span>
              <span className="text-sm text-gray-700">8+ donations</span>
            </div>
          </div>
        </Card>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Rank
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Donor Name
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      College / City
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                      Total Donations
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                      Badge Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockDonors.map((donor) => (
                    <tr
                      key={donor.rank}
                      className={`border-b border-gray-100 transition-all ${getTopRankStyle(
                        donor.rank
                      )}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          {getRankBadge(donor.rank)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">
                          {donor.name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600">{donor.location}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                          {donor.totalDonations}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeColor(
                            donor.badgeLevel
                          )}`}
                        >
                          {donor.badgeLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {mockDonors.map((donor) => (
            <Card
              key={donor.rank}
              className={`${getTopRankStyle(donor.rank)}`}
              hover
            >
              <div className="flex items-center gap-4">
                <div>{getRankBadge(donor.rank)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{donor.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(
                        donor.badgeLevel
                      )}`}
                    >
                      {donor.badgeLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{donor.location}</p>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-600"
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
                    <span className="text-sm font-semibold text-gray-900">
                      {donor.totalDonations} donations
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
