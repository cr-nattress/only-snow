import { Scenario, ChaseRegion, TripPlan, ResortDetail, DailyForecast, WorthKnowingEntry } from "./types";
import { resorts } from "./resorts";

// ─── Scenario 1: Denver Epic, Dry Weekend ────────────────────────────
// 5 Day: NW storm incoming Tue — Vail jumps to #1 (the aha moment)
// 10 Day: Vail stays dominant, second system hints

const denverDryWorthKnowing5d: WorthKnowingEntry[] = [
  {
    resort: resorts.loveland,
    snowfall24hr: 6,
    baseDepth: 42,
    openPercent: 85,
    walkUpPrice: 89,
    reason: "Got 6\" overnight — best on I-70 today. But the real story is the storm: 5-8\" coming, 15 min closer than Breck. No-frills, but the snow is real.",
    forecasts: {
      "5day": { display: "5-8\"", sort: 6.5 },
      "10day": { display: "8-12\"", sort: 10, daily: [0, 0, 0, 1, 4, 3, 1, 0, 0, 1] },
    },
  },
];

const denverDryWorthKnowing10d: WorthKnowingEntry[] = [
  {
    resort: resorts.beaverCreek,
    snowfall24hr: 0,
    baseDepth: 33,
    openPercent: 55,
    walkUpPrice: 249,
    reason: "10-15\" over 10 days — nearly matching Vail. Half the crowds. Consider adding to your resorts.",
    forecasts: {
      "5day": { display: "7-10\"", sort: 8.5 },
      "10day": { display: "10-15\"", sort: 12.5, daily: [0, 0, 0, 1, 4, 3, 2, 0, 0, 3] },
    },
  },
  {
    resort: resorts.copper,
    snowfall24hr: 0,
    baseDepth: 30,
    openPercent: 75,
    walkUpPrice: 139,
    reason: "Continental Divide resorts get surprise upslope from second system. 10-14\" in 10 days. Ikon — $139 walk-up if not on your pass.",
    forecasts: {
      "5day": { display: "5-8\"", sort: 6.5 },
      "10day": { display: "10-14\"", sort: 12, daily: [0, 0, 0, 0, 3, 3, 2, 0, 2, 2] },
    },
  },
];

export const denverDryWeekend: Scenario = {
  id: "denver-dry",
  name: "Denver Epic — Dry Weekend",
  description: "Groomed conditions today, but a NW storm arrives Tuesday.",
  location: "Denver, CO",
  pass: "epic",
  passLabel: "Epic",
  date: "Thu Feb 6",
  yourResorts: [
    {
      resort: resorts.breckenridge,
      snowfall24hr: 3,
      baseDepth: 24,
      openPercent: 64,
      trailsOpen: 166,
      trailsTotal: 277,
      liftsOpen: 20,
      liftsTotal: 33,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "4-8\"", sort: 6, daily: [0, 0, 0, 1, 5] },
        "10day": { display: "8-12\"", sort: 10, daily: [0, 0, 0, 1, 5, 2, 1, 0, 0, 1] },
      },
    },
    {
      resort: resorts.keystone,
      snowfall24hr: 2,
      baseDepth: 26,
      openPercent: 70,
      trailsOpen: 78,
      trailsTotal: 128,
      liftsOpen: 14,
      liftsTotal: 20,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "3-6\"", sort: 4.5, daily: [0, 0, 0, 1, 4] },
        "10day": { display: "6-10\"", sort: 8, daily: [0, 0, 0, 1, 4, 1, 1, 0, 0, 1] },
      },
    },
    {
      resort: resorts.vail,
      snowfall24hr: 1,
      baseDepth: 37,
      openPercent: 60,
      trailsOpen: 166,
      trailsTotal: 277,
      liftsOpen: 20,
      liftsTotal: 33,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "9-12\"", sort: 10.5, daily: [0, 0, 0, 3, 8] },
        "10day": { display: "12-18\"", sort: 15, daily: [0, 0, 0, 1, 5, 4, 2, 0, 0, 3] },
      },
    },
  ],
  worthKnowing: denverDryWorthKnowing5d,
  stormTracker: {
    severity: "moderate",
    text: "CO: 8-14\" expected Feb 10-12",
  },
  recommendation: {
    onPass: "Vail — NW storm hits Tuesday. 9-12\" forecast, most on I-70. Back Bowls will be loaded. Best powder day: Wed Feb 12.",
    bestSnow: "Beaver Creek — nearly as much as Vail (7-10\"), half the post-storm crowds. 10 min past Vail.",
    bestValue: "Wait for the storm. This weekend is groomers. Next Wed/Thu will be the best days this month.",
  },
  aiAnalysis: "Vail is your best bet — ski Tuesday Feb 11 when 5\" hits, or Wednesday for 4\" of fresh on top. That's 9\" in two days, most of any resort on your pass. Beaver Creek gets nearly as much (4\" + 3\") with half the crowds. Skip this weekend — it's all groomers. The storm arrives Monday and peaks Tuesday. If you can only pick one day, Wednesday Feb 12 will be the best powder day of the month.",
  contextBanner: "❄️ STORM ARRIVING TUE — NW flow favors Vail. Best powder day: Wed Feb 12.",
  timeWindows: {
    "5day": {
      dateLabel: "Next 5 Days · Feb 6-11",
      dailyLabels: ["Thu", "Fri", "Sat", "Sun", "Mon"],
      recommendation: {
        onPass: "Vail — NW storm hits Tuesday. 9-12\" forecast, most on I-70. Back Bowls will be loaded. Best powder day: Wed Feb 12.",
        bestSnow: "Beaver Creek — nearly as much as Vail (7-10\"), half the post-storm crowds. 10 min past Vail.",
        bestValue: "Wait for the storm. This weekend is groomers. Next Wed/Thu will be the best days this month.",
      },
      contextBanner: "❄️ STORM ARRIVING TUE — NW flow favors Vail. Best powder day: Wed Feb 12.",
      worthKnowing: denverDryWorthKnowing5d,
    },
    "10day": {
      dateLabel: "Next 10 Days · Feb 6-16",
      dailyLabels: ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      recommendation: {
        onPass: "Vail — dominant over 10 days. 12-18\" total with two systems. Back Bowls + Blue Sky Basin will be in play.",
        bestSnow: "Beaver Creek — 10-15\" and far less crowded than Vail. Consider adding it to your resorts.",
        bestValue: "Skip this weekend. Ski Wed Feb 12 (post-storm #1) and Sat Feb 15 (between systems). Two powder days > one groomer day.",
      },
      contextBanner: "❄️ Two storm systems in 10 days — best stretch of the season coming. Vail gets the most.",
      worthKnowing: denverDryWorthKnowing10d,
    },
  },
};

