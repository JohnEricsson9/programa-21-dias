/**
 * Vercel Serverless Entry Point
 *
 * This file wraps the Express app as a Vercel serverless function.
 * The Vercel.json rewrites /api/* requests to this function.
 */
import express from 'express';
import { dbStore } from '../server/db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();
app.use(express.json());

// --- API Routes (copied from server.ts) ---

// Get all active behavioral programs
app.get('/api/programs', (req, res) => {
  try { res.json(dbStore.getPrograms()); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get single program
app.get('/api/programs/:id', (req, res) => {
  try {
    const prog = dbStore.getProgram(req.params.id);
    if (!prog) return res.status(404).json({ error: 'Program not found' });
    res.json(prog);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get active questions with their options, filtered by program
app.get('/api/questions', (req, res) => {
  try {
    const { programId } = req.query;
    const questions = dbStore.getQuestions(programId as string || undefined);
    const allOptions = dbStore.getOptions();
    const questionsWithOptions = questions.map(q => ({
      ...q,
      options: allOptions.filter(o => o.questionId === q.id)
    }));
    res.json(questionsWithOptions);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Create or Update a Question
app.post('/api/questions', (req, res) => {
  try {
    const { id, text, order, programId, options } = req.body;
    let question;
    if (id) {
      question = dbStore.updateQuestion(id, text, Number(order));
    } else {
      if (!programId) return res.status(400).json({ error: 'programId is required to create a question' });
      question = dbStore.createQuestion(text, Number(order), programId);
    }
    if (!question) return res.status(404).json({ error: 'Question not found' });
    if (options && Array.isArray(options)) {
      dbStore.saveOptionsForQuestion(question.id, options);
    }
    res.json({ ...question, options: dbStore.getOptionsByQuestion(question.id) });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Delete a Question
app.delete('/api/questions/:id', (req, res) => {
  try { dbStore.deleteQuestion(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get profiles
app.get('/api/profiles', (req, res) => {
  try { res.json(dbStore.getProfiles(req.query.programId as string || undefined)); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Create or Update a Profile
app.post('/api/profiles', (req, res) => {
  try {
    const { id, name, programId, summary, icon, color, characteristics, gamificationType, mainMessage, preferredMissions, rewards, customReportText, keyPoints, recommendedObjective } = req.body;
    if (!id || !name || !programId) return res.status(400).json({ error: 'ID, programId and Name are required' });
    const profile = dbStore.saveProfile({
      id, programId, name, icon: icon || '🚀', color: color || 'orange',
      summary: summary || '', characteristics: Array.isArray(characteristics) ? characteristics : [],
      gamificationType: gamificationType || '', mainMessage: mainMessage || '',
      preferredMissions: Array.isArray(preferredMissions) ? preferredMissions : [],
      rewards: Array.isArray(rewards) ? rewards : [],
      customReportText: customReportText || '', keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
      recommendedObjective: recommendedObjective || ''
    });
    res.json(profile);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Delete profile
app.delete('/api/profiles/:id', (req, res) => {
  try { dbStore.deleteProfile(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Profile rules
app.get('/api/profile-rules', (req, res) => {
  try { res.json(dbStore.getProfileRules()); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/profile-rules', (req, res) => {
  try {
    const { id, profileId, ruleType, description } = req.body;
    if (!id || !profileId) return res.status(400).json({ error: 'ID and profileId are required' });
    res.json(dbStore.saveProfileRule({ id, profileId, ruleType: ruleType || 'weight_sum', description: description || '' }));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Users
app.post('/api/users', (req, res) => {
  try {
    const { name, email, programId } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    let user = dbStore.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) { if (programId) dbStore.updateUserProgram(user.id, programId); }
    else { user = dbStore.createUser(name, email, programId); }
    res.json(user);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Answers
app.post('/api/answers', (req, res) => {
  try {
    const { userId, programId, questionId, optionId } = req.body;
    if (!userId || !programId || !questionId || !optionId) return res.status(400).json({ error: 'userId, programId, questionId, e optionId são obrigatórios' });
    res.json(dbStore.saveAnswer(userId, programId, questionId, optionId));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Results
app.get('/api/results/:userId', (req, res) => {
  try {
    const { programId } = req.query;
    if (!programId) return res.status(400).json({ error: 'programId is required' });
    const result = dbStore.calculateAndSaveResult(req.params.userId, programId as string);
    if (!result) return res.status(404).json({ error: 'Nenhum resultado encontrado ou nenhuma resposta dada.' });
    const profile = dbStore.getProfiles(programId as string).find(p => p.id === result.profileId);
    res.json({ result, profile });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Missions
app.get('/api/missions', (req, res) => {
  try { res.json(dbStore.getMissions(req.query.programId as string || undefined)); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/missions', (req, res) => {
  try {
    const { id, programId, day, title, description, xpAwarded, category } = req.body;
    if (!programId || !day || !title) return res.status(400).json({ error: 'programId, day, and title are required' });
    res.json(dbStore.saveMission({ id: id || 'm_' + Math.random().toString(36).substring(2, 11), programId, day: Number(day), title, description, xpAwarded: Number(xpAwarded || 100), category: category || 'Habit' }));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/missions/:id', (req, res) => {
  try { dbStore.deleteMission(req.params.id); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// User progress
app.get('/api/user/progress', (req, res) => {
  try {
    const { userId, programId } = req.query;
    if (!userId || !programId) return res.status(400).json({ error: 'userId and programId are required' });
    res.json(dbStore.getOrInitializeProgress(userId as string, programId as string));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/user/mission-complete', (req, res) => {
  try {
    const { userId, programId, day } = req.body;
    if (!userId || !programId || day === undefined) return res.status(400).json({ error: 'userId, programId and day are required' });
    res.json(dbStore.completeMissionForDay(userId, programId, Number(day)));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/user/complete-task', (req, res) => {
  try {
    const { userId, programId, task } = req.body;
    if (!userId || !programId || !task) return res.status(400).json({ error: 'userId, programId and task are required' });
    res.json(dbStore.completeTodayTask(userId, programId, task));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/user/trigger', (req, res) => {
  try {
    const { userId, programId, type, intensity, notes } = req.body;
    if (!userId || !programId || !type || intensity === undefined) return res.status(400).json({ error: 'userId, programId, type, and intensity are required' });
    res.json(dbStore.registerTrigger(userId, programId, type, Number(intensity), notes));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/user/complete-challenge', (req, res) => {
  try {
    const { userId, programId, day } = req.body;
    if (!userId || !programId || day === undefined) return res.status(400).json({ error: 'userId, programId and day are required' });
    res.json(dbStore.completeExtraChallenge(userId, programId, Number(day)));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/user/defeat-boss', (req, res) => {
  try {
    const { userId, programId, week } = req.body;
    if (!userId || !programId || week === undefined) return res.status(400).json({ error: 'userId, programId and week are required' });
    res.json(dbStore.defeatWeeklyBoss(userId, programId, Number(week)));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.get('/api/user/checkin', (req, res) => {
  try {
    const { userId, programId } = req.query;
    if (!userId || !programId) return res.status(400).json({ error: 'userId and programId are required' });
    res.json(dbStore.getCheckins(userId as string, programId as string));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/user/checkin', (req, res) => {
  try {
    const { userId, programId, day, mood, cravingLevel, notes } = req.body;
    if (!userId || !programId || day === undefined || !mood) return res.status(400).json({ error: 'userId, programId, day and mood are required' });
    res.json(dbStore.saveCheckIn(userId, programId, Number(day), mood, Number(cravingLevel || 0), notes));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Community
app.get('/api/community', (req, res) => {
  try {
    const { programId } = req.query;
    if (!programId) return res.status(400).json({ error: 'programId is required' });
    res.json(dbStore.getCommunityPosts(programId as string));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/community', (req, res) => {
  try {
    const { userId, programId, userName, userProfileName, content } = req.body;
    if (!userId || !programId || !userName || !content) return res.status(400).json({ error: 'Missing required post parameters' });
    res.json(dbStore.createCommunityPost(userId, programId, userName, userProfileName || 'Membro', content));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/community/like', (req, res) => {
  try {
    const { postId, userId } = req.body;
    if (!postId || !userId) return res.status(400).json({ error: 'postId and userId are required' });
    const post = dbStore.toggleLikePost(postId, userId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Achievements
app.get('/api/achievements', (req, res) => {
  try { res.json(dbStore.getAchievements()); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Admin
app.get('/api/admin/stats', (req, res) => {
  try {
    const users = dbStore.getUsers();
    const results = dbStore.getFullResults();
    const questions = dbStore.getQuestions();
    const profiles = dbStore.getProfiles();
    const programs = dbStore.getPrograms();
    const profileCounts: Record<string, number> = {};
    profiles.forEach(p => { profileCounts[p.name] = 0; });
    results.forEach(r => { if (r.profile) { profileCounts[r.profile.name] = (profileCounts[r.profile.name] || 0) + 1; } });
    const programCounts: Record<string, number> = {};
    programs.forEach(p => { programCounts[p.name] = 0; });
    results.forEach(r => { if (r.program) { programCounts[r.program.name] = (programCounts[r.program.name] || 0) + 1; } });
    res.json({
      totalUsers: users.length, totalCompleted: results.length, totalQuestions: questions.length,
      totalProfiles: profiles.length, totalPrograms: programs.length,
      profileDistribution: Object.entries(profileCounts).map(([name, value]) => ({ name, value })),
      programDistribution: Object.entries(programCounts).map(([name, value]) => ({ name, value })),
      recentActivity: results.slice(-5).reverse().map(r => ({
        id: r.id, userName: r.user?.name || 'Anônimo', userEmail: r.user?.email || '-',
        programName: r.program?.name || 'Geral', profileName: r.profile?.name || 'Indefinido',
        date: r.calculatedAt
      }))
    });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/reset', (req, res) => {
  try { dbStore.resetAllData(); res.json({ success: true, message: 'Dados restaurados aos padrões originais com sucesso!' }); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Support
app.get('/api/support', (req, res) => {
  try { res.json(dbStore.getSupportMessages()); }
  catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/support', (req, res) => {
  try {
    const { name, email, message, userId } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required' });
    res.json(dbStore.addSupportMessage({ name, email, message, userId }));
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Export the Express app as a serverless function
export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req, res);
}
