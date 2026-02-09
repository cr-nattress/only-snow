"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
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
import { classifyPersona, getClassificationReason } from "@/lib/personaClassifier";
import { log } from "@/lib/log";

type Step =
  | "location"
  | "pass"
  | "homeMountain"
  | "radius"
  | "frequency"
  | "group"
  | "childAges"
  | "chase"
  | "triggers"
  | "experience"
  | "personaConfirm"
  | "signin";

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

import { resorts } from "@/data/resorts";
import { geocodeLocation } from "@/lib/geocode";

const ONBOARDING_STATE_KEY = "onlysnow_onboarding_state";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { setUserPersona } = usePersona();
  const { updatePreferences } = usePreferences();
  const [step, setStep] = useState<Step>("location");

  // Basic onboarding state
  const [location, setLocation] = useState("");
  const [pass, setPass] = useState("");
  const [hasHomeMountain, setHasHomeMountain] = useState<boolean | null>(null);
  const [homeMountain, setHomeMountain] = useState("");
  const [homeMountainSearch, setHomeMountainSearch] = useState("");
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

  // Geocoded coordinates (resolved when leaving location step)
  const [geocodedLat, setGeocodedLat] = useState<number | undefined>();
  const [geocodedLng, setGeocodedLng] = useState<number | undefined>();

  // Calculate step order and progress
  const stepOrder: Step[] = useMemo(() => {
    const order: Step[] = ["location", "pass", "homeMountain", "radius", "frequency", "group"];
    if (group === "family") {
      order.push("childAges");
    }
    if (pass !== "none") {
      order.push("chase");
    }
    order.push("triggers", "experience", "personaConfirm", "signin");
    return order;
  }, [pass, group]);

  const stepIndex = stepOrder.indexOf(step);
  // Exclude "signin" from progress — it's a gate, not a step
  const totalSteps = stepOrder.length - 1;

  // Geocode when location is entered (fire-and-forget, non-blocking)
  useEffect(() => {
    if (!location) return;
    geocodeLocation(location).then((coords) => {
      if (coords) {
        setGeocodedLat(coords.lat);
        setGeocodedLng(coords.lng);
      }
    });
  }, [location]);

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
    log("onboarding.persona_override", { persona: personaType });

    const updatedPersona: UserPersona = {
      ...detectedPersona,
      primary: personaType,
      confidence: 1.0, // User explicitly chose
    };
    setDetectedPersona(updatedPersona);
    setShowPersonaOverride(false);
  }

  function next() {
    log("onboarding.step_next", { step });
    const currentIndex = stepOrder.indexOf(step);
    const nextStep = stepOrder[currentIndex + 1];

    switch (step) {
      case "location":
      case "pass":
      case "homeMountain":
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
        setStep("signin");
        break;
      case "signin":
        // Persist all onboarding data and go to dashboard
        updatePreferences({
          location,
          lat: geocodedLat,
          lng: geocodedLng,
          passType: pass,
          homeMountain: homeMountain || undefined,
          driveRadius: radius,
          chaseWillingness: chase || "no",
          persona: detectedPersona
            ? newToLegacyPersona(detectedPersona.primary)
            : "powder-hunter",
          userPersona: detectedPersona,
          onboardingComplete: true,
        });
        // Clean up saved onboarding state
        try { localStorage.removeItem(ONBOARDING_STATE_KEY); } catch {}
        router.push("/dashboard");
        break;
    }
  }

  function back() {
    log("onboarding.step_back", { step });
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

  // Save onboarding state to localStorage before OAuth redirect
  const saveOnboardingState = useCallback(() => {
    try {
      const state = {
        location, pass, hasHomeMountain, homeMountain, homeMountainSearch,
        radius, chase, frequency, group, childAges, triggers, experience,
        detectedPersona, geocodedLat, geocodedLng,
      };
      localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
    } catch {}
  }, [location, pass, hasHomeMountain, homeMountain, homeMountainSearch,
      radius, chase, frequency, group, childAges, triggers, experience,
      detectedPersona, geocodedLat, geocodedLng]);

  // Restore onboarding state when returning from OAuth redirect
  useEffect(() => {
    if (searchParams.get("step") === "signin" && status === "authenticated") {
      try {
        const saved = localStorage.getItem(ONBOARDING_STATE_KEY);
        if (saved) {
          const s = JSON.parse(saved);
          if (s.location) setLocation(s.location);
          if (s.pass) setPass(s.pass);
          if (s.hasHomeMountain !== null) setHasHomeMountain(s.hasHomeMountain);
          if (s.homeMountain) setHomeMountain(s.homeMountain);
          if (s.homeMountainSearch) setHomeMountainSearch(s.homeMountainSearch);
          if (s.radius) setRadius(s.radius);
          if (s.chase) setChase(s.chase);
          if (s.frequency) setFrequency(s.frequency);
          if (s.group) setGroup(s.group);
          if (s.childAges) setChildAges(s.childAges);
          if (s.triggers) setTriggers(s.triggers);
          if (s.experience) setExperience(s.experience);
          if (s.detectedPersona) {
            setDetectedPersona(s.detectedPersona);
            setUserPersona(s.detectedPersona);
          }
          if (s.geocodedLat !== undefined) setGeocodedLat(s.geocodedLat);
          if (s.geocodedLng !== undefined) setGeocodedLng(s.geocodedLng);
          setStep("signin");
        }
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Auto-skip signin step if already authenticated
  useEffect(() => {
    if (step === "signin" && status === "authenticated") {
      next();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, status]);

  function handleGoogleSignIn() {
    log("onboarding.google_signin");
    saveOnboardingState();
    signIn("google", { callbackUrl: "/onboarding?step=signin" });
  }

  // Filtered resorts for home mountain search
  const filteredResorts = useMemo(() => {
    if (!homeMountainSearch) return [];
    const search = homeMountainSearch.toLowerCase();
    return Object.values(resorts)
      .filter((r) => r.name.toLowerCase().includes(search))
      .slice(0, 6);
  }, [homeMountainSearch]);

  const isNextDisabled = () => {
    switch (step) {
      case "location": return !location;
      case "pass": return !pass;
      case "homeMountain": return hasHomeMountain === null || (hasHomeMountain && !homeMountain);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 dark:bg-slate-800">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(((stepIndex + 1) / totalSteps) * 100, 100)}%` }}
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
      <div className="flex-1 min-h-0 overflow-y-auto px-6 md:px-8 lg:px-10 max-w-lg lg:max-w-xl mx-auto w-full">
        <div className="min-h-full flex flex-col justify-center py-4">
        {/* Step 1: Location */}
        {step === "location" && (
          <div className="space-y-4">
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
                  onClick={() => { log("onboarding.location_select", { location: city }); setLocation(city); }}
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
          <div className="space-y-4">
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
                  onClick={() => { log("onboarding.pass_select", { passType: p.id }); setPass(p.id); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    pass === p.id
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
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

        {/* Step 2b: Home Mountain */}
        {step === "homeMountain" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Do you have a home mountain?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                The resort you ski most often.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { log("onboarding.home_mountain", { has: "yes" }); setHasHomeMountain(true); }}
                className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  hasHomeMountain === true
                    ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Yes</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">I have a go-to resort</div>
              </button>
              <button
                onClick={() => { log("onboarding.home_mountain", { has: "no" }); setHasHomeMountain(false); setHomeMountain(""); setHomeMountainSearch(""); }}
                className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  hasHomeMountain === false
                    ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">No</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">I go wherever the snow is</div>
              </button>
            </div>

            {hasHomeMountain && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search for a resort..."
                  value={homeMountainSearch}
                  onChange={(e) => setHomeMountainSearch(e.target.value)}
                  className="w-full px-4 py-3 text-sm lg:text-base border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  autoFocus
                />
                {filteredResorts.length > 0 && (
                  <div className="space-y-1">
                    {filteredResorts.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { log("onboarding.home_mountain_select", { resort: r.name }); setHomeMountain(r.name); setHomeMountainSearch(r.name); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all ${
                          homeMountain === r.name
                            ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{r.region} · {r.passType}</div>
                      </button>
                    ))}
                  </div>
                )}
                {homeMountainSearch && filteredResorts.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-slate-500 px-1">No resorts match &ldquo;{homeMountainSearch}&rdquo;</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Drive Radius */}
        {step === "radius" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">How far will you drive?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                On a normal ski day, what&apos;s your max drive?
              </p>
            </div>
            <div className="space-y-2">
              {radiusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { log("onboarding.radius_select", { radius: String(opt.value) }); setRadius(opt.value); }}
                  className={`w-full flex items-center justify-between px-5 py-3 rounded-xl border-2 transition-all ${
                    radius === opt.value
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
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
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">How often do you ski?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                How many days did you ski last season?
              </p>
            </div>
            <div className="space-y-2">
              {frequencyOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => { log("onboarding.frequency_select", { frequency: opt.value }); setFrequency(opt.value); }}
                  className={`w-full text-left px-5 py-3 rounded-xl border-2 transition-all ${
                    frequency === opt.value && (opt.days !== 30 || frequencyOptions.findIndex((o) => o.value === frequency) === idx)
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
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
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Who do you ski with?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                We&apos;ll tailor recommendations for your group.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {groupOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { log("onboarding.group_select", { groupType: opt.value }); setGroup(opt.value); }}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    group === opt.value
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
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
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">How old are your kids?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                Select all that apply — we&apos;ll recommend family-friendly options.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {childAgeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { log("onboarding.child_age_toggle", { age: String(opt.value) }); toggleChildAge(opt.value); }}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    childAges.includes(opt.value)
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
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
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Will you travel for a big storm?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                We&apos;ll watch for chase-worthy storms and help you get there.
              </p>
            </div>
            <div className="space-y-2">
              {chaseOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { log("onboarding.chase_select", { value: opt.value }); setChase(opt.value); }}
                  className={`w-full text-left px-5 py-3 rounded-xl border-2 transition-all ${
                    chase === opt.value
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
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
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">What makes you decide to ski?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                Select all that apply.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {triggerOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { log("onboarding.trigger_toggle", { trigger: opt.value }); toggleTrigger(opt.value); }}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    triggers.includes(opt.value)
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
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
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">How would you describe your skiing?</h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                We&apos;ll match you with appropriate terrain recommendations.
              </p>
            </div>
            <div className="space-y-2">
              {experienceOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { log("onboarding.experience_select", { level: opt.value }); setExperience(opt.value); }}
                  className={`w-full text-left px-5 py-3 rounded-xl border-2 transition-all ${
                    experience === opt.value
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
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
          <div className="space-y-4">
            {!showPersonaOverride ? (
              <>
                <div className="text-center">
                  <span className="text-4xl mb-2 block">{getPersonaInfoV2(detectedPersona.primary).emoji}</span>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Sounds like you&apos;re a {getPersonaInfoV2(detectedPersona.primary).label}
                  </h1>
                  <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-1">
                    Based on {getClassificationReason(detectedPersona)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 lg:p-4">
                  <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">
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
                          ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"
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

        {/* Step 10: Sign In (required gate) */}
        {step === "signin" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                One last thing — sign in to save your profile
              </h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-slate-400 mt-2">
                Your preferences will sync across devices.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Continue with Google
              </span>
            </button>
          </div>
        )}

        </div>
      </div>

      {/* Bottom CTA — hidden on signin step (Google button is the CTA) */}
      {step !== "signin" && (
        <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-6 md:px-8 lg:px-10 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
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
                Continue
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-slate-400">Loading...</div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
