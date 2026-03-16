import { supabase } from './supabase';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface Report {
  id: string;
  title: string;
  location?: string;
  time?: string;
  objective?: string;
  participants_boys: number;
  participants_girls: number;
  leaders_count: number;
  responsible?: string;
  category?: string;
  beneficiary?: string;
  description_original?: string;
  description_reformulated?: string;
  evaluation_positive?: string;
  evaluation_negative?: string;
  recommendations?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  title: string;
  date_time?: string;
  location?: string;
  target_audience?: string;
  objective?: string;
  methodology_original?: string;
  methodology_reformulated?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  user_id?: string;
  full_name: string;
  role?: string;
  phone?: string;
  team?: string;
  profile_photo?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// REPORTS API
// ========================================

/**
 * Fetch all reports
 */
export async function fetchReports(): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    return data as Report[];
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

/**
 * Fetch a single report by ID
 */
export async function fetchReportById(id: string): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching report:', error);
      return null;
    }

    return data as Report;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
}

/**
 * Fetch reports by category
 */
export async function fetchReportsByCategory(category: string): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports by category:', error);
      return [];
    }

    return data as Report[];
  } catch (error) {
    console.error('Error fetching reports by category:', error);
    return [];
  }
}

/**
 * Fetch reports summary view
 */
export async function fetchReportsSummary(): Promise<Report[]> {
  try {
    const { data, error } = await supabase
      .from('reports_summary')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports summary:', error);
      return [];
    }

    return data as Report[];
  } catch (error) {
    console.error('Error fetching reports summary:', error);
    return [];
  }
}

// ========================================
// SESSIONS API
// ========================================

/**
 * Fetch all sessions
 */
export async function fetchSessions(): Promise<Session[]> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date_time', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return data as Session[];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
}

/**
 * Fetch a single session by ID
 */
export async function fetchSessionById(id: string): Promise<Session | null> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }

    return data as Session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

/**
 * Fetch upcoming sessions (future dates)
 */
export async function fetchUpcomingSessions(): Promise<Session[]> {
  try {
    const { data, error } = await supabase
      .from('upcoming_sessions')
      .select('*');

    if (error) {
      console.error('Error fetching upcoming sessions:', error);
      return [];
    }

    return data as Session[];
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    return [];
  }
}

/**
 * Fetch past sessions (historical)
 */
export async function fetchPastSessions(): Promise<Session[]> {
  try {
    const { data, error } = await supabase
      .from('past_sessions')
      .select('*');

    if (error) {
      console.error('Error fetching past sessions:', error);
      return [];
    }

    return data as Session[];
  } catch (error) {
    console.error('Error fetching past sessions:', error);
    return [];
  }
}

// ========================================
// MEMBERS API
// ========================================

/**
 * Fetch all members
 */
export async function fetchMembers(): Promise<Member[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
      return [];
    }

    return data as Member[];
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

/**
 * Fetch a single member by ID
 */
export async function fetchMemberById(id: string): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching member:', error);
      return null;
    }

    return data as Member;
  } catch (error) {
    console.error('Error fetching member:', error);
    return null;
  }
}

/**
 * Fetch members by team
 */
export async function fetchMembersByTeam(team: string): Promise<Member[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('team', team)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching members by team:', error);
      return [];
    }

    return data as Member[];
  } catch (error) {
    console.error('Error fetching members by team:', error);
    return [];
  }
}

/**
 * Create or update member profile (authenticated user only)
 */
export async function upsertMemberProfile(member: Partial<Member>): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .upsert(member, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting member:', error);
      return null;
    }

    return data as Member;
  } catch (error) {
    console.error('Error upserting member:', error);
    return null;
  }
}

/**
 * Get current user's member profile
 */
export async function getCurrentUserProfile(): Promise<Member | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching current user profile:', error);
      return null;
    }

    return data as Member;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return null;
  }
}

// ========================================
// STORAGE API
// ========================================

/**
 * Upload a file to storage bucket
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}
