import { redirect } from "next/navigation";
import { getUserProjectsList } from "@/actions/intelligence";

export async function redirectToFirstProject(basePath: string) {
  const projects = await getUserProjectsList();
  if (projects[0]) {
    redirect(`${basePath}/${projects[0].id}`);
  }
  return projects;
}
