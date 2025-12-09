-- AI-Powered RFP Automation Dashboard Database Schema
-- This file contains the complete schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFPs table
CREATE TABLE IF NOT EXISTS rfps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  source VARCHAR(255),
  source_url TEXT,
  website VARCHAR(500),
  submission_date DATE,
  detected_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'submitted')),
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  specs JSONB DEFAULT '[]'::jsonb,
  products JSONB DEFAULT '[]'::jsonb,
  pricing JSONB DEFAULT '{}'::jsonb,
  file_path VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_type VARCHAR(50) NOT NULL CHECK (agent_type IN ('sales', 'technical', 'pricing', 'report', 'master')),
  color VARCHAR(100),
  ai_model VARCHAR(100),
  system_prompt TEXT,
  status VARCHAR(50) DEFAULT 'idle' CHECK (status IN ('active', 'idle')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent tasks table
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  rfp_id UUID REFERENCES rfps(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  actions JSONB DEFAULT '[]'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfp_id UUID REFERENCES rfps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rfp_name VARCHAR(500),
  content TEXT,
  summary JSONB DEFAULT '{}'::jsonb,
  file_path VARCHAR(500),
  match_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  rfp_source_urls JSONB DEFAULT '[]'::jsonb,
  auto_scan_enabled BOOLEAN DEFAULT true,
  scan_interval_hours INTEGER DEFAULT 6,
  webhook_url VARCHAR(500),
  match_threshold INTEGER DEFAULT 70 CHECK (match_threshold >= 0 AND match_threshold <= 100),
  auto_response_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rfps_user_id ON rfps(user_id);
CREATE INDEX IF NOT EXISTS idx_rfps_status ON rfps(status);
CREATE INDEX IF NOT EXISTS idx_rfps_detected_date ON rfps(detected_date DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_rfp_id ON agent_tasks(rfp_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_reports_rfp_id ON reports(rfp_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rfps_updated_at ON rfps;
CREATE TRIGGER update_rfps_updated_at BEFORE UPDATE ON rfps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
