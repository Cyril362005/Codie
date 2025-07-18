Codie 1.0 – AI Code Review Assistant

Codie is a full-stack, microservices-based **AI-powered code review platform** designed to analyze, test, and improve source code across entire repositories. It integrates advanced static/dynamic analysis tools, test generation engines, real-time AI chat feedback, and intelligent refactor suggestions into one unified system.

> Built with 🧠 multi-agent AI orchestration, 🛠️ containerized microservices, and ⚡ real-time React frontend.

---

## 📦 Project Structure

codie-root/
├── codie/ # Backend microservices (FastAPI)
├── codie-chat/ # Frontend SPA (React + TypeScript)
└── docker-compose.yml # Multi-service orchestration

yaml
Copy
Edit

---

## 🚀 Features

✅ Repo-wide dependency analysis  
✅ Dynamic runtime testing with coverage  
✅ AI-generated test cases (Python, Java)  
✅ Adaptive style enforcement  
✅ Conversational code review (WebSocket + AI)  
✅ Refactor scoring with hotspots  
✅ CVE-linked vulnerability scanning (Snyk)  
✅ Confidence-based noise filtering


## 🧱 System Architecture

### 🔌 Microservices (FastAPI + Docker)
- `api_gateway`: Future-ready HTTP gateway
- `analysis_orchestrator`: Coordinates repo scanning, scoring, summaries
- `repo_analysis`: Tree-sitter + Radon-based AST and complexity analysis
- `dynamic_testing`: Executes code in Docker with pytest / Diffblue
- `chat_service`: Real-time WebSocket AI interface with Hugging Face API
- `style_learner`: Learns identifier naming style across repo
- `shared/`: SQLAlchemy DB models and PostgreSQL connection logic

### 💻 Frontend (React + TypeScript + Tailwind CSS)
- Real-time code review chat panel
- Metric cards (coverage, complexity, issues)
- Refactor suggestions, vulnerability feed, and code insights

---

## 🐳 Run Locally with Docker Compose

```bash
# Step 1: Clone the repo
git clone https://github.com/Cyril362005/Codie.git
cd Codie

# Step 2: Add your Hugging Face + Snyk tokens
cp .env.example .env
nano .env  # Fill in API keys

# Step 3: Launch all services
docker-compose up --build
Then visit: http://localhost:3000

🔐 Environment Variables
Make sure to define the following in your .env file:

env
Copy
Edit
HUGGINGFACE_API_KEY=your_hf_token
SNYK_TOKEN=your_snyk_token
SNYK_ORG_ID=your_org_id
📊 Tech Stack
Backend: Python, FastAPI, Tree-sitter, Radon, SQLAlchemy

Frontend: React, TypeScript, Tailwind CSS, Vite

AI Services: Hugging Face API, Diffblue Cover, Snyk API, ChatGPT, Gemini

DevOps: Docker, Docker Compose, PostgreSQL

🧪 Test Coverage
Python: via pytest-cov inside Docker

Java: via Diffblue Cover CLI

Real-time score displayed on dashboard

🔒 Security
Codie integrates SnykCode API and CVE database (NIST NVD) to detect:

Known vulnerabilities (linked to CVEs)

Common code smells or insecure patterns

✨ Future Improvements
OAuth login and user sessions

Uploadable Git repos via dashboard

Auto-refactor preview with edit tracking

CI/CD GitHub integration

Multi-language support (Go, C++)

🤝 Contributing
Contributions are welcome! Please open an issue or PR after:

bash
Copy
Edit
# Install pre-commit hooks (optional)
pip install pre-commit
pre-commit install
📄 License
MIT License

👨‍💻 Author
Pudota Chaitanya
📧 cyrilchaitanya@gmail.com
🌐 github.com/Cyril362005

yaml
Copy
Edit

---

### ✅ Want this in your repo?

1. Create a file named `README.md` in your root (`codie-root/`)
2. Paste the above content
3. Commit and push:

```bash
git add README.md
git commit -m "Add professional README for Codie"
git push
Let me know if you also want:

.env.example file generation

GitHub description and tags

Badges (build passing, version, Docker)

