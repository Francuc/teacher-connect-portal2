import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TeachersFilters } from "./teachers/TeachersFilters";
import { TeachersGrid } from "./teachers/TeachersGrid";

interface TeachersListProps {
  initialSearchQuery?: string;
}

export const TeachersList = ({ initialSearchQuery = "" }: TeachersListProps) => {
  const { language } = useLanguage();
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      console.log('Fetching teachers data...');
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          city:cities(
            id,
            name_en,
            name_fr,
            name_lb,
            region:regions(
              id,
              name_en,
              name_fr,
              name_lb
            )
          ),
          teacher_subjects!inner(
            subject:subjects(
              id,
              name_en,
              name_fr,
              name_lb
            )
          ),
          teacher_school_levels(
            school_level
          ),
          teacher_locations(
            location_type,
            price_per_hour
          ),
          teacher_student_cities(
            city_name
          ),
          teacher_student_regions(
            region_name
          )
        `);
      
      if (error) {
        console.error('Error fetching teachers:', error);
        throw error;
      }

      // Transform profile picture URLs and normalize subject data
      const teachersWithUrls = await Promise.all((data || []).map(async (teacher) => {
        // Handle profile picture URL
        let profileUrl = teacher.profile_picture_url;
        if (profileUrl) {
          const { data: urlData } = supabase
            .storage
            .from('profile-pictures')
            .getPublicUrl(profileUrl);
          profileUrl = urlData.publicUrl;
        }

        return {
          ...teacher,
          profile_picture_url: profileUrl,
        };
      }));
      
      console.log('Teachers data with subjects:', teachersWithUrls);
      return teachersWithUrls || [];
    }
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name_en');
      if (error) throw error;
      return data;
    }
  });

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

  const getTeacherLocation = (teacher: any) => {
    if (!teacher.city) return '';
    const cityName = getLocalizedName(teacher.city);
    const regionName = getLocalizedName(teacher.city.region);
    return `${cityName}, ${regionName}`;
  };

  const getLowestPrice = (locations: any[]) => {
    if (!locations || locations.length === 0) return null;
    const prices = locations.map(loc => loc.price_per_hour);
    return Math.min(...prices);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const teacherSubjects = teacher.teacher_subjects?.map(s => getLocalizedName(s.subject)) || [];
    const teacherLevels = teacher.teacher_school_levels?.map(l => l.school_level) || [];
    
    const matchesSubject = selectedSubject === "all" || teacherSubjects.includes(selectedSubject);
    const matchesLevel = selectedLevel === "all" || teacherLevels.includes(selectedLevel);
    const location = getTeacherLocation(teacher);
    const matchesSearch = !searchQuery || 
      `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSubject && matchesLevel && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 space-y-8">
      <TeachersFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        subjects={subjects}
        schoolLevels={schoolLevels}
        getLocalizedName={getLocalizedName}
      />

      <TeachersGrid
        teachers={filteredTeachers}
        isLoading={isLoadingTeachers}
        getLocalizedName={getLocalizedName}
        getTeacherLocation={getTeacherLocation}
        getLowestPrice={getLowestPrice}
        formatPrice={formatPrice}
      />
    </div>
  );
};