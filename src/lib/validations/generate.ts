import { z } from "zod";

export const generateSchema = z.object({
  projectName: z.string().min(2, "Project name is required"),
  projectDescription: z
    .string()
    .min(20, "Please describe your project in more detail"),
  features: z.array(z.string()).min(1, "Add at least one feature"),
  expectedUsers: z.string().min(1, "Select expected users"),
  budget: z.string().min(1, "Select a budget range"),
  preferredStack: z.string().min(1, "Select a preferred stack"),
  authType: z.string().min(1, "Select authentication type"),
  realtimeRequirements: z.string().optional(),
  fileUploadNeeds: z.string().optional(),
  aiFeatures: z.string().optional(),
  deploymentPreference: z.string().min(1, "Select deployment preference"),
  complexityLevel: z.coerce.number().min(1).max(10).optional(),
  needsRealtime: z.boolean().optional(),
  needsFileUpload: z.boolean().optional(),
  needsAi: z.boolean().optional(),
});

export type GenerateFormInput = z.infer<typeof generateSchema>;
