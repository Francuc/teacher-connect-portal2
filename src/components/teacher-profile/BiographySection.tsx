import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type BiographySectionProps = {
  formData: {
    bio: string;
  };
  setFormData: (data: any) => void;
};

export const BiographySection = ({ formData, setFormData }: BiographySectionProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {t("bio")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="bio">{t("bio")}</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="h-32"
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};