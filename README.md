# Inventory & Order Management System

A production-ready, full-stack Inventory & Order Management System built with FastAPI, React, and PostgreSQL — fully containerized with Docker.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Local Setup (without Docker)](#local-setup-without-docker)
6. [Docker Setup](#docker-setup)
7. [API Documentation](#api-documentation)
8. [Running Tests](#running-tests)
9. [Deployment](#deployment)
10. [Seed Data](#seed-data)

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Backend        | Python 3.12, FastAPI, SQLAlchemy    |
| Database       | PostgreSQL 16                       |
| Migrations     | Alembic                             |
| Validation     | Pydantic v2                         |
| Frontend       | React 18, Vite, Axios, React Router |
| Containerization | Docker, Docker Compose            |
| Backend Deploy | Render                              |
| Frontend Deploy| Vercel                              |

---

## Features

### Business Logic
- ✅ SKU uniqueness enforced at DB and service layer
- ✅ Customer email uniqueness enforced
- ✅ Stock quantity cannot be negative
- ✅ Orders rejected if inventory is insufficient
- ✅ Inventory automatically reduced on order creation
- ✅ Order total automatically calculated by backend
- ✅ Full transaction rollback on failure
- ✅ Cascade deletes (customer → orders → order items)

### API Quality
- ✅ OpenAPI / Swagger UI at `/docs`
- ✅ ReDoc at `/redoc`
- ✅ Pydantic v2 request/response validation
- ✅ Global exception handlers
- ✅ Structured JSON logging (structlog)
- ✅ Request logging middleware
- ✅ CORS middleware
- ✅ Rate limiting (slowapi) — 60 req/min default
- ✅ Health check: `GET /health`
- ✅ Proper HTTP status codes (201, 204, 400, 404, 409, 422, 500)

### Frontend
- ✅ Dashboard with stats and low-stock alerts
- ✅ Product CRUD (add, edit, delete, list)
- ✅ Customer management (add, delete, list)
- ✅ Order creation with multi-item support
- ✅ Order details page
- ✅ Search, sort, filter on products
- ✅ Pagination everywhere
- ✅ Responsive (mobile + desktop)
- ✅ Loading indicators, success/error toasts
- ✅ Client-side form validation

### Bonus
- ✅ Pagination on all list endpoints
- ✅ Product search by name/SKU
- ✅ Product sorting (name, price, stock, date)
- ✅ Product filtering (price range, in-stock only)
- ✅ Order history by customer (`GET /orders?customer_id=X`)
- ✅ API rate limiting
- ✅ Structured logging
- ✅ Alembic database migrations
- ✅ Seed script

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI routers
│   │   │   ├── products.py
│   │   │   ├── customers.py
│   │   │   ├── orders.py
│   │   │   └── dashboard.py
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── database/      # DB session setup
│   │   ├── core/          # Config, logging, exceptions
│   │   ├── utils/         # Middleware
│   │   └── main.py        # App entry point
│   ├── alembic/           # Migrations
│   ├── tests/             # Pytest tests
│   ├── seed.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── alembic.ini
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios API clients
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Route pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── .env.example
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable               | Default                                              | Description                        |
|------------------------|------------------------------------------------------|------------------------------------|
| `DATABASE_URL`         | `postgresql://postgres:postgres@localhost:5432/inventory_db` | PostgreSQL connection string |
| `CORS_ORIGINS`         | `["http://localhost:3000"]`                          | Allowed CORS origins (JSON array)  |
| `DEBUG`                | `false`                                              | Enable SQLAlchemy query logging    |
| `LOG_LEVEL`            | `INFO`                                               | Logging level                      |
| `RATE_LIMIT_PER_MINUTE`| `60`                                                 | API rate limit per client per min  |

### Frontend (`frontend/.env`)

| Variable             | Default                          | Description              |
|----------------------|----------------------------------|--------------------------|
| `VITE_API_BASE_URL`  | `http://localhost:8000/api/v1`   | Backend API base URL     |

### Docker Compose (`.env` at root)

| Variable             | Default          | Description              |
|----------------------|------------------|--------------------------|
| `POSTGRES_USER`      | `postgres`       | PostgreSQL username       |
| `POSTGRES_PASSWORD`  | `postgres`       | PostgreSQL password       |
| `POSTGRES_DB`        | `inventory_db`   | PostgreSQL database name  |
| `VITE_API_BASE_URL`  | (see above)      | Passed as build arg       |

---

## Local Setup (without Docker)

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 14+

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your local PostgreSQL

# Make sure a PostgreSQL server is running on localhost:5432 before running migrations.
# If you do not have PostgreSQL installed locally, start the Docker Compose services instead:
#   docker compose up --build
# Then run migrations inside the backend container:
#   docker compose exec backend alembic upgrade head

# Run migrations
alembic upgrade head

# (Optional) Seed sample data
python seed.py

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
Swagger UI: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — VITE_API_BASE_URL=http://localhost:8000/api/v1

# Start frontend dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Docker Setup

### Quick Start (recommended)

```bash
# Clone repo and enter directory
cd inventory-system

# Copy and configure environment
cp .env.example .env
# Edit .env if needed (change POSTGRES_PASSWORD for production)

# Build and run all services
docker compose up --build

# In another terminal, seed sample data (optional)
docker compose exec backend python seed.py
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| Backend   | http://localhost:8000        |
| Swagger   | http://localhost:8000/docs   |
| PostgreSQL| localhost:5432               |

### Useful Docker Commands

```bash
# Stop all services
docker compose down

# Stop and remove volumes (wipe database)
docker compose down -v

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild a single service
docker compose up --build backend

# Run migrations manually
docker compose exec backend alembic upgrade head

# Open a psql shell
docker compose exec postgres psql -U postgres -d inventory_db
```

### Build & Push Backend Image to Docker Hub

```bash
docker build -t yourdockerhubuser/inventory-backend:latest ./backend
docker push yourdockerhubuser/inventory-backend:latest
```

---

## API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Health Check
```
GET /health
```

### Products

| Method | Endpoint            | Description                  |
|--------|---------------------|------------------------------|
| GET    | /products           | List products (paginated, searchable, sortable, filterable) |
| POST   | /products           | Create product               |
| GET    | /products/{id}      | Get product by ID            |
| PUT    | /products/{id}      | Update product               |
| DELETE | /products/{id}      | Delete product               |

**Query params for GET /products:**
- `page`, `per_page` — pagination
- `search` — search by name or SKU
- `sort_by` — `name`, `price`, `stock_quantity`, `created_at`
- `sort_order` — `asc` / `desc`
- `min_price`, `max_price` — price range filter
- `in_stock_only=true` — only in-stock products

**POST /products body:**
```json
{
  "name": "Wireless Mouse",
  "sku": "WMOUSE-001",
  "price": 29.99,
  "stock_quantity": 100
}
```

### Customers

| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | /customers          | List customers       |
| POST   | /customers          | Create customer      |
| GET    | /customers/{id}     | Get customer by ID   |
| DELETE | /customers/{id}     | Delete customer      |

**POST /customers body:**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1-555-0101"
}
```

### Orders

| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | /orders             | List orders (filter by customer_id) |
| POST   | /orders             | Create order         |
| GET    | /orders/{id}        | Get order by ID      |
| DELETE | /orders/{id}        | Cancel order         |

**POST /orders body:**
```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

### Dashboard

| Method | Endpoint    | Description              |
|--------|-------------|--------------------------|
| GET    | /dashboard  | Summary stats + low stock |

---

## Running Tests

```bash
cd backend

# Activate venv
source .venv/bin/activate

# Install test dependencies (already in requirements.txt)
# Run all tests
pytest

# With coverage report
pytest --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/test_products.py -v
```

Tests use SQLite in-memory (no PostgreSQL required for tests).

---

## Deployment

### Backend → Render

1. Push your code to a GitHub repository.
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect your GitHub repository.
4. Set **Root Directory** to `backend`.
5. Configure:
   - **Build Command:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add a **PostgreSQL** database on Render (free tier).
7. Set environment variables:
   - `DATABASE_URL` → from Render PostgreSQL (internal connection string)
   - `CORS_ORIGINS` → `["https://your-frontend.vercel.app"]`
   - `LOG_LEVEL` → `INFO`
8. Deploy. Your API will be live at `https://your-service.onrender.com`.

Alternatively, use the `render.yaml` in the root (Blueprint deploy):
```bash
# From Render dashboard → New → Blueprint → connect repo
```

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Set **Framework Preset** to `Vite`.
5. Add environment variable:
   - `VITE_API_BASE_URL` → `https://your-backend.onrender.com/api/v1`
6. Deploy. Your frontend will be live at `https://your-project.vercel.app`.

### Post-deployment

After both are deployed:
1. Update `CORS_ORIGINS` in Render to include your Vercel URL.
2. Re-deploy the backend.
3. (Optional) Run the seed script:
   ```bash
   # Via Render shell or a one-off job
   python seed.py
   ```

---

## Seed Data

The seed script creates:
- 10 sample products (including some with low stock)
- 5 sample customers
- 2 sample orders

```bash
# Local
cd backend && python seed.py

# Docker
docker compose exec backend python seed.py
```
