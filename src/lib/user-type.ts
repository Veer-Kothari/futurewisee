/**
 * Who is signing up. The database accepts only these values
 * (profiles.user_type), and each has its own Kit tag (KIT_ROLE_TAGS).
 */
export const USER_TYPES = [
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "organization", label: "Organization" },
] as const;

export type UserType = (typeof USER_TYPES)[number]["value"];

/** The label people see; empty for accounts made before the question existed. */
export function userTypeLabel(value: string | null | undefined): string {
  return USER_TYPES.find((type) => type.value === value)?.label ?? "";
}
