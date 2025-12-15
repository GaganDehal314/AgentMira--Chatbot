import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PropertyFilters } from '@/types';
import { cn } from '@/lib/utils';

interface QuickFiltersProps {
  onSearch: (filters: PropertyFilters) => void;
  isLoading?: boolean;
}

const priceRanges = [
  { label: 'Under $500K', min: 0, max: 500000 },
  { label: '$500K - $1M', min: 500000, max: 1000000 },
  { label: '$1M - $2M', min: 1000000, max: 2000000 },
  { label: '$2M+', min: 2000000, max: undefined },
];

const bedroomOptions = [1, 2, 3, 4, 5];

const amenityOptions = ['Pool', 'Gym', 'Parking', 'Garden', 'Balcony', 'Fireplace'];

export function QuickFilters({ onSearch, isLoading }: QuickFiltersProps) {
  const [location, setLocation] = useState('');
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    const filters: PropertyFilters = {};

    if (location.trim()) {
      filters.location = [location.trim()];
    }

    if (selectedPrice !== null) {
      const range = priceRanges[selectedPrice];
      filters.min_price = range.min;
      if (range.max) filters.max_price = range.max;
    }

    if (selectedBedrooms !== null) {
      filters.min_bedrooms = selectedBedrooms;
    }

    if (selectedAmenities.length > 0) {
      filters.amenities = selectedAmenities;
    }

    onSearch(filters);
  };

  const handleClear = () => {
    setLocation('');
    setSelectedPrice(null);
    setSelectedBedrooms(null);
    setSelectedAmenities([]);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const hasFilters = location || selectedPrice !== null || selectedBedrooms !== null || selectedAmenities.length > 0;

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4 shadow-sm">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(showAdvanced && 'bg-secondary')}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Price range pills */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Price Range</label>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range, index) => (
            <button
              key={range.label}
              onClick={() => setSelectedPrice(selectedPrice === index ? null : index)}
              className={cn(
                'filter-pill',
                selectedPrice === index && 'filter-pill-active'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms pills */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Bedrooms</label>
        <div className="flex flex-wrap gap-2">
          {bedroomOptions.map((num) => (
            <button
              key={num}
              onClick={() => setSelectedBedrooms(selectedBedrooms === num ? null : num)}
              className={cn(
                'filter-pill',
                selectedBedrooms === num && 'filter-pill-active'
              )}
            >
              {num}+ beds
            </button>
          ))}
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="space-y-2 pt-2 border-t border-border animate-fade-in">
          <label className="text-sm font-medium text-foreground">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map((amenity) => (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={cn(
                  'filter-pill',
                  selectedAmenities.includes(amenity) && 'filter-pill-active'
                )}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
          Clear all filters
        </button>
      )}
    </div>
  );
}
