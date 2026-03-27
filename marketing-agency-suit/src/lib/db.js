import { v4 as uuidv4 } from "uuid";

// IN-MEMORY MOCK DB FOR DEMO PHASE 1
// In Phase 2, this file gets replaced with official Supabase Client calls.
// Read `schema.sql` for the corresponding Postgres schema.

const dbStore = {
  generations: [],
};

export const db = {
  generations: {
    async insert(data) {
      const record = {
        id: uuidv4(),
        ...data,
        created_at: new Date().toISOString(),
      };
      dbStore.generations.push(record);
      return record;
    },
    
    async getByProjectId(projectId) {
      return dbStore.generations
        .filter((g) => g.project_id === projectId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async getById(id) {
      return dbStore.generations.find((g) => g.id === id);
    },

    async update(id, data) {
      const idx = dbStore.generations.findIndex((g) => g.id === id);
      if (idx === -1) throw new Error("Not found");
      dbStore.generations[idx] = { ...dbStore.generations[idx], ...data };
      return dbStore.generations[idx];
    }
  }
};
