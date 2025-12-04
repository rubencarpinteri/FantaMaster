import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://teghwxjemabihaqdnufp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZ2h3eGplbWFiaWhhcWRudWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDk2NjUsImV4cCI6MjA4MDQyNTY2NX0.0roobrn4ey0Ub_AJqrnBSD0sr5DkDxlX5CplLaTreh4';

export const supabase = createClient(supabaseUrl, supabaseKey);

const TABLE = 'league_store';

// --- Generic Helpers ---

export const saveData = async (key: string, data: any) => {
    if (!supabase) return;
    const { error } = await supabase
        .from(TABLE)
        .upsert({ key, value: data }, { onConflict: 'key' });
    
    if (error) console.error(`Error saving ${key}:`, error);
};

export const loadData = async (key: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from(TABLE)
        .select('value')
        .eq('key', key)
        .single();
    
    if (error || !data) return null;
    return data.value;
};

// --- Specific Subscriptions (Realtime) ---

export const subscribeToData = (key: string, callback: (data: any) => void) => {
    if (!supabase) return () => {};

    // Initial fetch
    loadData(key).then(data => {
        if (data) callback(data);
    });

    // Realtime subscription
    const channel = supabase
        .channel(`public:${TABLE}:${key}`)
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: TABLE, 
            filter: `key=eq.${key}` 
        }, (payload) => {
            if (payload.new && payload.new.value) {
                callback(payload.new.value);
            }
        })
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: TABLE, 
            filter: `key=eq.${key}` 
        }, (payload) => {
            if (payload.new && payload.new.value) {
                callback(payload.new.value);
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};