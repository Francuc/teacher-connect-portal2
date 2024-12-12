import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { TeachingLocation } from "@/lib/constants";

type LocationSummaryProps = {
  location: TeachingLocation;
  price: string;
  selectedCity?: any;
  studentRegions: string[];
  studentCities: string[];
  getLocalizedName: (item: any) => string;
  onEdit: () => void;
};

export const LocationSummary = ({
  location,
  price,
  selectedCity,
  studentRegions,
  studentCities,
  getLocalizedName,
  onEdit,
}: LocationSummaryProps) => {
  const { t } = useLanguage();
  const hasPrice = price && parseFloat(price) > 0;

  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-accent"
      onClick={onEdit}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">{location}</span>
          {hasPrice && (
            <div className="font-semibold bg-background p-2 rounded-md border">
              {price}€/h
            </div>
          )}
        </div>

        {location === "Teacher's Place" && selectedCity && (
          <div className="text-sm text-muted-foreground">
            {`${getLocalizedName(selectedCity)}, ${getLocalizedName(selectedCity.region)}`}
          </div>
        )}

        {location === "Student's Place" && (
          <div className="text-sm text-muted-foreground">
            {studentRegions.length > 0 && (
              <div>
                <span className="font-medium">{t("regions")}: </span>
                {studentRegions.join(", ")}
              </div>
            )}
            {studentCities.length > 0 && (
              <div>
                <span className="font-medium">{t("cities")}: </span>
                {studentCities.join(", ")}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};