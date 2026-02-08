import { supabase } from './supabaseClient';

const TABLE = 'user_settings';

export async function fetchOrCreateUserSettings(userId: string, defaults: any): Promise<any> {
    if (!supabase) return defaults;
    const { data, error } = await supabase
        .from(TABLE)
        .select('settings')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (data?.settings) {
        return data.settings;
    }

    await saveUserSettings(userId, defaults);
    return defaults;
}

export async function saveUserSettings(userId: string, settings: any): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
        .from(TABLE)
        .upsert(
            {
                user_id: userId,
                settings,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
        );

    if (error) {
        throw error;
    }
}
