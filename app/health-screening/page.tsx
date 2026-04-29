"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useAuth } from "@/lib/AuthContext";
import { healthScreeningAPI } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormState {
  age: string;
  weight: string;
  hasDiabetes: boolean;
  hasHeartDisease: boolean;
  hasHIV: boolean;
  hasHepatitis: boolean;
  recentSurgery: boolean;
  recentTattoo: boolean;
  currentMedications: boolean;
  isPregnant: boolean;
  alcoholLast24h: boolean;
}

interface Result {
  eligible: boolean;
  reasons: string[];
  message: string;
}

// ── Yes/No toggle component ───────────────────────────────────────────────────
function YesNo({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: keyof FormState;
  value: boolean;
  onChange: (name: keyof FormState, val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700 flex-1 pr-4">{label}</span>
      <div className="flex gap-2 shrink-0">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(name, opt)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              value === opt
                ? opt
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            {opt ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HealthScreening() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [form, setForm] = useState<FormState>({
    age: "",
    weight: "",
    hasDiabetes: false,
    hasHeartDisease: false,
    hasHIV: false,
    hasHepatitis: false,
    recentSurgery: false,
    recentTattoo: false,
    currentMedications: false,
    isPregnant: false,
    alcoholLast24h: false,
  });

  const [errors, setErrors]   = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<Result | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError]       = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  const handleToggle = (name: keyof FormState, val: boolean) => {
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    const age    = Number(form.age);
    const weight = Number(form.weight);
    if (!form.age || isNaN(age) || age < 1)       e.age    = "Please enter a valid age.";
    if (!form.weight || isNaN(weight) || weight < 1) e.weight = "Please enter a valid weight (kg).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setLoading(true);
    try {
      const data = await healthScreeningAPI.submit({
        age:               Number(form.age),
        weight:            Number(form.weight),
        hasDiabetes:       form.hasDiabetes,
        hasHeartDisease:   form.hasHeartDisease,
        hasHIV:            form.hasHIV,
        hasHepatitis:      form.hasHepatitis,
        recentSurgery:     form.recentSurgery,
        recentTattoo:      form.recentTattoo,
        currentMedications: form.currentMedications,
        isPregnant:        form.isPregnant,
        alcoholLast24h:    form.alcoholLast24h,
      });
      setResult(data);
    } catch (err: any) {
      setResult({
        eligible: false,
        reasons: [err?.response?.data?.message || "Submission failed. Please try again."],
        message: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <Card>
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                result.eligible ? "bg-green-100" : "bg-red-100"
              }`}>
                {result.eligible ? (
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${result.eligible ? "text-green-700" : "text-red-700"}`}>
                {result.eligible ? "You're Eligible!" : "Not Eligible Right Now"}
              </h2>
              <p className="text-gray-600 text-sm">{result.message}</p>
            </div>

            {/* Ineligibility reasons */}
            {!result.eligible && result.reasons.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-800 mb-2">Reasons:</p>
                <ul className="space-y-1">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
              {!result.eligible && (
                <button
                  onClick={() => setResult(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline text-center"
                >
                  Re-submit form
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Donor Health Screening</h1>
          <p className="text-gray-500 text-sm">
            This quick form helps us ensure your safety and the safety of recipients.
            All information is confidential.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <h2 className="text-base font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  placeholder="e.g. 25"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.age ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.weight}
                  onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                  placeholder="e.g. 65"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.weight ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.weight && <p className="text-xs text-red-600 mt-1">{errors.weight}</p>}
              </div>
            </div>
          </Card>

          {/* Medical History */}
          <Card>
            <h2 className="text-base font-semibold text-gray-800 mb-1">Medical History</h2>
            <p className="text-xs text-gray-500 mb-4">Do you have or have you had any of the following?</p>
            <YesNo label="Diabetes"          name="hasDiabetes"     value={form.hasDiabetes}     onChange={handleToggle} />
            <YesNo label="Heart disease"     name="hasHeartDisease" value={form.hasHeartDisease} onChange={handleToggle} />
            <YesNo label="HIV / AIDS"        name="hasHIV"          value={form.hasHIV}          onChange={handleToggle} />
            <YesNo label="Hepatitis B or C"  name="hasHepatitis"    value={form.hasHepatitis}    onChange={handleToggle} />
          </Card>

          {/* Recent Activity */}
          <Card>
            <h2 className="text-base font-semibold text-gray-800 mb-1">Recent Activity</h2>
            <p className="text-xs text-gray-500 mb-4">In the last 6 months / 24 hours:</p>
            <YesNo label="Surgery in the last 6 months"              name="recentSurgery"       value={form.recentSurgery}       onChange={handleToggle} />
            <YesNo label="Tattoo or piercing in the last 6 months"   name="recentTattoo"        value={form.recentTattoo}        onChange={handleToggle} />
            <YesNo label="Currently on blood-thinners or antibiotics" name="currentMedications" value={form.currentMedications}  onChange={handleToggle} />
            <YesNo label="Currently pregnant"                         name="isPregnant"          value={form.isPregnant}          onChange={handleToggle} />
            <YesNo label="Consumed alcohol in the last 24 hours"      name="alcoholLast24h"      value={form.alcoholLast24h}      onChange={handleToggle} />
          </Card>

          {/* ── Legal Warning ─────────────────────────────────────────── */}
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-red-800 mb-1">
                  ⚠️ Legal Warning — Read Before Submitting
                </p>
                <p className="text-xs text-red-700 leading-relaxed">
                  Providing <span className="font-semibold">false or misleading information</span> on
                  this health screening form is a serious offence. Knowingly donating blood while
                  concealing a medical condition that could harm the recipient may result in:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-red-700">
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold shrink-0">•</span>
                    Criminal liability under applicable health and public safety laws
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold shrink-0">•</span>
                    Permanent ban from the RedConnect donor platform
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold shrink-0">•</span>
                    Reporting to relevant health authorities and law enforcement
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold shrink-0">•</span>
                    Civil action for damages caused to the recipient
                  </li>
                </ul>
                <p className="text-xs text-red-700 mt-2 font-medium">
                  All submissions are logged with your account, IP address, and timestamp.
                </p>
              </div>
            </div>
          </div>

          {/* ── Terms & Conditions Checkbox ───────────────────────────── */}
          <Card>
            <label className={`flex items-start gap-3 cursor-pointer select-none ${termsError ? "opacity-100" : ""}`}>
              <div className="relative shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                />
                {/* Custom checkbox */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  termsAccepted
                    ? "bg-red-600 border-red-600"
                    : termsError
                    ? "border-red-500 bg-red-50"
                    : "border-gray-400 bg-white"
                }`}>
                  {termsAccepted && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700 leading-relaxed">
                I confirm that all information provided above is{" "}
                <span className="font-semibold text-gray-900">true, accurate, and complete</span> to
                the best of my knowledge. I understand that submitting false information may lead to
                legal action, including reporting to{" "}
                <span className="font-semibold text-red-700">police and health authorities</span>, and
                I accept full responsibility for any harm caused by inaccurate disclosure.
              </span>
            </label>
            {termsError && (
              <p className="mt-3 text-xs text-red-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                You must accept the terms and conditions before submitting.
              </p>
            )}
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Checking eligibility…" : "Submit Health Form"}
          </Button>
        </form>
      </div>
    </div>
  );
}
