import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { RegionsSection } from "./RegionsSection";
import { type TeachingLocation } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { RegionSelector } from "./RegionSelector";
import { CitySelector } from "./CitySelector";
import { LocationDisplay } from "./LocationDisplay";

type TeachingLocationItemProps = {
  location: TeachingLocation;
  formData: {
    teachingLocations: TeachingLocation[];
    cityId: string;
    studentRegions: string[];
    studentCities: string[];
    pricePerHour: {
      teacherPlace: string;
      studentPlace: string;
      online: string;
    };
  };
  setFormData: (data: any) => void;
};

export const TeachingLocationItem = ({
  location,
  formData,
  setFormData,
}: TeachingLocationItemProps) => {
  const { t, language } = useLanguage();
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name_en');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          region:regions(
            id,
            name_en,
            name_fr,
            name_lb
          )
        `)
        .order('name_en');
      
      if (error) throw error;
      return data || [];
    },
  });

  const getLocalizedName = (item: any) => {
    if (!item) return '';
    switch(language) {
      case 'fr':
        return item.name_fr;
      case 'lb':
        return item.name_lb;
      default:
        return item.name_en;
    }
  };

  const selectedCity = cities.find(city => city.id === formData.cityId);

  const handleRegionSelect = (value: string) => {
    setSelectedRegionId(value);
    setFormData({
      ...formData,
      cityId: "",
    });
  };

  const handleCitySelect = (value: string) => {
    setFormData({
      ...formData,
      cityId: value,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={location}
          checked={formData.teachingLocations.includes(location)}
          onCheckedChange={(checked) => {
            setFormData({
              ...formData,
              teachingLocations: checked
                ? [...formData.teachingLocations, location]
                : formData.teachingLocations.filter((l) => l !== location),
            });
          }}
        />
        <Label htmlFor={location}>{location}</Label>
      </div>

      {formData.teachingLocations.includes(location) && (
        <div className="space-y-2 pl-6">
          {location === "Teacher's Place" && (
            <div className="space-y-4">
              <RegionSelector
                regions={regions}
                selectedRegionId={selectedRegionId}
                onRegionSelect={handleRegionSelect}
                getLocalizedName={getLocalizedName}
              />

              {selectedRegionId && (
                <CitySelector
                  cities={cities}
                  selectedRegionId={selectedRegionId}
                  selectedCityId={formData.cityId}
                  onCitySelect={handleCitySelect}
                  getLocalizedName={getLocalizedName}
                />
              )}

              <LocationDisplay
                selectedCity={selectedCity}
                getLocalizedName={getLocalizedName}
              />
            </div>
          )}

          {location === "Student's Place" && (
            <RegionsSection formData={formData} setFormData={setFormData} />
          )}

          <div className="flex items-center space-x-2">
            <span className="text-gray-500">€</span>
            <Input
              type="number"
              placeholder={t("pricePerHour")}
              value={
                formData.pricePerHour[
                  location.toLowerCase().replace("'s", "").split(" ")[0] as keyof typeof formData.pricePerHour
                ]
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pricePerHour: {
                    ...formData.pricePerHour,
                    [location.toLowerCase().replace("'s", "").split(" ")[0]]: e.target.value,
                  },
                })
              }
              className="w-32"
              required
            />
          </div>
        </div>
      )}
    </div>
  );
};