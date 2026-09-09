import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://skwinxwiyulwikglhvtc.supabase.co";

const SUPABASE_KEY = "sb_publishable_nnHV07VMLjn9PnOIJv6O6g_K0PWwToL";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);