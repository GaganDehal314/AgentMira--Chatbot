import { Property } from "../types";
import { PropertyCard } from "./PropertyCard";

type Props = {
  saved: Property[];
  onUnsave: (id: string) => void;
};

export function SavedList({ saved, onUnsave }: Props) {
  return (
    <div className="card">
      <h3>Saved properties</h3>
      {saved.length === 0 && <div>No saved properties yet.</div>}
      <div className="grid">
        {saved.map((p) => (
          <PropertyCard key={p.id} property={p} saved onUnsave={onUnsave} />
        ))}
      </div>
    </div>
  );
}

