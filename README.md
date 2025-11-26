# CyberSeed

CyberSeed is a full-stack application with a React + TypeScript + Vite frontend and a Python FastAPI backend.

## Backend Setup (Python FastAPI)

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment:**
   
   On Linux/macOS:
   ```bash
   source venv/bin/activate
   ```
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` to customize settings. For development, the defaults are sufficient.

### Running the Backend

Start the FastAPI server with uvicorn:

```bash
uvicorn backend.app_v2:app --reload --host 0.0.0.0 --port 8000
```

Or from the root directory:

```bash
cd ..  # if you're in the backend directory
source backend/venv/bin/activate
uvicorn backend.app_v2:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

### Development Authentication

In development mode, you can obtain a JWT token using the `/auth/login` endpoint:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev","password":"dev"}'
```

This will return an `access_token` that you can use in subsequent requests:

```bash
# Save the token
TOKEN="your_access_token_here"

# Use it in requests
curl http://localhost:8000/status/soul/dev/test-soul \
  -H "Authorization: Bearer $TOKEN"
```

### Backend API Endpoints

#### Health & Status
- `GET /health` - Health check
- `GET /status` - System status
- `GET /status/llm` - LLM service status
- `GET /status/soul/{owner_id}/{soul_id}` - Soul-specific status

#### Authentication
- `POST /auth/login` - Login and get JWT tokens
- `POST /auth/refresh` - Refresh access token

#### File Storage (Protected)
- `POST /souls/{owner_id}/{soul_id}/upload` - Upload files
- `GET /souls/{owner_id}/{soul_id}/files` - List files
- `DELETE /souls/{owner_id}/{soul_id}/files/{filename}` - Delete file
- `DELETE /souls/{owner_id}/{soul_id}/data` - Delete all soul data
- `DELETE /owners/{owner_id}/data` - Delete all owner data

#### Core Operations (Protected)
- `POST /souls/{owner_id}/{soul_id}/transcribe` - Transcribe audio
- `POST /souls/{owner_id}/{soul_id}/train` - Build/update RAG index
- `POST /souls/{owner_id}/{soul_id}/chat` - Chat with RAG + LLM

**Note:** Phase 1 implementation includes placeholders for LLM, RAG, and transcription services. These will be fully implemented in Phase 2.

## Frontend Setup (React + Vite)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
