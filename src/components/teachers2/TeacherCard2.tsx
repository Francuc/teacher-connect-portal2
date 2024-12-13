import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, User, Book, GraduationCap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { TeacherLocations } from "./card/TeacherLocations";
import { TeacherContactInfo } from "./card/TeacherContactInfo";
import { Section } from "./card/Section";
import { SectionHeader } from "./card/SectionHeader";

interface TeacherCard2Props {
  teacher: any;
}

export const TeacherCard2 = ({ teacher }: TeacherCard2Props) => {
  const { t, language } = useLanguage();

  const { data: schoolLevels = [] } = useQuery({
    queryKey: ['schoolLevels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_levels')
        .select('*')
        .order('name_en');
      if (error) throw error;
      return data;
    }
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['teacherCities', teacher.teacher_student_cities],
    queryFn: async () => {
      if (!teacher.teacher_student_cities?.length) return [];
      
      const cityNames = teacher.teacher_student_cities.map((c: any) => c.city_name);
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          region:regions(*)
        `)
        .in('name_en', cityNames);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!teacher.teacher_student_cities?.length
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

  const getTeacherLocation = () => {
    if (!teacher.city) return '';
    const cityName = getLocalizedName(teacher.city);
    const regionName = getLocalizedName(teacher.city.region);
    return `${cityName}, ${regionName}`;
  };

  const getTranslatedLevel = (levelName: string) => {
    const level = schoolLevels.find(l => l.name_en === levelName);
    if (level) {
      return getLocalizedName(level);
    }
    return levelName;
  };

  const getTranslatedCityName = (cityName: string) => {
    const city = cities.find(c => c.name_en === cityName);
    if (city) {
      return getLocalizedName(city);
    }
    return cityName;
  };

  const getProfilePictureUrl = () => {
    if (!teacher.profile_picture_url) return null;
    const { data: { publicUrl } } = supabase
      .storage
      .from('profile-pictures')
      .getPublicUrl(teacher.profile_picture_url);
    return publicUrl;
  };

  return (
    <Card className="p-4 flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
      {/* Header Section with fixed height */}
      <div className="h-[140px] flex items-start gap-4 mb-4">
        <Avatar className="w-20 h-20 rounded-xl border-4 border-purple-soft">
          {teacher.profile_picture_url ? (
            <AvatarImage 
              src={getProfilePictureUrl()}
              alt={`${teacher.first_name} ${teacher.last_name}`}
              className="aspect-square h-full w-full object-cover"
            />
          ) : (
            <AvatarFallback className="bg-primary/5">
              <User 
                className="w-10 h-10 text-primary/50"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-purple-dark">
            {teacher.first_name} {teacher.last_name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4" />
            {getTeacherLocation()}
          </p>
          <TeacherContactInfo
            email={teacher.email}
            phone={teacher.phone}
            facebookProfile={teacher.facebook_profile}
            showEmail={teacher.show_email}
            showPhone={teacher.show_phone}
            showFacebook={teacher.show_facebook}
          />
        </div>
      </div>

      <Separator className="my-3" />

      <div className="grid grid-cols-1 gap-3 flex-1">
        {/* Subjects Section */}
        <Section>
          <SectionHeader icon={Book} title={t("subjects")} />
          <div className="flex flex-wrap gap-2 mt-2 min-h-[40px]">
            {teacher.teacher_subjects?.map((subjectData: any) => (
              <Badge
                key={subjectData.subject.id}
                variant="outline"
                className="bg-primary/10 text-primary border-none"
              >
                {getLocalizedName(subjectData.subject)}
              </Badge>
            ))}
          </div>
        </Section>

        {/* School Levels Section */}
        <Section>
          <SectionHeader icon={GraduationCap} title={t("schoolLevels")} />
          <div className="flex flex-wrap gap-2 mt-2 min-h-[40px]">
            {teacher.teacher_school_levels?.map((level: any, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-primary/10 text-primary border-none"
              >
                {getTranslatedLevel(level.school_level)}
              </Badge>
            ))}
          </div>
        </Section>

        {/* Student Cities Section */}
        {teacher.teacher_student_cities && teacher.teacher_student_cities.length > 0 && (
          <Section>
            <SectionHeader icon={MapPin} title={t("availableIn")} />
            <div className="flex flex-wrap gap-2 mt-2 min-h-[40px]">
              {teacher.teacher_student_cities?.map((cityData: any, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-primary/10 text-primary border-none"
                >
                  {getTranslatedCityName(cityData.city_name)}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {/* Teaching Locations Section */}
        {teacher.teacher_locations && teacher.teacher_locations.length > 0 && (
          <div className="mt-auto">
            <TeacherLocations locations={teacher.teacher_locations} />
          </div>
        )}
      </div>
    </Card>
  );
};