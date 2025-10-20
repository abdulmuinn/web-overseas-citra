-- Drop existing trigger first
DROP TRIGGER IF EXISTS application_match_score_trigger ON applications;

-- Function to calculate job match score
CREATE OR REPLACE FUNCTION public.calculate_match_score(
  p_user_id uuid,
  p_job_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score integer := 0;
  v_profile RECORD;
  v_job RECORD;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = p_user_id;
  
  -- Get job details
  SELECT * INTO v_job
  FROM jobs
  WHERE id = p_job_id;
  
  IF v_profile IS NULL OR v_job IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Country match (30 points)
  IF v_profile.target_country = v_job.country THEN
    v_score := v_score + 30;
  END IF;
  
  -- Experience match (30 points)
  IF v_job.min_experience IS NOT NULL THEN
    IF v_profile.experience_years >= v_job.min_experience THEN
      v_score := v_score + 30;
    ELSIF v_profile.experience_years >= (v_job.min_experience - 1) THEN
      -- Close enough - partial points
      v_score := v_score + 15;
    END IF;
  ELSE
    -- No experience required - full points
    v_score := v_score + 30;
  END IF;
  
  -- Education match (20 points)
  IF v_job.required_education IS NOT NULL AND v_profile.education_level IS NOT NULL THEN
    IF LOWER(v_profile.education_level) = LOWER(v_job.required_education) THEN
      v_score := v_score + 20;
    ELSIF v_profile.education_level IS NOT NULL THEN
      -- Has education - partial points
      v_score := v_score + 10;
    END IF;
  ELSIF v_job.required_education IS NULL THEN
    -- No education required - full points
    v_score := v_score + 20;
  END IF;
  
  -- Profile completeness bonus (20 points)
  IF v_profile.full_name IS NOT NULL THEN
    v_score := v_score + 5;
  END IF;
  IF v_profile.phone IS NOT NULL THEN
    v_score := v_score + 5;
  END IF;
  IF v_profile.languages IS NOT NULL AND array_length(v_profile.languages, 1) > 0 THEN
    v_score := v_score + 10;
  END IF;
  
  RETURN v_score;
END;
$$;

-- Trigger to auto-calculate match score on application insert
CREATE OR REPLACE FUNCTION public.update_application_match_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.match_score := public.calculate_match_score(NEW.user_id, NEW.job_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER application_match_score_trigger
  BEFORE INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_application_match_score();