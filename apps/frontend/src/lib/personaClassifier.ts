import {
  OnboardingSignals,
  PersonaType,
  UserPersona,
  SkiFrequency,
  GroupType,
  DecisionTrigger,
  ExperienceLevel,
} from "@/data/types";

// Weighted scoring matrix for persona classification
// Each persona has weights for different signals
interface PersonaWeights {
  frequency: Record<SkiFrequency, number>;
  groupType: Record<GroupType, number>;
  triggers: Record<DecisionTrigger, number>;
  experience: Record<ExperienceLevel, number>;
  hasChildren: number;
  passBonus: Record<string, number>;
}

const personaWeights: Record<PersonaType, PersonaWeights> = {
  "core-local": {
    frequency: { core: 3, regular: 1, casual: -1 },
    groupType: { solo: 1, partner: 1, family: 0, friends: 0 },
    triggers: { snow: 2, time: 0, deal: -1, planned: 0 },
    experience: { expert: 2, advanced: 1, intermediate: 0, beginner: -2 },
    hasChildren: -1,
    passBonus: { epic: 0, ikon: 0, indy: 0, multi: 0, none: -1 },
  },
  "storm-chaser": {
    frequency: { core: 1, regular: 1, casual: 0 },
    groupType: { solo: 2, partner: 1, family: -1, friends: 1 },
    triggers: { snow: 3, time: 0, deal: 0, planned: 1 },
    experience: { expert: 2, advanced: 1, intermediate: 0, beginner: -2 },
    hasChildren: -2,
    passBonus: { epic: 0, ikon: 0, indy: 1, multi: 1, none: 0 },
  },
  "family-planner": {
    frequency: { core: 0, regular: 1, casual: 1 },
    groupType: { solo: -2, partner: 0, family: 3, friends: -1 },
    triggers: { snow: 0, time: 1, deal: 1, planned: 2 },
    experience: { expert: 0, advanced: 0, intermediate: 1, beginner: 1 },
    hasChildren: 3,
    passBonus: { epic: 0, ikon: 0, indy: 0, multi: 0, none: 0 },
  },
  "weekend-warrior": {
    frequency: { core: -1, regular: 2, casual: 1 },
    groupType: { solo: 0, partner: 1, family: 0, friends: 1 },
    triggers: { snow: 1, time: 2, deal: 1, planned: 0 },
    experience: { expert: 0, advanced: 1, intermediate: 1, beginner: 0 },
    hasChildren: 0,
    passBonus: { epic: 0, ikon: 0, indy: 1, multi: 1, none: 0 },
  },
  "resort-loyalist": {
    frequency: { core: 2, regular: 1, casual: 0 },
    groupType: { solo: 1, partner: 1, family: 1, friends: 0 },
    triggers: { snow: 0, time: 1, deal: 0, planned: 2 },
    experience: { expert: 1, advanced: 1, intermediate: 1, beginner: 0 },
    hasChildren: 0,
    passBonus: { epic: 1, ikon: 1, indy: 0, multi: -1, none: 0 },
  },
  "learning-curve": {
    frequency: { core: -1, regular: 0, casual: 2 },
    groupType: { solo: 0, partner: 1, family: 1, friends: 1 },
    triggers: { snow: -1, time: 1, deal: 1, planned: 1 },
    experience: { expert: -3, advanced: -2, intermediate: 1, beginner: 3 },
    hasChildren: 0,
    passBonus: { epic: 0, ikon: 0, indy: 0, multi: 0, none: 1 },
  },
  "social-skier": {
    frequency: { core: 0, regular: 1, casual: 1 },
    groupType: { solo: -2, partner: 1, family: 0, friends: 3 },
    triggers: { snow: 0, time: 1, deal: 1, planned: 1 },
    experience: { expert: 0, advanced: 0, intermediate: 1, beginner: 0 },
    hasChildren: 0,
    passBonus: { epic: 0, ikon: 0, indy: 0, multi: 0, none: 0 },
  },
  "luxury-seeker": {
    frequency: { core: 0, regular: 1, casual: 1 },
    groupType: { solo: 0, partner: 2, family: 0, friends: 0 },
    triggers: { snow: 1, time: 0, deal: -2, planned: 2 },
    experience: { expert: 1, advanced: 1, intermediate: 0, beginner: 0 },
    hasChildren: 0,
    passBonus: { epic: 1, ikon: 1, indy: -1, multi: 0, none: 1 },
  },
  "budget-maximizer": {
    frequency: { core: 0, regular: 1, casual: 1 },
    groupType: { solo: 0, partner: 0, family: 1, friends: 1 },
    triggers: { snow: 0, time: 0, deal: 3, planned: 0 },
    experience: { expert: 0, advanced: 0, intermediate: 1, beginner: 1 },
    hasChildren: 1,
    passBonus: { epic: 0, ikon: 0, indy: 2, multi: 1, none: 0 },
  },
};

