import { Property } from '@/types';
import { PropertyCard } from './PropertyCard';
import { Heart } from 'lucide-react';

interface SavedListProps {
  properties: Property[];
  selectedPropertyIds: Set<string>;
  onSelectProperty: (property: Property) => void;
  onUnsaveProperty: (property: Property) => void;
}

export function SavedList({
  properties,
  selectedPropertyIds,
  onSelectProperty,
  onUnsaveProperty,
}: SavedListProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Heart className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No saved properties</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Click the heart icon on any property to save it here for later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Saved Properties
        </h3>
        <span className="text-sm text-muted-foreground">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {properties.map((property, index) => (
          <div
            key={property.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PropertyCard
              property={property}
              isSelected={selectedPropertyIds.has(property.id)}
              isSaved={true}
              onSelect={onSelectProperty}
              onUnsave={onUnsaveProperty}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
