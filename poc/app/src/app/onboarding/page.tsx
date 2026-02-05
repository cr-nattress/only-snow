"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/context/PersonaContext";
import { personas } from "@/data/personas";
import { Persona } from "@/data/types";

type Step = "location" | "pass" | "radius" | "chase" | "persona" | "confirm";

const passes = [
  { id: "epic", label: "Epic", color: "bg-indigo-600" },
  { id: "ikon", label: "Ikon", color: "bg-orange-500" },
  { id: "indy", label: "Indy", color: "bg-emerald-600" },
  { id: "multi", label: "Multiple", color: "bg-gray-700" },
  { id: "none", label: "No Pass", color: "bg-gray-400" },
];

const radiusOptions = [
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
];

const chaseOptions = [
  { value: "anywhere", label: "Yes — anywhere", description: "I'll fly to chase a big storm" },
  { value: "driving", label: "Within driving", description: "Road trips for powder, not flights" },
  { value: "no", label: "No", description: "I stick to my local resorts" },
];

const mockDetectedResorts = [
  { name: "Vail", pass: "Epic", drive: "1h 40m" },
  { name: "Breckenridge", pass: "Epic", drive: "1h 30m" },
  { name: "Keystone", pass: "Epic", drive: "1h 30m" },
  { name: "Beaver Creek", pass: "Epic", drive: "1h 50m" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setPersona: setGlobalPersona } = usePersona();
  const [step, setStep] = useState<Step>("location");
  const [location, setLocation] = useState("");
  const [pass, setPass] = useState("");
  const [radius, setRadius] = useState(120);
  const [chase, setChase] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<Persona | "">("");

  const stepIndex = ["location", "pass", "radius", "chase", "persona", "confirm"].indexOf(step);
  const totalSteps = 5;

  function next() {
    switch (step) {
      case "location":
        setStep("pass");
        break;
      case "pass":
        setStep("radius");
        break;
      case "radius":
        setStep(pass !== "none" ? "chase" : "persona");
        break;
      case "chase":
        setStep("persona");
        break;
      case "persona":
        if (selectedPersona) {
          setGlobalPersona(selectedPersona);
        }
        setStep("confirm");
        break;
      case "confirm":
        router.push("/dashboard");
        break;
    }
  }

  function back() {
    switch (step) {
      case "pass":
        setStep("location");
        break;
      case "radius":
        setStep("pass");
        break;
      case "chase":
        setStep("radius");
        break;
      case "persona":
        setStep(pass !== "none" ? "chase" : "radius");
        break;
      case "confirm":
        setStep("persona");
        break;
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Back button */}
      {step !== "location" && (
        <button
          onClick={back}
          className="self-start px-4 md:px-6 lg:px-8 py-3 text-sm lg:text-base text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      )}

      {/* Content — centered with max-width for larger screens */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-8 lg:px-10 py-8 max-w-lg lg:max-w-xl mx-auto w-full">
        {/* Step 1: Location */}
        {step === "location" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Where do you live?</h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                We&apos;ll find every resort you can reach.
              </p>
            </div>
            <input
              type="text"
              placeholder="City or ZIP code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 lg:py-3.5 text-lg lg:text-xl border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              {["Denver, CO", "Avon, CO", "Salt Lake City, UT", "Scranton, PA"].map(
                (city) => (
                  <button
                    key={city}
                    onClick={() => setLocation(city)}
                    className={`text-xs lg:text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      location === city
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {city}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Step 2: Pass */}
        {step === "pass" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">What pass do you have?</h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                We&apos;ll filter to resorts on your pass first.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {passes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPass(p.id)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all ${
                    pass === p.id
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg ${p.color} flex items-center justify-center`}>
                    <span className="text-white text-xs lg:text-sm font-bold">
                      {p.label[0]}
                    </span>
                  </div>
                  <span className="text-sm lg:text-base font-medium text-gray-900">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Drive Radius */}
        {step === "radius" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                How far will you drive?
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                On a normal ski day, what&apos;s your max drive?
              </p>
            </div>
            <div className="space-y-3">
              {radiusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRadius(opt.value)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                    radius === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm lg:text-base font-medium text-gray-900">{opt.label}</span>
                  <span className="text-xs lg:text-sm text-gray-500">
                    {opt.value === 60 && "Closest resorts only"}
                    {opt.value === 120 && "Most day-trippers"}
                    {opt.value === 180 && "Worth the drive for powder"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Chase Willingness */}
        {step === "chase" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Will you travel for a big storm?
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                We&apos;ll watch for chase-worthy storms and help you get there.
              </p>
            </div>
            <div className="space-y-3">
              {chaseOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setChase(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    chase === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm lg:text-base font-medium text-gray-900">{opt.label}</div>
                  <div className="text-xs lg:text-sm text-gray-500 mt-0.5">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Persona */}
        {step === "persona" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                What kind of skier are you?
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                We&apos;ll personalize your experience based on what matters to you.
              </p>
            </div>
            <div className="space-y-3">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    selectedPersona === p.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {p.id === "powder-hunter" && "❄️"}
                      {p.id === "family-planner" && "👨‍👩‍👧"}
                      {p.id === "weekend-warrior" && "⏰"}
                      {p.id === "destination-traveler" && "✈️"}
                      {p.id === "beginner" && "⭐"}
                    </span>
                    <div>
                      <div className="text-sm lg:text-base font-medium text-gray-900">{p.label}</div>
                      <div className="text-xs lg:text-sm text-gray-500 mt-0.5">{p.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Confirmation */}
        {step === "confirm" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Here&apos;s what we found</h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                {mockDetectedResorts.length} resorts on your pass within{" "}
                {radiusOptions.find((r) => r.value === radius)?.label || "2 hours"}.
              </p>
            </div>

            <div className="space-y-2">
              {mockDetectedResorts.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between px-4 lg:px-5 py-3 lg:py-3.5 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm lg:text-base font-medium text-gray-900">{r.name}</span>
                    <span className="text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                      {r.pass}
                    </span>
                  </div>
                  <span className="text-xs lg:text-sm text-gray-500">{r.drive}</span>
                </div>
              ))}
            </div>

            <p className="text-xs lg:text-sm text-gray-400 text-center">
              We&apos;re also monitoring 5 other nearby resorts and will let you know
              when they&apos;re worth a look.
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA — centered with matching max-width */}
      <div className="px-6 md:px-8 lg:px-10 pb-8 max-w-lg lg:max-w-xl mx-auto w-full">
        <button
          onClick={next}
          disabled={
            (step === "location" && !location) ||
            (step === "pass" && !pass) ||
            (step === "chase" && !chase) ||
            (step === "persona" && !selectedPersona)
          }
          className="w-full py-3.5 bg-blue-600 text-white text-sm lg:text-base font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {step === "confirm" ? "Show me where to ski" : "Continue"}
        </button>
      </div>
    </div>
  );
}
