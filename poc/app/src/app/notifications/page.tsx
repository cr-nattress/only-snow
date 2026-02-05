"use client";

import Link from "next/link";

interface NotificationPreview {
  id: string;
  type: string;
  time: string;
  title: string;
  body: string;
  urgency: "info" | "alert" | "critical";
  icon: string;
}

const notifications: NotificationPreview[] = [
  {
    id: "powder",
    type: "Powder Alert",
    time: "6:30 AM",
    title: "Vail got 8\" overnight ❄️",
    body: "Back Bowls are loaded. Leave by 6:30am — garage fills by 8:30. Your best day this month.",
    urgency: "alert",
    icon: "❄️",
  },
  {
    id: "storm-incoming",
    type: "Storm Incoming",
    time: "Thu 7 PM",
    title: "9-12\" hitting Vail Tuesday",
    body: "NW flow storm arrives mid-week. Vail and Beaver Creek in the bullseye. Best day: Wednesday Feb 12.",
    urgency: "alert",
    icon: "🌨️",
  },
  {
    id: "weekend",
    type: "Weekend Outlook",
    time: "Thu 6 PM",
    title: "This weekend: Breck is your best bet 🟡",
    body: "Groomed conditions across the board. Breck has the most terrain open (64%). No new snow expected. Keystone has night skiing Fri-Sat.",
    urgency: "info",
    icon: "📋",
  },
  {
    id: "chase",
    type: "Chase Alert",
    time: "Tue 10 AM",
    title: "🔴 Telluride: 18-24\" next week",
    body: "On your Ikon pass. EWR→MTJ $289 RT. This is chase-worthy. Book today — flights will sell out once forecast firms up Sunday.",
    urgency: "critical",
    icon: "✈️",
  },
  {
    id: "worth-knowing",
    type: "Worth Knowing",
    time: "7:00 AM",
    title: "Loveland got 6\" — 2x your resorts",
    body: "Not on your pass, but $89 walk-up and 15 min closer than Breck. Best snow on I-70 today.",
    urgency: "info",
    icon: "💡",
  },
  {
    id: "price-drop",
    type: "Price Drop",
    time: "3:15 PM",
    title: "MTJ flights dropped to $249 ✈️",
    body: "You viewed the Telluride chase trip yesterday. Flights to Montrose just dropped $40. Still 3 seats left.",
    urgency: "alert",
    icon: "💰",
  },
];

const urgencyStyles = {
  info: "border-gray-200 bg-white",
  alert: "border-blue-200 bg-blue-50",
  critical: "border-red-200 bg-red-50",
};

const urgencyDot = {
  info: "bg-gray-400",
  alert: "bg-blue-500",
  critical: "bg-red-500",
};

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            ←
          </Link>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-xs lg:text-sm text-gray-500">Preview of all notification types</p>
          </div>
        </div>
      </div>

      {/* Rules callout */}
      <div className="px-4 md:px-6 lg:px-8 pt-3">
        <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 md:px-5 lg:px-6 py-3 lg:py-4">
          <h3 className="text-xs lg:text-sm font-bold text-amber-800 mb-1">NOTIFICATION RULES</h3>
          <ul className="text-[10px] lg:text-xs text-amber-700 space-y-0.5">
            <li>• Never send on a dry, uneventful day</li>
            <li>• Every notification must be actionable</li>
            <li>• Max 2 per day, ever</li>
            <li>• Weekend outlook: exactly once (Thursday PM)</li>
            <li>• Chase alerts escalate over time</li>
          </ul>
        </div>
      </div>

      {/* Notification previews — 2-col grid on desktop */}
      <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {notifications.map((n) => (
          <div key={n.id}>
            {/* Type label */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-2 h-2 rounded-full ${urgencyDot[n.urgency]}`} />
              <span className="text-[10px] lg:text-xs font-bold tracking-wide text-gray-400">
                {n.type.toUpperCase()}
              </span>
              <span className="text-[10px] lg:text-xs text-gray-400">· {n.time}</span>
            </div>

            {/* Phone notification mockup */}
            <div className={`rounded-xl border ${urgencyStyles[n.urgency]} px-4 md:px-5 lg:px-6 py-3 lg:py-4 shadow-sm`}>
              <div className="flex items-start gap-2">
                <span className="text-lg lg:text-xl shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs lg:text-sm font-bold text-gray-900">{n.title}</span>
                  <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mt-0.5">
                    {n.body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Escalation timeline */}
      <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100">
            <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500">
              CHASE ALERT ESCALATION TIMELINE
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { days: "7-10 days", icon: "📡", label: "HEADS UP", text: "Models showing potential storm. No action needed.", color: "text-gray-600" },
              { days: "5-6 days", icon: "🎯", label: "FIRMING UP", text: "Storm track converging. Check flight prices now.", color: "text-yellow-700" },
              { days: "3-4 days", icon: "🔴", label: "BOOK NOW", text: "Forecast locked in. Go/no-go moment. Flights rising.", color: "text-red-700" },
              { days: "1-2 days", icon: "❄️", label: "ARRIVING", text: "Storm hitting. If you booked, you're set.", color: "text-blue-700" },
            ].map((s) => (
              <div key={s.days} className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 flex items-start gap-3">
                <span className="text-base lg:text-lg shrink-0">{s.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] lg:text-xs font-bold ${s.color}`}>{s.label}</span>
                    <span className="text-[10px] lg:text-xs text-gray-400">{s.days} out</span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-600">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 lg:px-8 py-6 text-center">
        <p className="text-[10px] lg:text-xs text-gray-400">POC — Notification Designs</p>
      </div>
    </div>
  );
}
