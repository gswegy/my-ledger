// Mimics the window.storage API the Ledger component already uses
// (get/set/delete/list), but backed by a real Supabase table instead
// of the Claude-artifact sandbox. Every call requires an authenticated
// session — enforced both by Supabase Row Level Security and, for
// clarity, by this wrapper as well.
import { supabase } from "./supabaseClient";

function wrap(key, value) {
  return { key, value, shared: false };
}

window.storage = {
  async get(key) {
    const { data, error } = await supabase
      .from("ledger_data")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return wrap(key, data.value);
  },

  async set(key, value) {
    const { error } = await supabase
      .from("ledger_data")
      .upsert({ key, value }, { onConflict: "key" });
    if (error) throw error;
    return wrap(key, value);
  },

  async delete(key) {
    const { error } = await supabase.from("ledger_data").delete().eq("key", key);
    if (error) throw error;
    return { key, deleted: true, shared: false };
  },

  async list(prefix) {
    let query = supabase.from("ledger_data").select("key");
    if (prefix) query = query.like("key", prefix + "%");
    const { data, error } = await query;
    if (error) throw error;
    return { keys: (data || []).map((r) => r.key), prefix, shared: false };
  },
};
