// Mock schema.sql for the actual Supabase initialization in Phase 2
export const schema = `
-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generations Table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  service TEXT NOT NULL, -- e.g. 'image', 'video', 'copy', etc.
  input_data JSONB NOT NULL,
  output_url TEXT,
  style TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'error'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files Table (Optional for raw file storage refs)
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  type TEXT NOT NULL
);
`;
