export const PRONOUNS = ["I", "We", "My"] as const;
export type Pronoun = typeof PRONOUNS[number];

export const BASE_PHRASES = ["sleeping", "watch tv", "hungry", "help", "eat"] as const;

const activityMap: Record<string, string[]> = {
  sleep: ["go to sleep", "take a nap", "set a sleep timer", "talk about sleep schedule"],
  sleeping: ["go to sleep", "nap for 30 minutes", "adjust sleeping schedule", "sleep well wishes"],
  "watch tv": ["watch TV", "change channel", "start streaming", "recommend a show"],
  watch: ["watch TV", "watch a movie", "turn on the show", "choose what to watch"],
  eat: ["have dinner", "order food", "prepare a snack", "set mealtime reminder"],
  hungry: ["grab something to eat", "order food", "prepare a snack", "drink water"],
  help: ["call for help", "need assistance", "send emergency alert"],
};

export function buildPrompt(pronoun: Pronoun, base: string, activity: string) {
  const a = activity.trim();
  if (pronoun === "My") return /^my\b/i.test(a) ? a : `My ${a}`;
  if (pronoun === "I")
    return /^(go to |take |set |watch |order |prepare |call |need |send )/i.test(a)
      ? `I ${a}`
      : `I want to ${a}`;
  return /^(watch|prepare|order|start|choose|set)/i.test(a) ? `Let's ${a}` : `We will ${a}`;
}

export function generateSuggestions(base: string) {
  const key = base.trim().toLowerCase();
  const suggestions: string[] = [];
  if (activityMap[key]) suggestions.push(...activityMap[key]);
  const tokens = key.split(/\s+/).filter(Boolean);
  if (tokens.length && activityMap[tokens[0]]) suggestions.push(...activityMap[tokens[0]]);
  suggestions.push(base, `think about ${base}`, `set reminder for ${base}`);
  return Array.from(new Set(suggestions)).slice(0, 8);
}
