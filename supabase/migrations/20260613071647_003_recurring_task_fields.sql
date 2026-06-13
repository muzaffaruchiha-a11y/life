-- Add recurring task fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type TEXT NOT NULL DEFAULT 'one_time' CHECK (task_type IN ('one_time', 'recurring'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_completed_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_count_today INT NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS max_completions_per_day INT NOT NULL DEFAULT 1;

-- Migrate existing recurrence-based tasks to new task_type
UPDATE tasks SET task_type = 'recurring' WHERE recurrence IN ('daily', 'weekly', 'monthly', 'custom');
UPDATE tasks SET task_type = 'one_time' WHERE recurrence = 'once';

-- Add index for daily reset queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_type ON tasks(user_id, task_type);
