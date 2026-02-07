"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/context/PersonaContext";
import { usePreferences } from "@/context/PreferencesContext";
import { personasV2, getPersonaInfoV2, newToLegacyPersona } from "@/data/personas";
import {
  PersonaType,
  SkiFrequency,
  GroupType,
  DecisionTrigger,
  ExperienceLevel,
  OnboardingSignals,
  UserPersona,
} from "@/data/types";
import type { OnboardingRecommendationResponse } from "@onlysnow/types";
import { classifyPersona, getClassificationReason } from "@/lib/personaClassifier";

type Step =
  | "location"
  | "pass"
  | "radius"
  | "frequency"
  | "group"
  | "childAges"
  | "chase"
  | "triggers"
  | "experience"
  | "personaConfirm"
  | "confirm";

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

const frequencyOptions = [
  { value: "casual" as SkiFrequency, label: "0-5 days", description: "A few times a season" },
  { value: "regular" as SkiFrequency, label: "6-15 days", description: "Regular weekends" },
  { value: "core" as SkiFrequency, label: "16-30 days", description: "Every chance I get" },
  { value: "core" as SkiFrequency, label: "30+ days", description: "It's my lifestyle", days: 30 },
];

const groupOptions = [
  { value: "solo" as GroupType, label: "Solo", emoji: "🧍", description: "Just me" },
  { value: "partner" as GroupType, label: "Partner", emoji: "👫", description: "With my partner" },
  { value: "family" as GroupType, label: "Family with kids", emoji: "👨‍👩‍👧", description: "We bring the kids" },
  { value: "friends" as GroupType, label: "Friends", emoji: "👥", description: "With the crew" },
];

const triggerOptions = [
  { value: "snow" as DecisionTrigger, label: "Fresh snow", emoji: "❄️", description: "I go when it dumps" },
  { value: "time" as DecisionTrigger, label: "Weekend free", emoji: "📅", description: "When my schedule allows" },
  { value: "planned" as DecisionTrigger, label: "Trip planned", emoji: "🗓️", description: "I book in advance" },
  { value: "deal" as DecisionTrigger, label: "Good deal", emoji: "💰", description: "When I find a bargain" },
];

const experienceOptions = [
  { value: "beginner" as ExperienceLevel, label: "Beginner", description: "Learning the basics" },
  { value: "intermediate" as ExperienceLevel, label: "Intermediate", description: "Comfortable on blues" },
  { value: "advanced" as ExperienceLevel, label: "Advanced", description: "Black diamonds, no problem" },
  { value: "expert" as ExperienceLevel, label: "Expert", description: "Double blacks and backcountry" },
];

const chaseOptions = [
  { value: "anywhere", label: "Yes — anywhere", description: "I'll fly to chase a big storm" },
  { value: "driving", label: "Within driving", description: "Road trips for powder, not flights" },
  { value: "no", label: "No", description: "I stick to my local resorts" },
];