// ─── Scenario 2: Denver Epic, Storm Incoming ─────────────────────────
// 5 Day: Storm arriving mid-week, Vail is #1
// 10 Day: Second system possible, even more snow

export const denverStormIncoming: Scenario = {
  id: "denver-storm",
  name: "Denver Epic — Storm Incoming",
  description: "NW flow storm arriving Tuesday. Vail in the bullseye.",
  location: "Denver, CO",
  pass: "epic",
  passLabel: "Epic",
  date: "Mon Feb 9",
  yourResorts: [
    {
      resort: resorts.vail,
      snowfall24hr: 0,
      baseDepth: 37,
      openPercent: 60,
      trailsOpen: 166,
      trailsTotal: 277,
      liftsOpen: 20,
      liftsTotal: 33,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "9-12\"", sort: 10.5, daily: [0, 1, 5, 4, 1] },
        "10day": { display: "14-20\"", sort: 17, daily: [0, 1, 5, 4, 1, 0, 0, 2, 3, 1] },
      },
    },
    {
      resort: resorts.breckenridge,
      snowfall24hr: 0,
      baseDepth: 24,
      openPercent: 64,
      trailsOpen: 177,
      trailsTotal: 277,
      liftsOpen: 22,
      liftsTotal: 33,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "4-8\"", sort: 6, daily: [0, 0, 3, 2, 1] },
        "10day": { display: "10-14\"", sort: 12, daily: [0, 0, 3, 3, 1, 0, 0, 1, 3, 1] },
      },
    },
    {
      resort: resorts.keystone,
      snowfall24hr: 0,
      baseDepth: 26,
      openPercent: 70,
      trailsOpen: 90,
      trailsTotal: 128,
      liftsOpen: 14,
      liftsTotal: 20,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "3-6\"", sort: 4.5, daily: [0, 0, 2, 2, 0] },
        "10day": { display: "8-12\"", sort: 10, daily: [0, 0, 2, 2, 1, 0, 0, 1, 2, 2] },
      },
    },
  ],
  worthKnowing: [
    {
      resort: resorts.beaverCreek,
      snowfall24hr: 0,
      baseDepth: 33,
      openPercent: 55,
      walkUpPrice: 249,
      reason: "Almost as much as Vail, less crowded on post-storm Saturdays. Same storm pattern (NW flow hits both equally). Not in your saved resorts — should it be?",
      forecasts: {
        "5day": { display: "7-10\"", sort: 8.5 },
        "10day": { display: "12-16\"", sort: 14, daily: [0, 1, 4, 3, 2, 0, 0, 1, 2, 1] },
      },
    },
  ],
  stormTracker: {
    severity: "significant",
    text: "Your area: 9-12\" coming Tue. Vail getting the most.",
    region: "I-70 Corridor",
    forecastTotal: "9-12\"",
    dates: "Feb 10-12",
  },
  recommendation: {
    onPass: "Vail — 9-12\" incoming. NW flow puts Vail in the bullseye. Best powder day: Wed Feb 12. Leave by 6:30 AM.",
    bestSnow: "Beaver Creek — 7-10\" from the same system. Less tracked out because fewer people check it.",
    bestValue: "Wed or Thu mid-week powder day avoids the weekend crowds entirely.",
  },
  aiAnalysis: "Vail is the clear winner with 17\" over 10 days. The big day is Wednesday Feb 12 — 5\" dropping, Back Bowls will be loaded. Thursday adds 4\" more. Beaver Creek sees 14\" on the same timeline with far fewer people. Second system arrives next Monday with another 3\" at Vail. Best strategy: ski Vail on Thursday Feb 13 (day after the peak dump), then again Tuesday Feb 18 for round two.",
  contextBanner: "❄️ STORM ARRIVING TUE — NW flow favors Vail Valley. 9-12\" expected.",
  timeWindows: {
    "5day": {
      dateLabel: "Next 5 Days · Feb 9-14",
      dailyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      recommendation: {
        onPass: "Vail — 9-12\" incoming. NW flow puts Vail in the bullseye. Best powder day: Wed Feb 12. Leave by 6:30 AM.",
        bestSnow: "Beaver Creek — 7-10\" from the same system. Less tracked out because fewer people check it.",
        bestValue: "Wed or Thu mid-week powder day avoids the weekend crowds entirely.",
      },
      contextBanner: "❄️ STORM ARRIVING TUE — NW flow favors Vail Valley. 9-12\" expected.",
    },
    "10day": {
      dateLabel: "Next 10 Days · Feb 9-19",
      dailyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"],
      recommendation: {
        onPass: "Vail — 14-20\" total over 10 days. Two systems stacking. This could reset the season. Back Bowls + Blue Sky Basin.",
        bestSnow: "Beaver Creek — 12-16\" with less traffic. Two storms = two powder days.",
        bestValue: "Plan for Wed Feb 12 and the following weekend. Two storm cycles = multiple opportunities.",
      },
      contextBanner: "❄️ Two systems in 10 days — Vail could see 14-20\". Best stretch of the season.",
      worthKnowing: [
        {
          resort: resorts.beaverCreek,
          snowfall24hr: 0,
          baseDepth: 33,
          openPercent: 55,
          walkUpPrice: 249,
          reason: "12-16\" over 10 days — nearly matching Vail. Much less crowded. Seriously consider adding this to your resorts.",
          forecasts: {
            "5day": { display: "7-10\"", sort: 8.5 },
            "10day": { display: "12-16\"", sort: 14, daily: [0, 1, 4, 3, 2, 0, 0, 1, 2, 1] },
          },
        },
        {
          resort: resorts.winterPark,
          snowfall24hr: 0,
          baseDepth: 35,
          openPercent: 72,
          walkUpPrice: 159,
          reason: "Mary Jane side picks up 10-14\" from both systems. NW flow clips it. Ikon — $159 walk-up. Advanced bump skiers: Mary Jane in 14\" is elite.",
          forecasts: {
            "5day": { display: "6-9\"", sort: 7.5 },
            "10day": { display: "10-14\"", sort: 12, daily: [0, 0, 3, 2, 1, 0, 0, 1, 3, 2] },
          },
        },
      ],
    },
  },
};

