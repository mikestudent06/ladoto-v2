# TaskFlow - Modern Task Management App

A comprehensive task management and team collaboration application built with modern frontend technologies.

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone and setup the project**

   ```bash
   # Create new project
   npm create vite@latest taskflow-frontend -- --template react-ts
   cd taskflow-frontend

   # Remove default files and install dependencies
   rm -rf src/assets src/App.css
   ```

2. **Install all dependencies**

   ```bash
   npm install react react-dom react-router-dom @tanstack/react-query @tanstack/react-query-devtools zustand @supabase/supabase-js react-hook-form @hookform/resolvers zod class-variance-authority clsx tailwind-merge lucide-react sonner date-fns

   npm install -D @types/react @types/react-dom @typescript-eslint/eslint-plugin @typescript-eslint/parser @vitejs/plugin-react autoprefixer postcss tailwindcss tailwindcss-animate typescript vite
   ```

3. **Copy all the configuration files** provided in the artifacts above:

   - `package.json`
   - `vite.config.ts`
   - `tsconfig.json`
   - `tailwind.config.js`
   - `components.json`
   - `index.html`

4. **Create the src folder structure**

   ```
   src/
   ├── components/
   │   ├── ui/          # shadcn/ui components
   │   └── layouts/     # Layout components
   ├── pages/           # Page components
   │   └── auth/        # Auth pages
   ├── lib/             # Utilities and configurations
   ├── hooks/           # Custom React hooks
   ├── store/           # Zustand stores
   ├── types/           # TypeScript type definitions
   └── api/             # API functions
   ```

5. **Copy all the source files** from the artifacts above:

   - All component files in their respective directories
   - All page files
   - Utility functions
   - CSS files

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
taskflow-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   ├── layouts/         # Layout components
│   │   └── features/        # Feature-specific components (Phase 2+)
│   ├── pages/
│   │   ├── auth/           # Authentication pages
│   │   └── ...             # Other pages
│   ├── lib/
│   │   ├── utils.ts        # Utility functions
│   │   ├── supabase.ts     # Supabase client (Phase 2)
│   │   └── validations.ts  # Zod schemas (Phase 2)
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript definitions
│   ├── api/                # API functions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── components.json
└── package.json
```

## 🎯 Learning Phases

### Phase 1: Foundation Setup ✅

- [x] Project initialization with Vite + React + TypeScript
- [x] shadcn/ui setup and theming
- [x] Basic routing structure
- [x] Folder organization and best practices

### Phase 2: Authentication System (Next)

- [ ] Supabase setup and configuration
- [ ] Auth state management with Zustand
- [ ] Login/Register forms with validation
- [ ] Protected routes implementation

### Phase 3: Core CRUD Operations

- [ ] TanStack Query setup
- [ ] Projects CRUD operations
- [ ] Tasks CRUD with relationships
- [ ] Form handling best practices

### Phase 4: Advanced UI Components

- [ ] Data tables with sorting/pagination
- [ ] Modal system implementation
- [ ] Advanced forms with validation
- [ ] Toast notifications

### Phase 5: File Management

- [ ] File upload functionality
- [ ] Image handling and optimization
- [ ] Supabase Storage integration

### Phase 6: Advanced Features

- [ ] Filtering and search system
- [ ] Real-time updates
- [ ] Dashboard analytics
- [ ] Responsive design polish

### Phase 7: Production Ready

- [ ] Error boundaries
- [ ] Loading states
- [ ] Performance optimization
- [ ] Deployment

## 🧰 Development Tools

- **React Query DevTools**: Available in development mode
- **TypeScript**: Strict mode enabled for better type safety
- **ESLint**: Code linting and formatting
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast development and build tool

## 📚 Key Learning Concepts

This project covers all essential modern frontend development patterns:

1. **Component Architecture**: Proper component organization and reusability
2. **State Management**: Local state (useState) vs Global state (Zustand) vs Server state (React Query)
3. **Type Safety**: Comprehensive TypeScript usage
4. **Form Handling**: React Hook Form + Zod validation
5. **API Integration**: RESTful API calls with proper error handling
6. **File Uploads**: Image handling and file management
7. **Routing**: Protected routes and navigation
8. **UI/UX**: Modern design patterns with shadcn/ui
9. **Performance**: Code splitting and optimization techniques
10. **Best Practices**: Folder structure, naming conventions, and clean code

Ready for Phase 2! 🚀
