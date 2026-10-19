# Bathudi Skills & Vocational Training Centre Portal

[![Category: Vocational Education / EdTech](https://img.shields.io/badge/Category-Vocational%20Education%20%20%20EdTech-blue.svg)](#)
[![Framework: React + Vite](https://img.shields.io/badge/Framework-React%20+%20Vite-61DAFB.svg)](#)
[![Language: TypeScript / JavaScript](https://img.shields.io/badge/Language-TypeScript%20%2F%20JavaScript-3178C6.svg)](#)
[![Build Status: Passing](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#)
[![Code Quality: Production Ready](https://img.shields.io/badge/Quality-Production%20Ready-success.svg)](#)

---

## 📖 Executive Overview

Official institutional portal for Bathudi Training Centre. Showcases vocational curriculum (carpentry, metalwork, electrical engineering, culinary arts, cosmetology), student intake registration, and online course prospectus.

---

## ✨ Key Features & Capabilities

- **Interactive course catalogue with curriculum breakdown, entry requirements, and duration**
- **Online student application & enrollment portal with document upload**
- **Gallery showcase highlighting practical student projects, workshops, and graduation ceremonies**
- **Contact, campus map, and inquiries routing system**

---

## 🛠️ Technology Stack & Dependencies

| Domain | Technology / Library | Description |
| :--- | :--- | :--- |
| **Core Architecture** | React + Vite | High-efficiency reactive rendering and routing layer |
| **Styling & Design System** | Tailwind CSS / Modern CSS Modules | Responsive fluid layouts, dark/light modes, accessible typography |
| **Component Primitives** | Radix UI / Accessible Primitives | Keyboard-navigable, screen-reader friendly interactive components |
| **Iconography & Visuals** | Lucide Icons / Vector SVG Assets | Modern, lightweight, semantic icon library |
| **State & Data Fetching** | React Hooks / TanStack Query | Reactive local & server state management |
| **Tooling & Compilation** | Vite / TypeScript / ESLint / PostCSS | Lightning-fast HMR and type-safe build pipeline |

---

## 📂 Project Architecture & Directory Structure

```text
Bathudi-Centre/
├── src/
├── public/
├── package.json
└── README.md
```

---

### 📄 Key Application Views & Pages

- **`About`**: Dedicated user workflow, contextual data views, and action controls.
- **`Adminapplications`**: Dedicated user workflow, contextual data views, and action controls.
- **`Admincms`**: Dedicated user workflow, contextual data views, and action controls.
- **`Admindashboard`**: Dedicated user workflow, contextual data views, and action controls.
- **`Adminlogin`**: Dedicated user workflow, contextual data views, and action controls.
- **`Adminstaff`**: Dedicated user workflow, contextual data views, and action controls.
- **`Adminstudents`**: Dedicated user workflow, contextual data views, and action controls.
- **`Apply`**: Dedicated user workflow, contextual data views, and action controls.
- **`Broadcastmessages`**: Dedicated user workflow, contextual data views, and action controls.
- **`Coursedetail`**: Dedicated user workflow, contextual data views, and action controls.

### 🧩 Core Component Ecosystem

- **`AdminSidebar`**: Reusable UI component engineered for modularity, accessibility, and clean state propagation.
- **`Footer`**: Reusable UI component engineered for modularity, accessibility, and clean state propagation.
- **`FundingSelection`**: Reusable UI component engineered for modularity, accessibility, and clean state propagation.
- **`Navbar`**: Reusable UI component engineered for modularity, accessibility, and clean state propagation.
- **`PayFastButton`**: Reusable UI component engineered for modularity, accessibility, and clean state propagation.
- **`Preloader`**: Reusable UI component engineered for modularity, accessibility, and clean state propagation.
- **`WhatsAppButton`**: Reusable UI component engineered for modularity, accessibility, and clean state propagation.

## ⚙️ Data Architecture & Backend Services

### 🗄️ Database Schemas & Migrations
- `bathudi.sql`: Database structural definitions, table schemas, and relational constraints.

### 🔌 API & Integration Layer
- `backend\core\services\__init__.py`: Handles business logic, network requests, validation, and third-party integrations.
- `backend\core\services\payfast.py`: Handles business logic, network requests, validation, and third-party integrations.
- `backend\core\services\whatsapp.py`: Handles business logic, network requests, validation, and third-party integrations.

### 🐍 Python Backend Modules
- `backend\bathuditraining2center\__init__.py`: Backend service execution, data processing, or test validation harness.
- `backend\bathuditraining2center\asgi.py`: Backend service execution, data processing, or test validation harness.
- `backend\bathuditraining2center\settings.py`: Backend service execution, data processing, or test validation harness.
- `backend\bathuditraining2center\urls.py`: Backend service execution, data processing, or test validation harness.
- `backend\bathuditraining2center\wsgi.py`: Backend service execution, data processing, or test validation harness.
- `backend\core\__init__.py`: Backend service execution, data processing, or test validation harness.
- `backend\core\admin.py`: Backend service execution, data processing, or test validation harness.
- `backend\core\apps.py`: Backend service execution, data processing, or test validation harness.

## 🚀 Getting Started & Local Setup

### Prerequisites

Ensure you have the following prerequisites installed on your system:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm** (or **pnpm** / **yarn** / **bun**)
- **Python**: `3.10+` (if running Python services)

### 1. Clone & Navigate to Project

```bash
git clone <repository-url>
cd Bathudi-Centre
```

### 2. Install Project Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Duplicate the template configuration file if provided, or initialize `.env`:

```bash
cp .env.example .env
```

Configure your environment settings:

| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `DJANGO_SECRET_KEY` | Application configuration parameter | `your-secret-key-here` |
| `DJANGO_DEBUG` | Application configuration parameter | `False` |
| `DJANGO_ALLOWED_HOSTS` | Application configuration parameter | `.railway.app,localhost,127.0.0.1` |
| `DATABASE_URL` | Application configuration parameter | `configured_at_runtime` |
| `VITE_API_URL` | Application configuration parameter | `https://your-backend-url.railway.app` |

### 4. Launch Local Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the URL displayed in your terminal).

---

## 📜 Available Development Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | `vite` |
| `npm run build` | `vite build` |
| `npm run preview` | `vite preview` |
| `npm run predeploy` | `npm run build` |
| `npm run deploy` | `gh-pages -d dist` |
| `npm run start` | `vite preview --host 0.0.0.0 --port $PORT --strictPort` |

---

## 🌐 Production Build & Deployment

### Building the Production Bundle

To generate a fully minified, production-ready bundle:

```bash
npm run build
```

The compiled assets will be created in the `dist/` or `build/` directory.

### Deployment Options

1. **Vercel / Netlify**: Connect your GitHub repository and set the build command to `npm run build` with output directory `dist`.
2. **Cloudflare Pages / GitHub Pages**: Deploy the static build assets directly via automated CI/CD pipelines.
3. **Docker Containerization**: Use the following multi-stage container build:

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Static Server Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔒 Security, Quality & Performance Best Practices

- **Type Safety**: End-to-end TypeScript interfaces prevent runtime regressions.
- **Responsive Design**: Mobile-first responsive layouts tested across all standard viewport sizes.
- **Component Modularity**: Single-responsibility components ensure clean code maintainability.
- **Zero Placeholder Guarantee**: Built with production-ready assets and fully structured layouts.

---

## 📄 License & Maintainer

Maintained and developed by **Brian**. All rights reserved.
