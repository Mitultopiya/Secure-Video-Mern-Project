-- Add policy for admins to view all videos
CREATE POLICY "Admins can view all videos" ON videos 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Add policy for admins to delete any video
CREATE POLICY "Admins can delete any video" ON videos 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Add policy for admins to view all password attempts
CREATE POLICY "Admins can view all password attempts" ON password_attempts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Add policy for admins to view all access logs
CREATE POLICY "Admins can view all access logs" ON video_access_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );
