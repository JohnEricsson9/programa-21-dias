/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Question, QuestionOption } from '../types';

interface QuizViewProps {
  questions: (Question & { options: QuestionOption[] })[];
  userId: string;
  onAnswerSaved: (questionId: string, optionId: string) => Promise<void>;
  onFinish: () => void;
}

export default function QuizView({ questions, userId, onAnswerSaved, onFinish }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="font-semibold">Nenhuma pergunta cadastrada no sistema.</p>
        <p className="text-sm mt-1">Por favor, acesse o Painel Administrativo para cadastrar perguntas.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex) / questions.length) * 100);

  const handleOptionSelect = async (optionId: string) => {
    setSelectedOptionId(optionId);
    setError(null);
    setIsSaving(true);

    try {
      // Save answer in the database instantly
      await onAnswerSaved(currentQuestion.id, optionId);

      // Simple delay to show selection before moving forward (improves UX)
      setTimeout(() => {
        setIsSaving(false);
        setSelectedOptionId(null);
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          onFinish();
        }
      }, 350);
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro ao salvar sua resposta. Tente novamente.');
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOptionId(null);
      setError(null);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[75vh] justify-between py-4 px-2">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0 || isSaving}
          className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            currentIndex === 0
              ? 'text-slate-300 border-slate-100 cursor-not-allowed'
              : 'text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800 active:translate-y-0.5'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Anterior
        </button>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          Pergunta {currentIndex + 1} de {questions.length}
        </span>
      </div>

      {/* Progress Tracker */}
      <div className="w-full mb-8">
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
          <span>Sua Avaliação</span>
          <span>{progressPercent}% Concluído</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-[#B89A6C] to-[#E2C799] rounded-full"
          />
        </div>
      </div>

      {/* Centered Question Box */}
      <div className="my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* Question Card */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-slate-900 text-[#B89A6C] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#B89A6C]/35">
                <HelpCircle className="w-3.5 h-3.5 text-[#B89A6C]" />
                ETAPA {currentIndex + 1}
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800 tracking-tight leading-tight">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Response Options (Big clickable cards) */}
            <div className="grid grid-cols-1 gap-3.5 pt-2">
              {currentQuestion.options && currentQuestion.options.map((option, index) => {
                const isSelected = selectedOptionId === option.id;
                const letter = String.fromCharCode(65 + index); // A, B, C, D...

                return (
                  <motion.button
                    key={option.id}
                    onClick={() => !isSaving && handleOptionSelect(option.id)}
                    disabled={isSaving}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 text-sm md:text-base font-medium flex items-center justify-between gap-4 transition-all relative ${
                      isSelected
                        ? 'border-[#B89A6C] bg-[#B89A6C]/10 text-slate-900 shadow-md'
                        : 'border-slate-200 bg-white hover:border-[#B89A6C]/50 hover:bg-slate-50/50 text-slate-700 shadow-sm shadow-slate-100/50'
                    } ${isSaving && !isSelected ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Stylized letter badge */}
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-[#B89A6C] border border-[#B89A6C]/40 shadow-sm'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {letter}
                      </span>
                      <span className="leading-snug">{option.text}</span>
                    </div>

                    {/* Completion ring */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'border-[#B89A6C] bg-slate-900'
                        : 'border-slate-300 bg-transparent'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#B89A6C]" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}
      </div>

      {/* Helper Footer Hint */}
      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        {isSaving ? 'Gravando resposta...' : 'Selecione uma opção para avançar automaticamente.'}
      </div>
    </div>
  );
}
