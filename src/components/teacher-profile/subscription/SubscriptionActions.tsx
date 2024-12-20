import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionActionsProps {
  isLoading: boolean;
  onToggleStatus: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export const SubscriptionActions = ({ 
  isLoading, 
  onToggleStatus,
  onDelete
}: SubscriptionActionsProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isLoading}
          className="w-full"
        >
          {t("deleteProfile")}
        </Button>
      </div>
    </div>
  );
};