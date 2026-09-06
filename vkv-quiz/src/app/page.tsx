"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Game, Round, PidstavaCard, CommentGame, BlitzQuestion, GameSettings } from "@/types/quiz";
import confetti from "canvas-confetti";
import {
  Trophy,
  Play,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Flame,
  Settings,
  MessageSquareQuote,
  Sparkles,
  ArrowRightCircle,
  Edit3,
  Check,
  MessageCircle,
  Zap,
  Lock,
  Loader2,
  HelpCircle,
  Info,
  Users,
  UserCheck,
  Flag,
} from "lucide-react";

// Web Audio API procedural sound synthesizer
function playBeep(
  frequency = 800,
  duration = 0.1,
  type: "sine" | "square" | "sawtooth" | "triangle" = "sine",
) {
  if (typeof window === "undefined") return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.error("Audio beep failed:", err);
  }
}

function playChime() {
  playBeep(587.33, 0.15, "sine"); // D5
  setTimeout(() => playBeep(880, 0.3, "sine"), 120); // A5
}

function playBuzzer() {
  playBeep(140, 0.4, "sawtooth");
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Fallback demo data for Round 1: Підстава (8 карток з окремими фактами)
const DEFAULT_PIDSTAVA_CARDS: PidstavaCard[] = [
  {
    topic: "Кінематограф та Шоу",
    easy_question: "Який український 3D-фільм став найкасовішим анімаційним фільмом в історії українського прокату?",
    easy_answer: "Мавка. Лісова пісня",
    easy_fact: "Касові збори «Мавки» у світовому прокаті перевищили 20 мільйонів доларів у понад 80 країнах.",
    hard_question: "Хто є режисером культового українського фільму «Тіні забутих предків» (1965)?",
    hard_answer: "Сергій Параджанов",
    hard_fact: "Гарвардський університет додав цей фільм до списку обов'язкових для перегляду студентам кінознавства.",
  },
  {
    topic: "Історія України",
    easy_question: "Який князь офіційно охрестив Київську Русь у 988 році?",
    easy_answer: "Володимир Великий",
    easy_fact: "До хрещення Русі князь Володимир встановив у Києві пантеон із 6 головних язичницьких богів на чолі з Перуном.",
    hard_question: "У якому році гетьман Пилип Орлик уклав свою знамениту Конституцію в Бендерах?",
    hard_answer: "1710",
    hard_fact: "Оригінал першої сторінки Конституції латинською мовою зберігається в Національному архіві Швеції.",
  },
  {
    topic: "Музика та Хіти",
    easy_question: "Який гурт переміг на Євробаченні-2022 від України з піснею «Стефанія»?",
    easy_answer: "Kalush Orchestra",
    easy_fact: "Пісня «Стефанія» спочатку була присвячена мамі лідера гурту Олега Псюка.",
    hard_question: "Скільки струн зазвичай має традиційна академічна українська бандура?",
    hard_answer: "Від 55 до 65",
    hard_fact: "Бандура поєднує в собі риси лютні та гусел і є унікальним суто українським інструментом.",
  },
  {
    topic: "Географія та Мандри",
    easy_question: "Яка найвища гірська вершина України?",
    easy_answer: "Говерла (2061 м)",
    easy_fact: "Назва «Говерла» походить з угорської мови (Hóvár) і перекладається як «Снігова гора».",
    hard_question: "Який острів є найбільшим за площею островом України в Чорному морі?",
    hard_answer: "Джарилгач",
    hard_fact: "Металевий каркас маяка на острові Джарилгач був виготовлений у Парижі в майстерні Ейфеля.",
  },
  {
    topic: "Українська Кухня",
    easy_question: "Яка традиційна страва з кукурудзяного борошна та сметани є візитівкою гуцульської кухні?",
    easy_answer: "Банош (або бануш)",
    easy_fact: "Справжній гуцульський банош традиційно варять виключно чоловіки на відкритому вогні та помішують тільки дерев'яною ложкою.",
    hard_question: "Який головний інгредієнт використовується як основа для стародавньої страви «верещака»?",
    hard_answer: "Свинячі реберця в буряковому квасі",
    hard_fact: "Верещака згадується ще в «Енеїді» Котляревського серед найулюбленіших страв козаків.",
  },
  {
    topic: "Спорт та Рекорди",
    easy_question: "У якому виді спорту здобув світове визнання володар «Золотого м'яча» Андрій Шевченко?",
    easy_answer: "Футбол",
    easy_fact: "Андрій Шевченко став третім українцем після Олега Блохіна та Ігоря Бєланова, який здобув «Золотий м'яч».",
    hard_question: "Яку висоту подолав Сергій Бубка у 1994 році, встановивши світовий рекорд зі стрибків з жердиною?",
    hard_answer: "6.14 м",
    hard_fact: "Цей рекорд на відкритому повітрі тримався непобитим понад 26 років (до 2020 року)!",
  },
  {
    topic: "Література та Мова",
    easy_question: "Хто є автором знаменитої поеми «Катерина» та збірки «Кобзар»?",
    easy_answer: "Тарас Шевченко",
    easy_fact: "Тарасу Шевченку встановлено найбільше пам'ятників у світі серед діячів культури — понад 1380 монументів у 35 країнах!",
    hard_question: "Хто з українських письменників першим написав твір живою народною мовою («Енеїда», 1798)?",
    hard_answer: "Іван Котляревський",
    hard_fact: "Перші три частини «Енеїди» були видані в Петербурзі без відома самого автора конотопським шляхтичем Максимом Парпурою.",
  },
  {
    topic: "Технології & Інтернет",
    easy_question: "Як називається український державний застосунок та портал електронних послуг?",
    easy_answer: "Дія",
    easy_fact: "Україна стала першою державою у світі, де електронні паспорти в застосунку отримали таку ж юридичну силу, як і паперові.",
    hard_question: "Який всесвітньо відомий сервіс онлайн-перевірки граматики заснували українці у 2009 році?",
    hard_answer: "Grammarly",
    hard_fact: "Засновниками сервісу є кияни Олексій Шевченко, Максим Литвин та Дмитро Лідер, а щоденна аудиторія перевищує 30 мільйонів користувачів.",
  },
];

// Fallback demo data for Round 2: Коментарі (4 гри)
const DEFAULT_COMMENTS_GAMES: CommentGame[] = [
  {
    correct_video: "DZIDZIO — Я і Сара",
    fake_videos: ["Потап і Настя — Чумачечая весна", "ТІК — Олені", "Оля Полякова — Шльопки"],
    comments: [
      "Після цього кліпу моя бабця на весіллі почала танцювати на столі в гумових чоботях",
      "Хто б міг подумати, що бородатий мужик і єврейська дівчина стануть головним хітом літа",
      "Така любов, що аж кукурудза в полі сама почистилася і зварилася",
      "Васильович, віддай Сару, вона ще город не досапала!",
    ],
  },
  {
    correct_video: "Wellboy — Гуси",
    fake_videos: ["Jerry Heil — Охрана, отмєна", "Kalush — Зорі", "LATEXFAUNA — Cherkaschyna"],
    comments: [
      "Ця пісня грала у мене в голові навіть коли я здавав іспит з вищої математики",
      "Птахи ще ніколи не були настільки стильними в українському шоу-бізнесі",
      "В селі Грунь після цього кліпу ціни на домашню птицю підскочили втричі",
      "Гуси-гуси, га-га-га, а цей трек качає так, що аж вибило пробки в хаті",
    ],
  },
  {
    correct_video: "Степан Гіга — Цей сон",
    fake_videos: ["Іво Бобул — А липи цвітуть", "Павло Зібров — Вусатий хит", "Микола Гнатюк — Час рікою пливе"],
    comments: [
      "Мій психотерапевт: цього не існує. Цей трек о 3-й ночі в ТікТоці: добрий вечір!",
      "Легенда повернулася і показала молодим реперам, як треба тримати стадіони",
      "Слухаю цей шедевр і розумію, що мені знову сімнадцять, хоча мені вже тридцять п'ять",
      "Цей сон, цей сон, мені щоночі сниться... Народний артист України назавжди в серці!",
    ],
  },
  {
    correct_video: "Пивоваров x Дорофєєва — Думи",
    fake_videos: ["Монатік x Ніна Матвієнко — Цей день", "Бумбокс x Хливнюк — Ой у лузі", "The HARDKISS x KAZKA — Сестра"],
    comments: [
      "Коли класика літератури звучить сучасніше за всі світові чарти разом узяті",
      "Вірші Тараса Григоровича Шевченка у такому дуеті доводять до мурашок по шкірі",
      "Чорно-білий кліп, але стільки емоцій і глибини, що перехоплює подих",
      "Думи мої, думи мої, лихо мені з вами... Артем і Надя створили справжній шедевр",
    ],
  },
];

// Fallback demo data for Round 3: 5/10 (8 питань)
const DEFAULT_BLITZ_QUESTIONS: BlitzQuestion[] = [
  { question: "Назвіть 3 предмети, які завжди є в жіночій сумочці" },
  { question: "Назвіть 3 причини, чому чоловік може запізнитися на побачення" },
  { question: "Назвіть 3 українські страви, які соромно не вміти готувати" },
  { question: "Назвіть 3 речі, які люди роблять, коли думають, що їх ніхто не бачить" },
  { question: "Назвіть 3 професії, представникам яких не варто брехати" },
  { question: "Назвіть 3 фільми, над якими плачуть навіть дорослі чоловіки" },
  { question: "Назвіть 3 речі, які обов'язково беруть із собою в поїзд Укрзалізниці" },
  { question: "Назвіть 3 пісні, які знає напам'ять кожен українець" },
];

const DEFAULT_GAME_SETTINGS: GameSettings = {
  team1: {
    name: "Команда 1",
    players: ["Гравець 1 (К1)", "Гравець 2 (К1)"],
  },
  team2: {
    name: "Команда 2",
    players: ["Гравець 1 (К2)", "Гравець 2 (К2)"],
  },
  first_turn_team: 1,
};

export default function GamePage() {
  // Game & Round States
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<"select_game" | "playing" | "finished">("select_game");

  // Scores
  const [scores, setScores] = useState<{ team1: number; team2: number }>({ team1: 0, team2: 0 });

  // Teams & Players Setup
  const [gameSettings, setGameSettings] = useState<GameSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("vkv_game_settings");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_GAME_SETTINGS;
  });

  const [editingSettingsModal, setEditingSettingsModal] = useState<boolean>(false);

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [roundsLoading, setRoundsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- GLOBAL TURN ORDER & LEADERSHIP LOGIC ---
  const [tieBreakerTeam, setTieBreakerTeam] = useState<"team1" | "team2">("team1");

  const getLeadingTeam = (): "team1" | "team2" | "tie" => {
    if (scores.team1 > scores.team2) return "team1";
    if (scores.team2 > scores.team1) return "team2";
    return "tie";
  };

  // Determine starting team for the current round
  const getCurrentRoundStartingTeam = (): "team1" | "team2" => {
    if (currentRoundIndex === 0) {
      return gameSettings.first_turn_team === 1 ? "team1" : "team2";
    }
    const leader = getLeadingTeam();
    if (leader === "team1") return "team1";
    if (leader === "team2") return "team2";
    return tieBreakerTeam;
  };

  // --- ROUND 1: ПІДСТАВА STATES ---
  const [easyHardActiveCardIdx, setEasyHardActiveCardIdx] = useState<number | null>(null);
  const [easyHardDifficulty, setEasyHardDifficulty] = useState<"easy" | "hard" | null>(null);
  const [easyHardPlayedIndices, setEasyHardPlayedIndices] = useState<number[]>([]);
  const [easyHardChoosingTeam, setEasyHardChoosingTeam] = useState<"team1" | "team2">("team1");
  const [easyHardJudgmentGiven, setEasyHardJudgmentGiven] = useState<boolean | null>(null);

  // --- ROUND 2: КОМЕНТАРІ STATES ---
  const [commentsGameIndex, setCommentsGameIndex] = useState<number>(0);
  const [commentsRevealedCount, setCommentsRevealedCount] = useState<number>(1); // 1 to 4
  const [commentsEliminatedOptions, setCommentsEliminatedOptions] = useState<string[]>([]);
  const [commentsSelectedOption, setCommentsSelectedOption] = useState<string | null>(null);
  const [commentsGameFinished, setCommentsGameFinished] = useState<boolean>(false);
  const [commentsPointsEarned, setCommentsPointsEarned] = useState<number | null>(null);
  const [shuffledVideoOptions, setShuffledVideoOptions] = useState<string[]>([]);

  // --- ROUND 3: 5/10 STATES ---
  const [blitzQuestionIndex, setBlitzQuestionIndex] = useState<number>(0); // 0 to 7
  const [blitz10TimeLeft, setBlitz10TimeLeft] = useState<number>(10);
  const [blitz10TimerActive, setBlitz10TimerActive] = useState<boolean>(false);
  const [blitzScores, setBlitzScores] = useState<Record<number, boolean | null>>({});
  const blitzTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- ROUND 4: ЕЛІАС STATES ---
  const [aliasTurnIndex, setAliasTurnIndex] = useState<number>(0); // 0 to 7 (8 turns)
  const [aliasTimeLeft, setAliasTimeLeft] = useState<number>(71);
  const [aliasTimerActive, setAliasTimerActive] = useState<boolean>(false);
  const [aliasGuessedCount, setAliasGuessedCount] = useState<number>(0);
  const [aliasSkippedCount, setAliasSkippedCount] = useState<number>(0);
  const [aliasTurnSummaryModal, setAliasTurnSummaryModal] = useState<{
    teamName: string;
    explainer: string;
    guesser: string;
    guessed: number;
    skipped: number;
    points: number;
    nextTeamName?: string;
    nextExplainer?: string;
    nextGuesser?: string;
  } | null>(null);
  const aliasTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem("vkv_game_settings", JSON.stringify(gameSettings));
  }, [gameSettings]);

  // Load Persisted Game Scores from LocalStorage
  useEffect(() => {
    try {
      const savedScores = localStorage.getItem("vkv_scores");
      if (savedScores) setScores(JSON.parse(savedScores));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save State to LocalStorage
  useEffect(() => {
    localStorage.setItem("vkv_scores", JSON.stringify(scores));
  }, [scores]);

  // Fetch Games on Mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Whenever selectedGameId changes, fetch its rounds
  useEffect(() => {
    if (selectedGameId) {
      fetchRoundsForGame(selectedGameId);
    }
  }, [selectedGameId]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setGames(data || []);
      if (data && data.length > 0) {
        const firstGame = data[0];
        setSelectedGameId(firstGame.id);
        setSelectedGame(firstGame);
        await fetchRoundsForGame(firstGame.id);
      }
    } catch (err: any) {
      console.error("fetchGames error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoundsForGame = async (gameId: string) => {
    try {
      setRoundsLoading(true);
      const { data, error } = await supabase
        .from("rounds")
        .select("*")
        .eq("game_id", gameId)
        .order("order_index", { ascending: true });

      if (error) throw error;

      const normalizedRounds: Round[] = (data || []).map((r: any) => ({
        ...r,
        ...(r.data || {}),
        cards: r.cards || r.data?.cards || [],
        comment_games: r.comment_games || r.data?.comment_games || r.data?.games || r.games || [],
        games: r.games || r.data?.games || r.data?.comment_games || r.comment_games || [],
        blitz_questions: r.blitz_questions || r.data?.blitz_questions || r.data?.questions || r.questions || [],
        questions: r.questions || r.data?.questions || r.data?.blitz_questions || r.blitz_questions || [],
        timer_seconds: r.timer_seconds || r.data?.timer_seconds || r.data?.config?.timer_seconds || 71,
      }));

      setRounds(normalizedRounds);
    } catch (err: any) {
      console.error("fetchRoundsForGame error:", err);
    } finally {
      setRoundsLoading(false);
    }
  };

  const handleSelectGame = async (game: Game) => {
    setSelectedGameId(game.id);
    setSelectedGame(game);
    await fetchRoundsForGame(game.id);
  };

  const startGame = async () => {
    if (!selectedGameId) return;
    resetScores(true); // Автоматичне скидання рахунку до 0:0 при старті нової гри
    if (rounds.length === 0) {
      await fetchRoundsForGame(selectedGameId);
    }
    setGameState("playing");
    setCurrentRoundIndex(0);
    resetRoundStates();
  };

  // Швидке заповнення раундами поточної гри, якщо в ній 0 раундів
  const handleQuickFillDemoRounds = async () => {
    if (!selectedGameId) return;
    try {
      setRoundsLoading(true);
      const normalizedComments = DEFAULT_COMMENTS_GAMES.map((g) => ({
        correct_video: g.correct_video.trim(),
        fake_videos: g.fake_videos.map((f) => f.trim()),
        comments: g.comments.map((c) => c.trim()),
        options: [g.correct_video.trim(), ...g.fake_videos.map((f) => f.trim())],
        video_url: g.video_url || "",
      }));

      const demoRounds = [
        {
          game_id: selectedGameId,
          type: "pidstava",
          order_index: 0,
          data: { cards: DEFAULT_PIDSTAVA_CARDS, question: "Підстава (8 тем)" },
        },
        {
          game_id: selectedGameId,
          type: "comments",
          order_index: 1,
          data: { games: normalizedComments, comment_games: normalizedComments, question: "Коментарі (4 гри)" },
        },
        {
          game_id: selectedGameId,
          type: "blitz_5_10",
          order_index: 2,
          data: { questions: DEFAULT_BLITZ_QUESTIONS, blitz_questions: DEFAULT_BLITZ_QUESTIONS, question: "5/10 (8 питань)" },
        },
        {
          game_id: selectedGameId,
          type: "alias",
          order_index: 3,
          data: { config: { timer_seconds: 71 }, timer_seconds: 71, question: "Еліас: 71 секунда (01:11)" },
        },
      ];

      const { error } = await supabase.from("rounds").insert(demoRounds);
      if (error) {
        console.error("Quick fill rounds error:", error);
        alert("Помилка додавання 4 раундів: " + error.message);
        throw error;
      }

      await fetchRoundsForGame(selectedGameId);
    } catch (err: any) {
      console.error("handleQuickFillDemoRounds catch:", err);
    } finally {
      setRoundsLoading(false);
    }
  };

  const resetRoundStates = () => {
    // Round 1
    setEasyHardActiveCardIdx(null);
    setEasyHardDifficulty(null);
    setEasyHardPlayedIndices([]);
    setEasyHardJudgmentGiven(null);
    const initialStart = gameSettings.first_turn_team === 1 ? "team1" : "team2";
    setEasyHardChoosingTeam(initialStart);

    // Round 2
    setCommentsGameIndex(0);
    setCommentsRevealedCount(1);
    setCommentsEliminatedOptions([]);
    setCommentsSelectedOption(null);
    setCommentsGameFinished(false);
    setCommentsPointsEarned(null);

    // Round 3
    setBlitzQuestionIndex(0);
    setBlitz10TimeLeft(10);
    setBlitz10TimerActive(false);
    setBlitzScores({});
    if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);

    // Round 4
    setAliasTurnIndex(0);
    setAliasTimeLeft(71);
    setAliasTimerActive(false);
    setAliasGuessedCount(0);
    setAliasSkippedCount(0);
    setAliasTurnSummaryModal(null);
    if (aliasTimerRef.current) clearInterval(aliasTimerRef.current);
  };

  const triggerVictoryConfetti = () => {
    if (typeof window === "undefined") return;
    try {
      playChime();
      setTimeout(() => playBeep(1046.5, 0.4, "sine"), 250);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
        });
      }, 400);

      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.4 },
        });
      }, 700);
    } catch (e) {
      console.error("Confetti trigger error:", e);
    }
  };

  useEffect(() => {
    if (gameState === "finished") {
      triggerVictoryConfetti();
    }
  }, [gameState]);

  const handleRematch = () => {
    resetScores(true);
    setCurrentRoundIndex(0);
    resetRoundStates();
    setGameState("playing");
    playChime();
  };

  const handleStartNewGame = () => {
    resetScores(true);
    setCurrentRoundIndex(0);
    resetRoundStates();
    setGameState("select_game");
  };

  const nextRound = () => {
    if (currentRoundIndex + 1 < rounds.length) {
      setCurrentRoundIndex((prev) => prev + 1);
      resetRoundStates();
    } else {
      setGameState("finished");
    }
  };

  const prevRound = () => {
    if (currentRoundIndex > 0) {
      setCurrentRoundIndex((prev) => prev - 1);
      resetRoundStates();
    }
  };

  const resetScores = (force = false) => {
    if (force || (typeof window !== "undefined" && window.confirm("Скинути рахунок обох команд до 0?"))) {
      setScores({ team1: 0, team2: 0 });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("vkv_scores", JSON.stringify({ team1: 0, team2: 0 }));
        } catch (e) {
          console.error(e);
        }
      }
      playBeep(400, 0.2, "sine");
    }
  };

  // Helper for shuffle video options in Round 2
  useEffect(() => {
    const currentRound = rounds[currentRoundIndex];
    if (
      currentRound &&
      (currentRound.type === "youtube_comments" || currentRound.type === "comments")
    ) {
      const gamesList: CommentGame[] =
        (currentRound.comment_games && currentRound.comment_games.length > 0)
          ? currentRound.comment_games
          : (currentRound.games && currentRound.games.length > 0)
            ? currentRound.games
            : (currentRound.data?.games && currentRound.data.games.length > 0)
              ? currentRound.data.games
              : (currentRound.data?.comment_games && currentRound.data.comment_games.length > 0)
                ? currentRound.data.comment_games
                : DEFAULT_COMMENTS_GAMES;

      const game = gamesList[commentsGameIndex] || gamesList[0];
      if (game) {
        const allOpts = [game.correct_video, ...game.fake_videos];
        setShuffledVideoOptions(shuffleArray(allOpts));
      }
    }
  }, [currentRoundIndex, commentsGameIndex, rounds]);

  // --- 10-SECOND TIMER LOGIC (ROUND 3: 5/10) ---
  const startBlitz10Timer = () => {
    if (blitz10TimerActive) return;
    setBlitz10TimerActive(true);
    playBeep(600, 0.1, "sine");

    blitzTimerRef.current = setInterval(() => {
      setBlitz10TimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(blitzTimerRef.current!);
          setBlitz10TimerActive(false);
          playBuzzer();
          return 0;
        }
        if (prev <= 4) {
          playBeep(880, 0.08, "sine");
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseBlitz10Timer = () => {
    if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
    setBlitz10TimerActive(false);
  };

  const resetBlitz10Timer = () => {
    if (blitzTimerRef.current) clearInterval(blitzTimerRef.current);
    setBlitz10TimerActive(false);
    setBlitz10TimeLeft(10);
  };

  // --- 71-SECOND (01:11) TIMER LOGIC (ROUND 4: ЕЛІАС) ---
  const startAliasTimer = () => {
    if (aliasTimerActive) return;
    setAliasTimerActive(true);
    playBeep(600, 0.1, "sine");

    aliasTimerRef.current = setInterval(() => {
      setAliasTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(aliasTimerRef.current!);
          setAliasTimerActive(false);
          playBuzzer();
          return 0;
        }
        if (prev <= 10) {
          playBeep(880, 0.08, "sine");
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseAliasTimer = () => {
    if (aliasTimerRef.current) clearInterval(aliasTimerRef.current);
    setAliasTimerActive(false);
  };

  const resetAliasTimer = () => {
    if (aliasTimerRef.current) clearInterval(aliasTimerRef.current);
    setAliasTimerActive(false);
    setAliasTimeLeft(71);
  };

  // Player rotation helper for 4 players (8 turns = 2 circles of 4)
  const getPlayerTurnInfo = (turnIdx: number, startingTeam: "team1" | "team2") => {
    const otherTeam = startingTeam === "team1" ? "team2" : "team1";
    const circle = Math.floor(turnIdx / 4) + 1;
    const stepInCircle = turnIdx % 4; // 0, 1, 2, 3

    let activeTeam: "team1" | "team2" = startingTeam;
    let explainer = "";
    let guesser = "";

    if (stepInCircle === 0) {
      activeTeam = startingTeam;
      explainer = gameSettings[startingTeam].players[0];
      guesser = gameSettings[startingTeam].players[1];
    } else if (stepInCircle === 1) {
      activeTeam = otherTeam;
      explainer = gameSettings[otherTeam].players[0];
      guesser = gameSettings[otherTeam].players[1];
    } else if (stepInCircle === 2) {
      activeTeam = startingTeam;
      explainer = gameSettings[startingTeam].players[1];
      guesser = gameSettings[startingTeam].players[0];
    } else {
      activeTeam = otherTeam;
      explainer = gameSettings[otherTeam].players[1];
      guesser = gameSettings[otherTeam].players[0];
    }

    let nextTurnInfo = null;
    if (turnIdx + 1 < 8) {
      const nextStep = (turnIdx + 1) % 4;
      const nextTeam = nextStep % 2 === 0 ? startingTeam : otherTeam;
      const isFirstPair = nextStep < 2;
      nextTurnInfo = {
        teamName: gameSettings[nextTeam].name,
        explainer: isFirstPair ? gameSettings[nextTeam].players[0] : gameSettings[nextTeam].players[1],
        guesser: isFirstPair ? gameSettings[nextTeam].players[1] : gameSettings[nextTeam].players[0],
      };
    }

    return {
      turnNumber: turnIdx + 1,
      circle,
      activeTeam,
      teamName: gameSettings[activeTeam].name,
      explainer,
      guesser,
      nextTurnInfo,
    };
  };

  // --- RENDER ROUND 1: ПІДСТАВА (8 КАРТОК/ТЕМ) ---
  const renderPidstavaRound = (round: Round) => {
    const cards: PidstavaCard[] =
      (round.cards && round.cards.length > 0)
        ? round.cards
        : (round.data?.cards && round.data.cards.length > 0)
          ? round.data.cards
          : DEFAULT_PIDSTAVA_CARDS;

    const isAllCardsPlayed = easyHardPlayedIndices.length >= cards.length;
    const opponentTeam = easyHardChoosingTeam === "team1" ? "team2" : "team1";

    if (isAllCardsPlayed) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 py-6 sm:py-8 animate-fadeIn w-full text-center px-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 mb-2">
            <Trophy size={30} />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              Раунд 1 Завершено!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">Усі 8 тем «Підстави» зіграно</h2>
            <p className="text-zinc-400 text-xs mt-1">Ознайомтесь із результатами та перейдіть до Раунду 2: «Коментарі»</p>
          </div>
          <button
            onClick={nextRound}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            Раунд 2: Коментарі <ChevronRight size={16} />
          </button>
        </div>
      );
    }

    // ЕТАП 1: ВИБІР ТЕМИ
    if (easyHardActiveCardIdx === null) {
      return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full animate-fadeIn">
          {/* Header Turn Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800/80 shadow-lg">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Раунд 1: Підстава (Легке: +1 б. • Складне: +2 б.)
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                  Зіграно: {easyHardPlayedIndices.length}/8
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-black text-white">
                <span className={easyHardChoosingTeam === "team1" ? "text-indigo-400" : "text-rose-400"}>
                  {gameSettings[easyHardChoosingTeam].name}
                </span>{" "}
                обирає підставу для команди{" "}
                <span className={opponentTeam === "team1" ? "text-indigo-400" : "text-rose-400"}>
                  {gameSettings[opponentTeam].name}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl font-bold">
                Черга: <strong className={easyHardChoosingTeam === "team1" ? "text-indigo-400" : "text-rose-400"}>{gameSettings[easyHardChoosingTeam].name}</strong>
              </span>
            </div>
          </div>

          {/* 8 Topics Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
            {cards.map((card: PidstavaCard, idx: number) => {
              const isPlayed = easyHardPlayedIndices.includes(idx);
              return (
                <button
                  key={idx}
                  disabled={isPlayed}
                  onClick={() => {
                    setEasyHardActiveCardIdx(idx);
                    setEasyHardDifficulty(null);
                    setEasyHardJudgmentGiven(null);
                    playBeep(650, 0.1, "sine");
                  }}
                  className={`p-4 sm:p-5 rounded-2xl text-left transition flex flex-col justify-between min-h-[110px] sm:min-h-[140px] relative overflow-hidden shadow-xl ${isPlayed
                      ? "bg-zinc-950/60 border border-zinc-900 text-zinc-600 opacity-40 cursor-not-allowed"
                      : "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 border-2 border-amber-300 hover:border-white cursor-pointer hover:scale-[1.02] transition duration-200"
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs shadow-inner ${isPlayed
                          ? "bg-zinc-900 text-zinc-600 border border-zinc-800"
                          : "bg-slate-950 text-amber-400 border border-amber-400/40"
                        }`}
                    >
                      #{idx + 1}
                    </span>
                    {isPlayed && (
                      <span className="text-[9px] sm:text-[10px] font-black text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800 uppercase">
                        ✓ Зіграно
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest block ${isPlayed ? "text-zinc-600" : "text-amber-950/70"
                        }`}
                    >
                      Тема
                    </span>
                    <h4
                      className={`text-xs sm:text-base font-black leading-tight mt-0.5 line-clamp-3 uppercase tracking-tight ${isPlayed ? "text-zinc-600" : "text-slate-950 drop-shadow-sm"
                        }`}
                    >
                      {card.topic}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    const activeCard = cards[easyHardActiveCardIdx];

    // ЕТАП 2: ВИБІР СКЛАДНОСТІ
    if (easyHardDifficulty === null) {
      return (
        <div className="flex flex-col items-center justify-center gap-5 sm:gap-6 py-4 sm:py-6 w-full animate-fadeIn max-w-xl mx-auto text-center px-2">
          <div className="flex items-center justify-between w-full pb-3 border-b border-zinc-800/80">
            <button
              onClick={() => setEasyHardActiveCardIdx(null)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-zinc-900"
            >
              <ChevronLeft size={14} /> Назад до тем
            </button>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              Тема #{easyHardActiveCardIdx + 1} з 8
            </span>
          </div>

          <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-slate-950 p-5 sm:p-6 rounded-3xl border-2 border-amber-300 w-full shadow-2xl">
            <span className="text-[10px] font-black text-amber-950/80 uppercase tracking-widest block">
              Обрана тема підстави
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black mt-1 uppercase tracking-tight">
              {activeCard.topic}
            </h3>
          </div>

          <div>
            <span className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider block">
              Команда <strong className={opponentTeam === "team1" ? "text-indigo-400" : "text-rose-400"}>{gameSettings[opponentTeam].name}</strong>, оберіть рівень складності:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            <button
              onClick={() => {
                setEasyHardDifficulty("easy");
                playBeep(700, 0.15, "sine");
              }}
              className="p-5 sm:p-6 min-h-[72px] rounded-3xl bg-emerald-950/30 hover:bg-emerald-900/40 active:scale-95 border-2 border-emerald-500/40 hover:border-emerald-400 text-white transition flex flex-col items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-950/30 group hover:scale-[1.02]"
            >
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                Рівень 1
              </span>
              <span className="text-lg sm:text-xl font-black group-hover:text-emerald-400 uppercase tracking-tight">
                Легке запитання
              </span>
              <span className="text-xs text-emerald-400 font-extrabold bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
                +1 бал
              </span>
            </button>

            <button
              onClick={() => {
                setEasyHardDifficulty("hard");
                playBeep(500, 0.15, "sine");
              }}
              className="p-5 sm:p-6 min-h-[72px] rounded-3xl bg-rose-950/30 hover:bg-rose-900/40 active:scale-95 border-2 border-rose-500/40 hover:border-rose-400 text-white transition flex flex-col items-center justify-center gap-2 cursor-pointer shadow-xl shadow-rose-950/30 group hover:scale-[1.02]"
            >
              <span className="px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                Рівень 2
              </span>
              <span className="text-lg sm:text-xl font-black group-hover:text-rose-400 uppercase tracking-tight">
                Складне запитання
              </span>
              <span className="text-xs text-rose-400 font-extrabold bg-rose-950/60 px-3 py-1 rounded-xl border border-rose-500/30">
                +2 бали
              </span>
            </button>
          </div>
        </div>
      );
    }

    // ЕТАП 3: ЕКРАН ПИТАННЯ
    const questionText =
      easyHardDifficulty === "easy"
        ? activeCard.easy_question || activeCard.question_easy
        : activeCard.hard_question || activeCard.question_hard;

    const answerText =
      easyHardDifficulty === "easy"
        ? activeCard.easy_answer || activeCard.correct_answer_easy
        : activeCard.hard_answer || activeCard.correct_answer_hard;

    const currentFact =
      easyHardDifficulty === "easy"
        ? activeCard.easy_fact || activeCard.fact
        : activeCard.hard_fact || activeCard.fact;

    const rewardPoints = easyHardDifficulty === "easy" ? 1 : 2;

    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full animate-fadeIn max-w-3xl mx-auto px-1">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-zinc-400">
              #{easyHardActiveCardIdx + 1}: {activeCard.topic}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${easyHardDifficulty === "easy"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
            >
              {easyHardDifficulty === "easy" ? "Легке (+1 бал)" : "Складне (+2 бали)"}
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-300">
            Відповідає:{" "}
            <strong className={opponentTeam === "team1" ? "text-indigo-400" : "text-rose-400"}>
              {gameSettings[opponentTeam].name}
            </strong>
          </span>
        </div>

        {/* Central High-Contrast TV Banner for the Question */}
        <div className="bg-white text-slate-950 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-amber-400 text-center relative overflow-hidden">
          <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-amber-600 uppercase block mb-1.5">
            Шоу ВКВ • Запитання
          </span>
          <h3 className="text-lg sm:text-2xl md:text-3xl font-black leading-snug uppercase tracking-tight">
            {questionText}
          </h3>
        </div>

        {/* Host Guidance: Correct Answer Box */}
        <div className="p-3.5 sm:p-5 bg-emerald-950/20 border-2 border-emerald-500/40 rounded-2xl flex flex-col gap-1 shadow-lg">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Правильна відповідь (для ведучого):
          </span>
          <p className="text-sm sm:text-lg font-black text-emerald-300">
            {answerText || "—"}
          </p>
        </div>

        {/* Host Guidance: Specific Interesting Fact */}
        {currentFact && (
          <div className="p-3.5 sm:p-4 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex items-start gap-3 shadow-md animate-fadeIn">
            <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                Цікавий факт ({easyHardDifficulty === "easy" ? "до легкого" : "до складного"}):
              </span>
              <p className="text-xs sm:text-sm font-medium text-blue-200 mt-0.5 leading-relaxed">
                {currentFact}
              </p>
            </div>
          </div>
        )}

        {/* Host Judgment Controls (+1/+2 vs 0) */}
        {easyHardJudgmentGiven === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full mt-2">
            <button
              onClick={() => {
                setScores((prev) => ({
                  ...prev,
                  [opponentTeam]: prev[opponentTeam] + rewardPoints,
                }));
                setEasyHardJudgmentGiven(true);
                playChime();
                confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
              }}
              className="py-3.5 sm:py-4 min-h-[48px] sm:min-h-[54px] bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl font-black text-xs sm:text-base transition cursor-pointer shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <CheckCircle2 size={20} />
              <span>Зарахувати (+{rewardPoints} {rewardPoints === 1 ? "бал" : "бали"})</span>
            </button>

            <button
              onClick={() => {
                setEasyHardJudgmentGiven(false);
                playBuzzer();
              }}
              className="py-3.5 sm:py-4 min-h-[48px] sm:min-h-[54px] bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-2xl font-black text-xs sm:text-base transition cursor-pointer shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <XCircle size={20} />
              <span>Не зараховувати (0)</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full animate-fadeIn mt-2">
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-black text-center w-full shadow-lg ${easyHardJudgmentGiven
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
            >
              {easyHardJudgmentGiven ? (
                <span>✓ Зараховано! +{rewardPoints} {rewardPoints === 1 ? "бал" : "бали"} для команди {gameSettings[opponentTeam].name}</span>
              ) : (
                <span>✗ Не зараховано (0 балів). Відповідь: <u>{answerText}</u></span>
              )}
            </div>

            <button
              onClick={() => {
                setEasyHardPlayedIndices((prev) => [...prev, easyHardActiveCardIdx]);
                setEasyHardActiveCardIdx(null);
                setEasyHardDifficulty(null);
                setEasyHardJudgmentGiven(null);
                setEasyHardChoosingTeam((prev) => (prev === "team1" ? "team2" : "team1"));
                playBeep(600, 0.1, "sine");
              }}
              className="w-full py-3.5 sm:py-4 min-h-[48px] sm:min-h-[52px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-slate-950 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Завершити хід та передати іншій команді</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // --- RENDER ROUND 2: КОМЕНТАРІ (4 ГРИ) ---
  const renderCommentsRound = (round: Round) => {
    const commentGamesList: CommentGame[] =
      (round.comment_games && round.comment_games.length > 0)
        ? round.comment_games
        : (round.games && round.games.length > 0)
          ? round.games
          : (round.data?.games && round.data.games.length > 0)
            ? round.data.games
            : (round.data?.comment_games && round.data.comment_games.length > 0)
              ? round.data.comment_games
              : DEFAULT_COMMENTS_GAMES;

    const startingTeam = getCurrentRoundStartingTeam();
    const otherTeam = startingTeam === "team1" ? "team2" : "team1";

    const playingTeam = commentsGameIndex % 2 === 0 ? startingTeam : otherTeam;
    const nextPlayingTeam = (commentsGameIndex + 1) % 2 === 0 ? startingTeam : otherTeam;
    const playingTeamName = gameSettings[playingTeam].name;

    const isRoundFinished = commentsGameIndex >= 4;

    if (isRoundFinished) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 py-6 sm:py-8 animate-fadeIn w-full text-center px-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/20 mb-2">
            <Trophy size={30} />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
              Раунд 2 Завершено!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">Усі 4 гри «Коментарів» зіграно</h2>
            <p className="text-xs text-zinc-400 mt-1">Ознайомтесь із результатами та перейдіть до Раунду 3: «5/10»</p>
          </div>
          <button
            onClick={nextRound}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            Раунд 3: 5/10 <ChevronRight size={16} />
          </button>
        </div>
      );
    }

    const currentGame = commentGamesList[commentsGameIndex] || commentGamesList[0];
    const currentRewardPoints = 5 - commentsRevealedCount; // 4, 3, 2, 1
    const letters = ["А", "Б", "В", "Г"];

    const currentCommentText =
      currentGame.comments[commentsRevealedCount - 1] ||
      currentGame.comments[0] ||
      "—";

    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full animate-fadeIn max-w-3xl mx-auto px-1">
        {/* Top Header & Turn Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800/80 shadow-lg">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle size={13} />
                Раунд 2: Коментарі • Гра {commentsGameIndex + 1}/4
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                Спроба {commentsRevealedCount}/4
              </span>
            </div>
            <h3 className="text-xs sm:text-base font-black text-white">
              Відгадує команда:{" "}
              <strong className={playingTeam === "team1" ? "text-indigo-400" : "text-rose-400"}>
                {playingTeamName}
              </strong>
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black font-mono shadow-md shadow-amber-500/20">
              Поточна вартість: +{currentRewardPoints} {currentRewardPoints === 1 ? "бал" : "бали"}
            </span>
          </div>
        </div>

        {/* 4 Step Clue Pills */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4].map((step) => {
            const isCurrent = step === commentsRevealedCount;
            const isPassed = step < commentsRevealedCount;
            const pts = 5 - step;
            return (
              <div
                key={step}
                className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center ${isCurrent
                    ? "bg-rose-600 text-white border-rose-400 font-black shadow-lg shadow-rose-600/30 scale-105"
                    : isPassed
                      ? "bg-zinc-950 text-zinc-500 border-zinc-900 line-through opacity-60"
                      : "bg-zinc-950/60 text-zinc-600 border-zinc-900"
                  }`}
              >
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase">
                  {step}-й
                </span>
                <span className="text-xs sm:text-sm font-black font-mono">+{pts} б.</span>
              </div>
            );
          })}
        </div>

        {/* TV-Show Central High-Contrast White Banner for the Active Comment */}
        <div className="bg-white text-slate-950 p-5 sm:p-8 md:p-9 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-rose-500 text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
              КОМЕНТАР #{commentsRevealedCount}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase">
              (Вартість: +{currentRewardPoints} б.)
            </span>
          </div>
          <h3 className="text-base sm:text-xl md:text-2xl font-black leading-snug uppercase tracking-tight text-slate-950 mt-1">
            "{currentCommentText}"
          </h3>
        </div>

        {/* Previous Comments Log if any */}
        {commentsRevealedCount > 1 && (
          <div className="p-3 bg-zinc-950/80 border border-zinc-900 rounded-2xl space-y-1.5 animate-fadeIn">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">
              Попередні відкриті коментарі:
            </span>
            {currentGame.comments.slice(0, commentsRevealedCount - 1).map((prevComm: string, pIdx: number) => (
              <p key={pIdx} className="text-xs text-zinc-400 italic">
                #{pIdx + 1}: "{prevComm}"
              </p>
            ))}
          </div>
        )}

        {/* 4 Video Options Grid (А, Б, В, Г) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Варіанти відповідей (клікніть варіант):
            </span>
            <span className="text-[9px] text-zinc-500 font-semibold hidden sm:inline">
              🟢 — позначка для ведучого
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
            {shuffledVideoOptions.map((opt, optIdx) => {
              const isEliminated = commentsEliminatedOptions.includes(opt);
              const isCorrect = opt === currentGame.correct_video;
              const letter = letters[optIdx] || String.fromCharCode(65 + optIdx);

              if (commentsGameFinished) {
                return (
                  <div
                    key={optIdx}
                    className={`p-3.5 sm:p-5 min-h-[50px] sm:min-h-[60px] rounded-2xl border-2 text-left flex items-center justify-between transition ${isCorrect
                        ? "bg-emerald-600 text-white border-emerald-300 font-black shadow-xl shadow-emerald-600/30 scale-[1.02]"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-600 opacity-40"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-mono font-black text-xs sm:text-sm flex-shrink-0">
                        {letter}
                      </span>
                      <span className="text-xs sm:text-base font-black uppercase tracking-tight truncate">{opt}</span>
                    </div>
                    {isCorrect && (
                      <span className="text-[10px] sm:text-xs font-black bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-400/40 uppercase flex-shrink-0 ml-2">
                        ✓ Справжнє
                      </span>
                    )}
                  </div>
                );
              }

              if (isEliminated) {
                return (
                  <div
                    key={optIdx}
                    className="p-3.5 sm:p-5 min-h-[50px] sm:min-h-[60px] rounded-2xl border border-zinc-900 bg-zinc-950/40 text-zinc-600 line-through opacity-40 flex items-center justify-between cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-zinc-900 text-zinc-600 flex items-center justify-center font-mono font-bold text-xs sm:text-sm flex-shrink-0">
                        {letter}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold truncate">{opt}</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-rose-500 uppercase flex-shrink-0 ml-2">✗ Невірно</span>
                  </div>
                );
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => {
                    if (isCorrect) {
                      const pts = currentRewardPoints;
                      setScores((prev) => ({
                        ...prev,
                        [playingTeam]: prev[playingTeam] + pts,
                      }));
                      setCommentsPointsEarned(pts);
                      setCommentsGameFinished(true);
                      playChime();
                      confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 } });
                    } else {
                      playBuzzer();
                      const nextEliminated = [...commentsEliminatedOptions, opt];
                      setCommentsEliminatedOptions(nextEliminated);

                      if (commentsRevealedCount < 4) {
                        setCommentsRevealedCount((prev) => prev + 1);
                      } else {
                        setCommentsPointsEarned(0);
                        setCommentsGameFinished(true);
                      }
                    }
                  }}
                  className="p-3.5 sm:p-5 min-h-[52px] sm:min-h-[64px] rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 border-2 border-amber-300 hover:border-white shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.02] transition duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-mono font-black text-xs sm:text-sm shadow-inner flex-shrink-0">
                      {letter}
                    </span>
                    <span className="text-xs sm:text-base font-black leading-tight uppercase tracking-tight text-slate-950 drop-shadow-sm text-left line-clamp-2">
                      {opt}
                    </span>
                  </div>

                  {/* Host-only subtle hint marker */}
                  {isCorrect && (
                    <span
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-700 border-2 border-emerald-400 flex-shrink-0 ml-2"
                      title="Правильна відповідь"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Post Game Actions */}
        {commentsGameFinished && (
          <div className="flex flex-col items-center gap-3 w-full animate-fadeIn mt-2">
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-black text-center w-full shadow-lg ${commentsPointsEarned! > 0
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
            >
              {commentsPointsEarned! > 0 ? (
                <span>
                  🎉 Вірно! (+{commentsPointsEarned} {commentsPointsEarned === 1 ? "бал" : "бали"} для команди {playingTeamName})
                </span>
              ) : (
                <span>
                  ✗ 0 балів за цю гру. Справжнє відео: <u>{currentGame.correct_video}</u>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setCommentsGameIndex((prev) => prev + 1);
                setCommentsRevealedCount(1);
                setCommentsEliminatedOptions([]);
                setCommentsSelectedOption(null);
                setCommentsGameFinished(false);
                setCommentsPointsEarned(null);
                playBeep(600, 0.1, "sine");
              }}
              className="w-full py-3.5 sm:py-4 min-h-[48px] sm:min-h-[52px] bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-[0.98] text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2"
            >
              <span>
                {commentsGameIndex + 1 < 4
                  ? `Наступна гра (Гра ${commentsGameIndex + 2}/4 • Хід команди ${gameSettings[nextPlayingTeam].name})`
                  : "Завершити раунд «Коментарі» та перейти до Раунду 3"}
              </span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // --- RENDER ROUND 3: 5/10 (8 ПИТАНЬ) ---
  const renderBlitzRound = (round: Round) => {
    const rawQuestions: (BlitzQuestion | string)[] =
      (round.blitz_questions && round.blitz_questions.length > 0)
        ? round.blitz_questions
        : (round.questions && round.questions.length > 0)
          ? round.questions
          : (round.data?.questions && round.data.questions.length > 0)
            ? round.data.questions
            : (round.data?.blitz_questions && round.data.blitz_questions.length > 0)
              ? round.data.blitz_questions
              : DEFAULT_BLITZ_QUESTIONS;

    const questions = rawQuestions.map((q: any) => (typeof q === "string" ? q : q.question));

    const startingTeam = getCurrentRoundStartingTeam();
    const otherTeam = startingTeam === "team1" ? "team2" : "team1";

    const isRoundFinished = blitzQuestionIndex >= 8;

    if (isRoundFinished) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 py-6 sm:py-8 animate-fadeIn w-full text-center px-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 mb-2 font-black text-2xl">
            🏆
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              Раунд 3 Завершено!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">Усі 8 питань 5/10 зіграно</h2>
          </div>
          <button
            onClick={nextRound}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            Раунд 4: Еліас <ChevronRight size={16} />
          </button>
        </div>
      );
    }

    // Strict 8-player rotation: Player 1 (Team A) -> Player 1 (Team B) -> Player 2 (Team A) -> Player 2 (Team B)
    const turnInCircle = blitzQuestionIndex % 4;
    const circle = Math.floor(blitzQuestionIndex / 4) + 1;

    let activeTeam: "team1" | "team2" = startingTeam;
    let playerName = "";

    if (turnInCircle === 0) {
      activeTeam = startingTeam;
      playerName = gameSettings[startingTeam].players[0];
    } else if (turnInCircle === 1) {
      activeTeam = otherTeam;
      playerName = gameSettings[otherTeam].players[0];
    } else if (turnInCircle === 2) {
      activeTeam = startingTeam;
      playerName = gameSettings[startingTeam].players[1];
    } else {
      activeTeam = otherTeam;
      playerName = gameSettings[otherTeam].players[1];
    }

    const currentQuestionText = questions[blitzQuestionIndex] || `Бліц-запитання #${blitzQuestionIndex + 1}`;
    const questionAnswered = blitzScores[blitzQuestionIndex] !== undefined && blitzScores[blitzQuestionIndex] !== null;

    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full animate-fadeIn max-w-2xl mx-auto px-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800/80 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={13} />
                Раунд 3: 5/10 (Питання {blitzQuestionIndex + 1}/8)
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                Круг {circle}
              </span>
            </div>
            <h3 className="text-sm sm:text-lg font-black text-white mt-1.5">
              Питання #{blitzQuestionIndex + 1}: Відповідає{" "}
              <strong className="text-amber-400 underline decoration-amber-400/50">{playerName}</strong>{" "}
              ({gameSettings[activeTeam].name})
            </h3>
          </div>
        </div>

        {/* 10-Second Countdown Timer */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center relative shadow-2xl">
          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
            Таймер на відповідь (10 с)
          </span>

          <div
            className={`text-5xl sm:text-7xl font-black font-mono tracking-tight my-1 sm:my-2 transition duration-300 ${blitz10TimeLeft === 0
                ? "text-red-500 scale-105 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                : blitz10TimeLeft <= 3
                  ? "text-amber-400 animate-pulse"
                  : "text-white"
              }`}
          >
            00:{blitz10TimeLeft.toString().padStart(2, "0")}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 mt-2">
            {!blitz10TimerActive ? (
              <button
                onClick={startBlitz10Timer}
                className="px-5 sm:px-6 py-2.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Play size={14} className="fill-current" />
                {blitz10TimeLeft === 10 ? "Запустити 10 с" : "Продовжити"}
              </button>
            ) : (
              <button
                onClick={pauseBlitz10Timer}
                className="px-5 sm:px-6 py-2.5 min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-2 border border-zinc-700 cursor-pointer"
              >
                <RotateCcw size={14} /> Пауза
              </button>
            )}
            <button
              onClick={resetBlitz10Timer}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer flex items-center justify-center"
              title="Скинути таймер"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl text-center shadow-lg">
          <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1.5">
            Запитання для ведучого
          </span>
          <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed">
            {currentQuestionText}
          </h3>
        </div>

        {/* Host Judgment Buttons: +1 / 0 */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
            <button
              onClick={() => {
                setScores((prev) => ({
                  ...prev,
                  [activeTeam]: prev[activeTeam] + 1,
                }));
                setBlitzScores((prev) => ({ ...prev, [blitzQuestionIndex]: true }));
                playChime();
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
              }}
              className={`p-3.5 sm:p-4 min-h-[48px] sm:min-h-[52px] rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer border active:scale-95 ${blitzScores[blitzQuestionIndex] === true
                  ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/20"
                  : "bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                }`}
            >
              <CheckCircle2 size={18} /> +1 Зарахувати
            </button>

            <button
              onClick={() => {
                setBlitzScores((prev) => ({ ...prev, [blitzQuestionIndex]: false }));
                playBuzzer();
              }}
              className={`p-3.5 sm:p-4 min-h-[48px] sm:min-h-[52px] rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer border active:scale-95 ${blitzScores[blitzQuestionIndex] === false
                  ? "bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/20"
                  : "bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border-rose-500/30"
                }`}
            >
              <XCircle size={18} /> 0 Незалік
            </button>
          </div>

          {questionAnswered && (
            <button
              onClick={() => {
                setBlitzQuestionIndex((prev) => prev + 1);
                resetBlitz10Timer();
              }}
              className="w-full py-3.5 min-h-[48px] bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <span>Наступне запитання ({blitzQuestionIndex + 2}/8)</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // --- RENDER ROUND 4: ЕЛІАС ---
  const renderAliasRound = (round: Round) => {
    const startingTeam = getCurrentRoundStartingTeam();
    const isAllTurnsFinished = aliasTurnIndex >= 8;

    const turnInfo = getPlayerTurnInfo(aliasTurnIndex, startingTeam);

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const currentTurnPoints = aliasGuessedCount - aliasSkippedCount;

    if (isAllTurnsFinished) {
      return (
        <div className="flex flex-col items-center justify-center gap-6 py-6 sm:py-8 animate-fadeIn w-full text-center px-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 mb-2">
            <Trophy size={30} />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              Раунд 4: Еліас завершено!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">Усі 8 ходів зіграно!</h2>
          </div>
          <button
            onClick={() => {
              setGameState("finished");
              confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
            }}
            className="w-full sm:w-auto px-8 py-4 min-h-[50px] rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-purple-600/30 uppercase tracking-wider"
          >
            Фінальний підсумок гри 🎉
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full animate-fadeIn max-w-2xl mx-auto px-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-3.5 sm:p-4 rounded-2xl border border-zinc-800/80 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquareQuote size={13} />
                Раунд 4: Еліас (Паперові картки)
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                Хід {turnInfo.turnNumber}/8
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-white mt-1.5">
              Команда: <strong className={turnInfo.activeTeam === "team1" ? "text-indigo-400" : "text-rose-400"}>{turnInfo.teamName}</strong>
            </h3>
          </div>

          <button
            onClick={() => setEditingSettingsModal(true)}
            className="text-xs min-h-[38px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded-lg transition font-semibold flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
          >
            <Edit3 size={13} /> Склад
          </button>
        </div>

        {/* Active Pair Banner */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border transition flex items-center justify-between gap-3 shadow-lg ${turnInfo.activeTeam === "team1" ? "bg-indigo-950/30 border-indigo-500/40" : "bg-rose-950/30 border-rose-500/40"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0 ${turnInfo.activeTeam === "team1" ? "bg-indigo-600" : "bg-rose-600"}`}>
              {turnInfo.turnNumber}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 block truncate">
                Зараз грає: {turnInfo.teamName}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block">
                🗣️ <u className="text-indigo-300">{turnInfo.explainer}</u> ➔ 🎯 <u className="text-emerald-300">{turnInfo.guesser}</u>
              </span>
            </div>
          </div>
        </div>

        {/* 71-Second (01:11) Timer */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xl relative">
          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
            Таймер на раунд (01:11 • 71 с)
          </span>

          <div
            className={`text-5xl sm:text-7xl font-black font-mono tracking-tight my-1 sm:my-2 transition duration-300 ${aliasTimeLeft === 0
                ? "text-red-500 scale-105 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                : aliasTimeLeft <= 15
                  ? "text-amber-400 animate-pulse"
                  : "text-white"
              }`}
          >
            {formatTime(aliasTimeLeft)}
          </div>

          {aliasTimeLeft === 0 && (
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-950/40 border border-red-500/50 rounded-xl text-red-400 text-[10px] sm:text-xs font-black uppercase tracking-wider animate-bounce mt-1 flex items-center gap-2 text-center">
              <Flame size={16} /> ЧАС ВИЙШОВ! Необмежений час на останнє слово <Flame size={16} />
            </div>
          )}

          <div className="flex items-center gap-2.5 sm:gap-3 mt-2 sm:mt-3">
            {!aliasTimerActive ? (
              <button
                onClick={startAliasTimer}
                className="px-5 sm:px-6 py-2.5 min-h-[44px] rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 uppercase"
              >
                <Play size={14} className="fill-current" />
                {aliasTimeLeft === 71 ? "▶ Почати (01:11)" : "Продовжити"}
              </button>
            ) : (
              <button
                onClick={pauseAliasTimer}
                className="px-5 sm:px-6 py-2.5 min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-2 border border-zinc-700 cursor-pointer"
              >
                <RotateCcw size={14} /> Пауза
              </button>
            )}

            <button
              onClick={resetAliasTimer}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer flex items-center justify-center"
              title="Скинути на 01:11 (71 с)"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Live Score Tally Box */}
        <div className="p-3 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center shadow-lg">
          <div className="flex items-center justify-around text-xs font-bold">
            <div>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase block">Вгадано (+1)</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">+{aliasGuessedCount}</span>
            </div>
            <div className="h-7 sm:h-8 w-px bg-zinc-800"></div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase block">Штрафів (-1)</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400">-{aliasSkippedCount}</span>
            </div>
            <div className="h-7 sm:h-8 w-px bg-zinc-800"></div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase block">За хід</span>
              <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">{currentTurnPoints} б.</span>
            </div>
          </div>
        </div>

        {/* Big Host Scoring Buttons */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 w-full">
          <button
            onClick={() => {
              setAliasGuessedCount((prev) => prev + 1);
              playBeep(880, 0.1, "sine");
            }}
            className="h-16 sm:h-20 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl font-black text-base sm:text-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-600/20 border border-emerald-400/30"
          >
            <CheckCircle2 size={22} />
            <span>+1 ВГАДАНО</span>
          </button>

          <button
            onClick={() => {
              setAliasSkippedCount((prev) => prev + 1);
              playBeep(200, 0.15, "sawtooth");
            }}
            className="h-16 sm:h-20 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-2xl font-black text-base sm:text-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-rose-600/20 border border-rose-400/30"
          >
            <XCircle size={22} />
            <span>-1 ПРОПУСК</span>
          </button>
        </div>

        {/* Finish & Handover Turn */}
        <button
          onClick={() => {
            const netPoints = aliasGuessedCount - aliasSkippedCount;
            setScores((prev) => ({
              ...prev,
              [turnInfo.activeTeam]: Math.max(0, prev[turnInfo.activeTeam] + netPoints),
            }));

            setAliasTurnSummaryModal({
              teamName: turnInfo.teamName,
              explainer: turnInfo.explainer,
              guesser: turnInfo.guesser,
              guessed: aliasGuessedCount,
              skipped: aliasSkippedCount,
              points: netPoints,
              nextTeamName: turnInfo.nextTurnInfo?.teamName,
              nextExplainer: turnInfo.nextTurnInfo?.explainer,
              nextGuesser: turnInfo.nextTurnInfo?.guesser,
            });

            resetAliasTimer();
            setAliasGuessedCount(0);
            setAliasSkippedCount(0);
            setAliasTurnIndex((prev) => prev + 1);
            playChime();
          }}
          className="w-full py-3.5 sm:py-4 min-h-[50px] bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 active:scale-[0.98] text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <ArrowRightCircle size={18} />
          <span>Завершити хід та передати іншій команді</span>
        </button>

        {/* Turn Summary Modal */}
        {aliasTurnSummaryModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 max-w-md w-full text-center shadow-2xl space-y-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Хід завершено</span>
              <h3 className="text-lg sm:text-xl font-black text-white">{aliasTurnSummaryModal.teamName}</h3>

              <div className="p-3 sm:p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-around">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">Вгадано</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400">+{aliasTurnSummaryModal.guessed}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">Штрафів</span>
                  <span className="text-lg sm:text-xl font-black text-rose-400">-{aliasTurnSummaryModal.skipped}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">Нараховано</span>
                  <span className="text-lg sm:text-xl font-black text-purple-400">{aliasTurnSummaryModal.points} б.</span>
                </div>
              </div>

              {aliasTurnSummaryModal.nextTeamName && (
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs text-zinc-400">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block">Наступний хід:</span>
                  <strong className="text-white">{aliasTurnSummaryModal.nextTeamName}</strong> ({aliasTurnSummaryModal.nextExplainer} ➔ {aliasTurnSummaryModal.nextGuesser})
                </div>
              )}

              <button
                onClick={() => setAliasTurnSummaryModal(null)}
                className="w-full py-3 min-h-[46px] bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl uppercase tracking-wider transition cursor-pointer"
              >
                Готові до наступного ходу!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main UI
  return (
    <div className="min-h-screen bg-slate-950 text-zinc-50 flex flex-col font-sans select-none pb-20 touch-manipulation overflow-x-hidden w-full">
      {/* Top Header */}
      <header className="border-b border-zinc-900/80 bg-zinc-950/90 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-xs sm:text-sm shadow-md shadow-amber-500/20 flex-shrink-0">
              ВКВ
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">Шоу ВКВ 2026</h1>
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block truncate">
                {selectedGame ? selectedGame.name : "Вікторина"}
              </span>
            </div>
          </div>

          {/* Teams Scoreboard in Header */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 shadow-inner">
              <button
                onClick={() => setScores((s) => ({ ...s, team1: s.team1 + 1 }))}
                className="px-2 sm:px-2.5 py-1 min-h-[38px] sm:min-h-[40px] rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 font-bold text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:bg-indigo-900/40 active:scale-95 transition"
                title={`Додати бал для ${gameSettings.team1.name}`}
              >
                <span className="truncate max-w-[65px] xs:max-w-[85px] sm:max-w-[120px]">{gameSettings.team1.name}:</span>
                <span className="text-xs sm:text-sm font-black font-mono">{scores.team1}</span>
              </button>

              <span className="text-zinc-600 font-bold text-xs px-0.5">:</span>

              <button
                onClick={() => setScores((s) => ({ ...s, team2: s.team2 + 1 }))}
                className="px-2 sm:px-2.5 py-1 min-h-[38px] sm:min-h-[40px] rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 font-bold text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:bg-rose-900/40 active:scale-95 transition"
                title={`Додати бал для ${gameSettings.team2.name}`}
              >
                <span className="truncate max-w-[65px] xs:max-w-[85px] sm:max-w-[120px]">{gameSettings.team2.name}:</span>
                <span className="text-xs sm:text-sm font-black font-mono">{scores.team2}</span>
              </button>

              {/* Компактна стильна кнопка скидання рахунку */}
              <button
                onClick={() => resetScores(false)}
                className="p-1.5 min-h-[38px] min-w-[34px] sm:min-w-[38px] bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-amber-400 active:scale-95 rounded-lg border border-zinc-700/50 transition cursor-pointer flex items-center justify-center group"
                title="Скинути рахунок обох команд до 0"
              >
                <RotateCcw size={13} className="group-hover:rotate-[-45deg] transition-transform duration-200" />
              </button>
            </div>

            <button
              onClick={() => setEditingSettingsModal(true)}
              className="p-2 min-h-[38px] min-w-[38px] bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition cursor-pointer flex items-center justify-center"
              title="Налаштування команд та учасників"
            >
              <Settings size={15} />
            </button>

            <button
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "/admin";
              }}
              className="text-xs min-h-[38px] bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 border border-zinc-800 px-2.5 py-1.5 rounded-lg transition font-semibold cursor-pointer flex items-center justify-center"
            >
              Адмінка
            </button>
          </div>
        </div>
      </header>

      {/* Team & Scoreboard Configuration Modal */}
      {editingSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Налаштування команд та учасників
                </h3>
              </div>
              <button
                onClick={() => setEditingSettingsModal(false)}
                className="text-xs min-h-[36px] min-w-[36px] text-zinc-500 hover:text-white p-1 rounded-lg flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* 2 Teams Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Team 1 Setup */}
              <div className="p-3.5 sm:p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Flag size={12} /> Команда 1
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setScores((s) => ({ ...s, team1: Math.max(0, s.team1 - 1) }))}
                      className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 flex items-center justify-center active:scale-95"
                    >
                      -1
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-1.5">{scores.team1} б.</span>
                    <button
                      onClick={() => setScores((s) => ({ ...s, team1: s.team1 + 1 }))}
                      className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 flex items-center justify-center active:scale-95"
                    >
                      +1
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Назва команди</label>
                  <input
                    type="text"
                    value={gameSettings.team1.name}
                    onChange={(e) =>
                      setGameSettings((s) => ({ ...s, team1: { ...s.team1, name: e.target.value } }))
                    }
                    className="w-full bg-zinc-900 border border-indigo-500/30 rounded-xl px-3 py-2 text-base sm:text-xs text-white font-bold min-h-[44px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Учасники (2 гравці)</label>
                  <input
                    type="text"
                    placeholder="Гравець 1"
                    value={gameSettings.team1.players[0]}
                    onChange={(e) =>
                      setGameSettings((s) => ({
                        ...s,
                        team1: { ...s.team1, players: [e.target.value, s.team1.players[1]] },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base sm:text-xs text-zinc-200 min-h-[44px]"
                  />
                  <input
                    type="text"
                    placeholder="Гравець 2"
                    value={gameSettings.team1.players[1]}
                    onChange={(e) =>
                      setGameSettings((s) => ({
                        ...s,
                        team1: { ...s.team1, players: [s.team1.players[0], e.target.value] },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base sm:text-xs text-zinc-200 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Team 2 Setup */}
              <div className="p-3.5 sm:p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <Flag size={12} /> Команда 2
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setScores((s) => ({ ...s, team2: Math.max(0, s.team2 - 1) }))}
                      className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 flex items-center justify-center active:scale-95"
                    >
                      -1
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-1.5">{scores.team2} б.</span>
                    <button
                      onClick={() => setScores((s) => ({ ...s, team2: s.team2 + 1 }))}
                      className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 flex items-center justify-center active:scale-95"
                    >
                      +1
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Назва команди</label>
                  <input
                    type="text"
                    value={gameSettings.team2.name}
                    onChange={(e) =>
                      setGameSettings((s) => ({ ...s, team2: { ...s.team2, name: e.target.value } }))
                    }
                    className="w-full bg-zinc-900 border border-rose-500/30 rounded-xl px-3 py-2 text-base sm:text-xs text-white font-bold min-h-[44px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Учасники (2 гравці)</label>
                  <input
                    type="text"
                    placeholder="Гравець 1"
                    value={gameSettings.team2.players[0]}
                    onChange={(e) =>
                      setGameSettings((s) => ({
                        ...s,
                        team2: { ...s.team2, players: [e.target.value, s.team2.players[1]] },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base sm:text-xs text-zinc-200 min-h-[44px]"
                  />
                  <input
                    type="text"
                    placeholder="Гравець 2"
                    value={gameSettings.team2.players[1]}
                    onChange={(e) =>
                      setGameSettings((s) => ({
                        ...s,
                        team2: { ...s.team2, players: [s.team2.players[0], e.target.value] },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base sm:text-xs text-zinc-200 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Starting Team Switcher */}
            <div className="p-3.5 sm:p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2.5">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                Хто починає 1-й раунд («Підстава»)?
              </span>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setGameSettings((s) => ({ ...s, first_turn_team: 1 }))}
                  className={`py-2.5 sm:py-3 px-3 min-h-[44px] rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${gameSettings.first_turn_team === 1
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                >
                  <UserCheck size={14} />
                  <span className="truncate">{gameSettings.team1.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGameSettings((s) => ({ ...s, first_turn_team: 2 }))}
                  className={`py-2.5 sm:py-3 px-3 min-h-[44px] rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${gameSettings.first_turn_team === 2
                      ? "bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                >
                  <UserCheck size={14} />
                  <span className="truncate">{gameSettings.team2.name}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-800">
              <button onClick={() => resetScores(false)} className="text-xs text-rose-400 hover:underline cursor-pointer py-1">
                Скинути рахунок до 0:0
              </button>
              <button
                onClick={() => setEditingSettingsModal(false)}
                className="w-full sm:w-auto px-6 py-3 min-h-[46px] bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center"
              >
                Зберегти налаштування
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col justify-center">
        {gameState === "select_game" && (
          <div className="flex flex-col gap-5 sm:gap-6 py-4 sm:py-6 animate-fadeIn">
            {/* Title & Badge */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} /> Новий випуск вікторини ВКВ
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Налаштування гри та команд
              </h2>
            </div>

            {/* Game Selector Section */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 rounded-3xl space-y-3 shadow-xl">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                1. Оберіть гру з бази даних
              </label>

              {loading ? (
                <div className="py-6 text-zinc-500 flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-xs">Завантаження списку ігор...</span>
                </div>
              ) : games.length === 0 ? (
                <div className="p-4 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-zinc-400">Ігор ще не створено.</p>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") window.location.href = "/admin";
                    }}
                    className="px-4 py-2.5 min-h-[44px] bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase"
                  >
                    Перейти в адмінку
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {games.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleSelectGame(g)}
                      className={`p-3 sm:p-3.5 min-h-[48px] rounded-2xl border text-left flex items-center justify-between transition cursor-pointer active:scale-95 ${selectedGameId === g.id
                          ? "bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-950/30"
                          : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                        }`}
                    >
                      <div className="truncate min-w-0 pr-2">
                        <span className="font-extrabold text-xs sm:text-sm block truncate">{g.name}</span>
                        {selectedGameId === g.id && (
                          <span className="text-[9px] sm:text-[10px] text-indigo-400 font-bold block mt-0.5">
                            Завантажено раундів: {rounds.length}
                          </span>
                        )}
                      </div>
                      {selectedGameId === g.id && <Check size={16} className="text-indigo-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Teams and Players Setup Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                2. Склад команд та учасників (2 гравці в кожній)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Team 1 Card */}
                <div className="p-3.5 sm:p-4 bg-zinc-950 border border-indigo-500/30 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">
                    Команда 1
                  </span>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Назва команди</label>
                    <input
                      type="text"
                      value={gameSettings.team1.name}
                      onChange={(e) =>
                        setGameSettings((s) => ({ ...s, team1: { ...s.team1, name: e.target.value } }))
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white font-bold focus:outline-none focus:border-indigo-500 min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block">Гравці команди</label>
                    <input
                      type="text"
                      placeholder="Гравець 1"
                      value={gameSettings.team1.players[0]}
                      onChange={(e) =>
                        setGameSettings((s) => ({
                          ...s,
                          team1: { ...s.team1, players: [e.target.value, s.team1.players[1]] },
                        }))
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base sm:text-xs text-zinc-200 min-h-[44px]"
                    />
                    <input
                      type="text"
                      placeholder="Гравець 2"
                      value={gameSettings.team1.players[1]}
                      onChange={(e) =>
                        setGameSettings((s) => ({
                          ...s,
                          team1: { ...s.team1, players: [s.team1.players[0], e.target.value] },
                        }))
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base sm:text-xs text-zinc-200 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Team 2 Card */}
                <div className="p-3.5 sm:p-4 bg-zinc-950 border border-rose-500/30 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block">
                    Команда 2
                  </span>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Назва команди</label>
                    <input
                      type="text"
                      value={gameSettings.team2.name}
                      onChange={(e) =>
                        setGameSettings((s) => ({ ...s, team2: { ...s.team2, name: e.target.value } }))
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white font-bold focus:outline-none focus:border-rose-500 min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block">Гравці команди</label>
                    <input
                      type="text"
                      placeholder="Гравець 1"
                      value={gameSettings.team2.players[0]}
                      onChange={(e) =>
                        setGameSettings((s) => ({
                          ...s,
                          team2: { ...s.team2, players: [e.target.value, s.team2.players[1]] },
                        }))
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base sm:text-xs text-zinc-200 min-h-[44px]"
                    />
                    <input
                      type="text"
                      placeholder="Гравець 2"
                      value={gameSettings.team2.players[1]}
                      onChange={(e) =>
                        setGameSettings((s) => ({
                          ...s,
                          team2: { ...s.team2, players: [s.team2.players[0], e.target.value] },
                        }))
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base sm:text-xs text-zinc-200 min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* First Turn Selector */}
              <div className="p-3.5 sm:p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                  3. Хто починає 1-й раунд («Підстава»)?
                </span>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setGameSettings((s) => ({ ...s, first_turn_team: 1 }))}
                    className={`py-2.5 sm:py-3 px-3 min-h-[44px] rounded-xl border text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${gameSettings.first_turn_team === 1
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                      }`}
                  >
                    <UserCheck size={14} />
                    <span className="truncate">{gameSettings.team1.name}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameSettings((s) => ({ ...s, first_turn_team: 2 }))}
                    className={`py-2.5 sm:py-3 px-3 min-h-[44px] rounded-xl border text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${gameSettings.first_turn_team === 2
                        ? "bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                      }`}
                  >
                    <UserCheck size={14} />
                    <span className="truncate">{gameSettings.team2.name}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Big Start Game Button */}
            <button
              onClick={startGame}
              className="w-full py-4 min-h-[52px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-slate-950 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition cursor-pointer shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              <span>Розпочати гру!</span>
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="flex flex-col gap-4 sm:gap-6 w-full animate-fadeIn">
            {/* Round Switcher Tabs */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 bg-zinc-950 p-1 sm:p-1.5 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                {rounds.map((r, idx) => {
                  const isActive = currentRoundIndex === idx;
                  let roundLabel = `Раунд ${idx + 1}`;
                  if (r.type === "easy_hard" || r.type === "pidstava") roundLabel = "1. Підстава";
                  else if (r.type === "youtube_comments" || r.type === "comments") roundLabel = "2. Коментарі";
                  else if (r.type === "blitz_5sec" || r.type === "blitz_5_10") roundLabel = "3. 5/10";
                  else if (r.type === "alias") roundLabel = "4. Еліас";

                  return (
                    <button
                      key={r.id || idx}
                      onClick={() => {
                        setCurrentRoundIndex(idx);
                        resetRoundStates();
                      }}
                      className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[40px] rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap active:scale-95 ${isActive ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                      {roundLabel}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  disabled={currentRoundIndex === 0}
                  onClick={prevRound}
                  className="p-2 min-h-[36px] min-w-[36px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer flex items-center justify-center active:scale-95"
                  title="Попередній раунд"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={nextRound}
                  className={`px-2.5 py-1.5 min-h-[36px] rounded-lg transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 text-xs font-bold ${currentRoundIndex === rounds.length - 1
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  title={currentRoundIndex === rounds.length - 1 ? "Завершити гру та відкрити екран переможця" : "Наступний раунд"}
                >
                  {currentRoundIndex === rounds.length - 1 ? (
                    <>
                      <span>Фінал</span>
                      <Trophy size={14} />
                    </>
                  ) : (
                    <ChevronRight size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* Render Current Round Component */}
            {rounds.length === 0 ? (
              <div className="p-6 sm:p-10 bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">У цій грі ще немає збережених раундів</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                    Заповніть гру готовими 4 раундами в 1 клік або налаштуйте власні питання в адмінці.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleQuickFillDemoRounds}
                    disabled={roundsLoading}
                    className="w-full sm:w-auto px-5 py-3 min-h-[46px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    {roundsLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Завантаження...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>⚡ Заповнити 4 раундами та грати</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") window.location.href = "/admin";
                    }}
                    className="w-full sm:w-auto px-5 py-3 min-h-[46px] bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white rounded-xl text-xs font-bold uppercase transition cursor-pointer flex items-center justify-center"
                  >
                    Відкрити адмінку
                  </button>
                </div>
              </div>
            ) : (
              (() => {
                const currentRound = rounds[currentRoundIndex];
                if (!currentRound) return null;

                if (currentRound.type === "easy_hard" || currentRound.type === "pidstava") {
                  return renderPidstavaRound(currentRound);
                }
                if (currentRound.type === "youtube_comments" || currentRound.type === "comments") {
                  return renderCommentsRound(currentRound);
                }
                if (currentRound.type === "blitz_5sec" || currentRound.type === "blitz_5_10") {
                  return renderBlitzRound(currentRound);
                }
                if (currentRound.type === "alias") {
                  return renderAliasRound(currentRound);
                }
                return null;
              })()
            )}
          </div>
        )}

        {gameState === "finished" && (
          <div className="flex flex-col items-center justify-center gap-5 sm:gap-6 py-4 sm:py-8 animate-fadeIn text-center px-1 sm:px-2 max-w-2xl mx-auto w-full">
            {/* Victory Card Container with dynamic glowing backdrop */}
            <div
              className={`w-full p-5 sm:p-8 rounded-3xl border-2 shadow-2xl relative overflow-hidden backdrop-blur-xl transition-all duration-500 ${scores.team1 > scores.team2
                  ? "bg-gradient-to-b from-indigo-950/80 via-zinc-900/90 to-zinc-950 border-indigo-500/50 shadow-indigo-950/50"
                  : scores.team2 > scores.team1
                    ? "bg-gradient-to-b from-rose-950/80 via-zinc-900/90 to-zinc-950 border-rose-500/50 shadow-rose-950/50"
                    : "bg-gradient-to-b from-amber-950/80 via-zinc-900/90 to-zinc-950 border-amber-500/50 shadow-amber-950/50"
                }`}
            >
              {/* Background ambient glow effect */}
              <div
                className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none ${scores.team1 > scores.team2
                    ? "bg-indigo-500"
                    : scores.team2 > scores.team1
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  }`}
              />

              {/* Central Trophy Presentation */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl mb-3 shadow-2xl transition duration-300 transform hover:scale-105 ${scores.team1 > scores.team2
                      ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-500 text-slate-950 border-2 border-amber-300 shadow-amber-500/30 animate-pulse"
                      : scores.team2 > scores.team1
                        ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-rose-500 text-slate-950 border-2 border-amber-300 shadow-amber-500/30 animate-pulse"
                        : "bg-gradient-to-tr from-amber-300 via-amber-400 to-orange-500 text-slate-950 border-2 border-amber-200 shadow-amber-500/30 animate-pulse"
                    }`}
                >
                  🏆
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-700 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-2 shadow-inner">
                  {scores.team1 > scores.team2 ? (
                    <span className="text-indigo-400 flex items-center gap-1">
                      <Sparkles size={13} /> ПЕРЕМОЖЦІ ГРИ
                    </span>
                  ) : scores.team2 > scores.team1 ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <Sparkles size={13} /> ПЕРЕМОЖЦІ ГРИ
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Sparkles size={13} /> ФІНАЛЬНИЙ РЕЗУЛЬТАТ
                    </span>
                  )}
                </div>

                {/* Winner Title */}
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-md leading-tight">
                  {scores.team1 > scores.team2 ? (
                    <>
                      <span className="text-indigo-400">{gameSettings.team1.name}</span>!
                    </>
                  ) : scores.team2 > scores.team1 ? (
                    <>
                      <span className="text-rose-400">{gameSettings.team2.name}</span>!
                    </>
                  ) : (
                    <span className="text-amber-400">Бойова Нічия!</span>
                  )}
                </h2>

                {/* Winner Players Subtitle */}
                {scores.team1 !== scores.team2 && (
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-medium">
                    Склад переможців:{" "}
                    <strong className="text-white">
                      {(scores.team1 > scores.team2
                        ? gameSettings.team1.players
                        : gameSettings.team2.players
                      )
                        .filter(Boolean)
                        .join(" та ")}
                    </strong>
                  </p>
                )}

                {scores.team1 === scores.team2 && (
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Неймовірна боротьба! Обидві команди набрали однакову кількість балів.
                  </p>
                )}
              </div>

              {/* Comparative Scoreboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-5 sm:my-6 relative z-10 text-left">
                {/* Team 1 Score Card */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition relative flex flex-col justify-between ${scores.team1 > scores.team2
                      ? "bg-indigo-950/60 border-indigo-400/80 shadow-lg shadow-indigo-950/50 scale-[1.02]"
                      : scores.team1 === scores.team2
                        ? "bg-zinc-950/70 border-amber-500/40"
                        : "bg-zinc-950/40 border-zinc-800 opacity-60"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 truncate">
                      {gameSettings.team1.name}
                    </span>
                    {scores.team1 > scores.team2 && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider flex-shrink-0">
                        ✓ 1-ше місце
                      </span>
                    )}
                  </div>

                  <div className="my-2 flex items-baseline justify-between">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                      {scores.team1}
                    </span>
                    <span className="text-xs text-zinc-400 font-bold uppercase">
                      {scores.team1 === 1 ? "бал" : scores.team1 >= 2 && scores.team1 <= 4 ? "бали" : "балів"}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 truncate border-t border-zinc-800/80 pt-2">
                    {gameSettings.team1.players.filter(Boolean).join(", ")}
                  </div>
                </div>

                {/* Team 2 Score Card */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition relative flex flex-col justify-between ${scores.team2 > scores.team1
                      ? "bg-rose-950/60 border-rose-400/80 shadow-lg shadow-rose-950/50 scale-[1.02]"
                      : scores.team1 === scores.team2
                        ? "bg-zinc-950/70 border-amber-500/40"
                        : "bg-zinc-950/40 border-zinc-800 opacity-60"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 truncate">
                      {gameSettings.team2.name}
                    </span>
                    {scores.team2 > scores.team1 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider flex-shrink-0">
                        ✓ 1-ше місце
                      </span>
                    )}
                  </div>

                  <div className="my-2 flex items-baseline justify-between">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                      {scores.team2}
                    </span>
                    <span className="text-xs text-zinc-400 font-bold uppercase">
                      {scores.team2 === 1 ? "бал" : scores.team2 >= 2 && scores.team2 <= 4 ? "бали" : "балів"}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 truncate border-t border-zinc-800/80 pt-2">
                    {gameSettings.team2.players.filter(Boolean).join(", ")}
                  </div>
                </div>
              </div>

              {/* Confetti Re-fire Button */}
              <button
                type="button"
                onClick={triggerVictoryConfetti}
                className="relative z-10 px-3.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-700/60 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 active:scale-95 shadow-md touch-manipulation"
              >
                <Sparkles size={13} />
                <span>Запустити салют знову! 🎉</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg">
              <button
                onClick={handleRematch}
                className="w-full sm:w-1/2 py-3.5 sm:py-4 min-h-[50px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 touch-manipulation"
              >
                <Zap size={16} />
                <span>⚡ Реванш (тими ж складами)</span>
              </button>

              <button
                onClick={handleStartNewGame}
                className="w-full sm:w-1/2 py-3.5 sm:py-4 min-h-[50px] bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white border border-zinc-800 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 touch-manipulation"
              >
                <RotateCcw size={15} />
                <span>🔄 Почати нову гру</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
