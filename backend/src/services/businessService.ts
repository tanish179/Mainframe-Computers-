import { supabaseAdmin } from '../config/supabase.js';
import { BusinessProfile } from '../types/database.types.js';

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('business_profile')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch business profile: ${error.message}`);
  }

  if (!data) {
    // Return default business profile if database is unseeded
    return {
      id: 'default-profile-id',
      business_name: 'Mainframe Computers',
      business_description: 'Computer Sales, Services & Repair Business',
      address: 'Kolhapur, Maharashtra, India',
      phone: '+91-9876543210',
      email: 'contact@mainframecomputers.com',
      gst_number: null,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data as BusinessProfile;
}

export async function updateBusinessProfile(
  updates: Partial<Omit<BusinessProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<BusinessProfile> {
  const existing = await getBusinessProfile();

  if (!existing || existing.id === 'default-profile-id') {
    const { data, error } = await supabaseAdmin
      .from('business_profile')
      .insert([
        {
          business_name: updates.business_name || 'Mainframe Computers',
          business_description: updates.business_description || 'Computer Sales, Services & Repair Business',
          address: updates.address || 'Kolhapur, Maharashtra, India',
          phone: updates.phone || '+91-9876543210',
          email: updates.email || 'contact@mainframecomputers.com',
          gst_number: updates.gst_number || null,
          currency: updates.currency || 'INR',
          timezone: updates.timezone || 'Asia/Kolkata',
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Failed to initialize business profile: ${error.message}`);
    return data as BusinessProfile;
  } else {
    const { data, error } = await supabaseAdmin
      .from('business_profile')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update business profile: ${error.message}`);
    return data as BusinessProfile;
  }
}
