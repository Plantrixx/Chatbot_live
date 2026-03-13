// 🚀 Supabase Configuration
// Bitte trage hier deine Supabase-Daten ein.
// Du findest diese unter Project Settings -> API.

const SUPABASE_URL = 'https://rcwxdkrzjxxdqnwquehd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjd3hka3J6anh4ZHFud3F1ZWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE0NzksImV4cCI6MjA4ODkzNzQ3OX0.y7sdAU5fwqfuiZdJZKPwxNou2CGN2rifvBHBE3eIO4U';

// Init Supabase Client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
