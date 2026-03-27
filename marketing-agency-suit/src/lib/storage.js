/**
 * Storage Abstraction
 * Phase 1: Mocks file upload and returns static URLs.
 * Phase 2: Will integrate with Supabase Storage or Cloudinary.
 */

export const storage = {
  async uploadFile(fileBuffer, filename, folder = "general") {
    // Simulating upload delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // In demo, we just return a placeholder mock depending on the folder/file type
    // If it's real integration, implementation goes here
    
    if (folder === "images") {
      return \`https://source.unsplash.com/random/800x800/?product&\${Date.now()}\`;
    }
    
    if (folder === "videos") {
      return "https://www.w3schools.com/html/mov_bbb.mp4"; // Sample public video
    }

    return "https://example.com/mock-file.pdf";
  },

  async getDownloadUrl(path) {
    // In mock, path is fully qualified URL
    return path;
  }
};
