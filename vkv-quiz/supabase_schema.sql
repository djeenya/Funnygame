-- SQL SCHEMA FOR VKV QUIZ GAME
-- Run this in your Supabase Project SQL Editor (https://supabase.com/dashboard)

-- Drop existing tables if they exist to prevent schema conflicts
DROP TABLE IF EXISTS public.rounds CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;

-- Create games table
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create rounds table
CREATE TABLE public.rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'easy_hard', 'youtube_comments', 'blitz_5sec'
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Fields for 'easy_hard' type
    question_easy TEXT,
    options_easy JSONB, -- Array of 4 strings e.g. ["A", "B", "C", "D"]
    correct_answer_easy TEXT,
    question_hard TEXT,
    options_hard JSONB, -- Array of 4 strings e.g. ["A", "B", "C", "D"]
    correct_answer_hard TEXT,
    
    -- Fields for 'youtube_comments' type
    question TEXT, -- e.g. "Який коментар є справжнім?" or general question
    video_url TEXT, -- YouTube URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)
    options JSONB, -- Array of 4 strings (the comments)
    correct_answer TEXT, -- The correct comment text
    
    -- Fields for 'blitz_5sec' type
    -- (uses the question and correct_answer fields)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) to allow the frontend to easily query and insert games/rounds
ALTER TABLE public.games DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to anon, authenticated, and service_role roles to prevent any 'permission denied' errors
GRANT ALL ON public.games TO anon;
GRANT ALL ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;

GRANT ALL ON public.rounds TO anon;
GRANT ALL ON public.rounds TO authenticated;
GRANT ALL ON public.rounds TO service_role;

-- Optional: Insert a sample game to quickly test
INSERT INTO public.games (id, name) VALUES 
('a83efb1c-bc9d-4357-9db6-3e3a479ff7dc', 'Пробне Шоу ВКВ 2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rounds (game_id, type, order_index, question_easy, options_easy, correct_answer_easy, question_hard, options_hard, correct_answer_hard) VALUES
('a83efb1c-bc9d-4357-9db6-3e3a479ff7dc', 'easy_hard', 0, 
'Який колір неба у сонячний день?', '["Синій", "Червоний", "Зелений", "Жовтий"]', 'Синій',
'З якого елементу складається більша частина атмосфери Землі?', '["Кисень", "Азот", "Вуглекислий газ", "Водень"]', 'Азот')
ON CONFLICT DO NOTHING;

INSERT INTO public.rounds (game_id, type, order_index, question, video_url, options, correct_answer) VALUES
('a83efb1c-bc9d-4357-9db6-3e3a479ff7dc', 'youtube_comments', 1,
'Який з цих коментарів є реальним під відео?', 'https://www.youtube.com/watch?v=9bZkp7q19f0',
'["Це шедевр!", "Я дивився це 5 разів поспіль і все одно сміюсь", "Хто це взагалі дивиться в 2026 році?", "Не розумію гумору बिल्कुल"]',
'Це шедевр!')
ON CONFLICT DO NOTHING;

INSERT INTO public.rounds (game_id, type, order_index, question, correct_answer) VALUES
('a83efb1c-bc9d-4357-9db6-3e3a479ff7dc', 'blitz_5sec', 2,
'Назвіть три українські страви за 5 секунд!', 'Борщ, вареники, деруни')
ON CONFLICT DO NOTHING;
