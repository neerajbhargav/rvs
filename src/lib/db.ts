import { createClient } from "@supabase/supabase-js";

// ─── Types ──────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  password: string;
  step: number;
  aboutMe: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  birthdate: string | null;
  createdAt: string;
}

export interface PageConfig {
  aboutMe: number;
  address: number;
  birthdate: number;
}

// ─── Supabase Client ────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to map Supabase snake_case back to frontend camelCase
function mapUser(row: any): User {
  if (!row) return row;
  return {
    ...row,
    aboutMe: row.about_me ?? null,
    createdAt: row.created_at ?? row.createdAt,
  };
}

// ─── User operations ────────────────────────────────────
export async function createUser(email: string, password: string): Promise<User> {
  const { data: existing } = await supabase.from('users').select('*').eq('email', email).single();
  if (existing) throw new Error("User already exists");

  const { data, error } = await supabase.from('users').insert([{ email, password, step: 2 }]).select().single();
  if (error) throw error;
  return mapUser(data);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  return data ? mapUser(data) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  return data ? mapUser(data) : null;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const mappedUpdates: any = { ...updates };
  if (updates.aboutMe !== undefined) {
    mappedUpdates.about_me = updates.aboutMe;
    delete mappedUpdates.aboutMe;
  }
  
  const { data, error } = await supabase.from('users').update(mappedUpdates).eq('id', id).select().maybeSingle();
  if (error || !data) return null;
  return mapUser(data);
}

export async function getAllUsers(): Promise<User[]> {
  const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  return data ? data.map(mapUser) : [];
}

// ─── Config operations ──────────────────────────────────
export async function getConfig(): Promise<PageConfig> {
  const { data } = await supabase.from('page_config').select('*').eq('id', 'config').maybeSingle();
  if (data) {
    return {
      aboutMe: data.about_me ?? 2,
      address: data.address ?? 2,
      birthdate: data.birthdate ?? 3,
    };
  }
  return { aboutMe: 2, address: 2, birthdate: 3 };
}

export async function updateConfig(config: PageConfig): Promise<PageConfig> {
  const { error } = await supabase.from('page_config').upsert({
    id: 'config',
    about_me: config.aboutMe,
    address: config.address,
    birthdate: config.birthdate
  });
  if (error) throw error;
  return config;
}
