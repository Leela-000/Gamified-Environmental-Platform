# ProductVision (Game Web App)

ProductVision is a full-stack learning and engagement platform focused on eco-awareness. It combines tasks, announcements, assignments, quizzes, and bite-sized mini-games into a single experience with leaderboards and admin tools.

## What this app is about
- Encourage students to take eco-friendly actions via tasks and assignments with teacher review and points.
- Offer bite-sized mini-games about sustainability; points are credited once per game per student.
- Run quizzes at two scopes: Global (admin) and School (teacher), scored securely server-side.
- Provide leaderboards for schools, students, and teachers, plus previews and admin analytics.
- Include a clean admin portal to manage users, global content (quizzes/announcements/assignments), and games.

## Tech stack
- Frontend: React + Vite, Tailwind-style tokens, Radix UI, Wouter routing
- Backend: Express + TypeScript (in-memory storage persisted to `server/data.json`)
- Build: Vite for client, esbuild for server bundle

## Key features
- Sign up and approval flows for students and teachers
- Teacher tasks with photo proof, multi-photo submission, and group mode
- Announcements and Assignments (School + Global)
- Quizzes (Global + School) with server-side scoring and one-attempt rule
- Games: 15+ mini-games; server enforces one-time points per game per user
- Leaderboards: global schools/students/teachers with previews and admin analytics
- Notifications and weekly streaks on student profile

## How to run
1. Install dependencies
   - npm install
2. Start dev server
   - npm run dev
3. Open the client (Vite serves the SPA) at the port printed by the server; API runs under `/api/*`.

Notes
- The server persists in-memory state to `server/data.json`.
- Demo seeders are included for quick content and leaderboard demos.

## Test accounts (for quick login)
- Admin: username `admin123`, password `admin@1234`
- Teacher: username `test_teacher`, password `123@123`
- Student: username `test_student`, password `123@123`

These accounts are auto-seeded on first run. You can change passwords via the Admin Portal.

## Admin Portal overview
- Approval List: approve pending students/teachers
- Manage Admin Accounts: create/edit/delete admin users (main admin restrictions apply)
- Manage All Accounts: view details, set custom passwords, move users back to pending
- Challenges & Games: manage the games catalog (create/edit/delete)
- Quizzes Management: CRUD for global quizzes
- Schools & Colleges: add/remove schools
- Global Announcements and Global Assignments: create and list global items

## Security and constraints
- Quiz scoring is server-side; answers are not sent in public endpoints
- One attempt per quiz per student
- Games award points only once per game per student (server-enforced)
- Basic throttling prevents rapid duplicate game plays

## Troubleshooting
- If client HMR or build behaves oddly after dependency changes, stop and re-run `npm run dev`.
- Check the server console for logs (e.g., OTP codes for the demo).

