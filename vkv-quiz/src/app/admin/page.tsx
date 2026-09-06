"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Game, Round, RoundType, PidstavaCard, CommentGame, BlitzQuestion } from "@/types/quiz";
import {
  Lock,
  Plus,
  Trash2,
  ListOrdered,
  PlusCircle,
  Check,
  Loader2,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Zap,
  MessageSquareQuote,
  MessageCircle,
  ArrowLeft,
  LogOut,
  CheckCircle2,
  Edit3,
  X,
} from "lucide-react";

// Демо-пак 1: «Підстава» (8 карток / тем з окремими фактами для легкого та складного)
const DEFAULT_DEMO_CARDS: PidstavaCard[] = [
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

// Демо-пак 2: «Коментарі» (4 гри: 4 відео + 4 коментарі-підказки)
const DEFAULT_DEMO_COMMENTS_GAMES: CommentGame[] = [
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

// Демо-пак 3: «5/10» (8 бліц-питань)
const DEFAULT_DEMO_BLITZ: BlitzQuestion[] = [
  { question: "Назвіть 3 предмети, які завжди є в жіночій сумочці" },
  { question: "Назвіть 3 причини, чому чоловік може запізнитися на побачення" },
  { question: "Назвіть 3 українські страви, які соромно не вміти готувати" },
  { question: "Назвіть 3 речі, які люди роблять, коли думають, що їх ніхто не бачить" },
  { question: "Назвіть 3 професії, представникам яких не варто брехати" },
  { question: "Назвіть 3 фільми, над якими плачуть навіть дорослі чоловіки" },
  { question: "Назвіть 3 речі, які обов'язково беруть із собою в поїзд Укрзалізниці" },
  { question: "Назвіть 3 пісні, які знає напам'ять кожен українець" },
];

function createEmptyCard(index: number): PidstavaCard {
  return {
    topic: `Тема ${index + 1}`,
    easy_question: "",
    easy_answer: "",
    easy_fact: "",
    hard_question: "",
    hard_answer: "",
    hard_fact: "",
  };
}

function createEmptyCommentGame(index: number): CommentGame {
  return {
    correct_video: "",
    fake_videos: ["", "", ""],
    comments: ["", "", "", ""],
    video_url: "",
  };
}

function extractPidstavaCards(round: any): any[] {
  if (!round) return [];

  let dataObj = round.data;
  if (typeof dataObj === "string") {
    try {
      dataObj = JSON.parse(dataObj);
    } catch {
      dataObj = {};
    }
  }

  const candidates = [
    round.topics,
    dataObj?.topics,
    round.cards,
    dataObj?.cards,
    round.themes,
    dataObj?.themes,
    round.questions,
    dataObj?.questions,
    round.items,
    dataObj?.items,
  ];

  for (const cand of candidates) {
    if (!cand) continue;
    let list = cand;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        continue;
      }
    }
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  }

  return [];
}

function normalizePidstavaCard(c: any, i: number): PidstavaCard {
  if (!c) return createEmptyCard(i);
  if (typeof c === "string") {
    return {
      ...createEmptyCard(i),
      topic: c,
    };
  }
  const topic = (c.topic || c.title || c.name || c.theme || c.topic_name || `Тема ${i + 1}`).trim();
  const easy_question = (c.easy_question || c.question_easy || c.easyQuestion || c.question || c.q_easy || c.q1 || "").trim();
  const easy_answer = (c.easy_answer || c.correct_answer_easy || c.easyAnswer || c.answer_easy || c.answer || c.a_easy || c.a1 || "").trim();
  const easy_fact = (c.easy_fact || c.fact_easy || c.easyFact || c.fact || c.fact1 || "").trim();
  const hard_question = (c.hard_question || c.question_hard || c.hardQuestion || c.q_hard || c.q2 || "").trim();
  const hard_answer = (c.hard_answer || c.correct_answer_hard || c.hardAnswer || c.answer_hard || c.a_hard || c.a2 || "").trim();
  const hard_fact = (c.hard_fact || c.fact_hard || c.hardFact || c.fact2 || "").trim();

  return {
    id: c.id ?? i + 1,
    topic: topic || `Тема ${i + 1}`,
    easy_question,
    easy_answer,
    easy_fact,
    hard_question,
    hard_answer,
    hard_fact,
    question_easy: easy_question,
    correct_answer_easy: easy_answer,
    fact: easy_fact,
    question_hard: hard_question,
    correct_answer_hard: hard_answer,
  };
}

const ROUND_DRAFT_KEY = "vkv_round_draft";

const getDefaultEasyHardCards = (): PidstavaCard[] =>
  Array.from({ length: 8 }, (_, i) => createEmptyCard(i));

const getDefaultCommentGames = (): CommentGame[] =>
  Array.from({ length: 4 }, (_, i) => createEmptyCommentGame(i));

const getDefaultBlitzQuestions = (): BlitzQuestion[] =>
  DEFAULT_DEMO_BLITZ.map((q) => ({ question: q.question }));

const getDefaultAliasForm = () => ({
  question: "Еліас: Поясни якомога більше слів за 01:11 (71 секунду, паперові картки)",
});

