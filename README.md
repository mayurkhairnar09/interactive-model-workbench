# Interactive Model Analysis Workbench

A modern, performant notebook-style code execution environment built with React, TypeScript, and Jupyter backend. Create and manage multiple notebooks, write and execute Python code in real-time, and view results instantly.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Zustand](https://img.shields.io/badge/Zustand-State-orange)

##  Features

-  **Multiple Notebook Management** - Create, manage, and switch between notebooks
-  **Real-time Code Execution** - Execute Python code with instant feedback
-  **High Performance** - List virtualization handles hundreds of cells smoothly
-  **WebSocket Integration** - Live output streaming during code execution
-  **State Management** - Efficient state handling with Zustand
-  **Modern UI** - Clean, VS Code-inspired dark theme
-  **TypeScript** - Full type safety throughout the application

##  Architecture

- **Frontend**: React + TypeScript + Vite
- **State Management**: Zustand
- **Virtualization**: TanStack Virtual
- **API Client**: Axios
- **Backend**: JupyterHub (Docker)

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

##  Installation & Setup

### Step 1: Clone the Repository

```powershell
git clone <your-repository-url>
cd interactive-model-workbench
```

### Step 2: Install Dependencies

```powershell
npm install
```

### Step 3: Setup Jupyter Backend

1. **Start Docker Desktop** (make sure it's running)

2. **Navigate to the Jupyter backend directory**:

```powershell
cd ../jupyter-backend-docker/basic-example
```

3. **Start JupyterHub using Docker Compose**:

```powershell
docker-compose up -d
```

4. **Verify JupyterHub is running**:

```powershell
docker ps
```

You should see a container named jupyterhub running.

### Step 4: Create Admin User & Generate Token

1. **Open your browser** and navigate to: http://localhost:8000/hub/signup

2. **Create an admin user**:
   - Username: dmin
   - Password: (choose a secure password)
   - Confirm Password: (same password)

3. **Login** with your credentials

4. **Generate an API token**:
   - Navigate to: http://localhost:8000/hub/token
   - Click "Request new API token"
   - Give it a name (e.g., "workbench")
   - Click "Request token"
   - **Copy the generated token** (you'll need it in the next step)

### Step 5: Start the Frontend Application

1. **Navigate back to the project directory**:

```powershell
cd ../../interactive-model-workbench
```

2. **Start the development server**:

```powershell
npm run dev
```

3. **Open your browser** and navigate to: http://localhost:5173

4. **Enter your Jupyter token** when prompted (the token you copied in Step 4)

5. **Start creating notebooks!** 

##  Usage Guide

### Creating a Notebook

1. In the left sidebar, enter a name for your notebook
2. Click the "+ New" button
3. The notebook will be created and automatically selected

### Adding Cells

1. With a notebook selected, click the "+ Add Cell" button in the header
2. A new code cell will be added to the notebook

### Writing and Executing Code

1. Click inside a cell to start typing Python code
2. Click the  (Run) button to execute the cell
3. Or press Shift + Enter to execute the cell
4. View the output below the cell

### Managing Cells

- **Delete**: Click the  button on any cell
- **Reorder**: Drag and drop cells (if implemented)

### Example Code to Try

```python
# Cell 1: Basic arithmetic
print("Hello from Interactive Workbench!")
result = 42 * 2
print(f"The answer is: {result}")
```

```python
# Cell 2: Working with lists
numbers = [1, 2, 3, 4, 5]
squares = [n**2 for n in numbers]
print("Squares:", squares)
```

```python
# Cell 3: Simple data analysis
import random
data = [random.randint(1, 100) for _ in range(10)]
print("Data:", data)
print("Average:", sum(data) / len(data))
print("Max:", max(data))
print("Min:", min(data))
```

##  Development

### Project Structure

```
interactive-model-workbench/
 src/
    components/       # React components
       NotebookList.tsx
       NotebookEditor.tsx
       CodeCell.tsx
       TokenSetup.tsx
    services/         # API and WebSocket services
       jupyterApi.ts
       kernelWebSocket.ts
    store/            # Zustand state management
       notebookStore.ts
    App.tsx           # Main application component
    main.tsx          # Application entry point
 DESIGN.md             # Architecture documentation
 README.md             # This file
 package.json          # Dependencies and scripts
```

### Available Scripts

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Technology Stack

| Technology | Purpose |
|------------|---------|
| **React** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool and dev server |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **TanStack Virtual** | List virtualization |
| **@dnd-kit** | Drag and drop |

##  Troubleshooting

### JupyterHub not starting

**Problem**: Docker Compose fails to start JupyterHub

**Solution**:
```powershell
# Check if port 8000 is already in use
netstat -ano | findstr :8000

# Stop and remove containers
docker-compose down

# Restart
docker-compose up -d
```

### WebSocket connection fails

**Problem**: Cells won't execute, console shows WebSocket errors

**Solution**:
1. Verify JupyterHub is running: http://localhost:8000
2. Check your token is correct
3. Make sure you created the dmin user
4. Try refreshing the browser

### Cells not rendering

**Problem**: Cells appear blank or don't show up

**Solution**:
1. Open browser DevTools (F12)
2. Check for JavaScript errors in Console
3. Try creating a new notebook
4. Restart the development server

### Module not found errors

**Problem**: Import errors when starting the dev server

**Solution**:
```powershell
# Delete node_modules and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

##  Documentation

For detailed architectural information, see:
- [DESIGN.md](./DESIGN.md) - Complete architecture and design decisions

##  Contributing

This project is an assignment submission. If you'd like to suggest improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

##  License

This project is created for educational purposes.

##  Acknowledgments

- JupyterHub team for the excellent backend
- React and Vite communities
- TanStack for the virtualization library

##  Contact

For questions or issues, please open an issue in the repository.

---

**Built with  using React, TypeScript, and JupyterHub**
