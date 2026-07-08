/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Shield, RefreshCw, AlertCircle, Sparkles, MessageCircle, HelpCircle, CheckCircle } from 'lucide-react';
import { User, Question, QuestionOption, Profile, Result, Program } from './types';
import WelcomeView from './components/WelcomeView';
import QuizView from './components/QuizView';
import ReportView from './components/ReportView';
import JourneyView from './components/JourneyView';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [step, setStep] = useState<'welcome' | 'quiz' | 'report' | 'journey' | 'admin'>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [questions, setQuestions] = useState<(Question & { options: QuestionOption[] })[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [calculatedProfile, setCalculatedProfile] = useState<Profile | null>(null);
  const [calculatedResult, setCalculatedResult] = useState<Result | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Support Popover State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Auto pre-populate support credentials
  useEffect(() => {
    if (user) {
      setSupportName(user.name);
      setSupportEmail(user.email);
    }
  }, [user]);

  // Fetch active programs on startup
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/programs');
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch (e) {
      console.error('Falha ao carregar programas do servidor.', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvaluation = async (name: string, email: string, programId: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch questions filtered by selected programId
      const qRes = await fetch(`/api/questions?programId=${programId}`);
      if (!qRes.ok) {
        throw new Error('Falha ao carregar o questionário dinâmico do programa selecionado.');
      }
      const questionsData = await qRes.json();
      setQuestions(questionsData);

      // Save selected program info
      const selectedProg = programs.find(p => p.id === programId) || {
        id: programId,
        name: programId.replace('prog-', '').toUpperCase(),
        description: 'Programa Comportamental',
        icon: 'Wind',
        color: 'emerald'
      };
      setActiveProgram(selectedProg);

      // 2. Create/Get User associated with program
      const userRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, programId })
      });

      if (!userRes.ok) {
        throw new Error('Erro ao registrar usuário na plataforma NeuroPure.');
      }

      const userData = await userRes.json();
      setUser(userData);
      setUserAnswers({});
      setStep('quiz');
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnswer = async (questionId: string, optionId: string) => {
    if (!user || !activeProgram) return;
    
    // Save locally
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));

    // Post to database instantly including programId
    const res = await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        programId: activeProgram.id,
        questionId,
        optionId
      })
    });

    if (!res.ok) {
      throw new Error('Falha ao persistir resposta no banco de dados NeuroPure.');
    }
  };

  const handleQuizFinish = async () => {
    if (!user || !activeProgram) return;
    setLoading(true);
    try {
      // Calculate results dynamically passing programId as query param
      const res = await fetch(`/api/results/${user.id}?programId=${activeProgram.id}`);
      if (!res.ok) {
        throw new Error('Falha ao calcular perfil comportamental para este programa.');
      }
      const data = await res.json();
      setCalculatedResult(data.result);
      setCalculatedProfile(data.profile);
      setStep('report');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = () => {
    setStep('journey');
  };

  const handleReset = () => {
    setStep('welcome');
    setUser(null);
    setActiveProgram(null);
    setUserAnswers({});
    setCalculatedResult(null);
    setCalculatedProfile(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 font-sans relative overflow-x-hidden select-none">
      {/* Ambient background blur elements matching mockup */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#B89A6C]/5 blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[100px]"></div>
      </div>

      {/* Main Container Shell (Capped at 600px for desktop-centric app experience) */}
      <div className="relative z-10 max-w-[600px] mx-auto min-h-screen px-4 py-6 flex flex-col justify-between animate-fade-in">
        {/* Navigation / Control Header */}
        <header className="flex items-center justify-between border-b border-slate-200/50 pb-4 mb-4">
          <div className="flex items-center gap-2 select-none">
            <span className="text-[#B89A6C] font-serif font-black text-xl tracking-wider">
              NeuroPure
            </span>
          </div>

          <div className="flex items-center gap-2">
            {step !== 'admin' ? (
              <button
                onClick={() => setStep('admin')}
                className="text-xs font-bold text-slate-500 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:translate-y-0.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                Painel Admin
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-500 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:translate-y-0.5 cursor-pointer"
              >
                Voltar ao App
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Step Router */}
        <main className="flex-1 flex flex-col justify-center">
          {loading && (step === 'welcome' || step === 'quiz') ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
              <p className="text-xs font-semibold uppercase tracking-wider">Carregando dados da plataforma...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-center space-y-4 max-w-sm mx-auto">
              <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
              <h3 className="font-extrabold text-slate-800">Oops! Algo deu errado</h3>
              <p className="text-xs text-rose-700 font-medium leading-relaxed">{error}</p>
              <button
                onClick={() => { setError(null); fetchPrograms(); }}
                className="h-10 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar Novamente
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === 'welcome' && (
                <WelcomeView onStart={handleStartEvaluation} />
              )}

              {step === 'quiz' && (
                <QuizView
                  questions={questions}
                  userId={user?.id || ''}
                  onAnswerSaved={handleSaveAnswer}
                  onFinish={handleQuizFinish}
                />
              )}

              {step === 'report' && calculatedProfile && calculatedResult && (
                <ReportView
                  userName={user?.name || 'Iniciado'}
                  profile={calculatedProfile}
                  result={calculatedResult}
                  questions={questions}
                  userAnswers={userAnswers}
                  onReset={handleReset}
                  onStartJourney={handleStartJourney}
                />
              )}

              {step === 'journey' && user && activeProgram && calculatedProfile && (
                <JourneyView
                  user={user}
                  program={activeProgram}
                  profile={calculatedProfile}
                  onBackToAssessment={handleReset}
                />
              )}

              {step === 'admin' && (
                <AdminPanel onBack={handleReset} />
              )}
            </AnimatePresence>
          )}
        </main>

        {/* Simple minimal footer */}
        <footer className="text-center text-[10px] text-slate-400 font-medium pt-6 border-t border-slate-200/40 mt-4">
          &copy; {new Date().getFullYear()} NeuroPure Engine - Bloom Health Systems. Todos os direitos reservados.
        </footer>
      </div>

      {/* Floating Support Bubble in the bottom-right corner of the entire screen */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08, boxShadow: '0 10px 25px -5px rgba(184, 154, 108, 0.4), 0 8px 10px -6px rgba(184, 154, 108, 0.4)' }}
          whileTap={{ scale: 0.93 }}
          onClick={() => {
            setShowSupportModal(true);
            setSupportSuccess(false);
            setSupportMessage('');
            if (user) {
              setSupportName(user.name);
              setSupportEmail(user.email);
            }
          }}
          className="w-14 h-14 rounded-full bg-slate-900 border-2 border-[#B89A6C] text-[#B89A6C] flex items-center justify-center shadow-lg transition-all cursor-pointer relative group overflow-hidden"
          title="Eu preciso de ajuda"
          id="help-bubble-trigger"
        >
          {/* Subtle glossy overlay (mimicking glossy glass finish in references) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none"></div>
          {/* Double inner gold rim layer */}
          <div className="absolute inset-1 rounded-full border border-[#B89A6C]/25 pointer-events-none"></div>
          
          <MessageCircle className="w-6 h-6 text-[#B89A6C] z-10" />
          
          {/* Floating Tooltip label */}
          <span className="absolute right-16 bg-slate-900 text-[#B89A6C] border border-[#B89A6C]/30 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Eu preciso de ajuda
          </span>
        </motion.button>
      </div>

      {/* Support Message Popover Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100]">
            {/* Modal Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupportModal(false)}
              className="absolute inset-0 cursor-default"
            ></motion.div>

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-3xl p-6 border border-slate-100 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden z-10"
            >
              {/* Premium Rose Gold metallic top bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B89A6C] via-[#E2C799] to-[#8C6D3E]"></div>

              <div className="w-12 h-12 bg-slate-900 border-2 border-[#B89A6C] rounded-full flex items-center justify-center mx-auto shadow-md relative">
                <div className="absolute inset-0.5 rounded-full border border-[#B89A6C]/25"></div>
                <HelpCircle className="w-6 h-6 text-[#B89A6C]" />
              </div>

              {!supportSuccess ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider font-serif">Central de Suporte</h3>
                    <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                      Deixe sua dúvida ou solicitação. Nossa equipe responderá diretamente no seu e-mail de contato em breve.
                    </p>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!supportName.trim() || !supportEmail.trim() || !supportMessage.trim()) return;
                      setIsSendingSupport(true);
                      try {
                        const res = await fetch('/api/support', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: supportName.trim(),
                            email: supportEmail.trim(),
                            message: supportMessage.trim(),
                            userId: user?.id
                          })
                        });
                        if (res.ok) {
                          setSupportSuccess(true);
                        } else {
                          alert('Falha ao enviar mensagem. Tente novamente.');
                        }
                      } catch (e) {
                        alert('Erro ao se conectar ao servidor.');
                      } finally {
                        setIsSendingSupport(false);
                      }
                    }}
                    className="space-y-3 text-left"
                  >
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seu Nome</label>
                      <input
                        type="text"
                        required
                        placeholder="Nome completo"
                        value={supportName}
                        onChange={(e) => setSupportName(e.target.value)}
                        className="w-full h-9 px-3 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#B89A6C] focus:ring-1 focus:ring-[#B89A6C] text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seu E-mail de Contato</label>
                      <input
                        type="email"
                        required
                        placeholder="email@exemplo.com"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full h-9 px-3 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#B89A6C] focus:ring-1 focus:ring-[#B89A6C] text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Como podemos te ajudar?</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Escreva sua solicitação com detalhes..."
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        className="w-full p-3 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#B89A6C] focus:ring-1 focus:ring-[#B89A6C] text-xs font-semibold resize-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowSupportModal(false)}
                        className="flex-1 h-10 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingSupport}
                        className="flex-1 h-10 bg-slate-900 hover:bg-slate-950 border border-[#B89A6C] text-[#B89A6C] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isSendingSupport ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Enviar Ajuda'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4 py-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-800">Mensagem Registrada!</h3>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      Obrigado <strong className="font-bold text-slate-700">{supportName}</strong>! 
                      Sua mensagem de suporte foi salva no ecossistema NeuroPure.
                      Responderemos no seu e-mail cadastrado em breve:
                      <br />
                      <strong className="font-bold text-[#B89A6C] block mt-1.5">{supportEmail}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSupportModal(false)}
                    className="w-full h-10 bg-slate-900 hover:bg-slate-950 border border-[#B89A6C] text-[#B89A6C] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
