# Craftify 🎨🏺

> **Preserving Indian Craft Heritage through Transparent Crowdfunding, Milestone Escrow, and Curated E-Commerce.**

Craftify is a modern hybrid web platform designed to empower traditional Indian artisans, craft clusters, and conscious patrons. It bridges generational handicraft preservation with modern financial transparency, featuring all-or-nothing milestone escrow covenants, AI-assisted storytelling and fair pricing, TF-IDF recommendation engines, and role-based artisan governance.

---

## ✨ Key Features

### 1. 📢 Artisan Crowdfunding & All-or-Nothing Escrow
- **Pre-Authorized Pledges**: Patrons back campaigns with $0 charged upfront; funds are held as pre-authorizations and only captured when the campaign reaches 100% of its funding goal by the deadline.
- **Milestone Settlement**: Automatic status transitions (`funded`, `failed`, or `in_progress`) with direct payout release upon goal completion.
- **Reward Tiers & Custom Specs**: Configurable reward tiers with estimated delivery dates, items included, and heritage specifications.

### 2. 🛍️ Curated Handicraft E-Commerce
- **Graduated Products**: Successful campaigns graduate directly onto the Craftify Marketplace for permanent retail access.
- **Geographical Indication (GI) Authenticity**: Product profiles highlight GI provenance, artisan origin, materials used, and verified customer reviews.
- **Delivery-Triggered Payouts**: Order payouts are secured in escrow and made available to artisans upon delivery confirmation.

### 3. 🤖 Craftify AI Tools
- **Master Artisan Storyteller**: Integrated with **Google Gemini API (`gemini-2.5-flash`)** to generate evocative, grammatically complete, and culturally authentic product & campaign descriptions.
- **Fair Price Suggester**: Rule-based pricing calculator evaluating raw material costs, labor hours spent, craft complexity level (Basic, Skilled, Master), and regional cost factors.
- **TF-IDF Recommendation Engine**: Content-based recommendation system built with `scikit-learn` (`TfidfVectorizer` & `cosine_similarity`) matching user-viewed categories to live campaigns and products.

### 4. 🛡️ Trust, Governance & Verification
- **GPS EXIF Proof Verification**: Mandatory EXIF metadata and GPS coordinate validation on artisan milestone proof submissions.
- **Phone OTP Verification**: Quick SMS OTP verification for seller onboarding without requiring heavy documentation.
- **Trust Score & Risk Flags**: Automated 0–100 artisan trust scoring system with risk level categorization (`low`, `medium`, `high`, `blacklisted`).
- **Admin Control Panel**: Full administrative dashboard to curate campaigns (`pending`, `approved`, `rejected`), review platform analytics, and manage user suspensions.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS + Tailwind CSS (Custom Craftify Tokens)
- **Icons**: Lucide React
- **Dev Server / Proxy**: Express.js (`server.ts`)

### **Backend**
- **Framework**: Django 5 + Django REST Framework (DRF)
- **Authentication**: `djangorestframework-simplejwt` (JSON Web Tokens)
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Machine Learning / AI**: `scikit-learn` (TF-IDF vectorizer), Google GenAI SDK (`@google/genai` / `gemini-2.5-flash`)
- **CORS**: `django-cors-headers`

---

## 🚀 Getting Started & Local Setup

### **Prerequisites**
- **Node.js** (v18+)
- **Python** (v3.10+)

---

### **1. Repository Setup**
```bash
git clone https://github.com/your-username/craftify.git
cd craftify
npm install
```

---

### **2. Environment Configuration**
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

Create a `.env` file in the `backend/` directory:
```env
DEBUG=True
SECRET_KEY=craftify_dev_secret_key_12345
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

---

### **3. Backend Setup (Django)**

Initialize the Python virtual environment and run database migrations:
```bash
# Set up virtual environment
python -m venv backend/venv

# Activate virtual environment (Windows)
.\backend\venv\Scripts\activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary pillow scikit-learn

# Run migrations
python backend/manage.py makemigrations
python backend/manage.py migrate

# Seed mock campaigns, products, users & pledges
python backend/manage.py seed_data

# Start Django backend server on port 8000
python backend/manage.py runserver 0.0.0.0:8000
```

---

### **4. Frontend Setup & Execution**

In a new terminal window, start the Express + Vite frontend development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔑 Demo Accounts

| Role | Username | Password |
| --- | --- | --- |
| **Admin** | `admin_aisha` | `CraftifyPass123!` |
| **Artisan / Creator** | `artisan_creator` | `CraftifyPass123!` |
| **Patron / Buyer** | `eleanor_buyer` | `CraftifyPass123!` |

---

## 📡 API Architecture & Routing

| Endpoint Path | Method | Description |
| --- | --- | --- |
| `POST /api/auth/token/` | `POST` | SimpleJWT Login (Returns access & refresh token) |
| `GET /api/auth/me/` | `GET` | Authenticated user profile details |
| `POST /api/auth/verify-otp/` | `POST` | Phone OTP seller verification |
| `GET /api/campaigns/` | `GET` | List all active public campaigns |
| `GET /api/campaigns/:id/` | `GET` | Detailed campaign information with updates & comments |
| `POST /api/campaigns/:id/pledge/` | `POST` | Escrow pledge pre-authorization |
| `POST /api/campaigns/:id/settle/` | `POST` | Milestone campaign settlement (`funded`/`failed`) |
| `GET /api/products/` | `GET` | List e-commerce marketplace products |
| `POST /api/orders/` | `POST` | Checkout and place customer order |
| `POST /api/ai/suggest-price/` | `POST` | Fair price calculation engine |
| `POST /api/ai/recommendations/` | `POST` | TF-IDF content recommendation engine |
| `GET /api/admin/stats/` | `GET` | Platform administrative metrics |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
