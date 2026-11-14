// A Supabase client with NO user attached: it always acts as an anonymous
// visitor. Use it for data that is the same for everyone, like the recipe
// list. Because it never looks at cookies, pages that use only this client
// can be built once and reused for every visitor.
//
// There are three clients in this folder:
//   public.js  anonymous, for public data (this file)
//   server.js  knows who is signed in, for server code
//   client.js  knows who is signed in, for code running in the browser
import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

// One client, shared by every file that imports it.
export const supabase = createClient(supabaseUrl, supabaseKey);
