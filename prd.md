# Personal Tutor AI – Quick Notes

## 1. Project Flow (MVP)

1. **Landing Page → Course Creation Form**
2. **Login** (Google OAuth / Email)
3. **Curriculum Q\&A + Confirmation**
4. **AI Generates Curriculum Overview**
5. **Module / Quiz Interaction**
6. **Course Completion Summary**
7. **Profile & Progress Dashboard**

## 2. Pages

* Landing Page
* Course Creation Page
* Curriculum Confirmation Page
* Curriculum Overview Page
* Module Page (with chat)
* Quiz/Project Page (timer, no chat)
* Course Completion Page
* User Profile

## 3. General TODO / Tickets

```
- [ ] **Landing & Onboarding**
    - [✅] Build landing layout + pricing section (static marketing copy)
    - [ ] Implement “Coba Sekarang” CTA → route to Course Creation

- [ ] **Course Creation**
    - [✅] Two-field form + validation (name & description)
    - [ ] POST to backend → trigger question‑generation prompt (controlled JSON)

- [ ] **Auth**
    - [ ] Google OAuth setup (Firebase/Auth0)
    - [ ] Email/password fallback

- [ ] **Curriculum Q&A**
    - [ ] Render dynamic form from JSON (component loop)
    - [ ] Persist answers (local & backend) (store as array)

- [ ] **Curriculum Generation**
    - [ ] Backend call to LLM with answers (chunking & retries)
    - [ ] Save curriculum structure in DB

- [ ] **Overview Page**
    - [ ] Display modules & sub‑courses (accordion UI)

- [ ] **Module Page**
    - [ ] Markdown material + chat window (stream AI responses)
    - [ ] Track completion state (progress API)

- [ ] **Quiz Page**
    - [ ] Timer logic & disable chat
    - [ ] Auto‑grading placeholder

- [ ] **Completion**
    - [ ] Generate summary & certificate stub (PDF later)

- [ ] **Profile**
    - [ ] List active/completed courses (progress bar)
    - [ ] Download certificate (stub)

- [ ] **DevOps**
    - [ ] Env config, CI/CD pipeline

- [ ] **Analytics**
    - [ ] Basic event tracking (activation, completion)
```

## 4. Project Structure
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── prd.md
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   ├── window.svg
├── README.md
├── src
│   ├── app
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
├── tsconfig.json