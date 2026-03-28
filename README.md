# SafeCircle 🌿

**Nepal–US AI Hackathon 2026 — Problem Statement 2**

> An anonymous peer support platform for mental wellness in culturally conservative communities.

---

## What is SafeCircle?

SafeCircle is a free, anonymous, community-driven peer support platform where people can express their mental health struggles, connect with others who understand them, and receive human and AI-assisted support — without fear of identity exposure, judgment, or cost.

Built for South Asian communities where mental health stigma remains high, SafeCircle removes the three biggest barriers to early support: **cost** (free), **identity** (anonymous by default), and **stigma** (community-normalised).

---

## Features

### 🟢 The Reach Button
A subtle, one-tap signal a user can send when they're struggling but not ready to speak. Silent. Anonymous. The community sees you without you having to say a word.

### 💬 Anonymous Feed
A Reddit-style post feed designed for emotional safety — no engagement metrics, no real names. Post how you feel and receive genuine support from the community.

### 📊 AI Wellbeing Metric
A background AI system that tracks emotional tone across posts and check-ins, generating a personal wellbeing score visible **only to the user**. Automatically surfaces crisis resources when the score drops critically low.

### 🤝 AI Check-in Companion
A conversational AI companion (powered by the Anthropic API) that serves as a gentle first point of contact. Not a replacement for therapy — a bridge that helps people take the first step.

---

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** CSS custom properties (no framework — full design control)
- **AI Companion:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Icons:** Lucide React

---

## Setup & Running

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
# Clone the repo
git clone <your-repo-url>
cd safecircle

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## Team

| Name | Role |
|------|------|
| Alka Neupane | Concept Lead / Design Lead |
| Bhaju Khanal | Team Lead / Strategy |
| Abhinav Purja Pun | Technical Lead / Prototype |
| Leeha Chhantyal | AI Feature & Backend Developer |
| Abina KC | UX / Design / Business |

---

## Notes for Judges

- The **Reach button** is our most original feature — a silent distress signal that requires no words.
- All posts are anonymous by default. The platform has no engagement metrics by design.
- The AI Companion uses the Anthropic API with a culturally-aware system prompt designed for South Asian communities.
- Crisis resources (iCall Nepal, Crisis Text Line) are surfaced automatically when distress signals are detected.
- Business model: grant/NGO funded, with institutional (university/employer) partnerships for sustainability. Individual users are always free.

---

*SafeCircle — Nepal–US AI Hackathon 2026*
