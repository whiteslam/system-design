import { redirect } from "next/navigation";
import { getUserProjectsList } from "@/actions/intelligence";
import { hasSupabaseEnv } from "@/lib/env";

export async function redirectToFirstProject(basePath: string) {
  if (!hasSupabaseEnv()) return [];
  const projects = await getUserProjectsList();
  if (projects[0]) {
    redirect(`${basePath}/${projects[0].id}`);
  }
  return projects;
}
