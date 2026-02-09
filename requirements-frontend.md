# ALLAI Frontend Requirements

This document lists the essential tools and steps to run the ALLAI frontend in any environment.

## 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** (usually comes with Node.js)
- **Git** (to clone/sync the repository)
- **ComfyUI** (running at `127.0.0.1:8188` or accessible via proxy)

## 2. Installation
1. Navigate to the `ComfyUI-Custom-Frontend` folder.
2. Run `npm install` to download all necessary libraries (React, Vite, etc.).

## 3. Running the App
- Run `npm run dev` to start the development server.
- The app will be available at `http://localhost:5173`.

## 4. Backups & Portability
All ComfyUI logic is encapsulated in:
- `src/config/workflows.js` (The live code used by the app)
- `src/config/workflow_backups/` (The original JSON files for manual use/ComfyUI drag-and-drop)

## 5. Easy Launch
If you are on Windows, you can simply run `Start-ALLAI.bat`. It will automatically install requirements if they are missing and launch the app for you.
