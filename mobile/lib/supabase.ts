import 'react-native-url-polyfill/auto'
import 'expo-sqlite/localStorage/install'

import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

if (!supabaseUrl) {
  throw new Error('Falta EXPO_PUBLIC_SUPABASE_URL')
}

if (!supabaseKey) {
  throw new Error('Falta EXPO_PUBLIC_SUPABASE_KEY')
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
