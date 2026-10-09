This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Follow these steps to run ErrorPal Pro locally on your machine:

**First:** Prerequisites
Ensure you have the following installed:

```bash
Node.js (v18+) 

Ollama 
```
INSTALLATION LINKS:

https://nodejs.org/en/download

https://ollama.com/download

**Second:** Pull the Local AI Model
Open your terminal and download the coding-optimized Qwen 2.5 3B model locally:

Bash

```bash
ollama pull qwen2.5-coder:0.5b
```

**Third:** Start the Ollama Service

Ensure your local inference engine is running in the background:

Open your terminal and run

Bash

```bash
ollama serve
or
ollama run qwen2.5-coder:0.5b

if output when the other one is inputted:

Error: listen tcp 127.0.0.1:11434: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.

-its running
```


**Fourth:** Install Dependencies
Clone the repository and install the project packages:

Bash

```bash
npm install - do inside the folder of the project (C:\..\errorpal-local-ai)
```

**Fifth:** Launch the Development Server
Start the local development server:

Bash

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

inside (C:\..\errorpal-local-ai)
```

**Lastly:** Open the Workspace
Open your web browser and navigate to:

Plaintext
http://localhost:3000

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