export default function AdminPage() {
  const [password, setPassword] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);

  const [loadingGames, setLoadingGames] = useState<boolean>(false);
  const [loadingRounds, setLoadingRounds] = useState<boolean>(false);
  const [submittingGame, setSubmittingGame] = useState<boolean>(false);
  const [submittingRound, setSubmittingRound] = useState<boolean>(false);
  const [creatingDemoGame, setCreatingDemoGame] = useState<boolean>(false);
  const [reorderingRounds, setReorderingRounds] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [newGameName, setNewGameName] = useState<string>("");
  const [roundType, setRoundType] = useState<RoundType>("easy_hard");

  const [easyHardCards, setEasyHardCards] = useState<PidstavaCard[]>(() => getDefaultEasyHardCards());
  const [activeCardTab, setActiveCardTab] = useState<number>(0);

  const [commentGames, setCommentGames] = useState<CommentGame[]>(() => getDefaultCommentGames());
  const [activeCommentTab, setActiveCommentTab] = useState<number>(0);

  const [blitzQuestions, setBlitzQuestions] = useState<BlitzQuestion[]>(() => getDefaultBlitzQuestions());

  const [aliasForm, setAliasForm] = useState(getDefaultAliasForm());
  const [draftRestored, setDraftRestored] = useState<boolean>(false);

  // Round Edit Mode States
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [editingRoundName, setEditingRoundName] = useState<string>("");
  const formRef = useRef<HTMLDivElement | null>(null);

  // Restore draft from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawDraft = localStorage.getItem(ROUND_DRAFT_KEY);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft);
          if (draft.roundType) setRoundType(draft.roundType);
          if (typeof draft.activeCardTab === "number") setActiveCardTab(draft.activeCardTab);
          if (typeof draft.activeCommentTab === "number") setActiveCommentTab(draft.activeCommentTab);
          if (Array.isArray(draft.easyHardCards) && draft.easyHardCards.length > 0) {
            const restoredCards = Array.from({ length: 8 }, (_, i) => draft.easyHardCards[i] || createEmptyCard(i));
            setEasyHardCards(restoredCards);
          }
          if (Array.isArray(draft.commentGames) && draft.commentGames.length === 4) {
            setCommentGames(draft.commentGames);
          }
          if (Array.isArray(draft.blitzQuestions) && draft.blitzQuestions.length > 0) {
            setBlitzQuestions(draft.blitzQuestions);
          }
          if (draft.aliasForm && typeof draft.aliasForm.question === "string") {
            setAliasForm(draft.aliasForm);
          }
        }
      } catch (err) {
        console.error("Помилка відновлення чернетки раунду:", err);
      } finally {
        setDraftRestored(true);
      }
    } else {
      setDraftRestored(true);
    }
  }, []);

  // Auto-save form draft whenever any field or active tab changes
  useEffect(() => {
    if (!draftRestored || typeof window === "undefined") return;
    try {
      const draftData = {
        roundType,
        activeCardTab,
        activeCommentTab,
        easyHardCards,
        commentGames,
        blitzQuestions,
        aliasForm,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(ROUND_DRAFT_KEY, JSON.stringify(draftData));
    } catch (err) {
      console.error("Помилка автозбереження чернетки раунду:", err);
    }
  }, [
    draftRestored,
    roundType,
    activeCardTab,
    activeCommentTab,
    easyHardCards,
    commentGames,
    blitzQuestions,
    aliasForm,
  ]);

  const handleResetRoundForm = (showConfirm = false) => {
    if (showConfirm && typeof window !== "undefined") {
      const confirmed = window.confirm("Очистити всю введену інформацію у формі та скинути чернетку?");
      if (!confirmed) return;
    }
    setEditingRoundId(null);
    setEditingRoundName("");
    setEasyHardCards(getDefaultEasyHardCards());
    setActiveCardTab(0);
    setCommentGames(getDefaultCommentGames());
    setActiveCommentTab(0);
    setBlitzQuestions(getDefaultBlitzQuestions());
    setAliasForm(getDefaultAliasForm());
    if (typeof window !== "undefined") {
      localStorage.removeItem(ROUND_DRAFT_KEY);
    }
    if (showConfirm) {
      setSuccessMessage("Чернетку форми успішно очищено!");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = sessionStorage.getItem("vkv_admin_auth");
      if (savedAuth === "true") setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchGames();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedGame) {
      fetchRounds(selectedGame.id);
      setEditingRoundId(null);
      setEditingRoundName("");
    } else {
      setRounds([]);
    }
  }, [selectedGame]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "vkv2026") {
      setIsAuthenticated(true);
      setAuthError(null);
      if (typeof window !== "undefined") sessionStorage.setItem("vkv_admin_auth", "true");
    } else {
      setAuthError("Невірний пароль!");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") sessionStorage.removeItem("vkv_admin_auth");
  };

  const fetchGames = async () => {
    try {
      setLoadingGames(true);
      const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setGames(data || []);
      if (data && data.length > 0 && !selectedGame) {
        setSelectedGame(data[0]);
      }
    } catch (err: any) {
      console.error("fetchGames error:", err);
      setErrorMessage(err.message);
    } finally {
      setLoadingGames(false);
    }
  };

  const fetchRounds = async (gameId: string) => {
    try {
      setLoadingRounds(true);
      const { data, error } = await supabase
        .from("rounds")
        .select("*")
        .eq("game_id", gameId)
        .order("order_index", { ascending: true });
      if (error) throw error;

      const normalizedRounds: Round[] = (data || []).map((r: any) => {
        let dataObj = r.data;
        if (typeof dataObj === "string") {
          try {
            dataObj = JSON.parse(dataObj);
          } catch {
            dataObj = {};
          }
        }
        const pidstavaCards = extractPidstavaCards(r);

        return {
          ...r,
          ...(dataObj || {}),
          cards: pidstavaCards,
          topics: pidstavaCards,
          themes: pidstavaCards,
          comment_games: r.comment_games || dataObj?.comment_games || dataObj?.games || r.games || [],
          games: r.games || dataObj?.games || dataObj?.comment_games || r.comment_games || [],
          blitz_questions: r.blitz_questions || dataObj?.blitz_questions || dataObj?.questions || r.questions || [],
          questions: r.questions || dataObj?.questions || dataObj?.blitz_questions || r.blitz_questions || [],
          timer_seconds: r.timer_seconds || dataObj?.timer_seconds || dataObj?.config?.timer_seconds || 71,
        };
      });

      setRounds(normalizedRounds);
    } catch (err: any) {
      console.error("fetchRounds error:", err);
      setErrorMessage(err.message);
    } finally {
      setLoadingRounds(false);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim()) return;
    try {
      setSubmittingGame(true);
      const { data, error } = await supabase
        .from("games")
        .insert([{ name: newGameName.trim() }])
        .select();
      if (error) throw error;
      setNewGameName("");
      setSuccessMessage("Гру успішно створено!");
      await fetchGames();
      if (data && data[0]) {
        setSelectedGame(data[0]);
        await fetchRounds(data[0].id);
      }
    } catch (err: any) {
      console.error("handleCreateGame error:", err);
      setErrorMessage(err.message);
    } finally {
      setSubmittingGame(false);
    }
  };

  // Швидке створення готової гри з усіма 4 раундами та демо-паками
  const handleCreateDemoGame = async () => {
    try {
      setCreatingDemoGame(true);
      const gameTitle = `Демо Гра ВКВ (${new Date().toLocaleDateString("uk-UA")})`;

      const { data: newGame, error: gameError } = await supabase
        .from("games")
        .insert([{ name: gameTitle }])
        .select()
        .single();

      if (gameError) {
        console.error("Помилка створення гри:", gameError);
        alert("Помилка створення гри: " + gameError.message);
        throw gameError;
      }

      if (!newGame || !newGame.id) {
        throw new Error("Не вдалося отримати ID створеної гри");
      }

      const normalizedComments = DEFAULT_DEMO_COMMENTS_GAMES.map((g) => ({
        correct_video: g.correct_video.trim(),
        fake_videos: g.fake_videos.map((f) => f.trim()),
        comments: g.comments.map((c) => c.trim()),
        options: [g.correct_video.trim(), ...g.fake_videos.map((f) => f.trim())],
        video_url: g.video_url || "",
      }));

      // Вставляємо строго валідні поля: game_id, type, order_index, data
      const demoRounds = [
        {
          game_id: newGame.id,
          type: "pidstava",
          order_index: 0,
          data: { cards: DEFAULT_DEMO_CARDS, question: "Підстава (8 тем)" },
        },
        {
          game_id: newGame.id,
          type: "comments",
          order_index: 1,
          data: { games: normalizedComments, comment_games: normalizedComments, question: "Коментарі (4 гри)" },
        },
        {
          game_id: newGame.id,
          type: "blitz_5_10",
          order_index: 2,
          data: { questions: DEFAULT_DEMO_BLITZ, blitz_questions: DEFAULT_DEMO_BLITZ, question: "5/10 (8 питань)" },
        },
        {
          game_id: newGame.id,
          type: "alias",
          order_index: 3,
          data: { config: { timer_seconds: 71 }, timer_seconds: 71, question: "Еліас: 71 секунда (01:11, паперові картки)" },
        },
      ];

      const { error: roundsError } = await supabase.from("rounds").insert(demoRounds);
      if (roundsError) {
        console.error("Помилка додавання раундів:", roundsError);
        alert("Помилка додавання раундів: " + roundsError.message);
        throw roundsError;
      }

      setSuccessMessage(`Готову демо-гру "${gameTitle}" з 4 раундами успішно створено!`);
      await fetchGames();
      setSelectedGame(newGame);
      await fetchRounds(newGame.id);
    } catch (err: any) {
      console.error("handleCreateDemoGame error:", err);
      setErrorMessage(err.message || "Помилка створення демо-гри");
    } finally {
      setCreatingDemoGame(false);
    }
  };

  // Заповнити поточну обрану гру 4 раундами (якщо вони ще не додані)
  const handleFillCurrentGameWithDemoRounds = async () => {
    if (!selectedGame) return;
    try {
      setCreatingDemoGame(true);

      const normalizedComments = DEFAULT_DEMO_COMMENTS_GAMES.map((g) => ({
        correct_video: g.correct_video.trim(),
        fake_videos: g.fake_videos.map((f) => f.trim()),
        comments: g.comments.map((c) => c.trim()),
        options: [g.correct_video.trim(), ...g.fake_videos.map((f) => f.trim())],
        video_url: g.video_url || "",
      }));

      const demoRounds = [
        {
          game_id: selectedGame.id,
          type: "pidstava",
          order_index: 0,
          data: { cards: DEFAULT_DEMO_CARDS, question: "Підстава (8 тем)" },
        },
        {
          game_id: selectedGame.id,
          type: "comments",
          order_index: 1,
          data: { games: normalizedComments, comment_games: normalizedComments, question: "Коментарі (4 гри)" },
        },
        {
          game_id: selectedGame.id,
          type: "blitz_5_10",
          order_index: 2,
          data: { questions: DEFAULT_DEMO_BLITZ, blitz_questions: DEFAULT_DEMO_BLITZ, question: "5/10 (8 питань)" },
        },
        {
          game_id: selectedGame.id,
          type: "alias",
          order_index: 3,
          data: { config: { timer_seconds: 71 }, timer_seconds: 71, question: "Еліас: 71 секунда (01:11, паперові картки)" },
        },
      ];

      const { error: roundsError } = await supabase.from("rounds").insert(demoRounds);
      if (roundsError) {
        console.error("Помилка заповнення 4 раундами:", roundsError);
        alert("Помилка додавання 4 раундів: " + roundsError.message);
        throw roundsError;
      }

      setSuccessMessage(`Гру "${selectedGame.name}" успішно заповнено 4 раундами!`);
      await fetchRounds(selectedGame.id);
    } catch (err: any) {
      console.error("handleFillCurrentGameWithDemoRounds error:", err);
      setErrorMessage(err.message || "Помилка заповнення гри раундами");
    } finally {
      setCreatingDemoGame(false);
    }
  };

  const handleDeleteGame = async (gameId: string, gameName: string) => {
    if (!confirm(`Видалити гру "${gameName}"?`)) return;
    try {
      const { error } = await supabase.from("games").delete().eq("id", gameId);
      if (error) throw error;
      if (selectedGame?.id === gameId) setSelectedGame(null);
      await fetchGames();
    } catch (err: any) {
      console.error("handleDeleteGame error:", err);
      setErrorMessage(err.message);
    }
  };

  const handleDeleteRound = async (roundId: string, index: number) => {
    if (!confirm(`Видалити раунд ${index + 1}?`)) return;
    try {
      const { error } = await supabase.from("rounds").delete().eq("id", roundId);
      if (error) throw error;
      setSuccessMessage("Раунд видалено.");
      if (editingRoundId === roundId) {
        setEditingRoundId(null);
        setEditingRoundName("");
        handleResetRoundForm(false);
      }
      if (selectedGame) {
        // Fetch and re-index remaining rounds sequentially
        const { data } = await supabase
          .from("rounds")
          .select("*")
          .eq("game_id", selectedGame.id)
          .order("order_index", { ascending: true });
        if (data && data.length > 0) {
          const reindexed = data.map((r: any, i: number) => ({ id: r.id, order_index: i }));
          await Promise.all(
            reindexed.map((r: any) =>
              supabase.from("rounds").update({ order_index: r.order_index }).eq("id", r.id)
            )
          );
        }
        await fetchRounds(selectedGame.id);
      }
    } catch (err: any) {
      console.error("handleDeleteRound error:", err);
      setErrorMessage(err.message);
    }
  };

  const handleMoveRound = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rounds.length) return;

    const roundA = rounds[index];
    const roundB = rounds[targetIndex];
    if (!roundA || !roundB) return;

    // Optimistically reorder array locally
    const updated = [...rounds];
    updated[index] = roundB;
    updated[targetIndex] = roundA;

    // Recalculate order_index sequentially
    const reindexed = updated.map((r, i) => ({ ...r, order_index: i }));
    setRounds(reindexed);

    try {
      setReorderingRounds(true);
      const updates = reindexed.map((r) =>
        supabase.from("rounds").update({ order_index: r.order_index }).eq("id", r.id)
      );
      const results = await Promise.all(updates);
      const errorResult = results.find((res) => res.error);
      if (errorResult && errorResult.error) throw errorResult.error;
    } catch (err: any) {
      console.error("handleMoveRound error:", err);
      setErrorMessage("Помилка зміни порядку раундів: " + err.message);
      if (selectedGame) await fetchRounds(selectedGame.id);
    } finally {
      setReorderingRounds(false);
    }
  };

  const prepareRoundData = () => {
    let roundData: any = {};

    if (roundType === "easy_hard" || roundType === "pidstava") {
      for (let i = 0; i < 8; i++) {
        const card = easyHardCards[i];
        const easyQ = card?.easy_question || card?.question_easy || "";
        const hardQ = card?.hard_question || card?.question_hard || "";
        if (!card?.topic?.trim() || !easyQ.trim() || !hardQ.trim()) {
          throw new Error(`Заповніть тему та запитання для картки ${i + 1}`);
        }
      }
      const normalizedCards = easyHardCards.map((c, i) => normalizePidstavaCard(c, i));
      roundData = {
        cards: normalizedCards,
        topics: normalizedCards,
        themes: normalizedCards,
        question: "Підстава (8 тем)",
      };
    } else if (roundType === "youtube_comments" || roundType === "comments") {
      for (let i = 0; i < 4; i++) {
        const g = commentGames[i];
        if (!g?.correct_video?.trim() || g.fake_videos.some((v) => !v.trim()) || g.comments.some((c) => !c.trim())) {
          throw new Error(`Заповніть правильну назву, 3 фейки та 4 коментарі для гри ${i + 1}`);
        }
      }
      const normalizedComments = commentGames.map((g) => ({
        correct_video: (g.correct_video || "").trim(),
        fake_videos: (g.fake_videos || []).map((f) => f.trim()),
        comments: (g.comments || []).map((c) => c.trim()),
        options: [(g.correct_video || "").trim(), ...(g.fake_videos || []).map((f) => f.trim())],
        video_url: (g.video_url || "").trim(),
      }));
      roundData = { games: normalizedComments, comment_games: normalizedComments, question: "Коментарі (4 гри)" };
    } else if (roundType === "blitz_5sec" || roundType === "blitz_5_10") {
      if (blitzQuestions.some((q) => !q?.question?.trim())) {
        throw new Error("Заповніть усі 8 бліц-питань для раунду 5/10");
      }
      const normalizedBlitz = blitzQuestions.map((q) => ({ question: (q.question || "").trim() }));
      roundData = { questions: normalizedBlitz, blitz_questions: normalizedBlitz, question: "5/10 (8 питань)" };
    } else if (roundType === "alias") {
      roundData = { config: { timer_seconds: 71 }, timer_seconds: 71, question: aliasForm.question.trim() || "Еліас (71с / 01:11)" };
    }

    return roundData;
  };

  const handleEditRound = (round: Round, idx: number) => {
    console.log("Завантаження раунду для редагування:", round);
    setEditingRoundId(round.id);
    let label = `Раунд ${idx + 1}`;

    if (round.type === "easy_hard" || round.type === "pidstava") {
      setRoundType("easy_hard");
      label = `Підстава (Раунд ${idx + 1})`;
      const loadedTopics = extractPidstavaCards(round);
      console.log("Завантажені теми раунду 'Підстава' (loadedTopics):", loadedTopics);

      if (Array.isArray(loadedTopics) && loadedTopics.length > 0) {
        const fullCards: PidstavaCard[] = Array.from({ length: 8 }).map((_, i) =>
          normalizePidstavaCard(loadedTopics[i], i)
        );
        console.log("Заповнені 8 карток для інпутів форми:", fullCards);
        setEasyHardCards(fullCards);
      } else {
        setEasyHardCards(getDefaultEasyHardCards());
      }
      setActiveCardTab(0);
    } else if (round.type === "youtube_comments" || round.type === "comments") {
      setRoundType("youtube_comments");
      label = `Коментарі (Раунд ${idx + 1})`;
      const rawGames = round.comment_games || round.data?.comment_games || round.data?.games || round.games || [];
      if (rawGames.length > 0) {
        const fullGames: CommentGame[] = Array.from({ length: 4 }).map((_, i) => {
          const g = rawGames[i];
          if (!g) {
            return {
              correct_video: "",
              fake_videos: ["", "", ""],
              comments: ["", "", "", ""],
              video_url: "",
            };
          }
          return {
            correct_video: g.correct_video || "",
            fake_videos: Array.isArray(g.fake_videos) && g.fake_videos.length === 3 ? g.fake_videos : ["", "", ""],
            comments: Array.isArray(g.comments) && g.comments.length === 4 ? g.comments : ["", "", "", ""],
            video_url: g.video_url || "",
          };
        });
        setCommentGames(fullGames);
      }
      setActiveCommentTab(0);
    } else if (round.type === "blitz_5sec" || round.type === "blitz_5_10") {
      setRoundType("blitz_5sec");
      label = `5/10 (Раунд ${idx + 1})`;
      const rawQuestions = round.blitz_questions || round.data?.blitz_questions || round.data?.questions || round.questions || [];
      if (rawQuestions.length > 0) {
        const fullBlitz: BlitzQuestion[] = Array.from({ length: 8 }).map((_, i) => {
          const q = rawQuestions[i];
          return {
            question: q?.question || "",
          };
        });
        setBlitzQuestions(fullBlitz);
      }
    } else if (round.type === "alias") {
      setRoundType("alias");
      label = `Еліас (Раунд ${idx + 1})`;
      setAliasForm({
        question: round.question || round.data?.question || "Еліас: 71 секунда (01:11, паперові картки)",
      });
    }

    setEditingRoundName(label);
    setSuccessMessage(`Дані раунду #${idx + 1} завантажено у форму для редагування / копіювання`);

    // Smooth scroll to builder form
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const handleUpdateRound = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGame || !editingRoundId) return;
    try {
      setSubmittingRound(true);
      const roundData = prepareRoundData();

      const { error } = await supabase
        .from("rounds")
        .update({
          type: roundType,
          data: roundData,
        })
        .eq("id", editingRoundId);

      if (error) throw error;

      setSuccessMessage("Зміни у раунді успішно збережено!");
      await fetchRounds(selectedGame.id);
    } catch (err: any) {
      console.error("handleUpdateRound error:", err);
      setErrorMessage(err.message || "Помилка збереження змін раунду");
    } finally {
      setSubmittingRound(false);
    }
  };

  const handleSaveAsNewRound = async () => {
    if (!selectedGame) return;
    try {
      setSubmittingRound(true);
      const roundData = prepareRoundData();
      const nextOrder = rounds.length;

      const insertPayload: any = {
        game_id: selectedGame.id,
        type: roundType,
        order_index: nextOrder,
        data: roundData,
      };

      const { error } = await supabase.from("rounds").insert([insertPayload]);
      if (error) throw error;

      setSuccessMessage(`Раунд успішно збережено як новий окремий раунд #${nextOrder + 1}!`);
      setEditingRoundId(null);
      setEditingRoundName("");
      handleResetRoundForm(false);
      await fetchRounds(selectedGame.id);
    } catch (err: any) {
      console.error("handleSaveAsNewRound error:", err);
      setErrorMessage(err.message || "Помилка збереження нового раунду");
    } finally {
      setSubmittingRound(false);
    }
  };

  const handleCancelEditing = () => {
    setEditingRoundId(null);
    setEditingRoundName("");
    handleResetRoundForm(false);
    setSuccessMessage("Редагування скасовано. Форму повернуто у стандартний режим.");
  };

  const handleAddRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoundId) {
      await handleUpdateRound();
      return;
    }
    if (!selectedGame) return;
    try {
      setSubmittingRound(true);
      const roundData = prepareRoundData();

      const nextOrder = rounds.length;
      const insertPayload: any = {
        game_id: selectedGame.id,
        type: roundType,
        order_index: nextOrder,
        data: roundData,
      };

      const { error } = await supabase.from("rounds").insert([insertPayload]);
      if (error) {
        console.error("Помилка додавання раунду:", error);
        alert("Помилка додавання раунду: " + error.message);
        throw error;
      }

      setSuccessMessage(`Раунд успішно додано до "${selectedGame.name}"!`);
      handleResetRoundForm(false);
      await fetchRounds(selectedGame.id);
    } catch (err: any) {
      console.error("handleAddRound error:", err);
      setErrorMessage(err.message || "Помилка додавання раунду");
    } finally {
      setSubmittingRound(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-4">
              <Lock size={28} />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide uppercase">Вхід до Адмін-панелі</h1>
            <p className="text-xs text-zinc-400 mt-1">Керування вікториною шоу ВКВ 2026</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Пароль адміністратора
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введіть пароль..."
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              Увійти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-zinc-50 flex flex-col font-sans select-none pb-20 touch-manipulation overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          {/* Top Row on Mobile: Left (Back + Title) & Right (Game Link + Logout) */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") window.location.href = "/";
                }}
                className="p-2 min-h-[38px] min-w-[38px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer flex items-center justify-center active:scale-95 touch-manipulation"
                title="На головну гру"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">Адмінка ВКВ 2026</h1>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold block truncate">Конструктор ігор та 4 раундів</span>
              </div>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") window.location.href = "/";
                }}
                className="px-2.5 py-1.5 min-h-[36px] bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center active:scale-95 touch-manipulation"
              >
                Ігровий екран
              </button>
              <button
                onClick={handleLogout}
                className="p-2 min-h-[36px] min-w-[36px] text-zinc-500 hover:text-zinc-300 rounded-xl hover:bg-zinc-900 transition cursor-pointer flex items-center justify-center touch-manipulation"
                title="Вийти"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Action Row / Desktop Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={creatingDemoGame}
              onClick={handleCreateDemoGame}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[42px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 touch-manipulation"
            >
              {creatingDemoGame ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Створення...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>⚡ Створити готову демо-гру (4 раунди)</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") window.location.href = "/";
                }}
                className="px-3 py-2 min-h-[38px] bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center active:scale-95"
              >
                Ігровий екран
              </button>
              <button
                onClick={handleLogout}
                className="p-2 min-h-[38px] min-w-[38px] text-zinc-500 hover:text-zinc-300 rounded-xl hover:bg-zinc-900 transition cursor-pointer flex items-center justify-center"
                title="Вийти"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {errorMessage && (
        <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 mt-4">
          <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 mt-4">
          <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Column 1: Games List & Create Game */}
        <section className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <ListOrdered size={14} /> Список Ігор
            </h2>
          </div>

          <form onSubmit={handleCreateGame} className="flex gap-2">
            <input
              type="text"
              placeholder="Назва нової гри..."
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={submittingGame || !newGameName.trim()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition cursor-pointer"
            >
              {submittingGame ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
          </form>

          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
            {loadingGames ? (
              <div className="py-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Завантаження...
              </div>
            ) : games.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">Ігор ще не створено.</p>
            ) : (
              games.map((g) => (
                <div
                  key={g.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${selectedGame?.id === g.id ? "bg-indigo-950/30 border-indigo-500/60" : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700"
                    }`}
                >
                  <button onClick={() => setSelectedGame(g)} className="flex-grow text-left truncate cursor-pointer py-1">
                    <h4 className={`text-xs font-extrabold ${selectedGame?.id === g.id ? "text-indigo-400" : "text-zinc-200"}`}>
                      {g.name}
                    </h4>
                  </button>
                  <button
                    onClick={() => handleDeleteGame(g.id, g.name)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Column 2 & 3: Selected Game Rounds & Builder */}
        <section className="md:col-span-2 flex flex-col gap-6">
          {!selectedGame ? (
            <div className="flex-grow bg-zinc-900/40 border border-zinc-800 border-dashed rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center text-zinc-500 min-h-[400px]">
              <HelpCircle size={48} className="text-zinc-700 mb-3" />
              <h3 className="text-base font-bold text-zinc-400">Гра не обрана</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-4">Оберіть або створіть гру зліва, або запустіть повний демо-пак.</p>
              <button
                type="button"
                onClick={handleCreateDemoGame}
                disabled={creatingDemoGame}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Sparkles size={15} />
                <span>⚡ Створити готову демо-гру (4 раунди)</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Existing Rounds in Selected Game */}
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">Поточна гра</span>
                    <h3 className="text-sm sm:text-base font-black text-white uppercase">{selectedGame.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {rounds.length === 0 && (
                      <button
                        type="button"
                        disabled={creatingDemoGame}
                        onClick={handleFillCurrentGameWithDemoRounds}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-lg text-xs uppercase transition cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                      >
                        <Sparkles size={13} />
                        <span>Заповнити 4 раундами</span>
                      </button>
                    )}
                    <span className="bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-zinc-400">
                      Раундів: {rounds.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto">
                  {loadingRounds ? (
                    <div className="py-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Завантаження...
                    </div>
                  ) : rounds.length === 0 ? (
                    <div className="p-6 bg-zinc-950/60 border border-dashed border-zinc-800 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
                      <p className="text-xs text-zinc-400 font-medium">У цій грі ще немає створених раундів.</p>
                      <button
                        type="button"
                        disabled={creatingDemoGame}
                        onClick={handleFillCurrentGameWithDemoRounds}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
                      >
                        {creatingDemoGame ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Заповнення...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>⚡ Заповнити цю гру 4 раундами (Демо-пак)</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    rounds.map((round, idx) => (
                      <div key={round.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl gap-2">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-xs font-extrabold text-zinc-400 border border-zinc-800 font-mono flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs sm:text-sm font-black text-white block truncate">
                              {round.type === "easy_hard" || round.type === "pidstava"
                                ? `Підстава (${(round.topics || round.data?.topics || round.cards || round.data?.cards || extractPidstavaCards(round)).length} тем)`
                                : round.type === "youtube_comments" || round.type === "comments"
                                  ? `Коментарі (${(round.comment_games || round.data?.games || []).length} гри)`
                                  : round.type === "blitz_5sec" || round.type === "blitz_5_10"
                                    ? `5/10 (${(round.blitz_questions || round.data?.questions || []).length} питань)`
                                    : "Еліас (71с / 01:11)"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button
                            type="button"
                            disabled={idx === 0 || reorderingRounds}
                            onClick={() => handleMoveRound(idx, "up")}
                            className="w-9 h-9 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 active:bg-zinc-700 hover:text-white hover:border-zinc-600 disabled:opacity-20 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-200 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center touch-manipulation"
                            title="Перемістити раунд вгору"
                          >
                            <ChevronUp size={16} />
                          </button>

                          <button
                            type="button"
                            disabled={idx === rounds.length - 1 || reorderingRounds}
                            onClick={() => handleMoveRound(idx, "down")}
                            className="w-9 h-9 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 active:bg-zinc-700 hover:text-white hover:border-zinc-600 disabled:opacity-20 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-200 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center touch-manipulation"
                            title="Перемістити раунд вниз"
                          >
                            <ChevronDown size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditRound(round, idx)}
                            className={`w-9 h-9 p-2 rounded-lg border transition cursor-pointer flex items-center justify-center touch-manipulation active:scale-95 ${editingRoundId === round.id
                              ? "bg-amber-500/20 border-amber-500 text-amber-400 ring-1 ring-amber-500/50"
                              : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-amber-400 hover:border-amber-500/40 active:bg-zinc-700"
                              }`}
                            title="Редагувати / Переглянути раунд"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRound(round.id, idx)}
                            className="w-9 h-9 p-2 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 active:scale-95 transition cursor-pointer flex items-center justify-center touch-manipulation ml-0.5"
                            title="Видалити раунд"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add / Edit Round Constructor */}
              <div ref={formRef} className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-lg scroll-mt-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {editingRoundId ? (
                      <>
                        <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Edit3 size={16} className="text-amber-400" />
                          <span>РЕДАГУВАННЯ РАУНДУ [{editingRoundName || "Раунд"}]</span>
                        </h3>
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          Режим редагування
                        </span>
                      </>
                    ) : (
                      <>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <PlusCircle size={16} className="text-indigo-400" />
                          <span>Додати Новий Раунд</span>
                        </h3>
                        <span className="text-[10px] text-zinc-500 font-bold hidden sm:inline-flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Автозбереження чернетки
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingRoundId ? (
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        className="px-2.5 py-1 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 touch-manipulation active:scale-95"
                        title="Скасувати режим редагування"
                      >
                        <X size={13} />
                        <span>Скасувати</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResetRoundForm(true)}
                        className="px-2.5 py-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 border border-zinc-800 hover:border-rose-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 touch-manipulation active:scale-95"
                        title="Скинути чернетку та очистити всі поля"
                      >
                        <Trash2 size={13} />
                        <span>Очистити форму</span>
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleAddRound} className="flex flex-col gap-5">
                  {/* Round Type Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setRoundType("easy_hard")}
                      className={`py-2 px-1 text-[10px] sm:text-xs font-extrabold rounded-lg transition uppercase cursor-pointer flex items-center justify-center gap-1 ${roundType === "easy_hard" || roundType === "pidstava" ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20" : "text-zinc-400 hover:text-white"
                        }`}
                    >
                      <Sparkles size={12} /> 1. Підстава
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoundType("youtube_comments")}
                      className={`py-2 px-1 text-[10px] sm:text-xs font-extrabold rounded-lg transition uppercase cursor-pointer flex items-center justify-center gap-1 ${roundType === "youtube_comments" || roundType === "comments" ? "bg-rose-600 text-white font-black shadow-md shadow-rose-600/20" : "text-zinc-400 hover:text-white"
                        }`}
                    >
                      <MessageCircle size={12} /> 2. Коментарі
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoundType("blitz_5sec")}
                      className={`py-2 px-1 text-[10px] sm:text-xs font-extrabold rounded-lg transition uppercase cursor-pointer flex items-center justify-center gap-1 ${roundType === "blitz_5sec" || roundType === "blitz_5_10" ? "bg-amber-500 text-slate-950" : "text-zinc-400 hover:text-white"
                        }`}
                    >
                      <Zap size={12} /> 3. 5/10
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoundType("alias")}
                      className={`py-2 px-1 text-[10px] sm:text-xs font-extrabold rounded-lg transition uppercase cursor-pointer flex items-center justify-center gap-1 ${roundType === "alias" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
                        }`}
                    >
                      <MessageSquareQuote size={12} /> 4. Еліас
                    </button>
                  </div>

                  {/* Form Builder Body */}
                  <div className="space-y-4">
                    {/* ROUND 1: ПІДСТАВА (8 КАРТОК/ТЕМ З ОКРЕМИМИ ФАКТАМИ ДЛЯ ЛЕГКОГО ТА СКЛАДНОГО) */}
                    {(roundType === "easy_hard" || roundType === "pidstava") && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Layers size={14} /> 8 тем раунду «Підстава» (Легке: 1 б. • Складне: 2 б.)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEasyHardCards(DEFAULT_DEMO_CARDS);
                              setSuccessMessage("Демо-пак з 8 тем завантажено!");
                            }}
                            className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 hover:bg-amber-500/30"
                          >
                            <Sparkles size={12} /> + Демо-пак (8 тем)
                          </button>
                        </div>

                        {/* 8 Card Navigation Tabs */}
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                          {easyHardCards.map((c, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveCardTab(idx)}
                              className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${activeCardTab === idx ? "bg-amber-500 text-slate-950 border-amber-400 font-black" : "bg-zinc-950 text-zinc-400 border-zinc-800"
                                }`}
                            >
                              <span className="text-xs font-mono font-black">{idx + 1}</span>
                              <span className="text-[9px] font-bold truncate max-w-[65px] block">{c.topic || `Тема ${idx + 1}`}</span>
                            </button>
                          ))}
                        </div>

                        {/* Active Card Subform */}
                        {easyHardCards[activeCardTab] && (
                          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
                            <div>
                              <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">
                                Назва теми картки #{activeCardTab + 1}
                              </label>
                              <input
                                type="text"
                                placeholder="Яскрава / смішна назва теми..."
                                value={easyHardCards[activeCardTab]?.topic || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEasyHardCards((prev) => {
                                    const next = [...prev];
                                    next[activeCardTab] = { ...next[activeCardTab], topic: val };
                                    return next;
                                  });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                              />
                            </div>

                            {/* Easy Question Block (Green Card with Fact) */}
                            <div className="p-3.5 bg-emerald-950/10 border border-emerald-500/30 rounded-xl space-y-2.5">
                              <span className="text-[10px] font-black text-emerald-400 uppercase block">
                                Легке запитання (1 бал)
                              </span>
                              <input
                                type="text"
                                placeholder="Текст легкого запитання..."
                                value={easyHardCards[activeCardTab]?.easy_question || easyHardCards[activeCardTab]?.question_easy || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEasyHardCards((prev) => {
                                    const next = [...prev];
                                    next[activeCardTab] = {
                                      ...next[activeCardTab],
                                      easy_question: val,
                                      question_easy: val,
                                    };
                                    return next;
                                  });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                              <input
                                type="text"
                                placeholder="Правильна відповідь на легке..."
                                value={easyHardCards[activeCardTab]?.easy_answer || easyHardCards[activeCardTab]?.correct_answer_easy || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEasyHardCards((prev) => {
                                    const next = [...prev];
                                    next[activeCardTab] = {
                                      ...next[activeCardTab],
                                      easy_answer: val,
                                      correct_answer_easy: val,
                                    };
                                    return next;
                                  });
                                }}
                                className="w-full bg-zinc-900 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-400"
                              />
                              <input
                                type="text"
                                placeholder="Цікавий факт до легкого запитання (необов'язково)..."
                                value={easyHardCards[activeCardTab]?.easy_fact || easyHardCards[activeCardTab]?.fact || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEasyHardCards((prev) => {
                                    const next = [...prev];
                                    next[activeCardTab] = {
                                      ...next[activeCardTab],
                                      easy_fact: val,
                                      fact: val,
                                    };
                                    return next;
                                  });
                                }}
                                className="w-full bg-zinc-900 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-400"
                              />
                            </div>

                            {/* Hard Question Block (Red Card with Fact) */}
                            <div className="p-3.5 bg-rose-950/10 border border-rose-500/30 rounded-xl space-y-2.5">
                              <span className="text-[10px] font-black text-rose-400 uppercase block">
                                Складне запитання (2 бали)
                              </span>
                              <input
                                type="text"
                                placeholder="Текст складного запитання..."
                                value={easyHardCards[activeCardTab]?.hard_question || easyHardCards[activeCardTab]?.question_hard || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEasyHardCards((prev) => {
                                    const next = [...prev];
                                    next[activeCardTab] = {
                                      ...next[activeCardTab],
                                      hard_question: val,
                                      question_hard: val,
                                    };
                                    return next;
                                  });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                              />
                              <input
                                type="text"
                                placeholder="Правильна відповідь на складне..."
                                value={easyHardCards[activeCardTab]?.hard_answer || easyHardCards[activeCardTab]?.correct_answer_hard || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEasyHardCards((prev) => {
                                    const next = [...prev];
                                    next[activeCardTab] = {
                                      ...next[activeCardTab],
                                      hard_answer: val,
                                      correct_answer_hard: val,
                                    };
                                    return next;
                                  });
                                }}
                                className="w-full bg-zinc-900 border border-rose-500/30 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 font-semibold focus:outline-none focus:border-rose-400"
                              />
                              <input
                                type="text"
                                placeholder="Цікавий факт до складного запитання (необов'язково)..."
                                value={easyHardCards[activeCardTab]?.hard_fact || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEasyHardCards((prev) => {
                                    const next = [...prev];
                                    next[activeCardTab] = {
                                      ...next[activeCardTab],
                                      hard_fact: val,
                                    };
                                    return next;
                                  });
                                }}
                                className="w-full bg-zinc-900 border border-rose-500/20 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-rose-400"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ROUND 2: КОМЕНТАРІ */}
                    {(roundType === "youtube_comments" || roundType === "comments") && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                              <MessageCircle size={14} /> 4 гри раунду «Коментарі»
                            </span>
                            <span className="text-[10px] text-zinc-500">4 спроби: +4, +3, +2, +1 бали</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCommentGames(DEFAULT_DEMO_COMMENTS_GAMES);
                              setSuccessMessage("Демо-пак з 4 ігор Коментарів завантажено!");
                            }}
                            className="px-3 py-1.5 bg-rose-600/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 hover:bg-rose-600/30"
                          >
                            <Sparkles size={12} /> + Демо-пак (4 гри)
                          </button>
                        </div>

                        {/* 4 Games Tabs */}
                        <div className="grid grid-cols-4 gap-2">
                          {commentGames.map((g, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveCommentTab(idx)}
                              className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${activeCommentTab === idx ? "bg-rose-600 text-white border-rose-400 font-black shadow-md shadow-rose-600/20" : "bg-zinc-950 text-zinc-400 border-zinc-800"
                                }`}
                            >
                              <span className="text-xs font-mono font-black">{idx + 1}</span>
                              <span className="text-[9px] font-bold truncate max-w-[80px] block">{g.correct_video || `Гра ${idx + 1}`}</span>
                            </button>
                          ))}
                        </div>

                        {/* Active Comment Game Form */}
                        {commentGames[activeCommentTab] && (
                          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
                            <div>
                              <label className="text-[9px] font-bold text-emerald-400 uppercase block mb-1">
                                Правильна назва відео (1 правильний варіант)
                              </label>
                              <input
                                type="text"
                                placeholder="Наприклад: DZIDZIO — Я і Сара"
                                value={commentGames[activeCommentTab].correct_video}
                                onChange={(e) => {
                                  const next = [...commentGames];
                                  next[activeCommentTab] = { ...next[activeCommentTab], correct_video: e.target.value };
                                  setCommentGames(next);
                                }}
                                className="w-full bg-zinc-900 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-bold"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-rose-400 uppercase block">
                                3 фейкові варіанти назв відео
                              </label>
                              {commentGames[activeCommentTab].fake_videos.map((f, fIdx) => (
                                <input
                                  key={fIdx}
                                  type="text"
                                  placeholder={`Фейковий варіант ${fIdx + 1}`}
                                  value={f}
                                  onChange={(e) => {
                                    const next = [...commentGames];
                                    const nextFakes = [...next[activeCommentTab].fake_videos];
                                    nextFakes[fIdx] = e.target.value;
                                    next[activeCommentTab] = { ...next[activeCommentTab], fake_videos: nextFakes };
                                    setCommentGames(next);
                                  }}
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                />
                              ))}
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-amber-400 uppercase block">
                                4 коментарі-підказки (від найскладнішого #1 до найбільш явного #4)
                              </label>
                              {commentGames[activeCommentTab].comments.map((c, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-amber-400 flex items-center justify-center flex-shrink-0 font-mono">
                                    #{cIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    placeholder={`Коментар-підказка #${cIdx + 1}`}
                                    value={c}
                                    onChange={(e) => {
                                      const next = [...commentGames];
                                      const nextComms = [...next[activeCommentTab].comments];
                                      nextComms[cIdx] = e.target.value;
                                      next[activeCommentTab] = { ...next[activeCommentTab], comments: nextComms };
                                      setCommentGames(next);
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ROUND 3: 5/10 */}
                    {(roundType === "blitz_5sec" || roundType === "blitz_5_10") && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                              <Zap size={14} /> 8 відкритих бліц-питань раунду «5/10»
                            </span>
                            <span className="text-[10px] text-zinc-500">По 2 питання на кожного з 4 учасників</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBlitzQuestions(DEFAULT_DEMO_BLITZ.map((q) => ({ question: q.question })));
                              setSuccessMessage("Демо-пак з 8 питань завантажено!");
                            }}
                            className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles size={12} /> + Демо-пак (8 питань)
                          </button>
                        </div>

                        <div className="space-y-2">
                          {blitzQuestions.map((bq, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-bold text-amber-400 flex items-center justify-center flex-shrink-0 font-mono">
                                #{idx + 1}
                              </span>
                              <input
                                type="text"
                                placeholder={`Текст запитання #${idx + 1} для ведучого...`}
                                value={bq.question}
                                onChange={(e) => {
                                  const next = [...blitzQuestions];
                                  next[idx] = { question: e.target.value };
                                  setBlitzQuestions(next);
                                }}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ROUND 4: ЕЛІАС */}
                    {roundType === "alias" && (
                      <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                            <MessageSquareQuote size={14} /> Раунд «Еліас» (71 секунда • 01:11 • Паперові картки)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          У цьому раунді гравці використовують фізичні паперові картки зі словами, а ведучий керує таймером на 71 секунду (01:11) та фіксує бали (+1 вгадано / -1 пропуск).
                        </p>
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">
                            Опис раунду / Нотатка для ведучого
                          </label>
                          <input
                            type="text"
                            value={aliasForm.question}
                            onChange={(e) => setAliasForm({ question: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit / Edit Round Buttons */}
                  {editingRoundId ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        disabled={submittingRound}
                        onClick={handleUpdateRound}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        {submittingRound ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Збереження...</span>
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            <span>Зберегти зміни</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={submittingRound}
                        onClick={handleSaveAsNewRound}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        {submittingRound ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Додавання...</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle size={16} />
                            <span>Зберегти як новий раунд</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={submittingRound}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {submittingRound ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Збереження...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Додати раунд до гри</span>
                        </>
                      )}
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
