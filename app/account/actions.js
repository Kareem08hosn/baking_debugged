// Server actions for the account page.
"use server";

import { createClient, getUser } from "@/lib/supabase/server";

// Permanently deletes everything the signed-in person has stored. The
// account itself (the email address) stays: deleting that needs Supabase's
// secret admin key, which this site deliberately doesn't have.
// Returns {} or { error }.
export async function deleteMyData(confirmation) {
  const user = await getUser();
  if (!user) {
    return { error: "Sign in first." };
  }
  // The page asks the person to type DELETE; check it here too.
  if (confirmation !== "DELETE") {
    return { error: "Type DELETE to confirm." };
  }

  const supabase = await createClient();
  // Each table, with the column that says whose row it is. Favourites and
  // notes go first, then bakes, preferences and finally the recipes.
  const tables = [
    ["favourites", "user_id"],
    ["recipe_notes", "user_id"],
    ["bakes", "user_id"],
    ["preferences", "user_id"],
    ["recipes", "owner"],
  ];
  const failed = [];
  for (const [table, column] of tables) {
    const { error } = await supabase.from(table).delete().eq(column, user.id);
    if (error) {
      console.error(`Deleting from ${table} failed:`, error.message);
      failed.push(table);
    }
  }
  if (failed.length > 0) {
    return { error: "Some of your data couldn’t be deleted. Try again in a moment." };
  }
  return {};
}
