import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tdjudlcphjnxafquhvxo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkanVkbGNwaGpueGFmcXVodnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjM1NDgsImV4cCI6MjEwMzY5OTU0OH0.Ito3liocey2S4vL51UFCn47HBe_Lyexam2IU0qWzEjg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
