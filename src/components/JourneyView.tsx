/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Award, Sparkles, MessageSquare, Heart, Send, Smile, Meh, Frown, AlertCircle,
  Flame, ShieldAlert, Brain, Moon, Wind, X, CheckCircle, Play, Activity, Calendar, 
  Compass, RefreshCw, Settings, TrendingUp, Coins, Clock, Lock, Unlock, Trophy, Plus, Dumbbell, ShieldCheck, HeartHandshake, Rocket, ArrowRight
} from 'lucide-react';
import { User, Program, Profile, Mission, CheckIn, UserProgress, CommunityPost, Achievement } from '../types';
import confetti from 'canvas-confetti';

interface JourneyViewProps {
  user: User;
  program: Program;
  profile: Profile;
  onBackToAssessment: () => void;
}

// Helper to render premium gold icons instead of childish emojis
export function renderPremiumIcon(iconStr: string, className = "w-5 h-5") {
  const norm = iconStr?.trim() || '';
  switch (norm) {
    case '🚀': return <Rocket className={`${className} text-[#B89A6C]`} />;
    case '🧠': return <Brain className={`${className} text-[#B89A6C]`} />;
    case '🤝': return <HeartHandshake className={`${className} text-[#B89A6C]`} />;
    case '🛡️': return <ShieldCheck className={`${className} text-[#B89A6C]`} />;
    case '🌱': return <Compass className={`${className} text-[#B89A6C]`} />;
    case '⚡': return <Zap className={`${className} text-[#B89A6C]`} />;
    case '❤️': return <Heart className={`${className} text-[#B89A6C]`} />;
    case '🌙': return <Moon className={`${className} text-[#B89A6C]`} />;
    case '⏰': return <Clock className={`${className} text-[#B89A6C]`} />;
    case '🥗': return <Activity className={`${className} text-[#B89A6C]`} />;
    case '🍱': return <Activity className={`${className} text-[#B89A6C]`} />;
    case '💆': return <Sparkles className={`${className} text-[#B89A6C]`} />;
    case '🌋': return <ShieldAlert className={`${className} text-[#B89A6C]`} />;
    // Other common string-based icons
    case 'Wind': return <Wind className={`${className} text-[#B89A6C]`} />;
    case 'Brain': return <Brain className={`${className} text-[#B89A6C]`} />;
    case 'Moon': return <Moon className={`${className} text-[#B89A6C]`} />;
    case 'Flame': return <Flame className={`${className} text-[#B89A6C]`} />;
    case 'ShieldAlert': return <ShieldAlert className={`${className} text-[#B89A6C]`} />;
    default: return <Brain className={`${className} text-[#B89A6C]`} />;
  }
}

// Leveling thresholds helper
function getLevelInfo(xp: number) {
  const levels = [
    { level: 1, minXp: 0, maxXp: 300 },
    { level: 2, minXp: 300, maxXp: 700 },
    { level: 3, minXp: 700, maxXp: 1200 },
    { level: 4, minXp: 1200, maxXp: 1800 },
    { level: 5, minXp: 1800, maxXp: 2500 },
    { level: 6, minXp: 2500, maxXp: 3300 },
    { level: 7, minXp: 3300, maxXp: 4200 },
    { level: 8, minXp: 4200, maxXp: 5200 },
    { level: 9, minXp: 5200, maxXp: 6300 },
    { level: 10, minXp: 6300, maxXp: 7500 },
  ];
  const currentLvl = levels[levels.length - 1];
  if (xp >= currentLvl.maxXp) {
    const extraXp = xp - currentLvl.maxXp;
    const additionalLevels = Math.floor(extraXp / 1500);
    const level = currentLvl.level + 1 + additionalLevels;
    const minXp = currentLvl.maxXp + additionalLevels * 1500;
    const maxXp = minXp + 1500;
    return { level, minXp, maxXp, xpInLevel: xp - minXp, levelProgress: ((xp - minXp) / 1500) * 100 };
  }
  for (const lvl of levels) {
    if (xp >= lvl.minXp && xp < lvl.maxXp) {
      const range = lvl.maxXp - lvl.minXp;
      const xpInLevel = xp - lvl.minXp;
      const levelProgress = (xpInLevel / range) * 100;
      return { level: lvl.level, minXp: lvl.minXp, maxXp: lvl.maxXp, xpInLevel, levelProgress };
    }
  }
  return { level: 1, minXp: 0, maxXp: 300, xpInLevel: xp, levelProgress: (xp / 300) * 100 };
}

// Get daily extra challenge based on active program day
const getExtraChallenge = (day: number) => {
  const challenges = [
    "Respire fundo 5 vezes antes de responder a qualquer mensagem hoje.",
    "Beba um copo de água gelada sempre que sentir ansiedade ou tédio.",
    "Mantenha o celular longe de você por 1 hora após acordar.",
    "Faça 5 minutos de alongamento consciente pela manhã.",
    "Evite cafeína após as 14:00 para acalmar o sistema nervoso.",
    "Identifique e escreva qual o seu principal gatilho de estresse hoje.",
    "Compartilhe uma palavra de apoio para 1 colega na comunidade.",
    "Fique 4 horas seguidas livre de qualquer comportamento impulsivo.",
    "Faça uma refeição consciente de 15 minutos sem usar o celular.",
    "Substitua o hábito impulsivo da tarde por um chá relaxante de camomila.",
    "Faça uma caminhada rápida de 10 minutos ouvindo os sons ao seu redor.",
    "Aguarde 5 minutos em silêncio quando sentir uma forte compulsão.",
    "Anote ou mentalize 3 motivos importantes que impulsionam sua saúde.",
    "Organize sua mesa ou quarto por 10 minutos para clarear a mente.",
    "Agradeça a alguém ou anote 3 coisas pelas quais você é grato hoje.",
    "Faça o exercício de respiração SOS 3 vezes ao longo do dia.",
    "Substitua lanches açucarados por uma porção de fruta fresca.",
    "Fique 2 horas consecutivas sem olhar nenhuma rede social.",
    "Escreva uma carta curta para si mesmo comemorando o progresso.",
    "Faça um relaxamento muscular guiado ou respiração antes de deitar.",
    "Repita em voz alta: 'Eu estou no controle da minha mente' hoje."
  ];
  return challenges[(day - 1) % challenges.length];
};

