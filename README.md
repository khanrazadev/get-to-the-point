# GET TO THE POINT

> Turn long videos and audio into something you can actually use.

I built **Get To The Point** because I don't always want to watch an entire video just to find one idea or answer.

The first version could have been simple:

```text
Video → Transcript → LLM → Summary
```

But I wanted to understand how **RAG** actually works, so I built the retrieval part myself.

Now you can paste a YouTube or public Instagram URL or upload audio/video, get the transcript and summary, and ask questions about the content.

---

## What it does

- YouTube video processing
- Public Instagram Reel processing
- Audio and video uploads
- Speech-to-text transcription
- Automatic summaries
- Transcript search using embeddings
- RAG-based chat
- Persistent chat history
- User authentication
- Duplicate URL detection
- Background content processing
- Temporary media cleanup

---

## How the RAG part works

The main pipeline looks like this:

```text
YouTube / Instagram / Upload
            ↓
         FFmpeg
            ↓
      Transcription
            ↓
         Chunking
            ↓
        Embeddings
            ↓
  PostgreSQL + pgvector
            ↓
      User Question
            ↓
    Question Embedding
            ↓
      Vector Search
            ↓
     Relevance Check
       ↙         ↘
    Good         Weak
     ↓            ↓
Retrieved Chunks   Content Summary
       ↘         ↙
        Qwen LLM
           ↓
        Answer
```

The important part is that I don't send the whole transcript to the LLM every time.

When a question comes in, I first find the parts of the transcript that are most related to the question. Those parts are then given to the model as context.

This makes the answer tied to the actual content instead of asking the model to guess from a huge transcript.

---

## One problem I had to solve

Vector search will always try to give you a result.

Even if you ask something completely unrelated.

For example, if the video is about anime merchandise and I ask:

> "What is the capital of France?"

the search still returns some chunks.

So I added a **relevance threshold**.

```text
Good match
   ↓
Use retrieved chunks

Weak match
   ↓
Use the content summary

Still not enough information
   ↓
"I don't know based on the provided content."
```

This was one of the more useful things I learned while building the project:

**The highest similarity result is not automatically a relevant result.**

---

## Duplicate URLs

I also didn't want the same video to be downloaded, transcribed, embedded, and summarized again every time the same URL was pasted.

So the backend normalizes URLs and checks the user's existing library before downloading anything.

```text
URL
 ↓
Normalize
 ↓
Check user's library
 ↓
Already exists?
    ↙      ↘
  YES        NO
   ↓          ↓
  409      Download
              ↓
           Process
```

For example, YouTube URLs such as:

```text
https://www.youtube.com/watch?v=ABC123

https://youtu.be/ABC123
```

are treated as the same video.

Instagram tracking parameters are also ignored when checking for duplicates.

This check happens before `yt-dlp`, so duplicate submissions don't waste transcription or embedding usage.

---

## Instagram

Public Instagram Reels are supported using `yt-dlp`.

Private or inaccessible Instagram content isn't supported.

If an inaccessible Reel is submitted, the backend returns an error immediately instead of creating a content record that sits around waiting to fail.

I intentionally kept Instagram authentication and private-account support out of the project.

---

## Why PostgreSQL + pgvector?

I wanted to keep the architecture simple.

PostgreSQL already stores:

- Users
- Content
- Transcripts
- Summaries
- Chat sessions
- Messages

With `pgvector`, it can also store and search the embeddings.

So I didn't need another database just for vectors.

---

## Why I didn't use LangChain

I wanted to understand what was happening instead of hiding the whole process behind a framework.

The core RAG flow is simple enough to build directly:

```text
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Relevance Check
   ↓
Context
   ↓
LLM
   ↓
Answer
```

Building it this way also made debugging easier because I can inspect the retrieved chunks and similarity scores myself.

---

## Some problems I ran into

This project had its share of things breaking.

I dealt with:

- Prisma 7 configuration changes
- PostgreSQL collation issues
- pgvector with Prisma
- Raw vector queries alongside Prisma
- Sarvam transcription limits
- FFmpeg processing
- Temporary file cleanup
- YouTube processing in the background
- Instagram media processing
- Private Instagram access failures
- Irrelevant vector search results
- RAG relevance thresholds
- Persistent chat sessions
- Frontend polling while content is processing
- Stopping polling when the backend becomes unavailable
- Duplicate URL processing
- URL normalization
- Dockerizing the backend and database environment

Most of these were small problems individually, but solving them made me understand the system much better.

---

## Tech Stack

### Frontend

React · TypeScript · Vite · Tailwind CSS · React Router · Clerk

### Backend

Node.js · Express · TypeScript · Prisma

### Database

PostgreSQL · pgvector

### Infrastructure

Docker · Docker Compose

### AI

- **Speech-to-text:** Sarvam AI · `saaras:v3`
- **Embeddings:** Hugging Face · `sentence-transformers/distiluse-base-multilingual-cased-v2`
- **LLM:** Qwen · `Qwen/Qwen3-4B-Instruct-2507`

### Media

FFmpeg · yt-dlp · Multer

---

## Project Structure

```text
get-to-the-point/
│
├── client/
│   └── src/
│       ├── components/
│       ├── lib/
│       ├── pages/
│       └── types/
│
├── server/
│   ├── prisma/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── types/
│       └── utils/
│
└── README.md
```

---

## Run it locally

You can clone the repository, run it locally, and experiment with the full RAG pipeline yourself.

You'll need Node.js, Docker, and API keys for Clerk, Hugging Face, and Sarvam AI.

```bash
git clone https://github.com/YOUR_USERNAME/get-to-the-point.git

cd get-to-the-point
```

Start PostgreSQL + pgvector:

```bash
cd server
docker compose up -d
```

Then install dependencies and start the backend and frontend:

```bash
cd server
npm install
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

Set up the required environment variables before running the app.

Feel free to read the code, run it locally, and experiment with the RAG pipeline.

---

## Why I built it

I didn't want this project to be just:

> "I connected an LLM API to a React app."

I wanted to understand what happens before the LLM gets the question.

How do you turn a video into useful data?

How do you search that data?

How do you decide whether the search result is actually relevant?

How do you stop the model from using information that wasn't in the source?

How do you prevent the same content from being processed repeatedly?

How do you handle media processing failures?

Those questions are what made this project interesting for me.

The UI is the part you see.

**The RAG pipeline is the part I wanted to learn.**