-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_target INTEGER NOT NULL DEFAULT 365,
  bundle_target INTEGER,
  sr_script_target INTEGER,
  stale_threshold INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dashboard metrics table
CREATE TABLE public.dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_key TEXT NOT NULL UNIQUE,
  metric_name TEXT NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  target_value INTEGER,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metric update history table
CREATE TABLE public.metric_update_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES public.dashboard_metrics(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  previous_value INTEGER NOT NULL,
  new_value INTEGER NOT NULL,
  change_value INTEGER NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_update_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Settings
CREATE POLICY "Users can view settings"
ON public.settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update settings"
ON public.settings FOR UPDATE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

CREATE POLICY "Admins can insert settings"
ON public.settings FOR INSERT TO authenticated WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- Dashboard metrics
CREATE POLICY "Users can view metrics"
ON public.dashboard_metrics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and Editors can update metrics"
ON public.dashboard_metrics FOR UPDATE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'EDITOR')
);

CREATE POLICY "Admins can insert metrics"
ON public.dashboard_metrics FOR INSERT TO authenticated WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- Metric update history
CREATE POLICY "Users can view history"
ON public.metric_update_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and Editors can insert history"
ON public.metric_update_history FOR INSERT TO authenticated WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'EDITOR')
);

-- Activity log
CREATE POLICY "Users can view activity log"
ON public.activity_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own activity"
ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE
ON public.settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_dashboard_metrics_updated_at BEFORE UPDATE
ON public.dashboard_metrics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    -- Make the first user an ADMIN, others VIEWER by default
    CASE 
      WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'ADMIN'
      ELSE 'VIEWER'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert initial data
INSERT INTO public.settings (video_target) VALUES (365);

INSERT INTO public.dashboard_metrics (metric_key, metric_name, current_value, target_value)
VALUES 
  ('videos_uploaded', 'Videos Uploaded', 128, 365),
  ('bundles_left_to_edit', 'Bundles Left to Edit', 42, NULL),
  ('sr_script_ready', 'SR + Script Ready', 78, NULL);
