-- Insert initial user roles (assuming users are created via Auth UI first)
-- You will need to manually map UUIDs if you want to pre-seed specific profiles.
-- For now, the handle_new_user trigger will take care of creating profiles when users sign up.

-- Ensure settings exist
INSERT INTO public.settings (video_target) VALUES (365)
ON CONFLICT (id) DO NOTHING;

-- Initial dashboard metrics
INSERT INTO public.dashboard_metrics (metric_key, metric_name, current_value, target_value)
VALUES 
  ('videos_uploaded', 'Videos Uploaded', 128, 365),
  ('bundles_left_to_edit', 'Bundles Left to Edit', 42, NULL),
  ('sr_script_ready', 'SR + Script Ready', 78, NULL)
ON CONFLICT (metric_key) DO UPDATE 
SET current_value = EXCLUDED.current_value;
