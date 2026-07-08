/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Program {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // lucide icon identifier
  color: string; // tailwind color prefix (e.g. 'emerald', 'sky', 'indigo')
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  currentProgramId?: string;
}

export interface Question {
  id: string;
  programId: string;
  text: string;
  order: number;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  // Weight or points allocated to each profile when chosen.
  // E.g., { "perfil-a": 3, "perfil-b": 1 }
  profileWeights: Record<string, number>;
}

export interface Profile {
  id: string;
  programId: string;
  name: string;
  icon: string; // e.g. "🚀"
  color: string; // e.g. "orange", "blue", "green", "purple", "teal"
  summary: string;
  characteristics: string[]; // Base comportamental
  gamificationType: string; // Tipo de gamificação
  mainMessage: string; // Mensagem principal
  preferredMissions: string[]; // Missões preferenciais
  rewards: string[]; // Recompensas
  customReportText: string; // Texto do relatório personalizado
  keyPoints: string[]; // backwards-compatibility keyPoints
  recommendedObjective: string;
}

export interface ProfileRule {
  id: string;
  profileId: string;
  ruleType: 'weight_sum' | 'conditional';
  description: string;
}

export interface UserAnswer {
  id: string;
  userId: string;
  programId: string;
  questionId: string;
  optionId: string;
  createdAt: string;
}

export interface Result {
  id: string;
  userId: string;
  programId: string;
  profileId: string; // primary profile
  secondaryProfileId?: string; // secondary profile
  calculatedAt: string;
  scores: Record<string, number>; // Maps profileId to score
}

export interface Mission {
  id: string;
  programId: string;
  day: number;
  title: string;
  description: string;
  xpAwarded: number;
  category: string; // e.g., 'Habit', 'Reflection', 'Breathing', 'Challenge'
}

export interface CheckIn {
  id: string;
  userId: string;
  programId: string;
  day: number;
  completedAt: string;
  mood: 'happy' | 'neutral' | 'stressed' | 'sad' | 'anxious';
  cravingLevel: number; // 0 to 10
  notes?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  programId: string;
  currentDay: number;
  totalXp: number;
  completedMissionsCount: number;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string;
  completedMissionsDays: number[]; // days that are checked off
  completedTodayTasks?: string[]; // e.g. ['checkin', 'message', 'breathing', 'trigger', 'community']
  bossDefeatedDays?: number[]; // days that the weekly boss was defeated
  extraChallengeCompletedDays?: number[]; // days that the daily extra challenge was completed
  triggers?: { id: string; timestamp: string; type: string; intensity: number; notes?: string }[];
}

export interface CommunityPost {
  id: string;
  userId: string;
  programId: string;
  userName: string;
  userProfileName: string;
  content: string;
  likes: number;
  likedByUserIds: string[];
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: string;
  unlockedAt?: string; // If true, when was it unlocked
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  userId?: string;
}

