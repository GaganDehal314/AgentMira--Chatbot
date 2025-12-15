import { FormEvent, useMemo, useState } from "react";
import { Property } from "../types";
import { PropertyCard } from "./PropertyCard";
import { nlpParse, searchProperties } from "../services/api";

type Message =
  | { role: "user"; text: string; source?: "chat" | "filter" }
  | { role: "bot"; text: string; results?: Property[]; source?: "chat" | "filter"; searchParams?: Record<string, any> };

const defaultFilters = { location: "", min_price: "", max_price: "", min_bedrooms: "", amenities: "" };

type Props = {
  saved: Property[];
  onSave: (id: string) => Promise<void>;
  onUnsave: (id: string) => Promise<void>;
  onRefreshSaved: () => Promise<void>;
};

export function Chat({ saved, onSave, onUnsave, onRefreshSaved }: Props) {
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: "Hi! Tell me your budget and location." }]);
  const [input, setInput] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = useMemo(() => localStorage.getItem("userId") || "demo-user", []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input, source: "chat" };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      const parsed = await nlpParse(input);
      
      // Show text message if present (always show the LLM's conversational response)
      if (parsed.text) {
        const textMsg: Message = {
          role: "bot",
          text: parsed.text,
          source: "chat",
        };
        setMessages((prev) => [...prev, textMsg]);
      }
      
      // If filters are present, perform search (can happen alongside text)
      if (parsed.filters && Object.keys(parsed.filters).length > 0) {
        const searchFilters = { ...filtersFromState(filters), ...parsed.filters };
        await performSearch(searchFilters, "chat");
      }
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const filtersFromState = (state: typeof defaultFilters) => ({
    location: state.location || undefined,
    min_price: state.min_price ? Number(state.min_price) : undefined,
    max_price: state.max_price ? Number(state.max_price) : undefined,
    min_bedrooms: state.min_bedrooms ? Number(state.min_bedrooms) : undefined,
    amenities: state.amenities ? state.amenities.split(",").map((a) => a.trim()) : undefined,
  });

  const performSearch = async (searchFilters: Record<string, any>, source: "chat" | "filter" = "chat") => {
    const res = await searchProperties(searchFilters);
    setResults(res.results);
    const botMsg: Message = {
      role: "bot",
      text: res.results.length ? `Found ${res.results.length} ${res.results.length === 1 ? "option" : "options"}.` : "No matches, try adjusting filters.",
      results: res.results,
      source: source,
      searchParams: searchFilters, // Show search params for both filter and chat to help debug
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  const handleFilterSearch = async () => {
    setLoading(true);
    try {
      const searchFilters = filtersFromState(filters);
      await performSearch(searchFilters, "filter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat">
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="Ask: Show 3BR homes in Austin under 500k..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>

      <div className="card">
        <h3>Quick filters</h3>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          />
          <input
            placeholder="Min price"
            value={filters.min_price}
            onChange={(e) => setFilters((f) => ({ ...f, min_price: e.target.value }))}
          />
          <input
            placeholder="Max price"
            value={filters.max_price}
            onChange={(e) => setFilters((f) => ({ ...f, max_price: e.target.value }))}
          />
          <input
            placeholder="Min bedrooms"
            value={filters.min_bedrooms}
            onChange={(e) => setFilters((f) => ({ ...f, min_bedrooms: e.target.value }))}
          />
          <input
            placeholder="Amenities (comma separated)"
            value={filters.amenities}
            onChange={(e) => setFilters((f) => ({ ...f, amenities: e.target.value }))}
          />
        </div>
        <button style={{ marginTop: 10 }} onClick={handleFilterSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="card">
        <h3>Chat</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "stretch" }}>
          {messages.map((m, idx) => {
            const isFilterSource = m.source === "filter";
            const isUserMessage = m.role === "user";
            const isFilterBotMessage = m.role === "bot" && isFilterSource;
            const isChatBotMessage = m.role === "bot" && !isFilterSource;
            const hasSearchParams = m.role === "bot" && m.searchParams && Object.keys(m.searchParams).length > 0;
            const isConversationalMessage = isChatBotMessage && !hasSearchParams;
            
            return (
              <div key={idx} style={{ marginBottom: isFilterBotMessage ? "8px" : "0", display: "flex", flexDirection: "column", alignItems: isUserMessage ? "flex-end" : "flex-start" }}>
                {/* Section header for filter searches - Grey background */}
                {isFilterBotMessage && (
                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "6px 12px",
                      borderRadius: "8px 8px 0 0",
                      fontSize: "11px",
                      color: "#475569",
                      fontWeight: 600,
                      borderBottom: "1px solid #cbd5e1",
                      maxWidth: 480,
                      alignSelf: "flex-start",
                    }}
                  >
                    🔍 Quick Filter Search
                  </div>
                )}
                
                {/* Section header for chat messages with search results - White background */}
                {isChatBotMessage && hasSearchParams && idx > 0 && (
                  <div
                    style={{
                      background: "#ffffff",
                      padding: "6px 12px",
                      borderRadius: "8px 8px 0 0",
                      fontSize: "11px",
                      color: "#475569",
                      fontWeight: 600,
                      borderBottom: "1px solid #e2e8f0",
                      maxWidth: 480,
                      alignSelf: "flex-start",
                    }}
                  >
                    💬 Chat Response
                  </div>
                )}
                
                {/* Message container with background based on source */}
                <div
                  style={{
                    background: isFilterBotMessage ? "#f8fafc" : (isChatBotMessage && hasSearchParams) ? "#ffffff" : "transparent",
                    padding: "0",
                    borderRadius: isFilterBotMessage ? "0 0 8px 8px" : (isChatBotMessage && hasSearchParams) ? "0 0 8px 8px" : "0",
                    border: (isFilterBotMessage || (isChatBotMessage && hasSearchParams)) ? "1px solid #e2e8f0" : "none",
                    borderTop: (isFilterBotMessage || (isChatBotMessage && hasSearchParams)) ? "none" : undefined,
                    maxWidth: 480,
                    alignSelf: isUserMessage ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: isUserMessage ? "#2563eb" : isFilterBotMessage ? "#f8fafc" : (isChatBotMessage && hasSearchParams) ? "#ffffff" : "#e2e8f0",
                      color: isUserMessage ? "#fff" : "#0f172a",
                      padding: "10px 12px",
                      borderRadius: isFilterBotMessage || (isChatBotMessage && hasSearchParams) ? "0 0 8px 8px" : "10px",
                    }}
                  >
                    {m.text}
                    
                    {/* Show search parameters for filter searches and chat messages with search results */}
                    {m.role === "bot" && m.searchParams && (isFilterBotMessage || (isChatBotMessage && hasSearchParams)) && (
                      <div
                        style={{
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px solid #e2e8f0",
                          fontSize: "9px",
                          color: "#64748b",
                          lineHeight: "1.5",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: "4px", fontSize: "10px" }}>Search filters used:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {Object.entries(m.searchParams)
                            .filter(([_, value]) => value !== undefined && value !== null && value !== "")
                            .map(([key, value]) => (
                              <span
                                key={key}
                                style={{
                                  background: "#e2e8f0",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  display: "inline-block",
                                  fontSize: "9px",
                                }}
                              >
                                {key.replace(/_/g, " ")}: {Array.isArray(value) ? value.join(", ") : String(value)}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {results.length > 0 && (
        <div className="card">
          <h3>Results</h3>
          <div className="grid">
            {results.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                saved={saved.some((s) => s.id === p.id)}
                onSave={onSave}
                onUnsave={onUnsave}
              />
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <button onClick={onRefreshSaved}>Refresh saved</button>
      </div>
    </div>
  );
}