function calculateScore(
  signals: OnboardingSignals,
  passType: string,
  weights: PersonaWeights
): number {
  let score = 0;

  // Frequency score
  score += weights.frequency[signals.frequency] || 0;

  // Group type score
  score += weights.groupType[signals.groupType] || 0;

  // Decision triggers (sum up all selected triggers)
  for (const trigger of signals.decisionTriggers) {
    score += weights.triggers[trigger] || 0;
  }

  // Experience level score
  score += weights.experience[signals.experienceLevel] || 0;

  // Children bonus (if family with kids)
  if (signals.groupType === "family" && signals.childAges && signals.childAges.length > 0) {
    score += weights.hasChildren;
  }

  // Pass type bonus
  score += weights.passBonus[passType] || 0;

  return score;
}

export function classifyPersona(
  signals: OnboardingSignals,
  passType: string
): UserPersona {
  const scores: { persona: PersonaType; score: number }[] = [];

  // Calculate scores for each persona
  for (const [personaId, weights] of Object.entries(personaWeights)) {
    const score = calculateScore(signals, passType, weights);
    scores.push({ persona: personaId as PersonaType, score });
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  const primary = scores[0];
  const secondary = scores[1];

  // Calculate confidence based on gap between top scores
  // Higher gap = higher confidence
  const gap = primary.score - secondary.score;
  const maxPossibleGap = 15; // Rough estimate of max gap
  const confidence = Math.min(0.95, Math.max(0.5, 0.5 + (gap / maxPossibleGap) * 0.45));

  const result: UserPersona = {
    primary: primary.persona,
    confidence,
    signals,
  };

  // Only include secondary if it's close enough to primary
  if (secondary.score > 0 && gap < 3) {
    result.secondary = secondary.persona;
  }

  return result;
}

// Helper to get readable description of why a persona was chosen
export function getClassificationReason(userPersona: UserPersona): string {
  const { primary, signals } = userPersona;

  const reasons: string[] = [];

  switch (primary) {
    case "core-local":
      if (signals.frequency === "core") reasons.push("skiing 20+ days");
      if (signals.decisionTriggers.includes("snow")) reasons.push("chasing fresh snow");
      if (signals.experienceLevel === "expert" || signals.experienceLevel === "advanced") {
        reasons.push("advanced skills");
      }
      break;
    case "storm-chaser":
      if (signals.decisionTriggers.includes("snow")) reasons.push("fresh snow priority");
      if (signals.groupType === "solo" || signals.groupType === "partner") {
        reasons.push("flexible travel");
      }
      break;
    case "family-planner":
      if (signals.groupType === "family") reasons.push("skiing with family");
      if (signals.childAges && signals.childAges.length > 0) reasons.push("kids in tow");
      break;
    case "weekend-warrior":
      if (signals.frequency === "regular") reasons.push("regular ski schedule");
      if (signals.decisionTriggers.includes("time")) reasons.push("time-conscious");
      break;
    case "learning-curve":
      if (signals.experienceLevel === "beginner") reasons.push("building skills");
      break;
    case "budget-maximizer":
      if (signals.decisionTriggers.includes("deal")) reasons.push("deal-focused");
      break;
    case "social-skier":
      if (signals.groupType === "friends") reasons.push("skiing with friends");
      break;
    default:
      break;
  }

  return reasons.length > 0 ? reasons.join(", ") : "your preferences";
}
