import React, { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  Checkbox,
  NumberInput,
  Select,
  SelectItem,
  Button,
} from '@carbon/react';
import { Reset } from '@carbon/icons-react';

interface FilterOptions {
  categories: string[];
  counties: string[];
  priceRange: {
    min: number;
    max: number;
  };
  availability: string[];
}

interface CatalogueFiltersProps {
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const CATEGORIES = [
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'METALWORK', label: 'Metalwork' },
  { value: 'TEXTILES', label: 'Textiles' },
  { value: 'CERAMICS', label: 'Ceramics' },
  { value: 'WOODWORK', label: 'Woodwork' },
  { value: 'UPHOLSTERY', label: 'Upholstery' },
  { value: 'LIGHTING', label: 'Lighting' },
  { value: 'DECOR', label: 'Decor' },
  { value: 'OTHER', label: 'Other' },
];

const KENYAN_COUNTIES = [
  'NAIROBI',
  'MOMBASA',
  'KISUMU',
  'NAKURU',
  'ELDORET',
  'THIKA',
  'MALINDI',
  'KITALE',
  'GARISSA',
  'KAKAMEGA',
  'NYERI',
  'MERU',
  'KISII',
  'KERICHO',
  'MACHAKOS',
  'NAIVASHA',
  'LAMU',
  'KILIFI',
  'EMBU',
  'NANYUKI',
];

const AVAILABILITY_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BUSY', label: 'Busy' },
  { value: 'CUSTOM_ORDER', label: 'Custom Order' },
];

const CatalogueFilters: React.FC<CatalogueFiltersProps> = ({
  onFilterChange,
  onClearFilters,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updated = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category);
    setSelectedCategories(updated);
    applyFilters({ categories: updated });
  };

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
    applyFilters({ county });
  };

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    applyFilters({ minPrice: min, maxPrice: max });
  };

  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    const updated = checked
      ? [...selectedAvailability, availability]
      : selectedAvailability.filter((a) => a !== availability);
    setSelectedAvailability(updated);
    applyFilters({ availability: updated });
  };

  const applyFilters = (updates: any) => {
    const filters = {
      categories: updates.categories !== undefined ? updates.categories : selectedCategories,
      county: updates.county !== undefined ? updates.county : selectedCounty,
      minPrice: updates.minPrice !== undefined ? updates.minPrice : minPrice,
      maxPrice: updates.maxPrice !== undefined ? updates.maxPrice : maxPrice,
      availability: updates.availability !== undefined ? updates.availability : selectedAvailability,
    };
    onFilterChange(filters);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedCounty('');
    setMinPrice(0);
    setMaxPrice(1000000);
    setSelectedAvailability([]);
    onClearFilters();
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedCounty !== '' ||
    minPrice > 0 ||
    maxPrice < 1000000 ||
    selectedAvailability.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filters */}
      <Accordion>
        {/* Category Filter */}
        <AccordionItem title="Category" open>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <Checkbox
                key={category.value}
                id={`category-${category.value}`}
                labelText={category.label}
                checked={selectedCategories.includes(category.value)}
                onChange={(e, { checked }) =>
                  handleCategoryChange(category.value, checked)
                }
              />
            ))}
          </div>
        </AccordionItem>

        {/* Location Filter */}
        <AccordionItem title="Location">
          <Select
            id="county-select"
            labelText="County"
            value={selectedCounty}
            onChange={(e) => handleCountyChange(e.target.value)}
          >
            <SelectItem value="" text="All Counties" />
            {KENYAN_COUNTIES.map((county) => (
              <SelectItem
                key={county}
                value={county}
                text={county.charAt(0) + county.slice(1).toLowerCase()}
              />
            ))}
          </Select>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem title="Price Range (KES)">
          <div className="space-y-4">
            <NumberInput
              id="min-price"
              label="Minimum Price"
              min={0}
              step={1000}
              value={minPrice}
              onChange={(e, { value }) => {
                if (value !== undefined) {
                  handlePriceChange(value, maxPrice);
                }
              }}
            />
            <NumberInput
              id="max-price"
              label="Maximum Price"
              min={0}
              step={1000}
              value={maxPrice}
              onChange={(e, { value }) => {
                if (value !== undefined) {
                  handlePriceChange(minPrice, value);
                }
              }}
            />
          </div>
        </AccordionItem>

        {/* Availability Filter */}
        <AccordionItem title="Availability">
          <div className="space-y-2">
            {AVAILABILITY_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                id={`availability-${option.value}`}
                labelText={option.label}
                checked={selectedAvailability.includes(option.value)}
                onChange={(e, { checked }) =>
                  handleAvailabilityChange(option.value, checked)
                }
              />
            ))}
          </div>
        </AccordionItem>
      </Accordion>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Active Filters:</p>
          <div className="space-y-1 text-sm text-gray-600">
            {selectedCategories.length > 0 && (
              <p>• Categories: {selectedCategories.length}</p>
            )}
            {selectedCounty && (
              <p>• Location: {selectedCounty.charAt(0) + selectedCounty.slice(1).toLowerCase()}</p>
            )}
            {(minPrice > 0 || maxPrice < 1000000) && (
              <p>
                • Price: KES {minPrice.toLocaleString()} - {maxPrice.toLocaleString()}
              </p>
            )}
            {selectedAvailability.length > 0 && (
              <p>• Availability: {selectedAvailability.length}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogueFilters;

// Made with Bob
