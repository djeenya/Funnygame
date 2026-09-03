export interface TeamSetup {
  name: string;
  players: [string, string];
}

export interface GameSettings {
  team1: TeamSetup;
  team2: TeamSetup;
  first_turn_team: 1 | 2; // 1 = Team 1 starts round 1, 2 = Team 2 starts
}

export interface Game {
  id: string;
  name: string;
  settings?: GameSettings;
  created_at?: string;
}

export type RoundType =
  | 'easy_hard' // Раунд 1: «Підстава» (8 карток)
  | 'pidstava'
  | 'youtube_comments' // Раунд 2: «Коментарі» (4 гри: 4 відео + 4 коментарі, 4-3-2-1 бали)
  | 'comments'
  | 'blitz_5sec' // Раунд 3: «5/10» (8 питань, 10с таймер, по 2 на кожного з 4 гравців)
  | 'blitz_5_10'
  | 'alias'; // Раунд 4: «Еліас» (71с / 01:11 таймер, пульт ведучого, паперові картки)

// Раунд 1: «Підстава» (8 карток / тем)
export interface PidstavaCard {
  id?: number | string;
  topic: string; // Яскрава/смішна назва теми
  easy_question: string; // Текст легкого питання (1 бал)
  easy_answer: string; // Правильна відповідь на легке
  easy_fact?: string; // Цікавий факт до легкого запитання (необов'язково)
  hard_question: string; // Текст складного питання (2 бали)
  hard_answer: string; // Правильна відповідь на складне
  hard_fact?: string; // Цікавий факт до складного запитання (необов'язково)

  // Legacy compatibility fields if any
  fact?: string;
  question_easy?: string;
  correct_answer_easy?: string;
  question_hard?: string;
  correct_answer_hard?: string;
  options_easy?: string[];
  options_hard?: string[];
}

export type EasyHardCard = PidstavaCard;

// Раунд 2: «Коментарі» (4 гри в раунді)
export interface CommentGame {
  id?: number | string;
  correct_video: string; // 1 правильна назва відео
  fake_videos: string[]; // 3 фейкові варіанти (всього 4 варіанти відео)
  comments: string[]; // 4 коментарі-підказки, які відкриваються по черзі
  options?: string[]; // 4 варіанти назв відео (А, Б, В, Г)
  correct_answer_index?: number; // Індекс правильної відповіді у масиві options
  video_url?: string; // Опціональне посилання на відео
}

// Раунд 3: «5/10» (8 бліц-питань без варіантів відповідей)
export interface BlitzQuestion {
  id?: number | string;
  question: string;
}

export interface Round {
  id: string;
  game_id: string;
  type: RoundType;
  order_index: number;

  // Раунд 1: Підстава (8 карток)
  cards?: PidstavaCard[];

  // Раунд 2: Коментарі (4 гри)
  comment_games?: CommentGame[];
  games?: CommentGame[];

  // Раунд 3: 5/10 (8 питань)
  blitz_questions?: (BlitzQuestion | string)[];
  questions?: (BlitzQuestion | string)[];

  // Раунд 4: Еліас / Загальні поля
  question?: string;
  timer_seconds?: number;
  config?: { timer_seconds?: number;[key: string]: any };
  words?: string[];
  options?: string[];
  video_url?: string;
  correct_answer?: string;

  // Legacy single card support
  question_easy?: string;
  options_easy?: string[];
  correct_answer_easy?: string;
  question_hard?: string;
  options_hard?: string[];
  correct_answer_hard?: string;

  // General JSON data payload for Supabase compatibility
  data?: Record<string, any>;

  created_at?: string;
}



