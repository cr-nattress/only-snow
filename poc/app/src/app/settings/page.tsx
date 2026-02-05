"use client";

import { useState } from "react";
import Link from "next/link";
import { usePersona } from "@/context/PersonaContext";
import { personas, getPersonaInfo } from "@/data/personas";

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

  const [editingLocation, setEditingLocation] = useState(false);
  const [editingPass, setEditingPass] = useState(false);
  const [editingPersona, setEditingPersona] = useState(false);

  const { persona, setPersona } = usePersona();
  const currentPersona = getPersonaInfo(persona);
  const currentPass = passes.find((p) => p.id === pass);

  const toggleNotification = (id: string) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const removeResort = (id: string) => {
    setSavedResorts((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            ←
          </Link>
          <div className="flex-1">
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-xs lg:text-sm text-gray-500">Manage your ski profile</p>
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm lg:text-base font-bold text-blue-700">CN</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500">PROFILE</h2>
          </div>

          {/* Location */}
          <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm lg:text-base font-medium text-gray-900">Home Location</div>
                {editingLocation ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onBlur={() => setEditingLocation(false)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingLocation(false)}
                    className="mt-1 text-xs lg:text-sm text-gray-600 border border-gray-300 rounded px-2 py-1 w-40"
                    autoFocus
                  />
                ) : (
                  <div className="text-xs lg:text-sm text-gray-500">{location}</div>
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
          <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm lg:text-base font-medium text-gray-900">Drive Radius</div>
                <div className="text-xs lg:text-sm text-gray-500">
                  {driveRadius === 60 ? "1 hour" : driveRadius === 120 ? "2 hours" : "3 hours"}
                </div>
              </div>
              <select
                value={driveRadius}
                onChange={(e) => setDriveRadius(Number(e.target.value))}
                className="text-xs lg:text-sm border border-gray-300 rounded px-2 py-1"
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
                <div className="text-sm lg:text-base font-medium text-gray-900">Season Pass</div>
                {editingPass ? (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {passes.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPass(p.id);
                          setEditingPass(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          pass === p.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded ${p.color} flex items-center justify-center`}>
                          <span className="text-white text-[10px] font-bold">{p.label[0]}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-900">{p.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-6 h-6 rounded ${currentPass?.color} flex items-center justify-center`}>
                      <span className="text-white text-[10px] font-bold">{currentPass?.label[0]}</span>
                    </div>
                    <span className="text-xs lg:text-sm text-gray-500">{currentPass?.label}</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500">SKIER TYPE</h2>
          </div>
          <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm lg:text-base font-medium text-gray-900">Your Persona</div>
                {editingPersona ? (
                  <div className="mt-3 space-y-2">
                    {personas.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPersona(p.id);
                          setEditingPersona(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          persona === p.id
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
                            <div className="text-xs lg:text-sm font-medium text-gray-900">{p.label}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">{p.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">
                      {persona === "powder-hunter" && "❄️"}
                      {persona === "family-planner" && "👨‍👩‍👧"}
                      {persona === "weekend-warrior" && "⏰"}
                      {persona === "destination-traveler" && "✈️"}
                      {persona === "beginner" && "⭐"}
                    </span>
                    <div>
                      <span className="text-xs lg:text-sm text-gray-700">{currentPersona.label}</span>
                      <div className="text-[10px] lg:text-xs text-gray-400">{currentPersona.focus}</div>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500">MY RESORTS</h2>
            <button className="text-xs lg:text-sm text-blue-600 font-medium">+ Add</button>
          </div>
          <div className="divide-y divide-gray-50">
            {savedResorts.map((resort) => (
              <div key={resort.id} className="px-4 md:px-5 lg:px-6 py-3 lg:py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm lg:text-base font-medium text-gray-900">{resort.name}</span>
                      <span className="text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                        {resort.pass.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] lg:text-xs text-gray-500">{resort.drive}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeResort(resort.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chase Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500">CHASE MODE</h2>
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
                <div className="text-sm lg:text-base font-medium text-gray-900 mb-2">Travel Willingness</div>
                <div className="space-y-2">
                  {[
                    { value: "anywhere", label: "Anywhere", desc: "I'll fly to chase a big storm" },
                    { value: "driving", label: "Within driving", desc: "Road trips only" },
                    { value: "no", label: "Local only", desc: "No travel for storms" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setChaseWillingness(opt.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        chaseWillingness === opt.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-xs lg:text-sm font-medium text-gray-900">{opt.label}</div>
                      <div className="text-[10px] lg:text-xs text-gray-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {chaseWillingness === "anywhere" && (
                <div>
                  <div className="text-sm lg:text-base font-medium text-gray-900 mb-2">Home Airports</div>
                  <div className="flex flex-wrap gap-2">
                    {["DEN", "EWR", "JFK", "SLC"].map((airport) => (
                      <span
                        key={airport}
                        className="text-xs lg:text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700"
                      >
                        {airport}
                      </span>
                    ))}
                    <button className="text-xs lg:text-sm px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-500">
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 border-b border-gray-100">
            <h2 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500">NOTIFICATIONS</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {notificationTypes
              .filter((n) => {
                if (n.id === "chase" || n.id === "price-drop") return chaseEnabled;
                return true;
              })
              .map((notif) => (
                <div key={notif.id} className="px-4 md:px-5 lg:px-6 py-3 lg:py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm lg:text-base font-medium text-gray-900">{notif.label}</div>
                    <div className="text-[10px] lg:text-xs text-gray-500">{notif.description}</div>
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
          <button className="w-full py-3 text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors">
            Export My Data
          </button>
          <button className="w-full py-3 text-sm lg:text-base text-red-600 hover:text-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 lg:px-8 py-6 text-center">
        <p className="text-[10px] lg:text-xs text-gray-400">POC — Settings</p>
      </div>
    </div>
  );
}
