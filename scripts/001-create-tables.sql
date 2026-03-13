-- Videos table to store video metadata
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  blob_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  duration INTEGER, -- in seconds
  thumbnail_url TEXT,
  view_count INTEGER DEFAULT 0,
  -- Password protection fields
  password_hash TEXT, -- bcrypt hash, NULL means no password
  password_expires_at TIMESTAMPTZ, -- NULL means never expires
  allow_expired_password BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookups
CREATE INDEX idx_videos_slug ON videos(slug);
CREATE INDEX idx_videos_user_id ON videos(user_id);

-- Password attempts tracking for rate limiting
CREATE TABLE password_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT false
);

CREATE INDEX idx_password_attempts_video_ip ON password_attempts(video_id, ip_address);
CREATE INDEX idx_password_attempts_attempted_at ON password_attempts(attempted_at);

-- Video access logs for analytics
CREATE TABLE video_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_access_logs_video_id ON video_access_logs(video_id);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_access_logs ENABLE ROW LEVEL SECURITY;

-- Videos RLS policies
-- Users can view their own videos
CREATE POLICY "Users can view own videos" ON videos 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own videos
CREATE POLICY "Users can insert own videos" ON videos 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own videos
CREATE POLICY "Users can update own videos" ON videos 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own videos
CREATE POLICY "Users can delete own videos" ON videos 
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access to videos by slug (for playback page)
CREATE POLICY "Public can view videos by slug" ON videos 
  FOR SELECT USING (true);

-- Password attempts: allow inserts from anyone (for rate limiting)
CREATE POLICY "Anyone can insert password attempts" ON password_attempts 
  FOR INSERT WITH CHECK (true);

-- Password attempts: users can view attempts on their videos
CREATE POLICY "Users can view attempts on own videos" ON password_attempts 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM videos WHERE videos.id = video_id AND videos.user_id = auth.uid())
  );

-- Video access logs: allow inserts from anyone
CREATE POLICY "Anyone can insert access logs" ON video_access_logs 
  FOR INSERT WITH CHECK (true);

-- Video access logs: users can view logs for their videos
CREATE POLICY "Users can view access logs for own videos" ON video_access_logs 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM videos WHERE videos.id = video_id AND videos.user_id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for videos updated_at
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
