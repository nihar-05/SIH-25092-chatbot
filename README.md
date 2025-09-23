# SIH-25092 Chatbot  

A conversational chatbot system built for **Smart India Hackathon (SIH)** problem statement 25092.  
This project combines a **Python backend agent (FastAPI + LangChain)** with a **Next.js (React) frontend** to deliver smooth, real-time user interactions.  

---

## ✨ Features  

- Interactive chatbot interface with dynamic, AI-powered responses  
- Backend agent logic in **Python (FastAPI)** with **LangChain + Gemini** for NLP  
- **LangGraph** for orchestrating multi-step conversations  
- **Tavily Web Search** integration to provide real-time information from the internet  
- **PostgreSQL storage** (via SQLAlchemy) for saving queries and responses  
- Modern, responsive UI built using **Next.js + Tailwind CSS**  
- Modular and scalable architecture for future enhancements  

---

## ⚙️ Tech Stack  

### Frontend  
- **Next.js** – React framework with SSR & optimized routing  
- **Tailwind CSS** – Utility-first CSS framework  

### Backend  
- **FastAPI** – High-performance Python API framework  
- **Uvicorn** – ASGI server to run FastAPI  
- **LangChain** – Agent and chain orchestration  
- **LangGraph** – Conversational graph orchestration  
- **LangChain Google GenAI** – Gemini integration via Google AI Studio  
- **Tavily Python** – Web search integration  
- **PostgreSQL + SQLAlchemy** – Database for storing conversations  
- **Pydantic v2** – Data validation for FastAPI  

### Deployment  
- **Frontend**: Vercel  
- **Database**: PostgreSQL (local or cloud-hosted)  

---

## 🚀 Getting Started  

### Clone Repo  

```bash
git clone https://github.com/nihar-05/SIH-25092-chatbot.git
cd SIH-25092-chatbot
