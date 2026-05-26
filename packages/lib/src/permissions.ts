export type FamilyRole = "mother" | "father" | "family" | "viewer";

export function canViewCoupleNotes(role: FamilyRole): boolean {
  return role === "mother" || role === "father";
}

export function canCreateRecord(role: FamilyRole): boolean {
  return role === "mother" || role === "father" || role === "family";
}

export function canCreateInvitation(role: FamilyRole): boolean {
  return role === "mother" || role === "father";
}

export function canViewExams(role: FamilyRole): boolean {
  return role !== "viewer";
}

export function isParent(role: FamilyRole): boolean {
  return role === "mother" || role === "father";
}