// ─── Scenario 3: Avon Epic, Powder Day + Road Trip ───────────────────
// 5 Day: Vail 12" total (today's storm + taper), BC 10"
// 10 Day: Second system possible

export const avonPowderDay: Scenario = {
  id: "avon-powder",
  name: "Avon Epic — Powder Day + Road Trip",
  description: "Vail got 10\", but Crested Butte got 20\". The road trip question.",
  location: "Avon, CO",
  pass: "epic",
  passLabel: "Epic",
  date: "Wed Feb 11",
  yourResorts: [
    {
      resort: { ...resorts.vail, driveTime: "10 min", driveMinutes: 10 },
      snowfall24hr: 10,
      baseDepth: 47,
      openPercent: 85,
      trailsOpen: 235,
      trailsTotal: 277,
      liftsOpen: 28,
      liftsTotal: 33,
      conditions: "Powder",
      forecasts: {
        "5day": { display: "12\"", sort: 12, daily: [5, 4, 2, 1, 0] },
        "10day": { display: "15-18\"", sort: 16.5, daily: [5, 4, 2, 1, 0, 0, 0, 2, 2, 1] },
      },
    },
    {
      resort: { ...resorts.beaverCreek, driveTime: "15 min", driveMinutes: 15 },
      snowfall24hr: 8,
      baseDepth: 41,
      openPercent: 80,
      trailsOpen: 120,
      trailsTotal: 150,
      liftsOpen: 18,
      liftsTotal: 24,
      conditions: "Powder",
      forecasts: {
        "5day": { display: "10\"", sort: 10, daily: [4, 3, 2, 1, 0] },
        "10day": { display: "12-15\"", sort: 13.5, daily: [4, 3, 2, 1, 0, 0, 0, 1, 2, 1] },
      },
    },
  ],
  worthKnowing: [
    {
      resort: {
        id: "monarch",
        name: "Monarch",
        passType: "independent",
        driveTime: "2h 45m",
        driveMinutes: 165,
        elevation: 11952,
        region: "Central CO",
        lat: 38.5125,
        lng: -106.3322,
      },
      snowfall24hr: 18,
      baseDepth: 58,
      openPercent: 100,
      walkUpPrice: 59,
      reason: "On your route to CB. More snow than CB. Ski Monarch on the way, or skip CB entirely.",
      forecasts: {
        "5day": { display: "18\"", sort: 18 },
        "10day": { display: "20-24\"", sort: 22, daily: [8, 6, 3, 2, 1, 0, 0, 1, 1, 0] },
      },
    },
  ],
  stormTracker: {
    severity: "chase",
    text: "Crested Butte: 20\" — On your pass. 3h 30m drive. Worth it?",
    region: "Southern CO",
    forecastTotal: "20\"",
    cta: "See road trip options",
  },
  recommendation: {
    onPass: "Vail — 12\" in 5 days including today's dump. Best skiing today and tomorrow. Back Bowls are loaded.",
    bestSnow: "Crested Butte — 20\" today. A story you tell for years. Extremes, Headwall, North Face all come alive.",
  },
  aiAnalysis: "Today is the day — Vail has 5\" of fresh right now and 4\" more coming tomorrow. You're 10 minutes away, get out there. Beaver Creek has 4\" today, 15 min drive. But the real outlier is Monarch with 8\" today and 6\" tomorrow — 22\" total over 10 days, more than any resort on this list. It's 2h 45m but if you want the deepest snow of the season, that's your target. A second small system arrives next Wednesday with 2\" at Vail.",
  contextBanner: "❄️ POWDER DAY — Vail 10\", Beaver Creek 8\". Both resorts loaded. Get out there.",
  timeWindows: {
    "5day": {
      dateLabel: "Next 5 Days · Feb 11-16",
      dailyLabels: ["Wed", "Thu", "Fri", "Sat", "Sun"],
      recommendation: {
        onPass: "Vail — 12\" in 5 days including today's dump. Best skiing today and tomorrow. Weekend will be packed powder.",
        bestSnow: "Crested Butte got 20\" today and could see residual moisture. If you're going, go NOW.",
      },
      contextBanner: "❄️ POWDER DAY — Vail 10\", Beaver Creek 8\". Both resorts loaded. Get out there.",
    },
    "10day": {
      dateLabel: "Next 10 Days · Feb 11-21",
      dailyLabels: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
      recommendation: {
        onPass: "Vail — 15-18\" total over 10 days. Another small system possible next week. Season is turning around.",
        bestSnow: "Crested Butte — 20\" today plus potential follow-up. CB could see 25-30\" total. Epic-ic.",
      },
      contextBanner: "❄️ Pattern change underway. Two systems in 10 days. Vail 15-18\", CB could see 25-30\" total.",
    },
  },
};

