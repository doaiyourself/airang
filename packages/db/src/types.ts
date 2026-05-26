export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type FamilyRole = "mother" | "father" | "family" | "viewer";
export type RecordType = "diary" | "photo" | "exam" | "symptom" | "emotion";
export type Visibility = "family" | "couple" | "private";
export type AiAnalysisType = "ultrasound" | "lab_result" | "weekly_summary";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Pregnancy {
  id: string;
  owner_id: string;
  due_date: string;
  last_menstrual_period: string;
  baby_nickname: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  pregnancy_id: string;
  user_id: string;
  role: FamilyRole;
  joined_at: string;
}

export interface Invitation {
  id: string;
  pregnancy_id: string;
  code: string;
  role: FamilyRole;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
}

export interface BabyInfo {
  size_comparison: string;
  length_cm: number;
  weight_g: number;
  development: string[];
}

export interface MomInfo {
  body_changes: string[];
  common_symptoms: string[];
}

export interface ExamInfo {
  name: string;
  timing: string;
  purpose: string;
}

export interface WeeklyContent {
  week_number: number;
  baby_info: BabyInfo;
  mom_info: MomInfo;
  essay: string;
  checklist: string[];
  exam_info: ExamInfo | null;
  illustration_url: string | null;
}

export interface Record {
  id: string;
  pregnancy_id: string;
  author_id: string;
  type: RecordType;
  record_date: string;
  week_number: number;
  visibility: Visibility;
  content: Json;
  created_at: string;
  updated_at: string;
}

export interface CoupleNote {
  id: string;
  pregnancy_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface AiAnalysis {
  id: string;
  record_id: string;
  type: AiAnalysisType;
  result: Json;
  model_version: string;
  created_at: string;
}

// Record content types
export interface DiaryContent {
  emotion: string;
  body: string;
  photo_urls?: string[];
}

export interface PhotoContent {
  photo_urls: string[];
  category: "belly" | "ultrasound" | "daily" | "checkup";
  caption?: string;
}

export interface ExamContent {
  exam_type: string;
  hospital?: string;
  image_urls: string[];
  doctor_note?: string;
  ai_analysis_id?: string;
}

export interface SymptomContent {
  tags: string[];
  intensity: number;
  memo?: string;
}

export interface EmotionContent {
  emoji: string;
  memo?: string;
}
