/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, Sparkles, ShieldCheck, Heart, Users, Wind, Brain, Moon, Flame, ShieldAlert, Check
} from 'lucide-react';

interface WelcomeViewProps {
  onStart: (name: string, email: string, programId: string) => void;
}

const PROGRAMS_PRESET = [
  {
    id: 'prog-tabagismo',
    name: 'Tabagismo',
    description: 'Elimine a dependência física e emocional do cigarro em 21 dias.',
    icon: Wind,
    badge: 'Mais Procurado',
    styles: {
      text: 'text-[#B89A6C]',
      bg: 'bg-amber-50/20',
      border: 'border-[#B89A6C]/15',
      activeBorder: 'border-[#B89A6C] ring-2 ring-[#B89A6C]/10'
    }
  },
  {
    id: 'prog-ansiedade',
    name: 'Ansiedade',
    description: 'Controle de crises, desaceleração e regulação de pensamentos.',
    icon: Brain,
    styles: {
      text: 'text-[#B89A6C]',
      bg: 'bg-amber-50/20',
      border: 'border-[#B89A6C]/15',
      activeBorder: 'border-[#B89A6C] ring-2 ring-[#B89A6C]/10'
    }
  },
  {
    id: 'prog-insonia',
    name: 'Insônia & Sono',
    description: 'Higiene do sono, relaxamento e melhora na energia diurna.',
    icon: Moon,
    styles: {
      text: 'text-[#B89A6C]',
      bg: 'bg-amber-50/20',
      border: 'border-[#B89A6C]/15',
      activeBorder: 'border-[#B89A6C] ring-2 ring-[#B89A6C]/10'
    }
  },
  {
    id: 'prog-emagrecimento',
    name: 'Emagrecimento',
    description: 'Supere a compulsão alimentar e reconstrua sua relação com o prato.',
    icon: Flame,
    styles: {
      text: 'text-[#B89A6C]',
      bg: 'bg-amber-50/20',
      border: 'border-[#B89A6C]/15',
      activeBorder: 'border-[#B89A6C] ring-2 ring-[#B89A6C]/10'
    }
  },
  {
    id: 'prog-estresse',
    name: 'Gestão de Estresse',
    description: 'Métodos práticos de descompressão diária e prevenção de burnout.',
    icon: ShieldAlert,
    styles: {
      text: 'text-[#B89A6C]',
      bg: 'bg-amber-50/20',
      border: 'border-[#B89A6C]/15',
      activeBorder: 'border-[#B89A6C] ring-2 ring-[#B89A6C]/10'
    }
  }
];

export default function WelcomeView({ onStart }: WelcomeViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedProgId, setSelectedProgId] = useState('prog-tabagismo');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, informe um email válido.');
      return;
    }
    onStart(name.trim(), email.trim(), selectedProgId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full flex flex-col justify-between min-h-[85vh] py-4 px-2"
    >
      {/* Visual Branding Section */}
      <div className="flex flex-col items-center text-center space-y-5 my-auto">
        {/* Animated circular logo wrapper matching the glossy black/gold button in mockup */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#B89A6C]/15 rounded-full blur-2xl animate-pulse"></div>
          
          {/* Main Logo Container */}
          <div className="relative w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-2 border-[#B89A6C] overflow-hidden">
            {/* Glossy radial gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none"></div>
            {/* Spin Ring */}
            <div className="absolute inset-1.5 rounded-full border border-[#B89A6C]/25 animate-[spin_12s_linear_infinite]"></div>
            
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="z-10 text-[#B89A6C] flex flex-col items-center justify-center"
            >
              <Heart className="w-10 h-10 fill-[#B89A6C]/10 text-[#B89A6C]" />
              <span className="text-[10px] font-black tracking-widest mt-1 font-serif">NEUROPURE</span>
            </motion.div>
          </div>
          
          <div className="absolute -top-1 -right-4 bg-slate-900 text-[#B89A6C] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-[#B89A6C]/50">
            <ShieldCheck className="w-3 h-3 text-[#B89A6C]" />
            V2 MULTI-PROGRAM
          </div>
        </div>

        {/* Typography Cluster */}
        <div className="space-y-1.5">
          <h1 className="font-serif text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            Motor de Programas <span className="text-[#B89A6C] font-extrabold relative italic">NeuroPure<span className="absolute left-0 bottom-0.5 w-full h-0.5 bg-[#B89A6C]/30 -z-10"></span></span>
          </h1>
          <p className="font-sans text-xs md:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed font-light">
            Selecione o programa comportamental de 21 dias e descubra seu diagnóstico instantâneo sob medida.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 text-left bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          
          {/* USER INFO FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seu Nome</label>
              <input
                type="text"
                placeholder="ex: João Silva"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                className="w-full h-10 px-3 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B89A6C]/10 focus:border-[#B89A6C] transition-all placeholder:text-slate-400 text-xs font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seu Melhor Email</label>
              <input
                type="email"
                placeholder="ex: joao@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full h-10 px-3 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B89A6C]/10 focus:border-[#B89A6C] transition-all placeholder:text-slate-400 text-xs font-semibold"
                required
              />
            </div>
          </div>

          {/* PROGRAM SELECTOR LIST */}
          <div className="space-y-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#B89A6C]" />
              Escolha seu programa comportamental
            </h2>

            <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {PROGRAMS_PRESET.map((prog) => {
                const IconComp = prog.icon;
                const isSelected = selectedProgId === prog.id;
                const colors = prog.styles;

                return (
                  <button
                    type="button"
                    key={prog.id}
                    onClick={() => setSelectedProgId(prog.id)}
                    className={`w-full p-3 text-left rounded-2xl border-2 flex items-center justify-between gap-3 transition-all relative cursor-pointer ${
                      isSelected 
                        ? `${colors.bg} ${colors.activeBorder}` 
                        : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 border ${colors.border}`}>
                        <IconComp className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-extrabold text-slate-800">{prog.name}</h3>
                          {prog.badge && (
                            <span className="bg-[#B89A6C]/10 text-[#B89A6C] text-[8px] font-black px-1.5 py-0.5 rounded-full border border-[#B89A6C]/25">
                              {prog.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal font-light max-w-xs">{prog.description}</p>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-slate-900 border-[#B89A6C] text-[#B89A6C]' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-medium">
              {error}
            </p>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full h-11 bg-slate-900 hover:bg-slate-950 border-2 border-[#B89A6C] text-[#B89A6C] font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:translate-y-0.5"
          >
            INICIAR DIAGNÓSTICO
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Social proof footer */}
      <div className="mt-4 flex flex-col items-center gap-1 bg-white/50 p-3 rounded-2xl border border-slate-100/50">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1.5">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=85&w=64&h=64"
              alt="User"
              className="w-6 h-6 rounded-full border border-white object-cover"
              referrerPolicy="no-referrer"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=64&h=64"
              alt="User"
              className="w-6 h-6 rounded-full border border-white object-cover"
              referrerPolicy="no-referrer"
            />
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=64&h=64"
              alt="User"
              className="w-6 h-6 rounded-full border border-white object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 ml-1">
            <Users className="w-3.5 h-3.5 text-[#B89A6C] animate-pulse" />
            Mais de 12.400 vidas impactadas através do ecossistema NeuroPure.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
