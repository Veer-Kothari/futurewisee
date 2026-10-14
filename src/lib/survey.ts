import { z } from "zod";

/**
 * The survey's questions and the one schema both the page and the server
 * function validate against. The option lists are the only accepted values.
 */
export const SURVEY_SOURCES = [
  "School",
  "Friend",
  "LinkedIn",
  "Instagram",
  "Parent/Teacher",
  "Other",
] as const;

export const SURVEY_ROLES = [
  "High school student",
  "University student",
  "Parent",
  "Educator",
  "Industry professional",
  "Other",
] as const;

export const SURVEY_INDUSTRIES = [
  "Law",
  "Entrepreneurship",
  "Investment Banking & Trading",
  "Other Finance",
  "Tax",
  "Economics",
  "Operations",
  "Not sure yet",
] as const;

export const SURVEY_NEEDS = [
  "Understanding industries",
  "Career readiness",
  "Personal finance",
  "Independent living skills",
  "Other",
] as const;

export type SurveySource = (typeof SURVEY_SOURCES)[number];
export type SurveyRole = (typeof SURVEY_ROLES)[number];
export type SurveyIndustry = (typeof SURVEY_INDUSTRIES)[number];
export type SurveyNeed = (typeof SURVEY_NEEDS)[number];
export type SurveyConfidence = 1 | 2 | 3 | 4 | 5;

export type SurveyAnswers = {
  source: SurveySource;
  role: SurveyRole;
  industries: SurveyIndustry[];
  needs: SurveyNeed[];
  confidence: SurveyConfidence;
};

function uniqueList<T extends readonly [string, ...string[]]>(values: T) {
  return z
    .array(z.enum(values))
    .min(1)
    .max(12)
    .refine((items) => new Set(items).size === items.length, { message: "Duplicate answer" });
}

export const surveyAnswersSchema: z.ZodType<SurveyAnswers> = z.object({
  source: z.enum(SURVEY_SOURCES),
  role: z.enum(SURVEY_ROLES),
  industries: uniqueList(SURVEY_INDUSTRIES),
  needs: uniqueList(SURVEY_NEEDS),
  confidence: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
});

export const surveySubmissionSchema = z.object({
  answers: surveyAnswersSchema,
  /** Honeypot: a hidden field people never fill in. */
  website: z.string().max(200).optional(),
});

/** 32 random bytes as base64url = 43 characters. */
export const claimSchema = z.object({
  id: z.string().uuid(),
  claimToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
});
