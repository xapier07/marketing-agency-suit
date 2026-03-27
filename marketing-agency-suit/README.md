# QuadriLabs AI - Demo Deployment

QuadriLabs is a fully functional AI content platform for e-commerce businesses. This is the **Phase 1 MVP Demo**, intended for client presentation and functional walkthroughs.

## Features Included (Phase 1)
1. **AI Product Image Studio**: Generate product lifestyle images, studio shots, and ad banners.
2. **AI UGC/Studio Video Generator**: Create engaging promotional videos automatically.
3. **AI Performance Marketing Copywriter**: Generate high-converting ad copy, hooks, and headlines.
4. **AI SEO & Blog Engine**: Produce SEO-optimized long-form blog articles.
5. **AI Product Description Gen**: Write compelling product features, benefits, and bullet points.
6. **AI UGC Script Generator**: Get structured UGC video scripts with hooks and CTAs.

## Getting Started Locally

Since the codebase was manually generated without \`npx\` (due to local environment constraints), follow these steps to install and run the project:

1. **Install Node.js & NPM** 
   Ensure you have Node.js (v18+) installed.
2. **Install Dependencies**
   Run the following in the terminal:
   \`\`\`bash
   npm install
   \`\`\`
3. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000)

## Demo Deployment (Vercel / Netlify)

This project uses Next.js (App Router) and is highly optimized for Vercel deployment.

1. Create a GitHub repository and push this codebase.
2. Go to [Vercel](https://vercel.com) and import your repository.
3. Keep the default Build Command (\`next build\`) and Install Command (\`npm install\`).
4. Set Environment Variables if necessary (for Phase 1 demo, none are strictly required since it utilizes mock APIs).
5. Deploy! The app will immediately be live and functional for your client pitch.

---

## Phase 2 Upgrade Guide (Agency/White-label Implementation)

When the client approves the demo, the application should be upgraded from a mock demo to a real **Agency-managed multi-tenant system**. (Note: Instead of a public SaaS with Stripe, this will be manually provisioned by the agency for their clients).

### 1. Database (Supabase PostgreSQL)
- Open `schema.sql` and run it in your Supabase SQL Editor.
- Update `src/lib/db.js` to connect securely using the \`@supabase/supabase-js\` client instead of the mock in-memory variables.
- Required Environment Variables:
  - \`NEXT_PUBLIC_SUPABASE_URL\`
  - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

### 2. Authentication & Admin Panel (Manual Provisioning)
- Implement Supabase Auth (or NextAuth.js/Clerk).
- Create an **Admin Panel** under \`/admin\` where the agency owner can manually create accounts (workspaces) for their clients.
- Protect client routes (\`/dashboard\`, \`/projects\`, \`/services/*\`) using Next.js Middleware to ensure clients only see their own assigned workspace/projects.
- Public sign-ups will be disabled; access is invite-only.

### 3. Real AI API Integration
- Update \`src/lib/antigravity.js\` to call actual APIs instead of resolving timeouts.
- Use **OpenAI API** for Text (Copy, Blog, Description, Script).
- Use **Stable Diffusion, OpenAI DALL-E 3, or Leonardo AI** for the Image Studio.
- Use **Sora API / Runway Gen-2 / HeyGen** for the Video generation.
- Configure webhooks (e.g. \`api/webhooks/generation\`) to listen for async generation completions from the video APIs and update the real Supabase Database.

### 4. Client Usage Tracking (Optional)
- Since this isn't a paid SaaS, you won't need Stripe. However, you may want to add a usage ledger in the database to track how many API calls each client makes so the agency can bill them manually at the end of the month based on real API costs.

## Deliverables Checklist
- [x] Beautiful, responsive, stunning UI
- [x] Placeholder Dashboard & Projects Management
- [x] API Route integration for all 6 Services
- [x] Functional Loaders and Download behaviors
- [x] Database Schema and Mocks setup