const childAgeOptions = [
  { value: 3, label: "Under 5", description: "Tiny tots" },
  { value: 7, label: "5-10", description: "Learning to ski" },
  { value: 13, label: "11-15", description: "Getting independent" },
  { value: 17, label: "16+", description: "Keeping up with adults" },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserPersona } = usePersona();
  const { updatePreferences } = usePreferences();
  const [step, setStep] = useState<Step>("location");

  // Basic onboarding state
  const [location, setLocation] = useState("");
  const [pass, setPass] = useState("");
  const [radius, setRadius] = useState(120);
  const [chase, setChase] = useState("");

  // New signal collection state
  const [frequency, setFrequency] = useState<SkiFrequency | "">("");
  const [group, setGroup] = useState<GroupType | "">("");
  const [childAges, setChildAges] = useState<number[]>([]);
  const [triggers, setTriggers] = useState<DecisionTrigger[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel | "">("");

  // Persona classification state
  const [detectedPersona, setDetectedPersona] = useState<UserPersona | null>(null);
  const [showPersonaOverride, setShowPersonaOverride] = useState(false);

  // Recommendation state
  const [recommendations, setRecommendations] = useState<OnboardingRecommendationResponse | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState(false);

  // Calculate step order and progress
  const stepOrder: Step[] = useMemo(() => {
    const order: Step[] = ["location", "pass", "radius", "frequency", "group"];
    if (group === "family") {
      order.push("childAges");
    }
    if (pass !== "none") {
      order.push("chase");
    }
    order.push("triggers", "experience", "personaConfirm", "confirm");
    return order;
  }, [pass, group]);

  const stepIndex = stepOrder.indexOf(step);
  const totalSteps = stepOrder.filter((s) => s !== "confirm").length;

  // Fetch recommendations when entering the confirm step
  const fetchRecommendations = useCallback(async () => {
    setLoadingRecs(true);
    setRecsError(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/onboarding/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          passType: pass,
          driveRadius: radius,
          persona: detectedPersona?.primary ?? "core-local",
          experience,
          frequency,
          groupType: group,
          triggers,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data: OnboardingRecommendationResponse = await res.json();
      setRecommendations(data);
    } catch {
      setRecsError(true);
    } finally {
      setLoadingRecs(false);
    }
  }, [location, pass, radius, detectedPersona, experience, frequency, group, triggers]);

  useEffect(() => {
    if (step === "confirm") {
      fetchRecommendations();
    }
  }, [step, fetchRecommendations]);

  function classifyAndContinue() {
    if (!frequency || !group || !experience || triggers.length === 0) return;

    const signals: OnboardingSignals = {
      frequency,
      groupType: group,
      decisionTriggers: triggers,
      experienceLevel: experience,
      childAges: group === "family" ? childAges : undefined,
    };

    const persona = classifyPersona(signals, pass);
    setDetectedPersona(persona);
    setStep("personaConfirm");
  }

  function selectPersonaOverride(personaType: PersonaType) {
    if (!detectedPersona) return;

    const updatedPersona: UserPersona = {
      ...detectedPersona,
      primary: personaType,
      confidence: 1.0, // User explicitly chose
    };
    setDetectedPersona(updatedPersona);
    setShowPersonaOverride(false);
  }

  function next() {
    const currentIndex = stepOrder.indexOf(step);
    const nextStep = stepOrder[currentIndex + 1];

    switch (step) {
      case "location":
      case "pass":
      case "radius":
      case "frequency":
      case "chase":
        setStep(nextStep);
        break;
      case "group":
        // If family, go to childAges, otherwise skip
        if (group === "family") {
          setStep("childAges");
        } else {
          // Skip to chase or triggers depending on pass
          setStep(pass !== "none" ? "chase" : "triggers");
        }
        break;
      case "childAges":
        setStep(pass !== "none" ? "chase" : "triggers");
        break;
      case "triggers":
        setStep("experience");
        break;
      case "experience":
        classifyAndContinue();
        break;
      case "personaConfirm":
        if (detectedPersona) {
          setUserPersona(detectedPersona);
        }
        setStep("confirm");
        break;
      case "confirm":
        // Persist all onboarding data before navigating
        updatePreferences({
          location,
          passType: pass,
          driveRadius: radius,
          chaseWillingness: chase || "no",
          persona: detectedPersona
            ? newToLegacyPersona(detectedPersona.primary)
            : "powder-hunter",
          userPersona: detectedPersona,
          onboardingComplete: true,
        });
        router.push("/dashboard");
        break;
    }
  }

  function back() {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      // Special handling for skipped steps
      if (step === "triggers" && group !== "family" && pass === "none") {
        setStep("group");
      } else if (step === "triggers" && group !== "family") {
        setStep("chase");
      } else if (step === "chase" && group !== "family") {
        setStep("group");
      } else {
        setStep(stepOrder[currentIndex - 1]);
      }
    }
    setShowPersonaOverride(false);
  }

  function toggleTrigger(trigger: DecisionTrigger) {
    setTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  }

  function toggleChildAge(age: number) {
    setChildAges((prev) =>
      prev.includes(age)
        ? prev.filter((a) => a !== age)
        : [...prev, age]
    );
  }

  const isNextDisabled = () => {
    switch (step) {
      case "location": return !location;
      case "pass": return !pass;
      case "frequency": return !frequency;
      case "group": return !group;
      case "childAges": return childAges.length === 0;
      case "chase": return !chase;
      case "triggers": return triggers.length === 0;
      case "experience": return !experience;
      case "personaConfirm": return !detectedPersona;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 dark:bg-slate-800">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Back button */}
      {step !== "location" && (
        <button
          onClick={back}
          className="self-start px-4 md:px-6 lg:px-8 py-3 text-sm lg:text-base text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
        >
          ← Back
        </button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-8 lg:px-10 py-8 max-w-lg lg:max-w-xl mx-auto w-full">
        {/* Step 1: Location */}
        {step === "location" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Where do you live?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                We&apos;ll find every resort you can reach.
              </p>
            </div>
            <input
              type="text"
              placeholder="City or ZIP code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 lg:py-3.5 text-lg lg:text-xl border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              {["Denver, CO", "Avon, CO", "Salt Lake City, UT", "Scranton, PA"].map((city) => (
                <button
                  key={city}
                  onClick={() => setLocation(city)}
                  className={`text-xs lg:text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    location === city
                      ? "bg-blue-50 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pass */}
        {step === "pass" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">What pass do you have?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
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
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg ${p.color} flex items-center justify-center`}>
                    <span className="text-white text-xs lg:text-sm font-bold">{p.label[0]}</span>
                  </div>
                  <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Drive Radius */}
        {step === "radius" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">How far will you drive?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
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
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{opt.label}</span>
                  <span className="text-xs lg:text-sm text-gray-500 dark:text-slate-400">
                    {opt.value === 60 && "Closest resorts only"}
                    {opt.value === 120 && "Most day-trippers"}
                    {opt.value === 180 && "Worth the drive for powder"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Frequency (NEW) */}
        {step === "frequency" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">How often do you ski?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                How many days did you ski last season?
              </p>
            </div>
            <div className="space-y-3">
              {frequencyOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setFrequency(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    frequency === opt.value && (opt.days !== 30 || frequencyOptions.findIndex((o) => o.value === frequency) === idx)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{opt.label}</div>
                  <div className="text-xs lg:text-sm text-gray-500 dark:text-slate-400 mt-0.5">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Group (NEW) */}
        {step === "group" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Who do you ski with?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                We&apos;ll tailor recommendations for your group.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {groupOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGroup(opt.value)}
                  className={`text-left px-4 py-4 rounded-xl border-2 transition-all ${
                    group === opt.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{opt.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5a: Child Ages (conditional, NEW) */}
        {step === "childAges" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">How old are your kids?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                Select all that apply — we&apos;ll recommend family-friendly options.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {childAgeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleChildAge(opt.value)}
                  className={`text-left px-4 py-4 rounded-xl border-2 transition-all ${
                    childAges.includes(opt.value)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{opt.label}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Chase Willingness */}
        {step === "chase" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Will you travel for a big storm?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
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
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{opt.label}</div>
                  <div className="text-xs lg:text-sm text-gray-500 dark:text-slate-400 mt-0.5">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Decision Triggers (NEW, multi-select) */}
        {step === "triggers" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">What makes you decide to ski?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                Select all that apply.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {triggerOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleTrigger(opt.value)}
                  className={`text-left px-4 py-4 rounded-xl border-2 transition-all ${
                    triggers.includes(opt.value)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{opt.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Experience Level (NEW) */}
        {step === "experience" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">How would you describe your skiing?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                We&apos;ll match you with appropriate terrain recommendations.
              </p>
            </div>
            <div className="space-y-3">
              {experienceOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setExperience(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    experience === opt.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{opt.label}</div>
                  <div className="text-xs lg:text-sm text-gray-500 dark:text-slate-400 mt-0.5">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 9: Persona Confirmation (NEW) */}
        {step === "personaConfirm" && detectedPersona && (
          <div className="space-y-6">
            {!showPersonaOverride ? (
              <>
                <div className="text-center">
                  <span className="text-5xl mb-4 block">{getPersonaInfoV2(detectedPersona.primary).emoji}</span>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Sounds like you&apos;re a {getPersonaInfoV2(detectedPersona.primary).label}
                  </h1>
                  <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-2">
                    Based on {getClassificationReason(detectedPersona)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 lg:p-5">
                  <p className="text-sm text-gray-700 dark:text-slate-300 mb-3">
                    {getPersonaInfoV2(detectedPersona.primary).description}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    <strong>We&apos;ll focus on:</strong> {getPersonaInfoV2(detectedPersona.primary).focus}
                  </div>
                </div>

                {detectedPersona.secondary && (
                  <div className="text-center text-xs text-gray-400 dark:text-slate-500">
                    You also have traits of a {getPersonaInfoV2(detectedPersona.secondary).label}
                  </div>
                )}

                <button
                  onClick={() => setShowPersonaOverride(true)}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Not quite right? Pick a different type
                </button>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Pick your type</h1>
                  <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                    Choose the one that fits you best.
                  </p>
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {personasV2.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectPersonaOverride(p.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        detectedPersona.primary === p.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{p.label}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">{p.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowPersonaOverride(false)}
                  className="w-full text-center text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                >
                  ← Back to recommendation
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 10: Confirmation */}
        {step === "confirm" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Here&apos;s what we found</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                {loadingRecs
                  ? "Finding your resorts..."
                  : recommendations
                    ? recommendations.summary
                    : recsError
                      ? `Resorts within ${radiusOptions.find((r) => r.value === radius)?.label || "2 hours"} of ${location}.`
                      : "Finding your resorts..."}
              </p>
            </div>

            {loadingRecs && (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 dark:text-slate-400">Analyzing resorts for you...</p>
              </div>
            )}

            {!loadingRecs && recommendations && (
              <div className="space-y-2">
                {recommendations.recommendations.map((r) => (
                  <div
                    key={r.slug}
                    className="px-4 lg:px-5 py-3 lg:py-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{r.name}</span>
                      <span className="text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium">
                        {r.passType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{r.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {!loadingRecs && recsError && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
                  We couldn&apos;t load personalized recommendations right now.
                </p>
                <button
                  onClick={fetchRecommendations}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {detectedPersona && (
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <span className="text-2xl">{getPersonaInfoV2(detectedPersona.primary).emoji}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getPersonaInfoV2(detectedPersona.primary).label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {getPersonaInfoV2(detectedPersona.primary).focus}
                  </div>
                </div>
              </div>
            )}

            {!loadingRecs && recommendations && recommendations.totalMatching > recommendations.recommendations.length && (
              <p className="text-xs lg:text-sm text-gray-400 dark:text-slate-500 text-center">
                We&apos;re also monitoring {recommendations.totalMatching - recommendations.recommendations.length} other
                nearby resorts and will let you know when they&apos;re worth a look.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA - sticky to stay visible */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-6 md:px-8 lg:px-10 py-4 mt-auto">
        <div className="max-w-lg lg:max-w-xl mx-auto w-full">
          {step === "personaConfirm" && !showPersonaOverride ? (
            <button
              onClick={next}
              className="w-full py-3.5 bg-blue-600 text-white text-sm lg:text-base font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              That&apos;s me!
            </button>
          ) : !showPersonaOverride && (
            <button
              onClick={next}
              disabled={isNextDisabled()}
              className="w-full py-3.5 bg-blue-600 text-white text-sm lg:text-base font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {step === "confirm" ? "Show me where to ski" : "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
