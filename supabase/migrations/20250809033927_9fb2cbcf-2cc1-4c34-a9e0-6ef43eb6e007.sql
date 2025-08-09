-- Fix the cleanup function search path issue
CREATE OR REPLACE FUNCTION public.cleanup_old_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete files from storage that were downloaded more than 10 minutes ago
  WITH files_to_delete AS (
    SELECT file_path 
    FROM invoices 
    WHERE downloaded_at IS NOT NULL 
    AND downloaded_at < NOW() - INTERVAL '10 minutes'
  )
  DELETE FROM invoices 
  WHERE file_path IN (SELECT file_path FROM files_to_delete);
  
END;
$$;