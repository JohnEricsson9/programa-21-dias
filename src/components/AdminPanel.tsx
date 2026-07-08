/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Edit2, Trash2, Save, X, Database, ListOrdered, FileText, Settings, 
  ChevronRight, RefreshCw, BarChart3, Users, CheckSquare, Sparkles, LogOut, ArrowLeft, Key, Lock, Code, Calendar, Award, Mail
} from 'lucide-react';
import { Question, QuestionOption, Profile, ProfileRule, Mission, SupportMessage } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'stats' | 'questions' | 'profiles' | 'missions' | 'support' | 'supabase'>('stats');

  // Backend state
  const [questions, setQuestions] = useState<(Question & { options: QuestionOption[] })[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('prog-tabagismo');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form editing states
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  // Form text helpers for newline-separated list editing
  const [characteristicsText, setCharacteristicsText] = useState('');
  const [preferredMissionsText, setPreferredMissionsText] = useState('');
  const [rewardsText, setRewardsText] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Senha incorreta! Use "admin" ou "admin123" para testar.');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [questionsRes, profilesRes, statsRes, programsRes, missionsRes, supportRes] = await Promise.all([
        fetch('/api/questions'),
        fetch('/api/profiles'),
        fetch('/api/admin/stats'),
        fetch('/api/programs'),
        fetch('/api/missions'),
        fetch('/api/support')
      ]);

      if (!questionsRes.ok || !profilesRes.ok || !statsRes.ok || !programsRes.ok || !missionsRes.ok || !supportRes.ok) {
        throw new Error('Falha ao sincronizar dados com o servidor.');
      }

      setQuestions(await questionsRes.json());
      setProfiles(await profilesRes.json());
      setStats(await statsRes.json());
      
      const progs = await programsRes.json();
      setPrograms(progs);
      if (progs.length > 0 && !selectedProgramId) {
        setSelectedProgramId(progs[0].id);
      }
      
      setMissions(await missionsRes.json());
      setSupportMessages(await supportRes.json());
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha na comunicação com o backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Tem certeza de que deseja restaurar as perguntas, perfis, missões e regras padrão do sistema? Todas as respostas e progresso de teste serão limpos.')) {
      try {
        const res = await fetch('/api/admin/reset', { method: 'POST' });
        if (res.ok) {
          alert('Dados do NeuroPure restaurados com sucesso!');
          fetchAdminData();
        }
      } catch (err) {
        alert('Erro ao restaurar dados.');
      }
    }
  };

  // Filter lists based on selected program
  const filteredQuestions = questions.filter(q => q.programId === selectedProgramId);
  const filteredProfiles = profiles.filter(p => p.programId === selectedProgramId);
  const filteredMissions = missions.filter(m => m.programId === selectedProgramId);

  // --- Questions Form Management ---
  const startNewQuestion = () => {
    setEditingQuestion({
      id: '',
      programId: selectedProgramId,
      text: '',
      order: filteredQuestions.length + 1,
      options: [
        { text: '', profileWeights: {} },
        { text: '', profileWeights: {} },
        { text: '', profileWeights: {} },
        { text: '', profileWeights: {} }
      ]
    });
  };

  const startEditQuestion = (q: any) => {
    // Deep clone to prevent accidental direct state mutability
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion.text.trim()) return;

    // Filter out options that are blank
    const sanitizedOptions = editingQuestion.options
      .filter((opt: any) => opt.text.trim() !== '')
      .map((opt: any) => ({
        id: opt.id || undefined,
        text: opt.text.trim(),
        profileWeights: opt.profileWeights || {}
      }));

    if (sanitizedOptions.length < 2) {
      alert('Uma pergunta precisa de pelo menos 2 opções de resposta!');
      return;
    }

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingQuestion.id || undefined,
          programId: selectedProgramId,
          text: editingQuestion.text.trim(),
          order: Number(editingQuestion.order),
          options: sanitizedOptions
        })
      });

      if (res.ok) {
        setEditingQuestion(null);
        fetchAdminData();
      } else {
        alert('Erro ao salvar a pergunta.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Deseja excluir esta pergunta? Todas as opções e respostas atreladas a ela serão removidas permanentemente.')) {
      try {
        const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchAdminData();
        }
      } catch (err) {
        alert('Erro ao excluir pergunta.');
      }
    }
  };

  const handleOptionWeightChange = (optionIndex: number, profileId: string, value: number) => {
    if (!editingQuestion) return;
    const updated = { ...editingQuestion };
    const opt = updated.options[optionIndex];
    if (!opt.profileWeights) opt.profileWeights = {};
    
    if (value === 0) {
      delete opt.profileWeights[profileId];
    } else {
      opt.profileWeights[profileId] = value;
    }
    setEditingQuestion(updated);
  };

  const handleOptionTextChange = (index: number, val: string) => {
    if (!editingQuestion) return;
    const updated = { ...editingQuestion };
    updated.options[index].text = val;
    setEditingQuestion(updated);
  };

  const addOptionField = () => {
    if (!editingQuestion) return;
    const updated = { ...editingQuestion };
    updated.options.push({ text: '', profileWeights: {} });
    setEditingQuestion(updated);
  };

  // --- Profiles Form Management ---
  const startNewProfile = () => {
    const defaultId = 'perf-' + selectedProgramId.replace('prog-', '') + '-' + Math.random().toString(36).substring(2, 6);
    setEditingProfile({
      id: defaultId,
      programId: selectedProgramId,
      name: '',
      icon: '🚀',
      color: 'orange',
      summary: '',
      characteristics: [],
      gamificationType: '',
      mainMessage: '',
      preferredMissions: [],
      rewards: [],
      customReportText: '',
      keyPoints: [],
      recommendedObjective: ''
    });
    setCharacteristicsText('');
    setPreferredMissionsText('');
    setRewardsText('');
  };

  const startEditProfile = (p: Profile) => {
    setEditingProfile({ ...p });
    setCharacteristicsText(p.characteristics ? p.characteristics.join('\n') : '');
    setPreferredMissionsText(p.preferredMissions ? p.preferredMissions.join('\n') : '');
    setRewardsText(p.rewards ? p.rewards.join('\n') : '');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editingProfile.id || !editingProfile.name.trim()) return;

    const characteristics = characteristicsText.split('\n').map(pt => pt.trim()).filter(Boolean);
    const preferredMissions = preferredMissionsText.split('\n').map(pt => pt.trim()).filter(Boolean);
    const rewards = rewardsText.split('\n').map(pt => pt.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProfile,
          characteristics,
          preferredMissions,
          rewards,
          keyPoints: characteristics // mirror characteristics for backwards compatibility
        })
      });

      if (res.ok) {
        setEditingProfile(null);
        fetchAdminData();
      } else {
        alert('Erro ao salvar o perfil.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar.');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (confirm('Deseja excluir este perfil? Todas as regras de pontuação associadas serão excluídas.')) {
      try {
        const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchAdminData();
        }
      } catch (err) {
        alert('Erro ao deletar perfil.');
      }
    }
  };

  // --- Missions Form Management ---
  const startNewMission = () => {
    setEditingMission({
      id: '',
      programId: selectedProgramId,
      day: filteredMissions.length + 1,
      title: '',
      description: '',
      xpAwarded: 100,
      category: 'Habit'
    });
  };

  const startEditMission = (m: Mission) => {
    setEditingMission({ ...m });
  };

  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission || !editingMission.title.trim()) return;

    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingMission,
          day: Number(editingMission.day),
          xpAwarded: Number(editingMission.xpAwarded)
        })
      });

      if (res.ok) {
        setEditingMission(null);
        fetchAdminData();
      } else {
        alert('Erro ao salvar a missão.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar missão.');
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (confirm('Deseja excluir esta missão? Ela deixará de fazer parte da jornada de 21 dias.')) {
      try {
        const res = await fetch(`/api/missions/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchAdminData();
        }
      } catch (err) {
        alert('Erro ao excluir missão.');
      }
    }
  };

  // Supabase SQL DDL for developer instruction
  const supabaseDDL = `-- SCRIPT DE CRIAÇÃO DE TABELAS PARA SUPABASE (POSTGRESQL)
-- Cole este script no SQL Editor do seu projeto Supabase para criar as tabelas do NeuroPure.

-- 1. Tabela Users
CREATE TABLE IF NOT EXISTS public."Users" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela Questions
CREATE TABLE IF NOT EXISTS public."Questions" (
    id TEXT PRIMARY KEY,
    program_id TEXT NOT NULL,
    text TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- 3. Tabela QuestionOptions
CREATE TABLE IF NOT EXISTS public."QuestionOptions" (
    id TEXT PRIMARY KEY,
    question_id TEXT REFERENCES public."Questions"(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    profile_weights JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- 4. Tabela Profiles
CREATE TABLE IF NOT EXISTS public."Profiles" (
    id TEXT PRIMARY KEY,
    program_id TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    summary TEXT NOT NULL,
    characteristics TEXT[] DEFAULT '{}'::text[] NOT NULL,
    gamification_type TEXT NOT NULL,
    main_message TEXT NOT NULL,
    preferred_missions TEXT[] DEFAULT '{}'::text[] NOT NULL,
    rewards TEXT[] DEFAULT '{}'::text[] NOT NULL,
    custom_report_text TEXT NOT NULL,
    key_points TEXT[] DEFAULT '{}'::text[] NOT NULL,
    recommended_objective TEXT NOT NULL
);

-- 5. Tabela Missions
CREATE TABLE IF NOT EXISTS public."Missions" (
    id TEXT PRIMARY KEY,
    program_id TEXT NOT NULL,
    day INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_awarded INTEGER NOT NULL,
    category TEXT NOT NULL
);

-- 6. Tabela UserAnswers
CREATE TABLE IF NOT EXISTS public."UserAnswers" (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public."Users"(id) ON DELETE CASCADE,
    question_id TEXT REFERENCES public."Questions"(id) ON DELETE CASCADE,
    option_id TEXT REFERENCES public."QuestionOptions"(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
`;

  // --- Password Gate ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 text-emerald-700">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Painel do Administrador</h2>
          <p className="text-xs text-slate-500 font-medium">Insira a senha mestra para fazer alterações dinâmicas de perguntas, perfis e missões.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Senha de Acesso</label>
            <div className="relative">
              <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Insira admin ou admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-sm font-medium"
                required
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-100 mt-2">
                {authError}
              </p>
            )}
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/10 active:translate-y-0.5 cursor-pointer"
            >
              Acessar Painel
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-400 text-center">
          Credencial de teste rápida: <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">admin</code>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Painel Administrativo
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            Controle NeuroPure SaaS
          </h2>
          <p className="text-xs text-slate-400 font-semibold">Telas, perguntas, missões e perfis totalmente parametrizados.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="h-10 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            title="Restaura banco de dados aos padrões"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
            Resetar Banco
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
          <button
            onClick={onBack}
            className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-700/10 transition-all cursor-pointer"
          >
            Ver App
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Program Switcher Tab Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Database className="w-4.5 h-4.5 text-emerald-700" />
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Programa Comportamental:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {programs.map((prog) => {
            const isActive = selectedProgramId === prog.id;
            return (
              <button
                key={prog.id}
                onClick={() => {
                  setSelectedProgramId(prog.id);
                  setEditingQuestion(null);
                  setEditingProfile(null);
                  setEditingMission(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60'
                }`}
              >
                {prog.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 border-b border-slate-100">
        <button
          onClick={() => { setActiveTab('stats'); setEditingQuestion(null); setEditingProfile(null); setEditingMission(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'stats' ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
          Visão Geral
        </button>
        <button
          onClick={() => { setActiveTab('questions'); setEditingQuestion(null); setEditingProfile(null); setEditingMission(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'questions' ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5 inline mr-1.5" />
          Perguntas ({filteredQuestions.length})
        </button>
        <button
          onClick={() => { setActiveTab('profiles'); setEditingQuestion(null); setEditingProfile(null); setEditingMission(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'profiles' ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5 inline mr-1.5" />
          Perfis & Relatório ({filteredProfiles.length})
        </button>
        <button
          onClick={() => { setActiveTab('missions'); setEditingQuestion(null); setEditingProfile(null); setEditingMission(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'missions' ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
          Missões 21 Dias ({filteredMissions.length})
        </button>
        <button
          onClick={() => { setActiveTab('support'); setEditingQuestion(null); setEditingProfile(null); setEditingMission(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'support' ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <Mail className="w-3.5 h-3.5 inline mr-1.5" />
          Mensagens de Ajuda ({supportMessages.length})
        </button>
        <button
          onClick={() => { setActiveTab('supabase'); setEditingQuestion(null); setEditingProfile(null); setEditingMission(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'supabase' ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <Code className="w-3.5 h-3.5 inline mr-1.5" />
          Supabase SQL
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* --- STATS TAB --- */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 border border-emerald-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usuários NeuroPure</span>
                <p className="text-xl font-extrabold text-slate-800">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 border border-emerald-100">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfis Mapeados</span>
                <p className="text-xl font-extrabold text-slate-800">{stats.totalCompleted}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 border border-emerald-100">
                <ListOrdered className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perguntas Totais</span>
                <p className="text-xl font-extrabold text-slate-800">{stats.totalQuestions}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 border border-emerald-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Programas Ativos</span>
                <p className="text-xl font-extrabold text-slate-800">{stats.totalPrograms}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profiles distribution */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Mapeamento por Perfil (SaaS NeuroPure)
              </h3>
              <div className="space-y-3.5">
                {stats.profileDistribution && stats.profileDistribution.map((p: any, idx: number) => {
                  const percent = stats.totalCompleted > 0 ? Math.round((p.value / stats.totalCompleted) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600 truncate max-w-[80%]">{p.name}</span>
                        <span className="text-slate-800">{p.value} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent activity list */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Users className="w-4 h-4 text-emerald-600" />
                Histórico de Diagnósticos Recentes
              </h3>
              <div className="divide-y divide-slate-100">
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-medium">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800">{activity.userName}</p>
                        <p className="text-slate-400 text-[10px]">{activity.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="inline-block bg-slate-100 text-slate-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-slate-200">
                            {activity.programName}
                          </span>
                          <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                            {activity.profileName.split(' (')[0]}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">{new Date(activity.date).toLocaleDateString('pt-BR')} {new Date(activity.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">Nenhum resultado gerado ainda.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- QUESTIONS TAB --- */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
              Perguntas Ativas ({filteredQuestions.length})
            </h3>
            {!editingQuestion && (
              <button
                onClick={startNewQuestion}
                className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-700/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nova Pergunta
              </button>
            )}
          </div>

          {editingQuestion ? (
            <form onSubmit={handleSaveQuestion} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold text-slate-800">
                  {editingQuestion.id ? 'Editar Pergunta' : 'Nova Pergunta Dinâmica'}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Título da Pergunta</label>
                  <input
                    type="text"
                    value={editingQuestion.text}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                    className="w-full h-11 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                    placeholder="ex: Qual o seu maior vício de saúde?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Ordem (Exibição)</label>
                  <input
                    type="number"
                    value={editingQuestion.order}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, order: e.target.value })}
                    className="w-full h-11 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Options weights logic builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opções de Resposta e Pesos (Matriz de Perfil)</h5>
                  <button
                    type="button"
                    onClick={addOptionField}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    + Adicionar Opção
                  </button>
                </div>

                <div className="space-y-4">
                  {editingQuestion.options.map((opt: any, optIndex: number) => (
                    <div key={optIndex} className="bg-white p-4 rounded-xl border border-slate-200/60 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <input
                           type="text"
                           value={opt.text}
                           onChange={(e) => handleOptionTextChange(optIndex, e.target.value)}
                           className="flex-1 h-10 px-3 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white"
                           placeholder={`Texto da opção ${String.fromCharCode(65 + optIndex)} (deixe em branco para remover)`}
                        />
                      </div>

                      {/* Weight configurator */}
                      <div className="pl-8 space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pesos atribuídos a perfis ao escolher esta opção:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {filteredProfiles.map(p => {
                            const currentWeight = opt.profileWeights?.[p.id] || 0;
                            return (
                              <div key={p.id} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-150 text-[11px] font-semibold">
                                <span className="text-slate-500 truncate max-w-[60%]">{p.name}</span>
                                <select
                                  value={currentWeight}
                                  onChange={(e) => handleOptionWeightChange(optIndex, p.id, Number(e.target.value))}
                                  className="h-7 text-[10px] bg-white border border-slate-200 rounded px-1 text-slate-700"
                                >
                                  <option value={0}>Sem pontuar</option>
                                  <option value={1}>+1 Ponto</option>
                                  <option value={2}>+2 Pontos</option>
                                  <option value={3}>+3 Pontos (Forte)</option>
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="h-10 px-4 bg-slate-200 text-slate-600 hover:bg-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-700/10"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Pergunta
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q) => (
                <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded">
                        Ordem #{q.order}
                      </span>
                      <span className="text-slate-400 text-[10px] font-semibold">ID: {q.id}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{q.text}</h4>

                    <div className="flex flex-col gap-1.5 pt-1">
                      {q.options && q.options.map((o, idx) => {
                        const weights = Object.entries(o.profileWeights || {})
                          .map(([profId, score]) => {
                            const prof = profiles.find(p => p.id === profId);
                            return prof ? `${prof.name}: +${score}` : `${profId}: +${score}`;
                          })
                          .join(', ');
                        
                        return (
                          <div key={o.id} className="text-[11px] text-slate-600 bg-slate-50/50 p-2 rounded border border-slate-100 leading-normal">
                            <span className="font-bold text-slate-700">{String.fromCharCode(65 + idx)}) {o.text}</span>
                            {weights && (
                              <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">➔ {weights}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditQuestion(q)}
                      className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-lg border border-slate-100 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg border border-slate-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredQuestions.length === 0 && (
                <p className="text-xs text-slate-400 py-8 text-center bg-white border border-slate-100 rounded-2xl">Não há perguntas ativas cadastradas para este programa comportamental ainda.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- PROFILES TAB --- */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
              Perfis de Diagnóstico ({filteredProfiles.length})
            </h3>
            {!editingProfile && (
              <button
                onClick={startNewProfile}
                className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-700/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Novo Perfil
              </button>
            )}
          </div>

          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold text-slate-800">
                  {editingProfile.id && profiles.some(p => p.id === editingProfile.id) ? 'Editar Perfil & Matriz' : 'Novo Perfil'}
                </h4>
                <button type="button" onClick={() => setEditingProfile(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ID Único</label>
                  <input
                    type="text"
                    value={editingProfile.id}
                    onChange={(e) => setEditingProfile({ ...editingProfile, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    disabled={profiles.some(p => p.id === editingProfile.id)}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                    placeholder="ex: perf-tab-impulsivo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Perfil</label>
                  <input
                    type="text"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                    placeholder="ex: Explorador"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Ícone (Emoji)</label>
                  <input
                    type="text"
                    value={editingProfile.icon || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, icon: e.target.value })}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                    placeholder="ex: 🚀"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Cor Primária</label>
                  <select
                    value={editingProfile.color || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, color: e.target.value })}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                    required
                  >
                    <option value="orange">Laranja (🚀)</option>
                    <option value="blue">Azul (🧠)</option>
                    <option value="green">Verde (💬)</option>
                    <option value="purple">Roxo (🛡️)</option>
                    <option value="emerald">Esmeralda (🍃)</option>
                    <option value="pink">Rosa</option>
                    <option value="amber">Amber</option>
                    <option value="indigo">Índigo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição Curta (Resumo de Diagnóstico)</label>
                <textarea
                  value={editingProfile.summary || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, summary: e.target.value })}
                  className="w-full p-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium h-20"
                  placeholder="Resumo curto exibido na lista ou topo do relatório..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Características (Base Comportamental) - Uma por linha</label>
                <textarea
                  value={characteristicsText}
                  onChange={(e) => setCharacteristicsText(e.target.value)}
                  className="w-full p-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-mono h-24"
                  placeholder="Gosta de novidades&#10;Dificuldade em focar&#10;Quer resultados imediatos"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Gamificação Recomendada</label>
                  <input
                    type="text"
                    value={editingProfile.gamificationType || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, gamificationType: e.target.value })}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                    placeholder="ex: Missões rápidas, muito XP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Mensagem de Apoio Principal</label>
                  <input
                    type="text"
                    value={editingProfile.mainMessage || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, mainMessage: e.target.value })}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                    placeholder="ex: Você vence uma pequena batalha por vez."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Missões Preferenciais - Uma por linha</label>
                <textarea
                  value={preferredMissionsText}
                  onChange={(e) => setPreferredMissionsText(e.target.value)}
                  className="w-full p-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-mono h-20"
                  placeholder="Minhas primeiras tarefas rápidas&#10;Desafio físico de 5 minutos"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Recompensas Estimulantes - Uma por linha</label>
                <textarea
                  value={rewardsText}
                  onChange={(e) => setRewardsText(e.target.value)}
                  className="w-full p-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-mono h-20"
                  placeholder="Medalha Bronze Rápida&#10;Bônus de 50 XP"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Objetivo Geral Recomendado</label>
                <input
                  type="text"
                  value={editingProfile.recommendedObjective || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, recommendedObjective: e.target.value })}
                  className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                  placeholder="ex: Adiar o primeiro cigarro em 15 minutos."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Relatório Personalizado (Texto de Análise em Markdown)</label>
                <textarea
                  value={editingProfile.customReportText || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, customReportText: e.target.value })}
                  className="w-full p-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium h-36 leading-relaxed"
                  placeholder="Seu comportamento é direcionado à pressa e novidades. Para ter sucesso no programa de 21 dias, use ganchos de gratificação imediata..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
                <button type="button" onClick={() => setEditingProfile(null)} className="h-10 px-4 bg-slate-200 text-slate-600 hover:bg-slate-300 text-xs font-bold rounded-xl">
                  Cancelar
                </button>
                <button type="submit" className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md">
                  <Save className="w-3.5 h-3.5" />
                  Salvar Perfil
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProfiles.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-1 rounded flex items-center gap-1 border border-slate-200">
                        <span>{p.icon || '🚀'}</span>
                        <span>ID: {p.id}</span>
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditProfile(p)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-lg border border-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(p.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg border border-slate-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span className="text-lg">{p.icon || '🚀'}</span>
                      <span className="border-b-2" style={{ borderColor: p.color === 'orange' ? '#f97316' : p.color === 'blue' ? '#3b82f6' : p.color === 'green' ? '#22c55e' : p.color === 'purple' ? '#a855f7' : '#10b981' }}>
                        {p.name}
                      </span>
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed font-normal">{p.summary}</p>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Características:</span>
                      <div className="flex flex-wrap gap-1">
                        {p.characteristics && p.characteristics.map((c, i) => (
                          <span key={i} className="bg-slate-50 border border-slate-100 text-[9px] font-medium text-slate-600 px-1.5 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gamificação:</span>
                      <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 inline-block">{p.gamificationType}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mensagem Principal:</span>
                      <p className="text-xs text-slate-600 font-medium italic border-l-2 border-slate-300 pl-2">"{p.mainMessage}"</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[10px] text-slate-700">
                    <strong className="font-bold text-emerald-800">Objetivo: </strong>{p.recommendedObjective}
                  </div>
                </div>
              ))}
              {filteredProfiles.length === 0 && (
                <p className="text-xs text-slate-400 col-span-2 text-center py-8">Nenhum perfil cadastrado para este programa comportamental ainda.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- MISSIONS TAB --- */}
      {activeTab === 'missions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
              Missões Jornada de 21 Dias ({filteredMissions.length})
            </h3>
            {!editingMission && (
              <button
                onClick={startNewMission}
                className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-700/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Nova Missão
              </button>
            )}
          </div>

          {editingMission ? (
            <form onSubmit={handleSaveMission} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold text-slate-800">
                  {editingMission.id ? 'Editar Missão de Jornada' : 'Nova Missão Diária'}
                </h4>
                <button type="button" onClick={() => setEditingMission(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Dia (1 a 21)</label>
                  <input
                    type="number"
                    min="1"
                    max="21"
                    value={editingMission.day}
                    onChange={(e) => setEditingMission({ ...editingMission, day: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Título da Missão</label>
                  <input
                    type="text"
                    value={editingMission.title}
                    onChange={(e) => setEditingMission({ ...editingMission, title: e.target.value })}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                    placeholder="ex: Adiar e Substituir"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
                  <select
                    value={editingMission.category || 'Habit'}
                    onChange={(e) => setEditingMission({ ...editingMission, category: e.target.value })}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                  >
                    <option value="Habit">Hábito / Comportamento (Habit)</option>
                    <option value="Breathing">Respiração / Meditação (Breathing)</option>
                    <option value="Challenge">Desafio Físico (Challenge)</option>
                    <option value="Reflection">Reflexão Escrita (Reflection)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">XP Premiado</label>
                  <input
                    type="number"
                    value={editingMission.xpAwarded}
                    onChange={(e) => setEditingMission({ ...editingMission, xpAwarded: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                    placeholder="ex: 100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Instruções / Descrição Completa</label>
                <textarea
                  value={editingMission.description}
                  onChange={(e) => setEditingMission({ ...editingMission, description: e.target.value })}
                  className="w-full p-3 text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium h-24 leading-normal"
                  placeholder="Descreva passo a passo o que o usuário deve fazer hoje ao iniciar esta missão..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
                <button type="button" onClick={() => setEditingMission(null)} className="h-10 px-4 bg-slate-200 text-slate-600 hover:bg-slate-300 text-xs font-bold rounded-xl">
                  Cancelar
                </button>
                <button type="submit" className="h-10 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md">
                  <Save className="w-3.5 h-3.5" />
                  Salvar Missão
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {filteredMissions.sort((a, b) => a.day - b.day).map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-emerald-100 uppercase">
                        Dia {m.day}
                      </span>
                      <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded">
                        {m.category === 'Habit' ? 'Hábito' : m.category === 'Breathing' ? 'Respiração' : m.category === 'Challenge' ? 'Desafio' : 'Reflexão'}
                      </span>
                      <span className="text-slate-400 text-[10px] font-semibold">+{m.xpAwarded} XP</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800">{m.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">{m.description}</p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditMission(m)}
                      className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-lg border border-slate-100 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMission(m.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg border border-slate-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredMissions.length === 0 && (
                <p className="text-xs text-slate-400 py-8 text-center bg-white border border-slate-100 rounded-2xl">Não há missões de 21 dias cadastradas para este programa ainda.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- SUPPORT TAB --- */}
      {activeTab === 'support' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Mail className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Mensagens enviadas no "Eu preciso de ajuda"</h3>
          </div>
          <p className="text-xs text-slate-500 font-light">
            Sempre responda aos usuários diretamente em seus e-mails listados abaixo.
          </p>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {supportMessages.map((msg) => (
              <div key={msg.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">{msg.name}</h4>
                    <p className="text-[10px] text-emerald-700 font-bold">{msg.email}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(msg.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-xl text-xs font-medium text-slate-700 whitespace-pre-wrap">
                  {msg.message}
                </div>
                <div className="text-right">
                  <a
                    href={`mailto:${msg.email}?subject=Suporte NeuroPure - Olá, ${msg.name}`}
                    className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-all"
                  >
                    Responder por E-mail
                  </a>
                </div>
              </div>
            ))}

            {supportMessages.length === 0 && (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl text-slate-400">
                <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Nenhuma mensagem de ajuda recebida ainda.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUPABASE TAB --- */}
      {activeTab === 'supabase' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-slate-800">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">Configuração de Escalar SaaS (Supabase)</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Desenvolvemos o esquema relacional SQL completo contendo as tabelas 
            <strong> Users, Questions, QuestionOptions, Profiles, Missions, e UserAnswers</strong> para que a plataforma NeuroPure esteja pronta para rodar em produção.
            Cole o script DDL abaixo no SQL Editor do Supabase para criar as tabelas instantaneamente!
          </p>

          <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-950">
            <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed select-all">
              {supabaseDDL}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