export default function JourneyView({ user, program, profile, onBackToAssessment }: JourneyViewProps) {
  // Navigation Tabs: 'hq' (Quartel General), 'progress' (Progresso/Economometria), 'community' (Mural), 'achievements' (Conquistas)
  const [activeTab, setActiveTab] = useState<'hq' | 'progress' | 'community' | 'achievements'>('hq');

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // State for checkin form
  const [mood, setMood] = useState<'happy' | 'neutral' | 'stressed' | 'sad' | 'anxious'>('neutral');
  const [cravingLevel, setCravingLevel] = useState<number>(3);
  const [checkinNotes, setCheckinNotes] = useState('');
  const [checkinsList, setCheckinsList] = useState<CheckIn[]>([]);
  const [isCheckinSaved, setIsCheckinSaved] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  // Trigger history & registering state
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [triggerType, setTriggerType] = useState('Stress');
  const [triggerIntensity, setTriggerIntensity] = useState<number>(5);
  const [triggerNotes, setTriggerNotes] = useState('');
  const [triggerTips, setTriggerTips] = useState<string | null>(null);

  // State for community
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // SOS Breath Trainer Overlay
  const [showSosBreath, setShowSosBreath] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [completedBreaths, setCompletedBreaths] = useState(0);

  // Leveling up overlays
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);

  // Message of the day popup
  const [showInspirationModal, setShowInspirationModal] = useState(false);

  // Economy customization state (saved in localStorage)
  const [cigsPerDay, setCigsPerDay] = useState<number>(() => {
    return Number(localStorage.getItem('neuropure_cigs_per_day') || '15');
  });
  const [packPrice, setPackPrice] = useState<number>(() => {
    return Number(localStorage.getItem('neuropure_pack_price') || '6.50');
  });
  const [showEconomySettings, setShowEconomySettings] = useState(false);

  // Weekend Boss Battle State
  const [showBossModal, setShowBossModal] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [bossHearts, setBossHearts] = useState(3);
  const [bossRound, setBossRound] = useState(0);
  const [bossOutcome, setBossOutcome] = useState<'playing' | 'victory' | 'defeat'>('playing');
  const [bossLog, setBossLog] = useState<string>('O Chefe da Fissura apareceu! Ele está bloqueando seu sábado.');

  // Trait distribution state
  const [profileScores, setProfileScores] = useState<Record<string, number>>({});
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Confetti trigger
  const triggerConfettiExplosion = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      ticks: 100, // Disappears twice as fast for a fast, clean animation
      origin: { y: 0.6 }
    });
  };

  useEffect(() => {
    fetchJourneyData();
  }, [user.id, program.id]);

  // Breathing SOS cycle logic
  useEffect(() => {
    let interval: any = null;
    if (showSosBreath) {
      interval = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            setBreathPhase((phase) => {
              switch (phase) {
                case 'inhale': return 'hold-in';
                case 'hold-in': return 'exhale';
                case 'exhale': return 'hold-out';
                case 'hold-out':
                  setCompletedBreaths(b => {
                    const newB = b + 1;
                    if (newB === 3) {
                      // Automatically award breathing XP after 3 full box breathing cycles!
                      handleCompleteTaskSilent('breathing');
                    }
                    return newB;
                  });
                  return 'inhale';
                default: return 'inhale';
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase('inhale');
      setBreathSeconds(4);
      setCompletedBreaths(0);
    }
    return () => clearInterval(interval);
  }, [showSosBreath]);

  const fetchJourneyData = async () => {
    setLoading(true);
    try {
      // Fetch progress
      const progressRes = await fetch(`/api/user/progress?userId=${user.id}&programId=${program.id}`);
      if (progressRes.ok) {
        const pData: UserProgress = await progressRes.json();
        setProgress(pData);
        
        // Track leveling up
        const lvlInfo = getLevelInfo(pData.totalXp);
        if (previousLevel !== null && lvlInfo.level > previousLevel) {
          setUnlockedLevel(lvlInfo.level);
          setShowLevelUpModal(true);
          triggerConfettiExplosion();
        }
        setPreviousLevel(lvlInfo.level);
      }

      // Fetch program specific missions
      const missionsRes = await fetch(`/api/missions?programId=${program.id}`);
      if (missionsRes.ok) {
        const mData = await missionsRes.json();
        setMissions(mData);
      }

      // Fetch community posts
      const postsRes = await fetch(`/api/community?programId=${program.id}`);
      if (postsRes.ok) {
        const pData = await postsRes.json();
        setPosts(pData);
      }

      // Fetch achievements
      const achRes = await fetch('/api/achievements');
      if (achRes.ok) {
        const aData = await achRes.json();
        setAchievements(aData);
      }

      // Fetch user checkins for this program
      const chkRes = await fetch(`/api/user/checkin?userId=${user.id}&programId=${program.id}`);
      if (chkRes.ok) {
        const cData = await chkRes.json();
        setCheckinsList(cData);
        
        // Check if checked in today
        const todayStr = new Date().toISOString().split('T')[0];
        const hasCheckedInToday = cData.some((c: CheckIn) => c.completedAt.startsWith(todayStr));
        setIsCheckinSaved(hasCheckedInToday);
      }

      // Fetch profile trait scores
      const scoresRes = await fetch(`/api/results/${user.id}?programId=${program.id}`);
      if (scoresRes.ok) {
        const sData = await scoresRes.json();
        if (sData.result && sData.result.scores) {
          setProfileScores(sData.result.scores);
        }
      }

      // Fetch all Profiles to match traits
      const profilesRes = await fetch(`/api/profiles?programId=${program.id}`);
      if (profilesRes.ok) {
        const prData = await profilesRes.json();
        setAllProfiles(prData);
      }
    } catch (error) {
      console.error('Error fetching journey data', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to complete task silently (e.g. background checklist items)
  const handleCompleteTaskSilent = async (taskName: string) => {
    if (!progress) return;
    try {
      const res = await fetch('/api/user/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          programId: program.id,
          task: taskName
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        if (data.xpEarned > 0) {
          triggerConfettiExplosion();
        }
      }
    } catch (err) {
      console.error('Error completing task', err);
    }
  };

  const handleCompleteMission = async () => {
    if (!progress) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/user/mission-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          programId: program.id,
          day: progress.currentDay
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        triggerConfettiExplosion();
        await fetchJourneyData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progress) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/user/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          programId: program.id,
          day: progress.currentDay,
          mood,
          cravingLevel,
          notes: checkinNotes
        })
      });
      if (res.ok) {
        setIsCheckinSaved(true);
        setCheckinNotes('');
        setShowCheckinModal(false);
        triggerConfettiExplosion();
        await fetchJourneyData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterTriggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/user/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          programId: program.id,
          type: triggerType,
          intensity: triggerIntensity,
          notes: triggerNotes
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        
        // Formulate a helpful clinical tips banner
        let tip = "";
        switch (triggerType) {
          case 'Stress':
            tip = "O estresse reduz o oxigênio periférico. Faça 3 respirações diafragmáticas e beba água antes de ceder à urgência.";
            break;
          case 'Social':
            tip = "Ambientes sociais nos ligam a velhas âncoras. Segure um copo de água na mão ativa para ocupar a memória muscular.";
            break;
          case 'Coffee':
            tip = "A cafeína mimetiza a aceleração cardíaca do cigarro. Reduza o café ou tome chá verde por 3 dias.";
            break;
          case 'Boredom':
            tip = "O tédio engana o cérebro buscando dopamina fácil. Mude de ambiente físico imediatamente por 5 minutos.";
            break;
          case 'After Meal':
            tip = "O pico de insulina após refeições pede rituais de fechamento. Escove os dentes imediatamente para sinalizar o fim da refeição.";
            break;
          default:
            tip = "A compulsão dura em média 3 a 5 minutos. Distraia sua mente com uma tarefa manual ou beba água gelada.";
        }
        setTriggerTips(tip);
        setTriggerNotes('');
        triggerConfettiExplosion();
        await fetchJourneyData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteExtraChallenge = async () => {
    if (!progress) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/user/complete-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          programId: program.id,
          day: progress.currentDay
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        triggerConfettiExplosion();
        await fetchJourneyData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          programId: program.id,
          userName: user.name,
          userProfileName: profile.name.split(' (')[0],
          content: newPostContent
        })
      });
      if (res.ok) {
        setNewPostContent('');
        
        // Auto complete community task
        await handleCompleteTaskSilent('community');
        
        // Refresh posts list
        const postsRes = await fetch(`/api/community?programId=${program.id}`);
        if (postsRes.ok) {
          const pData = await postsRes.json();
          setPosts(pData);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch('/api/community/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: user.id })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Boss CBT-combat rules & state updater
  const handleBossAction = (actionType: 'impulsive' | 'passive' | 'resilient') => {
    const questions = [
      {
        bossAttack: "O Monstro da Fissura ataca com Estresse do Sábado à Noite: 'Você trabalhou a semana toda e está sozinho. Só um trago vai te relaxar agora. Você merece um prêmio!'",
        options: {
          impulsive: { log: "Você cedeu! 'Fumar me acalma'. Você fuma e sente culpa imediata. O Boss te atropela!", damage: 0, heartChange: -1 },
          passive: { log: "Você tenta aguentar na força de vontade bruta, tremendo de ansiedade. O Boss recua um pouco, mas você se cansa.", damage: 25, heartChange: 0 },
          resilient: { log: "Resposta Perfeita! 'O estresse passa sozinho em 5 minutos. Fumar só me trará frustração'. Você rebate com clareza mental!", damage: 50, heartChange: 0 }
        }
      },
      {
        bossAttack: "O Monstro usa Pressão Social: 'Todo mundo no bar está fumando e rindo. Se você não fumar, vai ficar de fora e o rolê vai ser uma chatice total!'",
        options: {
          impulsive: { log: "Você pede um trago pra socializar. Sabor horrível nos dentes, cheiro de fumaça e derrota. Perde uma vida!", damage: 0, heartChange: -1 },
          passive: { log: "Você foge correndo e vai embora se isolar no quarto chateado. O Boss é repelido, mas custou caro.", damage: 25, heartChange: 0 },
          resilient: { log: "Defesa Psicológica! 'Minha liberdade vale mais que aprovação temporária. Posso rir e conversar sem fumaça'. Dano Crítico!", damage: 50, heartChange: 0 }
        }
      },
      {
        bossAttack: "O golpe final do Boss: 'Você já provou que aguenta 7 dias! Claramente você está curado. Fume só mais um hoje para celebrar essa vitória!'",
        options: {
          impulsive: { log: "Você cai no paradoxo da comemoração! 'Vou comemorar que parei... fumando!' O ciclo do vício recomeça. Perde vida!", damage: 0, heartChange: -1 },
          passive: { log: "Você deita e força o sono pra não pensar. Você sobrevive, mas a mente continua inquieta.", damage: 25, heartChange: 0 },
          resilient: { log: "Grito de Vitória! 'Comemorar o fim de uma prisão voltando para ela? Nem pensar. Minha comemoração é o ar limpo nos meus pulmões'. FIM DO ROUND!", damage: 50, heartChange: 0 }
        }
      }
    ];

    const currentQ = questions[bossRound];
    const outcome = currentQ.options[actionType];

    const nextHp = Math.max(0, bossHp - outcome.damage);
    const nextHearts = Math.max(0, bossHearts + outcome.heartChange);
    const nextRound = bossRound + 1;

    setBossHp(nextHp);
    setBossHearts(nextHearts);
    setBossLog(outcome.log);

    if (nextHp <= 0) {
      setBossOutcome('victory');
      handleCompleteBossServer();
    } else if (nextHearts <= 0) {
      setBossOutcome('defeat');
    } else if (nextRound >= 3) {
      // Checked all rounds but boss still alive
      if (nextHp <= 30) {
        setBossOutcome('victory');
        handleCompleteBossServer();
      } else {
        setBossOutcome('defeat');
      }
    } else {
      setBossRound(nextRound);
    }
  };

  const handleCompleteBossServer = async () => {
    if (!progress) return;
    try {
      const currentWeek = Math.floor((progress.currentDay - 1) / 7) + 1;
      const res = await fetch('/api/user/defeat-boss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          programId: program.id,
          week: currentWeek
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        triggerConfettiExplosion();
        await fetchJourneyData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetBossGame = () => {
    setBossHp(100);
    setBossHearts(3);
    setBossRound(0);
    setBossOutcome('playing');
    setBossLog("O Chefe da Fissura apareceu! Ele está bloqueando seu progresso de fim de semana.");
  };

  const saveEconomyConfig = () => {
    localStorage.setItem('neuropure_cigs_per_day', String(cigsPerDay));
    localStorage.setItem('neuropure_pack_price', String(packPrice));
    setShowEconomySettings(false);
    triggerConfettiExplosion();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Ajustando sua rota personalizada no NeuroPure...</p>
      </div>
    );
  }

  const currentDay = progress?.currentDay || 1;
  const currentMission = missions.find(m => m.day === currentDay) || {
    id: 'm-generic',
    title: 'Pausa Consistente',
    description: 'Faça o seu check-in diário de humor e realize um minuto de meditação atenta.',
    xpAwarded: 40,
    category: 'Habit'
  };

  const isMissionCompleted = progress?.completedMissionsDays.includes(currentDay) || false;

  // Level info helper
  const levelInfo = getLevelInfo(progress?.totalXp || 0);

  // Economy calculations
  const pricePerCig = packPrice / 20;
  const dailyCost = cigsPerDay * pricePerCig;
  const totalDaysSemFumar = Math.max(1, checkinsList.length);
  const totalMoneySaved = totalDaysSemFumar * dailyCost;
  const totalCigsAvoided = totalDaysSemFumar * cigsPerDay;
  const minutesSaved = totalCigsAvoided * 11; // 11 mins life per cig
  const hoursLifeSaved = Math.round((minutesSaved / 60) * 10) / 10;

  // Active profile traits percentages
  const totalScoreWeights = (Object.values(profileScores) as number[]).reduce((a, b) => a + b, 0) || 1;

  // Color mappings
  const getColorClasses = () => {
    return { 
      bg: 'bg-slate-900 border border-[#B89A6C]/30', 
      hover: 'hover:bg-slate-950 hover:border-[#B89A6C]/50', 
      text: 'text-[#B89A6C]', 
      light: 'bg-amber-50/10', 
      border: 'border-[#B89A6C]/20', 
      textLight: 'text-[#B89A6C]/70' 
    };
  };
  const themeColors = getColorClasses();

  return (
    <div className="space-y-6 pb-20">
      
      {/* ================= HEADER BAM BAM STATS GRID (Duolingo style) ================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        
        {/* Row 1: Profile identity & Streak */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-[#B89A6C] flex items-center justify-center relative shadow-md overflow-hidden shrink-0">
              {/* Subtle glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/15 pointer-events-none"></div>
              {/* Double inner gold rim */}
              <div className="absolute inset-0.5 rounded-full border border-[#B89A6C]/20 pointer-events-none"></div>
              {renderPremiumIcon(profile.icon, "w-5 h-5")}
            </div>
            <div className="text-left">
              <span className="text-[9px] font-bold tracking-widest text-[#B89A6C] uppercase font-serif">NEUROPURE QUARTEL</span>
              <h2 className="text-sm font-black text-slate-800">{user.name}</h2>
            </div>
          </div>

          <button
            onClick={() => {
              setShowInspirationModal(true);
              handleCompleteTaskSilent('message');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-950 border border-[#B89A6C]/50 text-[#B89A6C] rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-[#B89A6C] animate-pulse" />
            Mensagem do Dia
          </button>
        </div>

        {/* Row 2: Level Progress Meter */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/45 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#B89A6C] uppercase bg-slate-900 px-2.5 py-0.5 rounded-lg border border-[#B89A6C]/30">NÍVEL {levelInfo.level}</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#B89A6C]" /> {progress?.totalXp} / {levelInfo.maxXp} XP
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#B89A6C] font-extrabold text-xs">
              <Flame className="w-4 h-4 fill-[#B89A6C]/30 text-[#B89A6C]" />
              <span>{progress?.currentStreak} Dias</span>
            </div>
          </div>
          
          <div className="w-full bg-slate-200/70 h-3 rounded-full overflow-hidden relative border border-slate-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.levelProgress}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-[#B89A6C] to-[#E2C799] rounded-full"
            />
          </div>
        </div>

        {/* Row 3: Day Progress Slider */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center">
            <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none">DIA ATUAL</span>
            <span className="text-sm font-black text-slate-800">{currentDay} de 21</span>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className={`h-full ${themeColors.bg}`} style={{ width: `${(currentDay / 21) * 100}%` }}></div>
            </div>
          </div>
          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-center shadow-xs">
            <span className="block text-[9px] font-bold text-emerald-800 uppercase leading-none">ECONOMIA</span>
            <span className="text-sm font-black text-emerald-700">R$ {totalMoneySaved.toFixed(2)}</span>
            <span className="text-[8px] font-bold text-emerald-600 block leading-none mt-1">Salvos</span>
          </div>
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center">
            <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none">SAÚDE</span>
            <span className="text-sm font-black text-rose-600">+{hoursLifeSaved}h</span>
            <span className="text-[8px] font-semibold text-slate-400 block leading-none mt-1">Recuperadas</span>
          </div>
        </div>
      </div>

      {/* ================= SOS CRISIS PANIC FLOATER ================= */}
      <div className="bg-slate-900 border-2 border-[#B89A6C] text-[#B89A6C] p-4 rounded-3xl flex items-center justify-between gap-4 shadow-md transition-all active:scale-[1.01]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#B89A6C]/10 rounded-xl flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-6 h-6 text-[#B89A6C]" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">SOS Crise ou Fissura?</h4>
            <p className="text-sm font-extrabold leading-tight text-white">Clique para regular seu corpo agora</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowSosBreath(true);
            setBreathPhase('inhale');
            setBreathSeconds(4);
            setCompletedBreaths(0);
          }}
          className="px-4 py-2 bg-[#B89A6C] hover:bg-[#E2C799] text-slate-900 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          DESCOMPRIMIR
        </button>
      </div>

      {/* ================= TAB BUTTON SELECTOR (Pills layout) ================= */}
      <div className="bg-white/80 p-1.5 rounded-2xl border border-slate-100 flex gap-1 shadow-xs sticky top-2 z-10 backdrop-blur-md">
        {[
          { id: 'hq', label: 'Quartel', icon: ShieldCheck },
          { id: 'progress', label: 'Progresso', icon: TrendingUp },
          { id: 'community', label: 'Mural', icon: MessageSquare },
          { id: 'achievements', label: 'Insígnias', icon: Trophy }
        ].map(tab => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isSel ? 'bg-slate-900 text-[#B89A6C] border border-[#B89A6C]/30 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB CONTENTS ================= */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: MEU QUARTEL-GENERAL */}
        {activeTab === 'hq' && (
          <motion.div
            key="hq"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            
            {/* 1.1 Checklist: MISSÕES DE HOJE */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B89A6C]" /> Missões de Hoje
                </h3>
                <p className="text-xs text-slate-500 font-light">Complete as tarefas diárias para somar bônus e subir de nível.</p>
              </div>

              <div className="space-y-2">
                {[
                  { key: 'checkin', label: 'Fazer check-in diário', xp: 30, action: () => setShowCheckinModal(true) },
                  { key: 'message', label: 'Ler mensagem motivadora', xp: 20, action: () => { setShowInspirationModal(true); handleCompleteTaskSilent('message'); } },
                  { key: 'breathing', label: 'Exercício de respiração SOS', xp: 40, action: () => { setShowSosBreath(true); setBreathPhase('inhale'); setBreathSeconds(4); setCompletedBreaths(0); } },
                  { key: 'trigger', label: 'Registrar um gatilho de fissura', xp: 30, action: () => setShowTriggerModal(true) },
                  { key: 'community', label: 'Participar no Mural de Apoio', xp: 20, action: () => { setActiveTab('community'); handleCompleteTaskSilent('community'); } }
                ].map(task => {
                  const isDone = progress?.completedTodayTasks?.includes(task.key) || (task.key === 'checkin' && isCheckinSaved);
                  return (
                    <button
                      key={task.key}
                      onClick={task.action}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left group cursor-pointer ${
                        isDone 
                          ? 'bg-emerald-50/50 border-emerald-100 text-slate-500' 
                          : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                          isDone ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300 text-transparent group-hover:border-indigo-400'
                        }`}>
                          <CheckCircle className="w-4 h-4 shrink-0 fill-current" />
                        </div>
                        <span className={`text-xs font-bold ${isDone ? 'line-through opacity-70' : ''}`}>{task.label}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isDone ? 'bg-emerald-100/50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>+{task.xp} XP</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1.2 Core Mission Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wide border bg-slate-900 border-[#B89A6C]/30 text-[#B89A6C]">
                  {currentMission.category || 'MÉTODO'}
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Missão Principal • Dia {currentDay}</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-serif font-black text-slate-800">{currentMission.title}</h3>
                <p className="text-xs text-slate-600 font-light leading-relaxed">{currentMission.description}</p>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-50">
                <div className="text-left">
                  <span className="text-[9px] font-bold text-slate-400 block leading-none">PRÊMIO</span>
                  <span className="text-xs font-black text-[#B89A6C]">+{currentMission.xpAwarded} XP</span>
                </div>

                {isMissionCompleted ? (
                  <span className="h-9 px-4 bg-slate-900/10 text-[#B89A6C] font-extrabold text-xs rounded-xl flex items-center gap-1.5 border border-[#B89A6C]/30">
                    <CheckCircle className="w-3.5 h-3.5 text-[#B89A6C]" />
                    Completa!
                  </span>
                ) : (
                  <button
                    onClick={handleCompleteMission}
                    disabled={actionLoading}
                    className="h-9 px-4 bg-slate-900 border border-[#B89A6C]/30 hover:bg-slate-950 text-[#B89A6C] font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    Completar Missão
                  </button>
                )}
              </div>
            </div>

            {/* 1.3 Daily Extra Challenge Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wide border bg-slate-900 border-[#B89A6C]/30 text-[#B89A6C]">
                  DESAFIO EXTRA
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Bônus Diário</span>
              </div>

              <p className="text-xs text-slate-600 font-medium italic">&ldquo;{getExtraChallenge(currentDay)}&rdquo;</p>

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-50">
                <div className="text-left">
                  <span className="text-[9px] font-bold text-slate-400 block leading-none">PRÊMIO</span>
                  <span className="text-xs font-black text-[#B89A6C]">+50 XP</span>
                </div>

                {progress?.extraChallengeCompletedDays?.includes(currentDay) ? (
                  <span className="h-9 px-4 bg-slate-900/10 text-[#B89A6C] font-extrabold text-xs rounded-xl flex items-center gap-1.5 border border-[#B89A6C]/30">
                    <Award className="w-3.5 h-3.5 text-[#B89A6C]" />
                    Vencido!
                  </span>
                ) : (
                  <button
                    onClick={handleCompleteExtraChallenge}
                    className="h-9 px-4 bg-slate-900 border border-[#B89A6C]/30 hover:bg-slate-950 text-[#B89A6C] font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Vencer Desafio
                  </button>
                )}
              </div>
            </div>

            {/* 1.4 Weekly Weekend Boss Battle */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-[#B89A6C]/30 shadow-md space-y-4 relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12">
                <ShieldAlert className="w-32 h-32 text-[#B89A6C]" />
              </div>

              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider border border-[#B89A6C]/30 bg-[#B89A6C]/10 text-[#B89A6C] animate-pulse">
                  DESAFIO DE CONSISTÊNCIA
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-serif">FIM DE SEMANA</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-serif font-black text-[#B89A6C] flex items-center gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-[#B89A6C]" /> Conflito de Fim de Semana
                </h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  Momento crucial para blindar sua mente contra gatilhos habituais e fortalecer sua resiliência.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-800">
                <div className="text-left">
                  <span className="text-[9px] font-bold text-slate-500 block leading-none">RECOMPENSA</span>
                  <span className="text-xs font-black text-[#B89A6C]">+500 XP & Medalha</span>
                </div>

                {progress?.bossDefeatedDays?.includes(Math.floor((currentDay - 1) / 7) + 1) ? (
                  <span className="h-9 px-4 bg-[#B89A6C]/10 text-[#B89A6C] font-extrabold text-xs rounded-xl flex items-center gap-1.5 border border-[#B89A6C]/20">
                    <Trophy className="w-3.5 h-3.5 text-[#B89A6C]" />
                    Conclúido!
                  </span>
                ) : (
                  <button
                    onClick={() => { setShowBossModal(true); resetBossGame(); }}
                    className="h-9 px-4 bg-slate-900 border border-[#B89A6C]/30 hover:bg-slate-950 text-[#B89A6C] font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Entrar na Arena
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: MEU PROGRESSO (Pathway, stats, live traits) */}
        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            
            {/* 2.1 Visual circular/grid journey path */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#B89A6C]" /> Caminho da Sobriedade
                  </h3>
                  <p className="text-xs text-slate-500 font-light">Seu progresso visual ao longo da mudança em 21 dias.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#B89A6C]">{((progress?.completedMissionsDays?.length || 0) / 21 * 100).toFixed(0)}%</span>
                  <span className="block text-[8px] font-semibold text-slate-400 uppercase">CONCLUÍDO</span>
                </div>
              </div>

              {/* 21 Days road grid */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 21 }, (_, index) => {
                  const dayNum = index + 1;
                  const isDone = progress?.completedMissionsDays?.includes(dayNum);
                  const isCurrent = currentDay === dayNum;
                  
                  return (
                    <div
                      key={dayNum}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center text-[10px] font-black relative border transition-all ${
                        isDone 
                          ? 'bg-slate-900 border-[#B89A6C]/30 text-[#B89A6C] shadow-xs' 
                          : isCurrent 
                            ? 'bg-slate-900/10 border-2 border-[#B89A6C] text-[#B89A6C] animate-pulse' 
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span>D{dayNum}</span>
                      {isDone ? (
                        <CheckCircle className="w-3 h-3 mt-0.5 text-[#B89A6C]" />
                      ) : isCurrent ? (
                        <Play className="w-3 h-3 mt-0.5 fill-[#B89A6C] text-[#B89A6C]" />
                      ) : (
                        <Lock className="w-3 h-3 mt-0.5 opacity-40 text-slate-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2.2 Economy Tracker */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#B89A6C]" /> Painel Economômetro
                  </h3>
                  <p className="text-xs text-slate-500 font-light">Seu saldo acumulado livre de vícios e ansiedades.</p>
                </div>
                
                {/* Settings toggle */}
                <button
                  onClick={() => setShowEconomySettings(!showEconomySettings)}
                  className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-[#B89A6C] transition-all cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Economy config popup inline */}
              {showEconomySettings && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-[#B89A6C]" /> Personalizar Custos
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Cigarros / dia</label>
                      <input
                        type="number"
                        value={cigsPerDay}
                        onChange={(e) => setCigsPerDay(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Preço do Maço (20 un)</label>
                      <input
                        type="number"
                        value={packPrice}
                        onChange={(e) => setPackPrice(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={saveEconomyConfig}
                    className="w-full py-1.5 bg-slate-900 border border-[#B89A6C]/30 hover:bg-slate-950 text-[#B89A6C] text-xs font-black rounded-xl cursor-pointer"
                  >
                    Salvar & Aplicar
                  </button>
                </div>
              )}

              {/* Grid of detailed stats */}
              <div className="grid grid-cols-2 gap-3">
                {/* Destaque para Dinheiro Economizado */}
                <div className="bg-slate-900/5 p-5 rounded-2xl border border-[#B89A6C]/20 flex items-center gap-4 col-span-2 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-[#B89A6C]/30 text-[#B89A6C] flex items-center justify-center shrink-0 shadow-md">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-extrabold text-[#B89A6C] uppercase tracking-widest leading-none mb-1">DINHEIRO ECONOMIZADO</span>
                    <span className="text-2xl font-black text-slate-800 leading-none block">R$ {totalMoneySaved.toFixed(2)}</span>
                    <span className="text-[10px] font-semibold text-slate-500 block mt-1">Economia estimada de R$ {dailyCost.toFixed(2)} por dia</span>
                  </div>
                </div>

                <div className="bg-slate-900/5 p-4 rounded-2xl border border-[#B89A6C]/20 flex items-start gap-3 col-span-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-[#B89A6C]/30 text-[#B89A6C] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none">VIDA RECUPERADA</span>
                    <span className="text-base font-black text-slate-800 leading-tight">+{hoursLifeSaved} horas</span>
                    <span className="text-[9px] font-medium text-slate-500 block mt-0.5">11 min / cigarro</span>
                  </div>
                </div>

                <div className="bg-slate-900/5 p-4 rounded-2xl border border-[#B89A6C]/20 flex items-start gap-3 col-span-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-[#B89A6C]/30 text-[#B89A6C] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none">EVITADOS</span>
                    <span className="text-base font-black text-slate-800 leading-tight">{totalCigsAvoided} un.</span>
                    <span className="text-[9px] font-medium text-slate-500 block mt-0.5">Fora do pulmão</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2.3 Live profile trait distribution chart */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">🧬 Perfil Comportamental Ativo</h3>
                <p className="text-xs text-slate-500 font-light">Distribuição dinâmica de suas predisposições mentais no NeuroPure.</p>
              </div>

              <div className="space-y-3">
                {allProfiles.map(prof => {
                  const score = profileScores[prof.id] || 0;
                  const pct = Math.round((score / totalScoreWeights) * 100) || 0;
                  
                  return (
                    <div key={prof.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span className="text-sm">{prof.icon}</span>
                          <span>{prof.name}</span>
                        </div>
                        <span className="font-extrabold text-slate-600">{pct}%</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: prof.color === 'orange' ? '#f97316' : 
                                             prof.color === 'blue' ? '#3b82f6' : 
                                             prof.color === 'green' ? '#22c55e' : 
                                             prof.color === 'purple' ? '#a855f7' : '#14b8a6'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail message about active traits */}
              <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 flex items-start gap-2.5">
                <Brain className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-xs text-indigo-950 font-bold">Diagnóstico Cognitivo do NeuroPure</p>
                  <p className="text-[11px] text-indigo-700 font-light leading-normal">
                    Seu perfil predominante é <strong className="font-bold text-indigo-900">{profile.name}</strong>, o que significa que você responde melhor a: <strong className="font-bold">{profile.gamificationType}</strong>.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 3: COMUNIDADE */}
        {activeTab === 'community' && (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  Mural da Comunidade NeuroPure
                </h3>
                <p className="text-xs text-slate-500 font-light">Seu diário compartilhado de apoio. Nenhum guerreiro luta só.</p>
              </div>

              {/* Write Post Form */}
              <form onSubmit={handleCreatePost} className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Compartilhe apoio, relatos ou sua vitória de hoje..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                />
                <button
                  type="submit"
                  disabled={isPosting || !newPostContent.trim()}
                  className="w-10 h-10 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Social List */}
              <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                {posts.map((post) => {
                  const isLiked = post.likedByUserIds && post.likedByUserIds.includes(user.id);
                  return (
                    <div key={post.id} className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100 space-y-2 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-700">{post.userName}</span>
                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">
                          {post.userProfileName}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 leading-relaxed font-light">{post.content}</p>
                      
                      <div className="flex items-center gap-3 pt-1 border-t border-slate-100/50 text-[10px] text-slate-400 font-extrabold">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1 transition-all cursor-pointer ${
                            isLiked ? 'text-rose-600' : 'hover:text-slate-600'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                          <span>{post.likes} Curtidas</span>
                        </button>
                        <span>&bull;</span>
                        <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: CONQUISTAS */}
        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#B89A6C]" /> Galeria de Conquistas
                </h3>
                <p className="text-xs text-slate-500 font-light">Suas medalhas digitais provando consistência, resiliência e clareza mental.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {achievements.map((ach) => {
                  // Dynamic unlock evaluation based on state
                  const isUnlocked = 
                    ach.id === 'ach-primeiro-passo' || 
                    (ach.id === 'ach-dia-1' && (progress?.completedMissionsCount || 0) >= 1) ||
                    (ach.id === 'ach-streak-3' && (progress?.bestStreak || 0) >= 3) ||
                    (ach.id === 'ach-streak-5' && (progress?.bestStreak || 0) >= 5) ||
                    (ach.id === 'ach-xp-500' && (progress?.totalXp || 0) >= 500) ||
                    (ach.id === 'ach-comunidade' && posts.some(p => p.userId === user.id));

                  return (
                    <div 
                      key={ach.id} 
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isUnlocked 
                          ? 'bg-amber-50/40 border-amber-100 text-slate-800 shadow-xs' 
                          : 'bg-slate-50/50 border-slate-100 opacity-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {ach.badgeIcon === 'Compass' && <Compass className="w-5 h-5 animate-pulse" />}
                        {ach.badgeIcon === 'Play' && <Play className="w-5 h-5" />}
                        {ach.badgeIcon === 'Zap' && <Zap className="w-5 h-5" />}
                        {ach.badgeIcon === 'Award' && <Award className="w-5 h-5" />}
                        {ach.badgeIcon === 'Sparkles' && <Sparkles className="w-5 h-5" />}
                        {ach.badgeIcon === 'MessageSquare' && <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black leading-tight">{ach.title}</h4>
                        <p className="text-[10px] leading-tight text-slate-500 font-light">{ach.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ======================= HIGH FIDELITY OVERLAYS ======================= */}
      {/* ========================================================================= */}

      {/* 1. LEVEL UP CONGRATULATIONS OVERLAY MODAL */}
      <AnimatePresence>
        {showLevelUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 text-white"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-3xl p-6 border border-indigo-500/30 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-[-30px] left-[-30px] opacity-10 blur-xl w-32 h-32 bg-indigo-500 rounded-full animate-pulse" />
              <div className="absolute bottom-[-30px] right-[-30px] opacity-10 blur-xl w-32 h-32 bg-purple-500 rounded-full animate-pulse" />

              <div className="space-y-1.5">
                <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  MARCO DE JORNADA
                </span>
                <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                  <Brain className="w-6 h-6 text-indigo-400 animate-pulse" />
                  SUBIU DE NÍVEL!
                </h2>
              </div>

              {/* Giant Medal visualizer */}
              <div className="w-28 h-28 mx-auto bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center border-4 border-yellow-200 shadow-lg relative">
                <Trophy className="w-14 h-14 text-white animate-bounce" />
                <div className="absolute bottom-[-5px] bg-indigo-600 text-[10px] font-black px-3 py-0.5 rounded-full border border-indigo-400 text-white shadow-xs">
                  NÍVEL {unlockedLevel}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-slate-300 font-medium">Sua consistência superou velhas sinapses!</p>
                <p className="text-xs text-slate-400 font-light">Você agora está no Nível {unlockedLevel} e acumulando maior domínio mental contra impulsos físicos.</p>
              </div>

              <button
                onClick={() => setShowLevelUpModal(false)}
                className="w-full py-3 bg-slate-900 border border-[#B89A6C] text-[#B89A6C] font-black text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                PROSSEGUIR JORNADA
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. INSPIRATIONAL MESSAGE OF THE DAY MODAL */}
      <AnimatePresence>
        {showInspirationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 text-slate-800"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 max-w-sm w-full text-center space-y-4 shadow-xl"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <Brain className="w-6 h-6 text-emerald-600 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MENSAGEM PRINCIPAL</span>
                <h3 className="text-lg font-black text-slate-800">Cérebro {profile.name}</h3>
              </div>

              {/* Main message from config */}
              <p className="text-sm text-slate-600 italic font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                &ldquo;{profile.mainMessage || "Você vence uma pequena batalha por vez."}&rdquo;
              </p>

              <p className="text-xs text-slate-400 font-light">Sua base comportamental sugere focar em {profile.gamificationType.toLowerCase()}. Mantenha a clareza mental!</p>

              <button
                onClick={() => setShowInspirationModal(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
              >
                ENTENDIDO, ESTOU NO CONTROLE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. DAILY HUMOR AND CRAVING CHECK-IN MODAL */}
      <AnimatePresence>
        {showCheckinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 text-slate-800"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-3xl p-5 border border-slate-100 max-w-sm w-full text-left space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  Check-in Diário de Monitoramento
                </h3>
                <button
                  onClick={() => setShowCheckinModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isCheckinSaved ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">Já monitorado hoje!</h4>
                  <p className="text-xs text-slate-500 font-light">Continue firme! Seus registros estão calibrando seu Quartel-General.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveCheckin} className="space-y-4">
                  
                  {/* Mood Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 block">Como se sente mentalmente agora?</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { key: 'happy', label: 'Excelente', icon: Smile, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
                        { key: 'neutral', label: 'Neutro', icon: Meh, color: 'text-slate-500 bg-slate-50 border-slate-200' },
                        { key: 'stressed', label: 'Estressado', icon: ShieldAlert, color: 'text-amber-500 bg-amber-50 border-amber-200' },
                        { key: 'sad', label: 'Triste', icon: Frown, color: 'text-blue-500 bg-blue-50 border-blue-200' },
                        { key: 'anxious', label: 'Ansioso', icon: Brain, color: 'text-violet-500 bg-violet-50 border-violet-200' }
                      ].map(item => {
                        const Icon = item.icon;
                        const isSel = mood === item.key;
                        return (
                          <button
                            type="button"
                            key={item.key}
                            onClick={() => setMood(item.key as any)}
                            className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              isSel ? `${item.color} scale-105 shadow-xs font-bold` : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="text-[8px] leading-tight text-center">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Craving slide */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-slate-600">Nível de Fissura / Compulsão</label>
                      <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{cravingLevel}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={cravingLevel}
                      onChange={(e) => setCravingLevel(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-slate-400">
                      <span>0 - Sem Compulsão</span>
                      <span>5 - Moderado</span>
                      <span>10 - Insuportável</span>
                    </div>
                  </div>

                  {/* Notes text */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Notas adicionais (opcional)</label>
                    <textarea
                      placeholder="Insights rápidos de sua mente..."
                      value={checkinNotes}
                      onChange={(e) => setCheckinNotes(e.target.value)}
                      className="w-full p-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none min-h-[50px] placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    Registrar Check-in (+30 XP)
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. REGISTER TRIGGER MODAL (Cravings logger) */}
      <AnimatePresence>
        {showTriggerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 text-slate-800"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-3xl p-5 border border-slate-100 max-w-sm w-full text-left space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-amber-500" />
                  Mapear Gatilho de Fissura
                </h3>
                <button
                  onClick={() => { setShowTriggerModal(false); setTriggerTips(null); }}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {triggerTips ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                    <h4 className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider">Gatilho Mapeado (+30 XP)</h4>
                    <p className="text-xs text-emerald-700 font-medium italic leading-relaxed">&ldquo;{triggerTips}&rdquo;</p>
                  </div>
                  <button
                    onClick={() => { setShowTriggerModal(false); setTriggerTips(null); }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Prosseguir
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterTriggerSubmit} className="space-y-4">
                  
                  {/* Trigger type */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 block">Qual gatilho ativou sua compulsão?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'Stress', label: 'Estresse / Raiva', icon: ShieldAlert },
                        { key: 'Social', label: 'Momento Social', icon: HeartHandshake },
                        { key: 'Coffee', label: 'Gatilho do Café', icon: Wind },
                        { key: 'Boredom', label: 'Tédio / Distração', icon: Meh },
                        { key: 'After Meal', label: 'Após Refeição', icon: Smile }
                      ].map(item => {
                        const Icon = item.icon;
                        const isSel = triggerType === item.key;
                        return (
                          <button
                            type="button"
                            key={item.key}
                            onClick={() => setTriggerType(item.key)}
                            className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                              isSel ? 'bg-amber-50 border-amber-400 text-amber-800 font-black shadow-xs' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Intensity slide */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-slate-600">Intensidade da compulsão (0 a 10)</label>
                      <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{triggerIntensity}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={triggerIntensity}
                      onChange={(e) => setTriggerIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Trigger Notes */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Notas rápidas (opcional)</label>
                    <textarea
                      placeholder="ex: Briguei no trabalho e tive pressa..."
                      value={triggerNotes}
                      onChange={(e) => setTriggerNotes(e.target.value)}
                      className="w-full p-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none min-h-[50px] placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    Registrar & Mapear Gatilho
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. EPIC WEEKEND BOSS BATTLE MODAL */}
      <AnimatePresence>
        {showBossModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 text-white"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-3xl p-5 border border-[#B89A6C]/30 max-w-sm w-full text-center space-y-5 shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-[#B89A6C] flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-[#B89A6C] animate-pulse" /> ARENA COMPORTAMENTAL NEUROPURE
                </span>
                <button
                  onClick={() => setShowBossModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Boss avatar and HP bar */}
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-4xl shadow-md">
                  <Brain className="w-8 h-8 text-[#B89A6C] animate-pulse" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">O Monstro da Fissura</h3>
                
                {/* Boss HP Pool bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>HP DO CHEFE</span>
                    <span className="text-[#B89A6C] font-extrabold">{bossHp} / 100 HP</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                    <motion.div
                      animate={{ width: `${bossHp}%` }}
                      className="h-full bg-gradient-to-r from-[#B89A6C] to-[#E2C799]"
                    />
                  </div>
                </div>
              </div>

              {/* User Health Lives */}
              <div className="flex justify-center items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase mr-1">Suas Vidas:</span>
                {Array.from({ length: 3 }, (_, index) => (
                  <Heart
                    key={index}
                    className={`w-5 h-5 transition-all ${
                      index < bossHearts ? 'fill-[#B89A6C] text-[#B89A6C] scale-110' : 'text-slate-600 scale-90'
                    }`}
                  />
                ))}
              </div>

              {/* Boss dialogue attack & Battle logs */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-left min-h-[90px] flex flex-col justify-center">
                {bossOutcome === 'playing' ? (
                  <div className="space-y-2">
                    <p className="text-[#B89A6C] font-black uppercase tracking-wider text-[9px]">Ataque do Round {bossRound + 1}:</p>
                    <p className="text-slate-300 italic font-light">&ldquo;{
                      bossRound === 0 ? "Você trabalhou a semana toda e está sozinho no sábado. Só um trago vai te relaxar agora. Você merece um prêmio!" :
                      bossRound === 1 ? "Todo mundo no bar ou festa está rindo livremente. Se você não fumar, vai ficar isolado e o rolê vai ser uma chatice!" :
                      "Você já provou que aguenta uma semana! Claramente você está livre. Pode comemorar fumando só mais um hoje!"
                    }&rdquo;</p>
                  </div>
                ) : bossOutcome === 'victory' ? (
                  <div className="text-center space-y-1 text-[#B89A6C] py-2">
                    <CheckCircle className="w-8 h-8 mx-auto animate-bounce text-[#B89A6C]" />
                    <h4 className="font-black text-sm uppercase">VITÓRIA COMPORTAMENTAL!</h4>
                    <p className="text-[11px] text-slate-300 font-light">Você derrotou o Boss com reestruturação cognitiva científica!</p>
                  </div>
                ) : (
                  <div className="text-center space-y-1 text-slate-400 py-2">
                    <X className="w-8 h-8 mx-auto animate-spin text-slate-500" />
                    <h4 className="font-black text-sm uppercase">DERROTA NA ARENA</h4>
                    <p className="text-[11px] text-slate-300 font-light">Seu cérebro cedeu às mentiras cognitivas. Reforce seu plano e tente de novo!</p>
                  </div>
                )}
              </div>

              {/* Dynamic Action logs banner */}
              {bossLog && bossOutcome === 'playing' && (
                <p className="text-[10px] font-medium text-slate-400 bg-white/5 p-2 rounded-xl border border-white/5 italic text-center">
                  {bossLog}
                </p>
              )}

              {/* Combat Buttons options */}
              {bossOutcome === 'playing' && (
                <div className="space-y-2 text-left pt-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase block">Escolha sua defesa de CBT:</span>
                  
                  <button
                    onClick={() => handleBossAction('impulsive')}
                    className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[9px] font-black flex items-center justify-center shrink-0">A</span>
                    <span className="leading-tight text-slate-300">
                      {bossRound === 0 ? "É verdade, estou cansado e com direito a um prêmio rápido hoje." :
                       bossRound === 1 ? "Vou dar só um trago rápido de leve para não me sentir excluído." :
                       "Vou fumar um hoje para comemorar minha força, depois paro de novo."}
                    </span>
                  </button>

                  <button
                    onClick={() => handleBossAction('passive')}
                    className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[9px] font-black flex items-center justify-center shrink-0">B</span>
                    <span className="leading-tight text-slate-300">
                      {bossRound === 0 ? "Vou tentar aguentar na marra sem fazer nada, ficando sofrendo no canto." :
                       bossRound === 1 ? "Vou sair correndo da festa de volta pra casa pra me isolar trancado." :
                       "Vou dormir imediatamente pra fugir desses pensamentos insistententes."}
                    </span>
                  </button>

                  <button
                    onClick={() => handleBossAction('resilient')}
                    className="w-full p-2.5 bg-slate-900 hover:bg-slate-950 border border-[#B89A6C]/30 rounded-xl text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#B89A6C] text-slate-900 text-[9px] font-black flex items-center justify-center shrink-0">C</span>
                    <span className="leading-tight text-[#B89A6C]">
                      {bossRound === 0 ? "O estresse passa em minutos sozinho. Fumar só gerará mais frustração e ansiedade." :
                       bossRound === 1 ? "Minha liberdade vale mais que aprovação social rápida. Posso me divertir limpo." :
                       "Celebrar o fim de um vício voltando a usá-lo? Minha recompensa é o ar limpo nos meus pulmões!"}
                    </span>
                  </button>
                </div>
              )}

              {/* Close combat outcomes */}
              {bossOutcome !== 'playing' && (
                <button
                  onClick={() => {
                    setShowBossModal(false);
                    if (bossOutcome === 'victory') {
                      triggerConfettiExplosion();
                    }
                  }}
                  className="w-full py-3 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 bg-slate-900 border border-[#B89A6C] text-[#B89A6C]"
                >
                  {bossOutcome === 'victory' ? "REIVINDICAR +500 XP & MEDALHA" : "VOLTAR AO TREINAMENTO"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. FULL-SCREEN INTERACTIVE SOS BOX BREATHINGPACEMAKER OVERLAY */}
      <AnimatePresence>
        {showSosBreath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-between p-6 text-white"
          >
            {/* Top Close */}
            <div className="w-full flex justify-end">
              <button
                onClick={() => setShowSosBreath(false)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Breathing circle pacing */}
            <div className="flex flex-col items-center justify-center text-center space-y-8 my-auto">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-rose-400 tracking-wider uppercase bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  NEUROPURE BIOMODULADOR
                </span>
                <h2 className="text-xl font-black">Respiração Quadrada Prática</h2>
                <p className="text-xs text-slate-400 max-w-xs font-light">Siga a modulação física do diafragma para desacelerar seus impulsos.</p>
              </div>

              {/* Pacemaker Visual Ring */}
              <div className="relative w-60 h-60 flex items-center justify-center">
                {/* Visual pulse shadows */}
                <motion.div
                  animate={{
                    scale: breathPhase === 'inhale' ? [1, 1.4] : breathPhase === 'exhale' ? [1.4, 1] : breathPhase === 'hold-in' ? 1.4 : 1,
                  }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-indigo-500/15 rounded-full blur-2xl"
                />

                {/* Animated Ring */}
                <motion.div
                  animate={{
                    scale: breathPhase === 'inhale' ? [1, 1.35] : breathPhase === 'exhale' ? [1.35, 1] : breathPhase === 'hold-in' ? 1.35 : 1,
                  }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ${
                    breathPhase === 'inhale' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' :
                    breathPhase === 'hold-in' ? 'border-amber-500 bg-amber-500/10 text-amber-400' :
                    breathPhase === 'exhale' ? 'border-sky-500 bg-sky-500/10 text-sky-400' :
                    'border-slate-500 bg-slate-500/10 text-slate-400'
                  }`}
                >
                  <span className="text-3xl font-black">{breathSeconds}s</span>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-1">
                    {breathPhase === 'inhale' && 'Inale o Ar'}
                    {breathPhase === 'hold-in' && 'Segure o Ar'}
                    {breathPhase === 'exhale' && 'Exale o Ar'}
                    {breathPhase === 'hold-out' && 'Vazio'}
                  </span>
                </motion.div>
              </div>

              {/* Cycle progress bars */}
              <div className="space-y-1.5 w-full max-w-xs text-center">
                <p className="text-xs font-bold text-slate-400">Ciclos completos: {completedBreaths} / 3</p>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(completedBreaths / 3) * 100}%` }} />
                </div>
              </div>

              {/* Action instructions bar */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-xs text-center text-[10px] font-black text-slate-500">
                <span className={breathPhase === 'inhale' ? 'text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20' : ''}>1. INALE 4s</span>
                <span className={breathPhase === 'hold-in' ? 'text-amber-400 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20' : ''}>2. RETENHA 4s</span>
                <span className={breathPhase === 'exhale' ? 'text-sky-400 bg-sky-500/10 p-2 rounded-xl border border-sky-500/20' : ''}>3. EXALE 4s</span>
                <span className={breathPhase === 'hold-out' ? 'text-slate-300 bg-slate-500/10 p-2 rounded-xl border border-slate-500/20' : ''}>4. RETENHA 4s</span>
              </div>
            </div>

            {/* Bottom help indicator */}
            <div className="flex items-center gap-2.5 text-xs text-slate-400 mb-4 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5 max-w-sm text-center">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Realize 3 ciclos completos para acalmar o nervo vago e desinflamar a fissura de dopamina.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
