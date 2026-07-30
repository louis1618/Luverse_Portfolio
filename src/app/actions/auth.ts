"use server";

import { createClient } from "@/utils/supabase/server";

export async function getProfile() {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { session: null, profile: null };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('permission_level')
      .eq('id', session.user.id)
      .single();

    return { 
      session: { user: { id: session.user.id } }, 
      profile 
    };
  } catch (error) {
    console.error("Auth action error:", error);
    return { session: null, profile: null };
  }
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
  }
}
