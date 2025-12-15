import { useState } from "react";
import { predictComparison } from "../services/api";
import { PredictedProperty } from "../types";
import { PropertyCard } from "./PropertyCard";

export function Compare() {
  const [addressA, setAddressA] = useState("123 Main St, New York, NY");
  const [addressB, setAddressB] = useState("456 Ocean Dr, Miami, FL");
  const [results, setResults] = useState<PredictedProperty[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictComparison(addressA, addressB);
      setResults(res.properties);
    } catch (err) {
      setError("Unable to compare right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Compare & Predict</h3>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <input value={addressA} onChange={(e) => setAddressA(e.target.value)} placeholder="Address A" />
        <input value={addressB} onChange={(e) => setAddressB(e.target.value)} placeholder="Address B" />
        <button onClick={handleCompare} disabled={loading}>
          {loading ? "Predicting..." : "Compare"}
        </button>
      </div>
      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
      {results && (
        <div className="grid" style={{ marginTop: 12 }}>
          {results.map((p) => (
            <div key={p.id}>
              <PropertyCard property={p} />
              <div style={{ marginTop: 8, fontWeight: 600 }}>Estimated: ${p.predicted_price.toLocaleString()}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: "#475569" }}>
                Type: {p.features.property_type} · Beds: {p.features.bedrooms} · Baths: {p.features.bathrooms} ·
                School: {p.features.school_rating}/10
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