// ─── Scenario 4: PA Ikon, Quiet + Chase Brewing ─────────────────────
// 5 Day: Locally mediocre. Chase storm building out west.
// 10 Day: Local still flat. Chase storm is THE story.

export const paChaseTrip: Scenario = {
  id: "pa-chase",
  name: "PA Ikon — Chase Trip Brewing",
  description: "Quiet locally in the Poconos. Southern Colorado is about to get hammered.",
  location: "Scranton, PA",
  pass: "ikon",
  passLabel: "Ikon",
  date: "Wed Feb 4",
  yourResorts: [
    {
      resort: resorts.elkMountain,
      snowfall24hr: 1,
      baseDepth: 18,
      openPercent: 100,
      trailsOpen: 27,
      trailsTotal: 27,
      liftsOpen: 4,
      liftsTotal: 4,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "3\"", sort: 3, daily: [1, 0, 1, 1, 0] },
        "10day": { display: "4\"", sort: 4, daily: [1, 0, 1, 1, 0, 0, 0, 0, 1, 0] },
      },
    },
    {
      resort: resorts.montage,
      snowfall24hr: 1,
      baseDepth: 12,
      openPercent: 80,
      trailsOpen: 21,
      trailsTotal: 26,
      liftsOpen: 6,
      liftsTotal: 7,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "2\"", sort: 2, daily: [1, 0, 0, 1, 0] },
        "10day": { display: "3\"", sort: 3, daily: [1, 0, 0, 1, 0, 0, 0, 0, 1, 0] },
      },
    },
    {
      resort: resorts.camelback,
      snowfall24hr: 0,
      baseDepth: 8,
      openPercent: 75,
      trailsOpen: 33,
      trailsTotal: 47,
      liftsOpen: 13,
      liftsTotal: 16,
      conditions: "Machine Groomed",
      forecasts: {
        "5day": { display: "1\"", sort: 1, daily: [0, 0, 0, 1, 0] },
        "10day": { display: "2\"", sort: 2, daily: [0, 0, 0, 1, 0, 0, 0, 0, 1, 0] },
      },
    },
  ],
  worthKnowing: [
    {
      resort: resorts.killington,
      snowfall24hr: 4,
      baseDepth: 38,
      openPercent: 90,
      walkUpPrice: 0,
      reason: "6-8\" in 5 days — 2-3x your local resorts. On your Ikon pass. Worth a weekend trip to get real skiing.",
      forecasts: {
        "5day": { display: "6-8\"", sort: 7 },
        "10day": { display: "10-14\"", sort: 12, daily: [1, 1, 2, 2, 1, 0, 0, 2, 2, 1] },
      },
    },
  ],
  stormTracker: {
    severity: "chase",
    text: "S. Colorado: 18-30\" Feb 10-13. Telluride: 18-24\" · On Ikon",
    region: "Southern CO",
    forecastTotal: "18-30\"",
    dates: "Feb 10-13",
    flightPrice: "$289",
    cta: "See trip plan",
  },
  recommendation: {
    onPass: "Elk Mountain — best coverage locally (3\" in 5 days). Slim pickings in the Poconos.",
    bestSnow: "Killington — 6-8\" in 5 days, on your Ikon pass. 4h 30m drive but real skiing vs Pocono skiing.",
    bestValue: "Save your energy (and PTO) for the chase storm next week. 18-30\" in Colorado Feb 10-13.",
  },
  aiAnalysis: "Your local resorts are getting scraps — Elk Mountain leads with just 4\" over 10 days. The real play is Killington: 12\" over 10 days, on your Ikon pass. Best days are Thursday and Friday next week when 2\" hits each day. But honestly? The storm tracker is telling you to look west. Telluride is about to get 18-24\" Feb 10-13. If you can swing the trip, that's 3-4x the snow of anything on the East Coast.",
  contextBanner: "Quiet locally. The real story is the storm tracker — something big is brewing out West.",
  timeWindows: {
    "5day": {
      dateLabel: "Next 5 Days · Feb 4-9",
      dailyLabels: ["Wed", "Thu", "Fri", "Sat", "Sun"],
      recommendation: {
        onPass: "Elk Mountain — best coverage locally (3\" in 5 days). Slim pickings in the Poconos.",
        bestSnow: "Killington — 6-8\" in 5 days, on your Ikon pass. 4h 30m drive but real skiing vs Pocono skiing.",
        bestValue: "Save your energy (and PTO) for the chase storm next week. 18-30\" in Colorado Feb 10-13.",
      },
      contextBanner: "Quiet locally. The real story is the storm tracker — something big is brewing out West.",
    },
    "10day": {
      dateLabel: "Next 10 Days · Feb 4-14",
      dailyLabels: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
      recommendation: {
        onPass: "Forget local for the 10-day view. The story is Colorado: 18-30\" at Telluride, on your Ikon pass. $289 RT from EWR.",
        bestSnow: "Telluride — 18-24\" from a southern storm Feb 10-13. This is what chase mode was built for.",
        bestValue: "~$1,239 total for 3 nights, 2 powder days at Telluride. $413/powder day. Book flights NOW before they sell out.",
      },
      contextBanner: "🔴 CHASE MODE — Your local resorts: 2-4\". Telluride: 18-24\". On your pass. Book flights NOW.",
      worthKnowing: [
        {
          resort: resorts.killington,
          snowfall24hr: 4,
          baseDepth: 38,
          openPercent: 90,
          walkUpPrice: 0,
          reason: "10-14\" in 10 days including a Nor'easter mid-period. If you can't chase Colorado, Killington is your best Ikon option on the East Coast.",
          forecasts: {
            "5day": { display: "6-8\"", sort: 7 },
            "10day": { display: "10-14\"", sort: 12, daily: [1, 1, 2, 2, 1, 0, 0, 2, 2, 1] },
          },
        },
      ],
    },
  },
};

