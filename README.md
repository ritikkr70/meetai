# MeetAI

MeetAI is an intelligent meeting platform that uses AI agents to transcribe, record, and summarize your meetings. Create custom agents with specific instructions to assist you in your meetings.

## Features

- **User Authentication:** Secure sign-up and sign-in with email/password, Google, or GitHub.
- **AI Agent Creation:** Create and manage AI agents with custom instructions and personalities.
- **Meeting Scheduling:** Schedule meetings with your AI agents.
- **Real-time Transcription:** Get a live transcript of your meetings.
- **Meeting Recording:** Record your meetings for later review.
- **AI-Powered Summaries:** Automatically generate summaries of your meetings using OpenAI.
- **Dashboard:** View and manage your upcoming, active, and completed meetings.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (with Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **UI:** [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com)
- **Database:** [Neon](https://neon.tech) (Serverless Postgres) with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication:** [@polar-sh/better-auth](https://github.com/polarsource/better-auth)
- **API:** [tRPC](https://trpc.io)
- **Background Jobs:** [Inngest](https://www.inngest.com)
- **Real-time Communication:** [Stream.io](https://getstream.io) (for video and chat)
- **AI:** [OpenAI API](https://openai.com/api)
- **Styling:** [Tailwind CSS](https://tailwindcss.com), [lucide-react](https://lucide.dev/icons) for icons
- **Form Management:** [React Hook Form](https://react-hook-form.com) with [Zod](https://zod.dev) for validation
- **Data Fetching/State Management:** [@tanstack/react-query](https://tanstack.com/query/latest) (via tRPC)

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [npm](https://www.npmjs.com)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/meetai.git
    cd meetai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file by copying the example file:
        ```bash
        cp .env.example .env
        ```
    -   Fill in the required values in the `.env` file. You will need API keys and credentials for the services listed in the file (Database, OpenAI, GitHub/Google OAuth, Stream).

4.  **Set up the database:**
    -   Run the following command to push the schema to your database:
        ```bash
        npm run db:push
        ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
