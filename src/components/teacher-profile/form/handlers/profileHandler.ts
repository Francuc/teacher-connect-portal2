import { FormData } from "../types";
import { supabase } from "@/lib/supabase";

export const handleProfileUpdate = async (
  formData: FormData,
  userId: string,
  isNewProfile: boolean
): Promise<{ data?: { id: string }, error?: Error }> => {
  try {
    console.log('Starting profile update for user:', userId);

    // Upload profile picture if exists
    let profilePictureUrl = null;
    if (formData.profilePicture) {
      try {
        profilePictureUrl = await uploadProfilePicture(formData.profilePicture, userId);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        return { error: new Error('Error uploading profile picture') };
      }
    }

    // Prepare profile data
    const profileData = {
      user_id: userId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone || null,
      facebook_profile: formData.facebookProfile || null,
      show_email: formData.showEmail,
      show_phone: formData.showPhone,
      show_facebook: formData.showFacebook,
      bio: formData.bio,
      city_id: formData.cityId || null,
      updated_at: new Date().toISOString(),
    };

    // Only add profile_picture_url if a new picture was uploaded
    if (profilePictureUrl) {
      profileData.profile_picture_url = profilePictureUrl;
    }

    if (isNewProfile) {
      console.log('Creating new profile:', profileData);
      const { data, error } = await supabase
        .from('teachers')
        .insert([profileData])
        .select('id')
        .single();
        
      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }
      
      return { data };
    } else {
      console.log('Updating existing profile:', profileData);
      const { error } = await supabase
        .from('teachers')
        .update(profileData)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      return { data: { id: userId } };
    }
  } catch (error) {
    console.error('Error in handleProfileUpdate:', error);
    return { error: error as Error };
  }
};