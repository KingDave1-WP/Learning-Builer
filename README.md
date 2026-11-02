# 🚀 AI Learning Builder — Team Cheat Sheet & Project Plan

## 📌 Project Overview & Goals
* **Objective:** Build and ship a polished web app in **2 weeks (10 working days)** that lets teachers generate interactive learning activities using AI.
* **Chosen Path:** **Option 1 — Quiz & Activity Builder**.
* **Target User:** Non-technical teachers (10 minutes to spare).
* **End User:** Students playing on mobile phones with **no login required**.
* **Success Criteria:** A live, reliable app, small pull requests, strictly secured API keys, and 100% team code understanding.

---

## 🛠️ The Core Tech Stack
| Layer | Tool | Purpose |
| :--- | :--- | :--- |
| **Language** | **TypeScript** (`.ts` / `.tsx`) | Type safety, clean code, and full integration with Zod & Claude. |
| **Framework** | **Next.js (App Router)** | Combines React UI and backend API routes in a single repo. |
| **Editor** | **VS Code** | Code editing (Extensions: *Prettier*, *Tailwind CSS IntelliSense*, *GitLens*). |
| **Database & Auth** | **Supabase** | Teacher login & saving activities with **Row-Level Security (RLS)**. |
| **Hosting & CI/CD** | **Vercel** | Deployment, serverless functions, and automatic branch previews. |
| **AI Model** | **Claude API (`claude-sonnet-5-5`)** | Generates activity content structured strictly as JSON via Zod. |
| **Validation** | **Zod** | Schema validation to catch invalid JSON before displaying to teachers. |
| **Styling** | **Tailwind CSS** | Fast, responsive styling tailored for mobile phone screens. |

---

## 📂 Recommended Directory Structure

```text
my-learning-builder/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts        # Secure backend route for calling Claude API
│   ├── a/
│   │   └── [id]/
│   │       └── page.tsx        # Public link for students (/a/<id>) - No login needed
│   ├── dashboard/
│   │   └── page.tsx            # Teacher dashboard (view/manage activities)
│   ├── login/
│   │   └── page.tsx            # Teacher authentication
│   └── page.tsx                # Landing page
├── components/
│   ├── templates/              # Core student activity views
│   │   ├── MultipleChoice.tsx
│   │   ├── TrueFalse.tsx
│   │   ├── Flashcards.tsx
│   │   ├── MatchingPairs.tsx
│   │   └── PutInOrder.tsx
│   ├── ChatSidebar.tsx         # AI prompt & refinement chat
│   └── DirectEditor.tsx        # Direct manual editing of JSON content
├── lib/
│   ├── supabase.ts             # Supabase client setup
│   └── schemas.ts              # Zod schemas for all activity types
├── .env.local                  # Local secrets (NEVER COMMIT THIS FILE)
└── package.json
```

---

## 🔒 5 Non-Negotiable Rules (Read Carefully!)

1. **Keep Secrets Secret:** API keys live **ONLY** in server environment variables (Vercel / `.env.local`). Never commit keys, put them in frontend code, or post them in chat.
2. **Use Fake Mode for Interface Work:** Create a setting/mock handler in `/api/generate` so UI testing uses sample local JSON instead of burning real API dollars. Only switch to Sonnet 5.5 when testing real generation.
3. **No Direct HTML Rendering:** Insert AI text cleanly as string data into pre-tested React templates. Never use `dangerouslySetInnerHTML`.
4. **Row-Level Security (RLS) Day 1:** Supabase database tables must be restricted so teachers can only view and edit their own activities. Test with 2 separate accounts!
5. **Team Code Ownership:** You are responsible for every line merged. "The AI agent wrote it" will result in a failed check during the demo evaluation.

---

## 🎯 Option 1 Core Activity Types & Requirements

### Core Templates (Week 1 Priority)
1. **Multiple Choice:** 4 options per question, exactly 1 correct, short explanation.
2. **True / False:** Statement, true/false toggle, explanation.
3. **Flashcards:** Front (prompt/question) and Back (answer).
4. **Matching Pairs:** Terms and matching definitions (shuffled on load).
5. **Put in Order:** Sequence of steps/events (AI returns correct order; your code shuffles it for the student).

### Content Validation Rules (Zod + Custom Checks)
* Exactly **1** correct answer for multiple-choice.
* No duplicate choices/items in a single question.
* Sensible character limits (fit cleanly on mobile screens).
* Automatic **1 retry loop**: If JSON fails checks, send the error back to Claude once. If it fails twice, fall back gracefully to the previous working version.

---

## 📅 10-Day Execution Timeline

```text
Week 1: Core Functionality & Demo
├── Day 1: Setup GitHub, Supabase, Vercel, and Next.js skeleton. Login works live.
├── Day 2: Build Fake Mode in /api/generate and test end-to-end API pipeline.
├── Day 3: Build Multiple Choice template & complete prompt-to-preview loop.
├── Day 4: Implement public student link (/a/<id>) & remaining 4 core templates.
└── Day 5: Week 1 Live Demo (Show working core app).

Week 2: Reliability, Polishing & Stretch Goals
├── Day 6: Content checks, auto-retry loop, and friendly error states.
├── Day 7: Direct editing (manual tweaking of AI text without re-prompting).
├── Day 8: Mobile UI polish, extra stretch goals (e.g., extra templates, POPIA results).
├── Day 9: Testing with 10 real teacher prompt scenarios & edge-case bug fixes.
└── Day 10: DEMO DAY (10-min presentation + live un-seen teacher test).
```

---

## 💡 Workflow for AI Coding Agents
* **Plan First:** Ask the AI agent for an execution plan, review it, refine it, and *then* let it generate code.
* **Small Pull Requests (PRs):** Work in short branches. One feature per PR. Require a team member to review before merging to `main`.
* **Logbook:** Maintain daily notes detailing what was built, where the agent failed, and how you resolved issues.