// ─── Scenario 5: Denver Epic, Big Powder Day ─────────────────────────
// Fresh overnight dump, all resorts stacked

export const denverPowderDay: Scenario = {
  id: "denver-powder",
  name: "Denver Epic — Powder Day",
  description: "8-12\" overnight across the I-70 corridor. Get out there.",
  location: "Denver, CO",
  pass: "epic",
  passLabel: "Epic",
  date: "Thu Feb 13",
  yourResorts: [
    {
      resort: resorts.vail,
      snowfall24hr: 12,
      baseDepth: 49,
      openPercent: 95,
      trailsOpen: 263,
      trailsTotal: 277,
      liftsOpen: 31,
      liftsTotal: 33,
      conditions: "Powder",
      forecasts: {
        "5day": { display: "14\"", sort: 14, daily: [4, 2, 0, 0, 0] },
        "10day": { display: "16-20\"", sort: 18, daily: [4, 2, 0, 0, 0, 0, 2, 2, 1, 0] },
      },
    },
    {
      resort: resorts.breckenridge,
      snowfall24hr: 10,
      baseDepth: 36,
      openPercent: 88,
      trailsOpen: 244,
      trailsTotal: 277,
      liftsOpen: 29,
      liftsTotal: 33,
      conditions: "Powder",
      forecasts: {
        "5day": { display: "12\"", sort: 12, daily: [3, 1, 0, 0, 0] },
        "10day": { display: "14-18\"", sort: 16, daily: [3, 1, 0, 0, 0, 0, 2, 2, 1, 0] },
      },
    },
    {
      resort: resorts.keystone,
      snowfall24hr: 8,
      baseDepth: 34,
      openPercent: 85,
      trailsOpen: 109,
      trailsTotal: 128,
      liftsOpen: 17,
      liftsTotal: 20,
      conditions: "Powder",
      forecasts: {
        "5day": { display: "10\"", sort: 10, daily: [2, 1, 0, 0, 0] },
        "10day": { display: "12-14\"", sort: 13, daily: [2, 1, 0, 0, 0, 0, 1, 2, 1, 0] },
      },
    },
  ],
  worthKnowing: [],
  stormTracker: {
    severity: "quiet",
    text: "Storm delivered. Next system possible in 6 days.",
  },
  recommendation: {
    onPass: "Vail — 12\" overnight, most on the corridor. Back Bowls will be DEEP. Leave NOW. First chair 8:30 AM.",
    bestSnow: "They're all good. Vail has the most terrain to spread the crowds.",
    bestValue: "Keystone — 8\" overnight, closest drive. Night skiing tonight to extend the day.",
  },
  aiAnalysis: "This is it — the powder day you've been waiting for. Vail has 12\" overnight with 4\" more today. Back Bowls, Blue Sky Basin, Game Creek — all loaded. Best strategy: arrive by 8 AM, hit Back Bowls first (they open at 9 AM), work your way to Blue Sky by 11 AM before it gets tracked. If Vail is too crowded, Beaver Creek has 10\" and far fewer people. This snow will be good through the weekend.",
  contextBanner: "❄️ POWDER DAY — 8-12\" overnight across the corridor. Best day of the season. GO!",
  timeWindows: {
    "5day": {
      dateLabel: "Next 5 Days · Feb 13-18",
      dailyLabels: ["Thu", "Fri", "Sat", "Sun", "Mon"],
      recommendation: {
        onPass: "Vail — 12\" overnight, 4\" more today. Back Bowls are LOADED. Leave NOW.",
        bestSnow: "All your resorts are stacked. Pick by proximity or crowd preference.",
        bestValue: "Today and tomorrow are the days. Weekend will be packed but still good.",
      },
      contextBanner: "❄️ POWDER DAY — 8-12\" overnight. Best day of the season. GO!",
    },
    "10day": {
      dateLabel: "Next 10 Days · Feb 13-23",
      dailyLabels: ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      recommendation: {
        onPass: "Vail — 16-20\" total over 10 days. Second system arriving mid-week.",
        bestSnow: "Two powder windows: Today-Friday and next Wed-Thu.",
        bestValue: "Ski today, rest this weekend, ski again next Thursday.",
      },
      contextBanner: "❄️ Two storm cycles in 10 days. Vail 16-20\" total. Season is ON.",
    },
  },
};

