/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Calendar, Target, AlertTriangle, Play, Brain, RefreshCw, ChevronRight } from 'lucide-react';
import { Profile, Result, Question, QuestionOption } from '../types';

interface ReportViewProps {
  userName: string;
  profile: Profile;
  result: Result;
  questions: (Question & { options: QuestionOption[] })[];
  userAnswers: Record<string, string>; // Maps questionId to optionId
  onReset: () => void;
  onStartJourney: () => void;
}

export default function ReportView({ userName, profile, result, questions, userAnswers, onReset, onStartJourney }: ReportViewProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Extract answers program-agnostically by indexing questions array
  const q1 = questions[0];
  const q2 = questions[1];
  const q3 = questions[2];

  const getChosenOptionText = (questionId?: string): string => {
    if (!questionId) return 'Não respondido';
    const chosenOptionId = userAnswers[questionId];
    if (!chosenOptionId) return 'Não respondido';
    const q = questions.find(item => item.id === questionId);
    const opt = q?.options.find(o => o.id === chosenOptionId);
    return opt ? opt.text : 'Não respondido';
  };

  const objectiveText = q1 ? getChosenOptionText(q1.id) : 'Atingir metas de saúde';
  const triggerText = q2 ? getChosenOptionText(q2.id) : 'Estresse do dia a dia';
  const difficultyText = q3 ? getChosenOptionText(q3.id) : 'Falta de consistência';

  // Clean trigger and difficulty texts for badge-size formatting
  const formattedTrigger = triggerText ? triggerText.split(' em excesso')[0].split(' ou ')[0] : 'Estresse';
  const formattedDifficulty = difficultyText ? difficultyText.split(' e ')[0].split(' ou ')[0] : 'Rotina';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full space-y-6 pb-12"
    >
      {/* Visual Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 bg-slate-900 text-[#B89A6C] text-xs font-bold px-3 py-1 rounded-full border border-[#B89A6C]/30">
          <Brain className="w-3.5 h-3.5" />
          Avaliação Concluída
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-800 tracking-tight">
          Olá, <span className="text-[#B89A6C] italic">{userName}</span>!
        </h2>
        <p className="text-sm text-slate-500 font-light">
          Mapeamos suas respostas com sucesso. Veja seu plano de 21 dias personalizado:
        </p>
      </div>

      {/* Main Dashboard Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden text-left">
        {/* Subtle decorative background light */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#B89A6C]/5 rounded-full blur-2xl"></div>

        {/* Dashboard Title & Meta */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5 text-left">
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#B89A6C]" />
              Meu Plano Personalizado
            </h3>
            <p className="text-xs text-slate-400 font-light">A jornada de 21 dias para sua melhor versão.</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 text-slate-500 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#B89A6C]" />
            Dia 1 de 21
          </div>
        </div>

        {/* Customized Objective Banner */}
        <div className="bg-amber-50/20 border border-[#B89A6C]/15 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-[#B89A6C] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seu Objetivo Mapeado</h4>
            <p className="text-sm font-semibold text-slate-800 leading-snug">{objectiveText}</p>
          </div>
        </div>

        {/* Trigger and Difficulty Grid Cards */}
        <div className="grid grid-cols-2 gap-3.5 text-left">
          {/* Trigger Card */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seu Maior Gatilho</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B89A6C] shrink-0"></span>
              <span className="text-sm font-extrabold text-slate-800 leading-tight truncate">{formattedTrigger}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal font-light">
              Mecanismos neurais de recompensa rápida reagem a este estímulo.
            </p>
          </div>

          {/* Difficulty Card */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maior Obstáculo</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B89A6C] shrink-0"></span>
              <span className="text-sm font-extrabold text-slate-800 leading-tight truncate">{formattedDifficulty}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal font-light">
              Âncoras de rotina curtas irão blindar sua resiliência mental.
            </p>
          </div>
        </div>
      </div>

      {/* Behavioral Diagnostic Profile Details */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5 text-left">
        {/* Profile Card Header */}
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Seu Perfil de Comportamento</span>
          <h3 className="text-xl font-serif font-black text-[#B89A6C] flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#B89A6C]" />
            {profile.name}
          </h3>
        </div>

        {/* Summary Description */}
        <p className="text-sm text-slate-600 leading-relaxed font-light border-l-2 border-[#B89A6C] pl-4 py-0.5">
          {profile.summary}
        </p>

        {/* Key Diagnostic Strengths */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Seus Traços de Destaque:</h4>
          <ul className="space-y-1.5 pl-1">
            {profile.keyPoints && profile.keyPoints.map((point, index) => (
              <li key={index} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#B89A6C] shrink-0"></span>
                <span className="font-medium">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Target Objective */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-slate-800">
            <Target className="w-4.5 h-4.5 text-[#B89A6C]" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider">Objetivo Recomendado:</h4>
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-normal pl-6">
            {profile.recommendedObjective}
          </p>
        </div>
      </div>

      {/* Program Entry CTA Block */}
      <div className="bg-slate-900 border-2 border-[#B89A6C] rounded-3xl p-6 md:p-8 text-white shadow-xl space-y-5 text-center relative overflow-hidden">
        {/* Abstract background graphics representing "Cada respiração é um novo começo" */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <AnimatePresence mode="wait">
          {!isSubscribed ? (
            <motion.div
              key="cta-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 relative"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-extrabold text-[#B89A6C]">Participe do Programa 21 Dias</h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed font-light">
                  Receba tarefas e treinos de respiração diários sob medida para o perfil <strong className="font-bold text-white">{profile.name.split(' (')[0]}</strong>.
                </p>
              </div>

              <div className="text-center italic text-[#B89A6C] text-xs py-1">
                "Cada respiração é um novo começo."
              </div>

              {/* Touch button */}
              <button
                onClick={() => {
                  setIsSubscribed(true);
                  setTimeout(() => {
                    onStartJourney();
                  }, 1200); // Small smooth transition delay to display success animation nicely
                }}
                className="w-full max-w-xs mx-auto h-13 bg-[#B89A6C] text-slate-900 hover:bg-[#E2C799] font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-all cursor-pointer select-none"
              >
                INICIAR MISSÃO DO DIA
                <ChevronRight className="w-4 h-4 text-slate-900" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="cta-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 py-3 relative"
            >
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/20">
                <CheckCircle className="w-8 h-8 text-[#B89A6C]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-extrabold text-[#B89A6C]">Missão de Hoje Iniciada!</h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed font-light">
                  Parabéns, <strong className="font-bold text-white">{userName}</strong>! Você foi inscrito com sucesso na jornada do perfil <strong className="font-bold text-white">{profile.name.split(' (')[0]}</strong>.
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
                  Redirecionando para o seu Painel de Missões e SOS...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
