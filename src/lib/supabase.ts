
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xxmkepwxnrtzezlqyvca.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bWtlcHd4bnJ0emV6bHF5dmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTgzNTQsImV4cCI6MjA4NDQ5NDM1NH0.eUd6I5JabBnCWi2PWNl13gYxQ5I8Ix9QkmLyENnv3V0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
