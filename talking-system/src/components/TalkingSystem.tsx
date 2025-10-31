import React, { useEffect, useState } from "react";

const PRONOUNS = ["I", "We", "My"] as const;
type Pronoun = typeof PRONOUNS[number];

const BASE_PHRASES = ["sleeping", "watch tv", "hungry", "help", "eat"] as const;

const activityMap: Record<string, string[]> = {
  sleep: ["go to sleep", "take a nap", "set a sleep timer", "talk about sleep schedule"],
  sleeping: ["go to sleep", "nap for 30 minutes", "adjust sleeping schedule", "sleep well wishes"],
  "watch tv": ["watch TV", "change channel", "start streaming", "recommend a show"],
  watch: ["watch TV", "watch a movie", "turn on the show", "choose what to watch"],
  eat: ["have dinner", "order food", "prepare a snack", "set mealtime reminder"],
  hungry: ["grab something to eat", "order food", "prepare a snack", "drink water"],
  help: ["call for help", "need assistance", "send emergency alert"],
};

function buildPrompt(pronoun: Pronoun, base: string, activity: string) {
  const a = activity.trim();
  if (pronoun === "My") {
    if (/^my\b/i.test(a)) return a;
    return `My ${a}`;
  }
  if (pronoun === "I") {
    if (/^(go to |take |set |watch |order |prepare |call |need |send )/i.test(a)) return `I ${a}`;
    return `I want to ${a}`;
  }
  if (/^(watch|prepare|order|start|choose|set)/i.test(a)) return `Let's ${a}`;
  return `We will ${a}`;
}

function generateSuggestions(base: string) {
  const key = base.trim().toLowerCase();
  const suggestions: string[] = [];
  if (activityMap[key]) suggestions.push(...activityMap[key]);
  const tokens = key.split(/\s+/).filter(Boolean);
  if (tokens.length) {
    const root = tokens[0];
    if (activityMap[root]) suggestions.push(...activityMap[root]);
  }
  suggestions.push(base, `think about ${base}`, `set reminder for ${base}`);
  return Array.from(new Set(suggestions)).slice(0, 8);
}

export default function TalkingSystem(): JSX.Element {
  const [activePronoun, setActivePronoun] = useState<Pronoun>("I");
  const [basePhrase, setBasePhrase] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      if (loadedVoices.length > 0) {
        setVoices(loadedVoices);
        setVoicesLoaded(true);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleBaseSelect = (base: string) => {
    setBasePhrase(base);
    setSuggestions(generateSuggestions(base));
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech Synthesis not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const englishVoice = voices.find((v) => /en/i.test(v.lang));
    if (englishVoice) utter.voice = englishVoice;
    utter.rate = 1;
    utter.pitch = 1;

    setTimeout(() => {
      window.speechSynthesis.speak(utter);
    }, 100);

    setHistory((h) => [`${new Date().toLocaleTimeString()} — ${text}`, ...h].slice(0, 20));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #0ea5a4 0%, #2563eb 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          color: "#0f172a",
          padding: 30,
          borderRadius: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: 900,
          height: "auto",
        }}
      >
        <h1 style={{ margin: 0, textAlign: "center" }}>Talking Prompt Generator</h1>
        <p style={{ color: "#334155", textAlign: "center" }}>
          Select a perspective, choose a base phrase, then click a suggestion to speak it aloud.
        </p>

        {/* Pronoun Selection */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <strong>Perspective</strong>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
            {PRONOUNS.map((p) => (
              <button
                key={p}
                onClick={() => setActivePronoun(p)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: activePronoun === p ? "none" : "1px solid #e2e8f0",
                  background: activePronoun === p ? "#0ea5a4" : "#fff",
                  color: activePronoun === p ? "#fff" : "#0f172a",
                  cursor: "pointer",
                  transition: "0.2s ease",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Base Phrase Selection */}
        <div style={{ marginTop: 24 }}>
          <strong>Base Phrase</strong>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
            {BASE_PHRASES.map((base) => (
              <button
                key={base}
                onClick={() => handleBaseSelect(base)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: basePhrase === base ? "none" : "1px solid #e2e8f0",
                  background: basePhrase === base ? "#2563eb" : "#fff",
                  color: basePhrase === base ? "#fff" : "#0f172a",
                  cursor: "pointer",
                  transition: "0.2s ease",
                }}
              >
                {base}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {basePhrase && (
          <div style={{ marginTop: 24 }}>
            <strong>Suggestions</strong>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {suggestions.map((s, i) => {
                const txt = buildPrompt(activePronoun, basePhrase, s);
                return (
                  <button
                    key={i}
                    onClick={() => speakText(txt)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 8,
                      border: "1px dashed #cbd5e1",
                      background: "#000",
                      color: "#fff",
                      cursor: "pointer",
                      transition: "0.2s ease",
                    }}
                  >
                    {txt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* History */}
        <div style={{ marginTop: 24 }}>
          <strong>History</strong>
          <div style={{ marginTop: 8, background: "#f8fafc", borderRadius: 8, padding: 10, maxHeight: 150, overflowY: "auto" }}>
            {history.length === 0 ? (
              <div style={{ color: "#64748b" }}>No messages yet.</div>
            ) : (
              history.map((h, idx) => (
                <div key={idx} style={{ padding: "6px 0", borderBottom: "1px solid #e2e8f0", fontSize: 13 }}>
                  {h}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Voice Status */}
        <div style={{ marginTop: 16, textAlign: "center", color: "#64748b", fontSize: 13 }}>
          <div>Voice status: {voicesLoaded ? "✅ loaded" : "⏳ loading..."}</div>
          <div>Speech works best on Chrome / Edge with HTTPS or localhost.</div>
        </div>
      </div>
    </div>
  );
}