// ─── Scenario 6: Denver Epic, Dry Week ───────────────────────────────
// No snow in sight, groomed conditions only

export const denverDryWeek: Scenario = {
  id: "denver-flatline",
  name: "Denver Epic — Dry Week",
  description: "High pressure locked in. Groomers only for the next 10 days.",
  location: "Denver, CO",
  pass: "epic",
  passLabel: "Epic",
  date: "Mon Feb 17",
  yourResorts: [
    {
      resort: resorts.breckenridge,
      snowfall24hr: 0,
      baseDepth: 28,
      openPercent: 72,
      trailsOpen: 199,
      trailsTotal: 277,
      liftsOpen: 24,
      liftsTotal: 33,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "0\"", sort: 0, daily: [0, 0, 0, 0, 0] },
        "10day": { display: "0-2\"", sort: 1, daily: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1] },
      },
    },
    {
      resort: resorts.vail,
      snowfall24hr: 0,
      baseDepth: 40,
      openPercent: 68,
      trailsOpen: 188,
      trailsTotal: 277,
      liftsOpen: 22,
      liftsTotal: 33,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "0\"", sort: 0, daily: [0, 0, 0, 0, 0] },
        "10day": { display: "0-2\"", sort: 1, daily: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1] },
      },
    },
    {
      resort: resorts.keystone,
      snowfall24hr: 0,
      baseDepth: 26,
      openPercent: 75,
      trailsOpen: 96,
      trailsTotal: 128,
      liftsOpen: 15,
      liftsTotal: 20,
      conditions: "Groomed",
      forecasts: {
        "5day": { display: "0\"", sort: 0, daily: [0, 0, 0, 0, 0] },
        "10day": { display: "0-1\"", sort: 0.5, daily: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] },
      },
    },
  ],
  worthKnowing: [],
  stormTracker: {
    severity: "quiet",
    text: "High pressure dominates. No significant snow in the extended forecast.",
  },
  recommendation: {
    onPass: "Breckenridge — best grooming operation on your pass. Peak 6 bowls hold snow well.",
    bestValue: "Keystone — closest drive, night skiing makes it a full day without the long drive home in the dark.",
  },
  aiAnalysis: "Not much to work with here — high pressure is locked in and models show no relief for 10+ days. If you're going to ski, focus on quality groomers. Breckenridge has the best grooming crew and Peak 6 holds snow better than most. Vail's front side grooms well. Avoid Back Bowls — they're baked out. Consider taking the week off and waiting for the next cycle. Spring skiing starts in March.",
  contextBanner: "☀️ High pressure pattern. Groomed skiing only. Next storm possible late February.",
  timeWindows: {
    "5day": {
      dateLabel: "Next 5 Days · Feb 17-22",
      dailyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      recommendation: {
        onPass: "Breckenridge — best groomers. Go early, leave by 2 PM when conditions soften.",
        bestValue: "Save your days for when it snows. Nothing special happening this week.",
      },
      contextBanner: "☀️ Dry pattern. Groomed skiing only. Manage expectations.",
    },
    "10day": {
      dateLabel: "Next 10 Days · Feb 17-27",
      dailyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"],
      recommendation: {
        onPass: "No snow in sight. If you must ski, Breckenridge or Keystone for quality groomers.",
        bestValue: "Honestly? Take the week off. Save your energy and PTO for the next cycle.",
      },
      contextBanner: "☀️ Extended dry pattern. Models show possible change late month. Check back next week.",
    },
  },
};

