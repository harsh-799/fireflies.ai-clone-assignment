# Fireflies.ai Clone Frontend (Next.js + TypeScript + Tailwind)

This is the frontend portal for the Fireflies.ai SDE Fullstack Assignment, recreating the exact layout, colors, spacing, and workflows of the original workspace interface.

---

## Tech Stack
* **Framework**: Next.js (App Router, Client Components)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Icons**: Lucide React

---

## Features Recreated
1. **Demo Authenticator Login Screen**: Styled around the split design from the screenshots, accepting credentials `demo@fireflies.local` / `demo123` to enter the workspace dashboard.
2. **Dashboard / Meetings Library**: Displays title, date, duration, and participants. Includes global search, participant filters, date sorting, and list displays.
3. **Double-Column Workspaces**: Left column houses the media controls and interactive transcripts; right column houses the summary topics and action items toggle boards.
4. **Interactive Transcripts**: Highlights the active segment playing, scrolls active segment into view automatically during play, allows seeking the playback time by clicking transcript text, and highlights custom search queries.
5. **Bonus Actions**: Includes segment highlights and comment bubbles, allowing direct edits to transcript segments.
6. **AI Summary Outline & Action Cards**: Extracts and manages action items, supporting creation, updating, completion toggling, and deletion.
7. **Export formats**: Integrated markdown download streams.

---

## Quick Start Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API URL** (Optional):
   Create a `.env.local` file to specify your FastAPI server url (defaults to `http://localhost:8000`):
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:8000"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

4. **Sign In**:
   Use the demo credentials:
   * **Email**: `demo@fireflies.local`
   * **Password**: `demo123`
