"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { leaderboardAPI } from "@/lib/api";

interface LeaderboardEntry {
  rank: number;
  _id: string;
  name: string;
  bloodGroup: string;
  city: string;
  donationCount: number;
  reliabilityScore: number;
  badgeLevel: "Bronze" | "Silver" | "Gold";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBadgeLevel(count: number): "Bronze" | "Silver" | "Gold" {
  if (count >= 8) return "Gold";
  if (count >= 4) return "Silver";
  return "Bronze";
}

function getBadgeStyle(level: string) {
  switch (level) {
    case "Gold":   return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "Silver": return "bg-gray-100   text-gray-700   border-gray-300";
    default:       return "bg-orange-100 text-orange-700 border-orange-300";
  }
}

function getRowStyle(rank: number) {
  switch (rank) {
    case 1: return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400";
    case 2: return "bg-gradient-to-r from-gray-50   to-gray-100   border-2 border-gray-400";
    case 3: return "bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-400";
    default: return "bg-white";
  }
}

function RankIcon({ rank }: { rank: number }) {
  const base = "flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg shadow";
  if (rank === 1) return <div className={`${base} bg-yellow-400 text-white`}>🏆</div>;
  if (rank === 2) return <div className={`${base} bg-gray-400   text-white`}>🥈</div>;
  if (rank === 3) return <div className={`${base} bg-orange-400 text-white`}>🥉</div>;
  return <div className={`${base} bg-gray-200 text-gray-700 shadow-none`}>{rank}</div>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Leaderboard() {
  const [donors, setDonors]   = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    leaderboardAPI
      .getLeaderboard(50)
      .then((data: LeaderboardEntry[]) => {
        // Ensure badge level is always derived from donationCount
        // (backend virtual may not serialise — compute client-side as fallback)
        const normalised = data.map((d, i) => ({
          ...d,
          rank: i + 1,
          badgeLevel: d.badgeLevel ?? getBadgeLevel(d.donationCount),
        }));
        setDonors(normalised);
      })
      .catch(() => setError("Failed to load leaderboard. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  // ── Split into badge groups ───────────────────────────────────────────────
  const gold   = donors.filter((d) => getBadgeLevel(d.donationCount) === "Gold");
  const silver = donors.filter((d) => getBadgeLevel(d.donationCount) === "Silver");
  const bronze = donors.filter((d) => getBadgeLevel(d.donationCount) === "Bronze");

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading leaderboard…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="text-center py-10 max-w-sm w-full">
          <p className="text-red-600 font-semibold mb-2">Something went wrong</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Donor Leaderboard
          </h1>
          <p className="text-gray-500">
            {donors.length} donors ranked by total donations
          </p>
        </div>

        {/* Badge legend */}
        <Card className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Badge Levels</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Bronze", desc: "1–3 donations", style: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700 border-orange-300" },
              { label: "Silver", desc: "4–7 donations", style: "bg-gray-50   border-gray-200",   badge: "bg-gray-100   text-gray-700   border-gray-300"   },
              { label: "Gold",   desc: "8+ donations",  style: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700 border-yellow-300" },
            ].map(({ label, desc, style, badge }) => (
              <div key={label} className={`flex items-center gap-2 p-3 rounded-lg border ${style}`}>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badge}`}>{label}</span>
                <span className="text-xs text-gray-600">{desc}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Empty state */}
        {donors.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-500">No donors found yet. Be the first to donate!</p>
          </Card>
        )}

        {/* ── Gold section ─────────────────────────────────────────────── */}
        {gold.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🥇</span>
              <h2 className="text-lg font-bold text-yellow-700">Gold Donors</h2>
              <span className="ml-auto text-xs text-gray-400">{gold.length} donors · 8+ donations</span>
            </div>
            <LeaderboardTable donors={gold} />
            <MobileCards donors={gold} />
          </section>
        )}

        {/* ── Silver section ───────────────────────────────────────────── */}
        {silver.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🥈</span>
              <h2 className="text-lg font-bold text-gray-600">Silver Donors</h2>
              <span className="ml-auto text-xs text-gray-400">{silver.length} donors · 4–7 donations</span>
            </div>
            <LeaderboardTable donors={silver} />
            <MobileCards donors={silver} />
          </section>
        )}

        {/* ── Bronze section ───────────────────────────────────────────── */}
        {bronze.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🥉</span>
              <h2 className="text-lg font-bold text-orange-600">Bronze Donors</h2>
              <span className="ml-auto text-xs text-gray-400">{bronze.length} donors · 1–3 donations</span>
            </div>
            <LeaderboardTable donors={bronze} />
            <MobileCards donors={bronze} />
          </section>
        )}

      </div>
    </div>
  );
}

// ── Desktop table ─────────────────────────────────────────────────────────────
function LeaderboardTable({ donors }: { donors: LeaderboardEntry[] }) {
  return (
    <div className="hidden md:block">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 text-sm text-gray-600">
                <th className="text-left py-3 px-5">Rank</th>
                <th className="text-left py-3 px-5">Donor</th>
                <th className="text-left py-3 px-5">City</th>
                <th className="text-left py-3 px-5">Blood Group</th>
                <th className="text-center py-3 px-5">Donations</th>
                <th className="text-center py-3 px-5">Reliability</th>
                <th className="text-center py-3 px-5">Badge</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => {
                const badge = getBadgeLevel(donor.donationCount);
                return (
                  <tr
                    key={donor._id}
                    className={`border-b border-gray-100 transition-colors ${getRowStyle(donor.rank)}`}
                  >
                    <td className="py-3 px-5">
                      <RankIcon rank={donor.rank} />
                    </td>
                    <td className="py-3 px-5 font-semibold text-gray-900">{donor.name}</td>
                    <td className="py-3 px-5 text-gray-500 text-sm">{donor.city}</td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded-full text-sm font-bold bg-red-100 text-red-700">
                        {donor.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-sm">
                        {donor.donationCount}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center text-sm text-gray-600">
                      {donor.reliabilityScore}%
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(badge)}`}>
                        {badge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Mobile cards ──────────────────────────────────────────────────────────────
function MobileCards({ donors }: { donors: LeaderboardEntry[] }) {
  return (
    <div className="md:hidden space-y-3">
      {donors.map((donor) => {
        const badge = getBadgeLevel(donor.donationCount);
        return (
          <Card key={donor._id} className={getRowStyle(donor.rank)} hover>
            <div className="flex items-center gap-4">
              <RankIcon rank={donor.rank} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-gray-900 truncate">{donor.name}</span>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(badge)}`}>
                    {badge}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{donor.city}</span>
                  <span className="font-bold text-red-600">{donor.bloodGroup}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <span className="flex items-center gap-1 text-red-700 font-semibold">
                    ❤️ {donor.donationCount} donations
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">{donor.reliabilityScore}% reliability</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
