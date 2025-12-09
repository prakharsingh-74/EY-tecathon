import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration. Please check your .env file.');
}

// Create Supabase client with service role key for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Health check function
export async function checkDatabaseConnection() {
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);

        if (error) throw error;

        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

export default supabase;
