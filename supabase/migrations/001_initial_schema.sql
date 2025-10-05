-- MyBoss Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Boss evaluation dimensions enum
CREATE TYPE boss_dimension AS ENUM (
  'business',      -- 业务水平
  'leadership',    -- 指挥水平
  'communication', -- 沟通水平
  'accountability',-- 背锅水平
  'care'          -- 关怀水平
);

-- Answer type enum
CREATE TYPE answer_type AS ENUM ('yes', 'no', 'unsure');

-- Questions table (50 questions in total)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  dimension boss_dimension NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on dimension for faster random selection
CREATE INDEX idx_questions_dimension ON questions(dimension);

-- Evaluations table (survey submissions)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boss_identifier TEXT, -- Optional: name, phone, wechat, etc.
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  dimension_scores JSONB NOT NULL, -- {business: 20, leadership: 15, ...}
  ai_evaluation TEXT, -- GPT-4o-mini generated evaluation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for boss search and ranking
CREATE INDEX idx_evaluations_boss_identifier ON evaluations(boss_identifier) WHERE boss_identifier IS NOT NULL;
CREATE INDEX idx_evaluations_total_score ON evaluations(total_score);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at DESC);

-- Evaluation answers table (individual question responses)
CREATE TABLE evaluation_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  answer answer_type NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for querying answers by evaluation
CREATE INDEX idx_evaluation_answers_evaluation_id ON evaluation_answers(evaluation_id);

-- Function to calculate percentile ranking
CREATE OR REPLACE FUNCTION get_boss_percentile(boss_score INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  total_count INTEGER;
  worse_count INTEGER;
  percentile NUMERIC;
BEGIN
  -- Get total number of evaluations
  SELECT COUNT(*) INTO total_count FROM evaluations;

  -- Handle case with no or single evaluation
  IF total_count <= 1 THEN
    RETURN 50.0;
  END IF;

  -- Count evaluations with lower scores (worse bosses)
  SELECT COUNT(*) INTO worse_count
  FROM evaluations
  WHERE total_score < boss_score;

  -- Calculate percentile (higher score beats more bosses)
  percentile := (worse_count::NUMERIC / total_count::NUMERIC) * 100;

  RETURN ROUND(percentile, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to get random questions ensuring dimension distribution
CREATE OR REPLACE FUNCTION get_random_questions()
RETURNS TABLE (
  id UUID,
  content TEXT,
  dimension boss_dimension
) AS $$
BEGIN
  -- Get 1 question from each dimension (5 total)
  RETURN QUERY
  (
    SELECT q.id, q.content, q.dimension
    FROM questions q
    WHERE q.dimension = 'business'
    ORDER BY RANDOM()
    LIMIT 1
  )
  UNION ALL
  (
    SELECT q.id, q.content, q.dimension
    FROM questions q
    WHERE q.dimension = 'leadership'
    ORDER BY RANDOM()
    LIMIT 1
  )
  UNION ALL
  (
    SELECT q.id, q.content, q.dimension
    FROM questions q
    WHERE q.dimension = 'communication'
    ORDER BY RANDOM()
    LIMIT 1
  )
  UNION ALL
  (
    SELECT q.id, q.content, q.dimension
    FROM questions q
    WHERE q.dimension = 'accountability'
    ORDER BY RANDOM()
    LIMIT 1
  )
  UNION ALL
  (
    SELECT q.id, q.content, q.dimension
    FROM questions q
    WHERE q.dimension = 'care'
    ORDER BY RANDOM()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_answers ENABLE ROW LEVEL SECURITY;

-- Public read access policies (no authentication required)
CREATE POLICY "Public read access for questions"
  ON questions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for evaluations"
  ON evaluations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for evaluation_answers"
  ON evaluation_answers FOR SELECT
  TO public
  USING (true);

-- Public insert access policies (allow anonymous submissions)
CREATE POLICY "Public insert access for evaluations"
  ON evaluations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public insert access for evaluation_answers"
  ON evaluation_answers FOR INSERT
  TO public
  WITH CHECK (true);
