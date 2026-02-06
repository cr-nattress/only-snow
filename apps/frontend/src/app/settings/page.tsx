"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePersona } from "@/context/PersonaContext";
import { usePreferences } from "@/context/PreferencesContext";
import { getPersonaInfo, personasV2, getPersonaInfoV2, newToLegacyPersona } from "@/data/personas";

const passes = [
  { id: "epic", label: "Epic", color: "bg-indigo-600" },
  { id: "ikon", label: "Ikon", color: "bg-orange-500" },
  { id: "indy", label: "Indy", color: "bg-emerald-600" },
  { id: "multi", label: "Multiple", color: "bg-gray-700" },
  { id: "none", label: "No Pass", color: "bg-gray-400" },
];

const mockResorts = [
  { id: "vail", name: "Vail", pass: "epic", drive: "1h 40m" },
  { id: "breckenridge", name: "Breckenridge", pass: "epic", drive: "1h 30m" },
  { id: "keystone", name: "Keystone", pass: "epic", drive: "1h 30m" },
  { id: "beaver-creek", name: "Beaver Creek", pass: "epic", drive: "1h 50m" },
];

const notificationTypes = [
  { id: "powder", label: "Powder Alerts", description: "Morning alerts when your resorts get fresh snow" },
  { id: "storm", label: "Storm Incoming", description: "3-5 day advance notice of incoming storms" },
  { id: "weekend", label: "Weekend Outlook", description: "Thursday evening summary for the weekend" },
  { id: "chase", label: "Chase Alerts", description: "Major storm events worth traveling for" },
  { id: "worth-knowing", label: "Worth Knowing", description: "When nearby resorts have significantly more snow" },
  { id: "price-drop", label: "Price Drops", description: "Flight price alerts for chase trips you've viewed" },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { preferences, loaded, updatePreferences } = usePreferences();
  const [location, setLocation] = useState("Denver, CO");
  const [driveRadius, setDriveRadius] = useState(120);
  const [pass, setPass] = useState("epic");
  const [chaseEnabled, setChaseEnabled] = useState(true);
  const [chaseWillingness, setChaseWillingness] = useState("anywhere");
  const [savedResorts, setSavedResorts] = useState(mockResorts);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    powder: true,
    storm: true,
    weekend: true,
    chase: true,
    "worth-knowing": true,
    "price-drop": true,
  });
  const [saved, setSaved] = useState(false);

  const [editingLocation, setEditingLocation] = useState(false);
  const [editingPass, setEditingPass] = useState(false);
  const [editingPersona, setEditingPersona] = useState(false);

  const { persona, userPersona, setUserPersona, effectivePersonaType } = usePersona();

  // Hydrate local state from stored preferences on load
  useEffect(() => {
    if (!loaded) return;
    if (preferences.location) setLocation(preferences.location);
    if (preferences.driveRadius) setDriveRadius(preferences.driveRadius);
    if (preferences.passType) setPass(preferences.passType);
    if (preferences.chaseWillingness) {
      setChaseWillingness(preferences.chaseWillingness);
      setChaseEnabled(preferences.chaseWillingness !== "no");
    }
  }, [loaded, preferences]);

  // Flash a brief "Saved" indicator
  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }
  const currentPersona = userPersona
    ? getPersonaInfoV2(userPersona.primary)
    : getPersonaInfo(persona);
  const currentPass = passes.find((p) => p.id === pass);

  const toggleNotification = (id: string) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const removeResort = (id: string) => {
    setSavedResorts((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white/70 hover:text-white">
            ←
          </Link>
          <div className="flex-1">
            <h1 className="text-lg lg:text-xl font-bold text-white">Settings</h1>
            <p className="text-xs lg:text-sm text-blue-100 dark:text-slate-400">
              {session?.user?.name ? `Signed in as ${session.user.name}` : "Manage your ski profile"}
            </p>
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/20 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "Profile"}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm lg:text-base font-bold text-white">
                {session?.user?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Save indicator */}
      {saved && (
        <div className="px-4 md:px-6 lg:px-8">
          <div className="text-xs text-center text-green-600 dark:text-green-400 py-1">
            Settings saved
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Account Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">ACCOUNT</h2>
          </div>
          <div className="px-4 md:px-5 lg:px-6 py-4 lg:py-5">
            {status === "authenticated" && session?.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 overflow-hidden flex items-center justify-center">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "Profile"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {session.user.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">
                      {session.user.name}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-500 dark:text-slate-400">
                      {session.user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full py-2.5 px-4 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                  Sign in to save your settings across devices
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-block py-2.5 px-6 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign in with Google
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">PROFILE</h2>
          </div>

          {/* Location */}
          <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4 border-b border-gray-50 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Home Location</div>
                {editingLocation ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onBlur={() => { setEditingLocation(false); updatePreferences({ location }); flashSaved(); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setEditingLocation(false); updatePreferences({ location }); flashSaved(); } }}
                    className="mt-1 text-xs lg:text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 w-40"
                    autoFocus
                  />
                ) : (
                  <div className="text-xs lg:text-sm text-gray-500 dark:text-slate-400">{location}</div>
                )}
              </div>
              <button
                onClick={() => setEditingLocation(!editingLocation)}
                className="text-xs lg:text-sm text-blue-600 font-medium"
              >
                {editingLocation ? "Done" : "Edit"}
              </button>
            </div>
          </div>

          {/* Drive Radius */}
          <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4 border-b border-gray-50 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Drive Radius</div>
                <div className="text-xs lg:text-sm text-gray-500 dark:text-slate-400">
                  {driveRadius === 60 ? "1 hour" : driveRadius === 120 ? "2 hours" : "3 hours"}
                </div>
              </div>
              <select
                value={driveRadius}
                onChange={(e) => { const v = Number(e.target.value); setDriveRadius(v); updatePreferences({ driveRadius: v }); flashSaved(); }}
                className="text-xs lg:text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded px-2 py-1"
              >
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
          </div>

          {/* Pass */}
          <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Season Pass</div>
                {editingPass ? (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {passes.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPass(p.id);
                          setEditingPass(false);
                          updatePreferences({ passType: p.id });
                          flashSaved();
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          pass === p.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:border-slate-600"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded ${p.color} flex items-center justify-center`}>
                          <span className="text-white text-[10px] font-bold">{p.label[0]}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{p.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-6 h-6 rounded ${currentPass?.color} flex items-center justify-center`}>
                      <span className="text-white text-[10px] font-bold">{currentPass?.label[0]}</span>
                    </div>
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-slate-400">{currentPass?.label}</span>
                  </div>
                )}
              </div>
              {!editingPass && (
                <button
                  onClick={() => setEditingPass(true)}
                  className="text-xs lg:text-sm text-blue-600 font-medium"
                >
                  Change
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Skier Type */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">SKIER TYPE</h2>
          </div>
          <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Your Persona</div>
                {editingPersona ? (
                  <div className="mt-3 space-y-2 max-h-[50vh] overflow-y-auto">
                    {personasV2.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          // Update userPersona if it exists, otherwise create a minimal one
                          const updated = userPersona
                            ? { ...userPersona, primary: p.id, confidence: 1.0 }
                            : {
                                primary: p.id,
                                confidence: 1.0,
                                signals: {
                                  frequency: "regular" as const,
                                  groupType: "solo" as const,
                                  decisionTriggers: ["snow" as const],
                                  experienceLevel: "intermediate" as const,
                                },
                              };
                          setUserPersona(updated);
                          updatePreferences({
                            persona: newToLegacyPersona(p.id),
                            userPersona: updated,
                          });
                          setEditingPersona(false);
                          flashSaved();
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          effectivePersonaType === p.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                            : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{p.emoji}</span>
                          <div>
                            <div className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">{p.label}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">{p.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">
                      {userPersona ? (
                        getPersonaInfoV2(effectivePersonaType).emoji
                      ) : (
                        <>
                          {persona === "powder-hunter" && "❄️"}
                          {persona === "family-planner" && "👨‍👩‍👧"}
                          {persona === "weekend-warrior" && "⏰"}
                          {persona === "destination-traveler" && "✈️"}
                          {persona === "beginner" && "⭐"}
                        </>
                      )}
                    </span>
                    <div>
                      <span className="text-xs lg:text-sm text-gray-700 dark:text-slate-300">{currentPersona.label}</span>
                      <div className="text-[10px] lg:text-xs text-gray-400 dark:text-slate-500">{currentPersona.focus}</div>
                    </div>
                  </div>
                )}
              </div>
              {!editingPersona && (
                <button
                  onClick={() => setEditingPersona(true)}
                  className="text-xs lg:text-sm text-blue-600 font-medium"
                >
                  Change
                </button>
              )}
            </div>
          </div>
        </div>

        {/* My Resorts */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">MY RESORTS</h2>
            <button className="text-xs lg:text-sm text-blue-600 font-medium">+ Add</button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {savedResorts.map((resort) => (
              <div key={resort.id} className="px-4 md:px-5 lg:px-6 py-3 lg:py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{resort.name}</span>
                      <span className="text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                        {resort.pass.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">{resort.drive}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeResort(resort.id)}
                  className="text-gray-400 dark:text-slate-500 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chase Preferences */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">CHASE MODE</h2>
            <button
              onClick={() => setChaseEnabled(!chaseEnabled)}
              className={`w-10 h-6 rounded-full transition-colors ${
                chaseEnabled ? "bg-blue-500" : "bg-gray-300"
              } relative`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  chaseEnabled ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
          {chaseEnabled && (
            <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4 space-y-3">
              <div>
                <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white mb-2">Travel Willingness</div>
                <div className="space-y-2">
                  {[
                    { value: "anywhere", label: "Anywhere", desc: "I'll fly to chase a big storm" },
                    { value: "driving", label: "Within driving", desc: "Road trips only" },
                    { value: "no", label: "Local only", desc: "No travel for storms" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setChaseWillingness(opt.value); updatePreferences({ chaseWillingness: opt.value }); flashSaved(); }}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        chaseWillingness === opt.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:border-slate-600"
                      }`}
                    >
                      <div className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">{opt.label}</div>
                      <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {chaseWillingness === "anywhere" && (
                <div>
                  <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white mb-2">Home Airports</div>
                  <div className="flex flex-wrap gap-2">
                    {["DEN", "EWR", "JFK", "SLC"].map((airport) => (
                      <span
                        key={airport}
                        className="text-xs lg:text-sm px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                      >
                        {airport}
                      </span>
                    ))}
                    <button className="text-xs lg:text-sm px-3 py-1.5 rounded-full border border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400">
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">NOTIFICATIONS</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {notificationTypes
              .filter((n) => {
                if (n.id === "chase" || n.id === "price-drop") return chaseEnabled;
                return true;
              })
              .map((notif) => (
                <div key={notif.id} className="px-4 md:px-5 lg:px-6 py-3 lg:py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{notif.label}</div>
                    <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">{notif.description}</div>
                  </div>
                  <button
                    onClick={() => toggleNotification(notif.id)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      notifications[notif.id] ? "bg-blue-500" : "bg-gray-300"
                    } relative`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                        notifications[notif.id] ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-2">
          <button className="w-full py-3 text-sm lg:text-base text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            Export My Data
          </button>
          <button className="w-full py-3 text-sm lg:text-base text-red-600 hover:text-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 lg:px-8 py-6 text-center">
        <p className="text-[10px] lg:text-xs text-blue-200 dark:text-slate-500">POC — Settings</p>
      </div>
    </div>
  );
}