// ─── All scenarios ───────────────────────────────────────────────────

export const scenarios: Scenario[] = [
  denverDryWeekend,
  denverStormIncoming,
  avonPowderDay,
  paChaseTrip,
  denverPowderDay,
  denverDryWeek,
];

// ─── Chase Mode Data ─────────────────────────────────────────────────

export const chaseRegions: ChaseRegion[] = [
  {
    id: "co-south",
    name: "Southern Colorado",
    severity: "chase",
    forecastTotal: "18-30\"",
    dates: "Feb 10-13",
    resorts: ["Crested Butte", "Telluride", "Silverton", "Wolf Creek", "Purgatory", "Monarch"],
    description: "Deep southern storm. Could be biggest of the year.",
    bestAirport: "MTJ",
  },
  {
    id: "co-central",
    name: "Central Colorado",
    severity: "significant",
    forecastTotal: "8-14\"",
    dates: "Feb 10-12",
    resorts: ["Vail", "Beaver Creek", "Aspen", "Steamboat"],
    description: "Same storm system, less totals on the I-70.",
    bestAirport: "DEN",
  },
  {
    id: "ut-cottonwoods",
    name: "Utah (Cottonwoods)",
    severity: "moderate",
    forecastTotal: "6-10\"",
    dates: "Feb 11-13",
    resorts: ["Alta", "Snowbird", "Brighton", "Solitude"],
    description: "Tail end of the Colorado storm clips Utah.",
    bestAirport: "SLC",
  },
  {
    id: "ca-tahoe",
    name: "California / Tahoe",
    severity: "quiet",
    forecastTotal: "0-2\"",
    dates: "",
    resorts: ["Palisades", "Kirkwood", "Heavenly"],
    description: "Dry pattern continues.",
  },
  {
    id: "pnw",
    name: "Pacific Northwest",
    severity: "quiet",
    forecastTotal: "2-4\"",
    dates: "",
    resorts: ["Mt. Baker", "Crystal", "Stevens Pass"],
    description: "Light refresh.",
  },
  {
    id: "northeast",
    name: "Northeast",
    severity: "quiet",
    forecastTotal: "1-3\"",
    dates: "",
    resorts: ["Killington", "Stowe", "Jay Peak", "Sugarloaf"],
    description: "Weak clipper system.",
  },
  {
    id: "wy-mt",
    name: "Wyoming / Montana",
    severity: "quiet",
    forecastTotal: "0-2\"",
    dates: "",
    resorts: ["Jackson Hole", "Big Sky", "Grand Targhee"],
    description: "Dry.",
  },
];

