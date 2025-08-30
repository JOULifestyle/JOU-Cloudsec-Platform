import { createClient } from '@supabase/supabase-js';

// These would typically come from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xahxnpbplibmqquyzvek.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaHhucGJwbGlibXFxdXl6dmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzYwMDEsImV4cCI6MjA2MzMxMjAwMX0.Y0RMhGxqiKDcVvAUO5jhID3-M8oN3eKvuXzByp7R1ok';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });