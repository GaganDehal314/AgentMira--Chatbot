import { Property } from "../types";

type Props = {
  property: Property;
  saved?: boolean;
  onSave?: (id: string) => void;
  onUnsave?: (id: string) => void;
};

export function PropertyCard({ property, saved, onSave, onUnsave }: Props) {
  return (
    <div className="card">
      <img
        src={property.images?.[0]}
        alt={property.title}
        style={{ width: "100%", borderRadius: 12, objectFit: "cover", maxHeight: 180 }}
      />
      <h3 style={{ margin: "12px 0 6px" }}>{property.title}</h3>
      <div style={{ color: "#475569" }}>{property.location}</div>
      <div style={{ fontWeight: 600, margin: "8px 0" }}>${property.price.toLocaleString()}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="pill">{property.bedrooms} bd</span>
        <span className="pill">{property.bathrooms} ba</span>
        {property.size && <span className="pill">{property.size} sqft</span>}
      </div>
      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
        {property.amenities.slice(0, 4).map((a) => (
          <span key={a} className="pill">
            {a}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        {!saved && onSave && (
          <button onClick={() => onSave(property.id)} style={{ flex: 1 }}>
            Save
          </button>
        )}
        {saved && onUnsave && (
          <button onClick={() => onUnsave(property.id)} style={{ flex: 1 }}>
            Unsave
          </button>
        )}
      </div>
    </div>
  );
}

