import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  console.log("Users:", users ? users.users.map(u => ({ id: u.id, email: u.email })) : userError);

  const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
  console.log("Profiles:", profiles || profileError);
}
check();