// ─── Trip Plan (PA → Telluride) ──────────────────────────────────────

export const tellurideTripPlan: TripPlan = {
  destination: "Telluride, CO",
  dates: "Feb 11-14 (Wed-Sat)",
  nights: 3,
  flights: [
    {
      route: "EWR → MTJ",
      price: 289,
      details: "United, Tue 2pm → 6pm local. 1h 15m drive to Telluride.",
    },
    {
      route: "EWR → DEN",
      price: 180,
      details: "Cheaper but 6hr drive to Telluride. Only if hitting I-70 resorts too.",
    },
  ],
  lodging: [
    { name: "Hotel Telluride", price: 195, note: "Walk to gondola" },
    { name: "Airbnb avg", price: 160, note: "Town of Telluride" },
    { name: "Mountain Lodge", price: 250, note: "Ski-in/ski-out, Mountain Village" },
  ],
  rentalCar: { price: 55, note: "From Montrose. AWD recommended. Book now — limited." },
  liftTickets: { onPass: true, dailyPrice: 189 },
  skiPlan: [
    { day: "Wed Feb 11", plan: "Storm still active. Ski PM if lifts open. Tree runs hold best in wind." },
    { day: "Thu Feb 12", plan: "POWDER DAY. First chair 9am. Hit Revelation Bowl first. Prospect Bowl by 11am. Gold Hill trees PM." },
    { day: "Fri Feb 13", plan: "Day 2 powder. Steeps + trees still have stashes. Less frantic than Day 1." },
    { day: "Sat Feb 14", plan: "Groomed + packed powder. Cruise. Depart for Montrose by 2pm for evening flight." },
  ],
  totalEstimate: 1746,
  totalWithPass: 1239,
  costPerPowderDay: 413,
};

// ─── Resort Detail (Vail) ────────────────────────────────────────────

export const vailForecast: DailyForecast[] = [
  { day: "Thu", date: "Feb 6", snowfall: 0, tempHigh: 32, tempLow: 15, wind: 5, icon: "sunny", conditions: "Clear" },
  { day: "Fri", date: "Feb 7", snowfall: 0, tempHigh: 35, tempLow: 18, wind: 8, icon: "sunny", conditions: "Clear" },
  { day: "Sat", date: "Feb 8", snowfall: 0, tempHigh: 33, tempLow: 16, wind: 6, icon: "partly-cloudy", conditions: "Partly cloudy" },
  { day: "Sun", date: "Feb 9", snowfall: 0, tempHigh: 30, tempLow: 14, wind: 10, icon: "cloudy", conditions: "Cloudy" },
  { day: "Mon", date: "Feb 10", snowfall: 1, tempHigh: 25, tempLow: 10, wind: 15, icon: "cloudy", conditions: "Light snow possible" },
  { day: "Tue", date: "Feb 11", snowfall: 5, tempHigh: 20, tempLow: 8, wind: 20, icon: "snow", conditions: "Snow likely" },
  { day: "Wed", date: "Feb 12", snowfall: 4, tempHigh: 18, tempLow: 5, wind: 25, icon: "heavy-snow", conditions: "Heavy snow" },
  { day: "Thu", date: "Feb 13", snowfall: 2, tempHigh: 22, tempLow: 8, wind: 15, icon: "snow", conditions: "Snow showers" },
  { day: "Fri", date: "Feb 14", snowfall: 0, tempHigh: 28, tempLow: 12, wind: 8, icon: "partly-cloudy", conditions: "Clearing" },
  { day: "Sat", date: "Feb 15", snowfall: 0, tempHigh: 30, tempLow: 14, wind: 5, icon: "sunny", conditions: "Clear, packed powder" },
];

export const vailDetail: ResortDetail = {
  resort: resorts.vail,
  conditions: denverStormIncoming.yourResorts[0],
  forecast: vailForecast,
  aiAnalysis: "Vail is the #1 resort on your pass right now. 5\" hitting Wednesday, 4\" Thursday — Back Bowls will be loaded by Wednesday afternoon. Best powder day: Thursday Feb 13. Leave by 6:30 AM to beat the crowds.",
  contextBanner: "Ranked #1 — most snow forecast on your pass.",
  seasonTotal: 90,
  snowpackPercent: 55,
};
