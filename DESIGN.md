# Design Document: Interactive Model Analysis Workbench

## Overview
This document outlines the architectural decisions, component structure, and implementation strategies for the Interactive Model Analysis Workbench - a notebook-style code execution environment built with React, TypeScript, and Jupyter backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ NotebookList │  │   Notebook   │  │   CodeCell   │      │
│  │  Component   │  │    Editor    │  │  Component   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Zustand Store  │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐              │
│         │                  │                  │              │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐      │
│  │  Jupyter    │  │     Kernel      │  │  TanStack  │      │
│  │  REST API   │  │   WebSocket     │  │   Virtual  │      │
│  └──────┬──────┘  └────────┬────────┘  └────────────┘      │
└─────────┼────────────────────┼──────────────────────────────┘
          │                    │
          │  HTTP/REST         │  WebSocket
          │                    │
┌─────────▼────────────────────▼──────────────────────────────┐
│              JupyterHub Backend (Docker)                     │
│  ┌─────────────────┐           ┌────────────────┐           │
│  │ Notebook Storage│           │ Python Kernels │           │
│  └─────────────────┘           └────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 1. State Management (Zustand)

### Store Structure

The application uses a **single Zustand store** to manage all notebook and cell state. This centralized approach provides:

- **Predictable state updates**: All state changes go through defined actions
- **Easy debugging**: Single source of truth
- **Performance**: Zustand uses shallow equality checks for re-renders
- **Simplicity**: No boilerplate compared to Redux

### Store Schema

```typescript
interface NotebookState {
  // State
  notebooks: Notebook[]          // Array of all notebooks
  activeNotebookId: string | null // Currently selected notebook
  isLoading: boolean             // Loading state for async operations
  error: string | null           // Error messages

  // Notebook CRUD
  addNotebook()
  removeNotebook()
  setActiveNotebook()
  updateNotebook()

  // Cell CRUD
  addCell()
  removeCell()
  updateCell()
  reorderCells()

  // Utility
  setLoading()
  setError()
  clearError()
}
```

### Key Design Decisions

1. **Flat Structure**: Notebooks contain cells directly (not normalized)
   - **Pro**: Simpler to work with, easier to understand
   - **Con**: Slightly less efficient for very large numbers of notebooks
   - **Justification**: Simplicity wins for this use case; users typically have < 20 notebooks

2. **Immutable Updates**: Using spread operators for state updates
   - Ensures React re-renders components correctly
   - Maintains Zustand's shallow equality optimization

3. **No Middleware**: Keeping the store simple without persist/devtools middleware
   - Token stored in localStorage separately
   - Cleaner separation of concerns

## 2. WebSocket Connection Strategy

### Connection Management

Each notebook maintains its own kernel and WebSocket connection:

```typescript
class KernelWebSocket {
  private ws: WebSocket | null
  private messageCallbacks: Map<string, Function>
  private outputCallback: Function | null
  
  connect() // Establishes WebSocket connection
  executeCode(code: string) // Sends execution request
  onOutput(callback) // Registers output handler
  disconnect() // Cleans up connection
}
```

### Key Design Decisions

1. **One Connection Per Notebook**
   - Each notebook kernel has its own WebSocket
   - Connections are created when notebook becomes active
   - Cleaned up when notebook is closed or component unmounts

2. **Message Routing**
   - Uses message IDs to correlate requests/responses
   - Callback map stores handlers for specific messages
   - Global output callback for real-time streaming

3. **Error Handling**
   - Reconnection on disconnect (could be added)
   - Timeout handling for long-running cells
   - User-friendly error messages

### WebSocket Message Flow

```
User clicks "Run" → 
  1. Update cell state (isExecuting: true)
  2. HTTP PUT to update notebook content
  3. WebSocket: Send execute_request
  4. Listen for messages:
     - stream → Display output
     - execute_result → Show result
     - error → Display error
  5. Update cell state (isExecuting: false)
```

## 3. Component Architecture

### Component Hierarchy

```
App
├── TokenSetup (conditional)
└── Main Layout
    ├── NotebookList (sidebar)
    │   └── Notebook items
    └── NotebookEditor (main area)
        ├── Header (notebook name, add cell button)
        └── VirtualizedCellList
            └── CodeCell (repeated)
                ├── Toolbar (run, delete)
                ├── Code Editor (textarea)
                └── Output Display
```

### Component Responsibilities

#### 1. **App** (`App.tsx`)
- **Purpose**: Root component, handles token authentication
- **State**: Token setup status
- **Responsibilities**:
  - Check for saved token in localStorage
  - Show TokenSetup or main interface
  - Display global error banner

#### 2. **TokenSetup** (`TokenSetup.tsx`)
- **Purpose**: Initial setup screen for Jupyter token
- **State**: Token input, validation errors
- **Responsibilities**:
  - Guide user through token generation
  - Validate and store token
  - Trigger app initialization

#### 3. **NotebookList** (`NotebookList.tsx`)
- **Purpose**: Sidebar for notebook management
- **State**: New notebook name input
- **Responsibilities**:
  - Display all notebooks
  - Create new notebooks (API call)
  - Switch active notebook
  - Show cell count per notebook

#### 4. **NotebookEditor** (`NotebookEditor.tsx`)
- **Purpose**: Main editing area
- **State**: WebSocket connection
- **Responsibilities**:
  - Display active notebook
  - Manage kernel WebSocket
  - Coordinate cell execution
  - Handle cell CRUD operations
  - Implement list virtualization

#### 5. **CodeCell** (`CodeCell.tsx`)
- **Purpose**: Individual code cell
- **Props**: Cell data, callbacks for changes
- **Responsibilities**:
  - Code input (textarea)
  - Execution control (run button)
  - Output display (multiple types)
  - Delete functionality

### Why This Component Breakdown?

1. **Separation of Concerns**
   - Each component has a single responsibility
   - Easy to test independently
   - Clear data flow

2. **Reusability**
   - CodeCell is completely reusable
   - NotebookList could be used in different contexts

3. **Performance**
   - Components only re-render when their data changes
   - Zustand's selector system prevents unnecessary renders

4. **Maintainability**
   - Easy to locate and fix bugs
   - New features can be added without affecting others

## 4. Performance Optimizations

### List Virtualization

Using **@tanstack/react-virtual** for rendering cells:

```typescript
const virtualizer = useVirtualizer({
  count: cells.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200,  // Estimated cell height
  overscan: 5               // Render 5 extra cells
})
```

**Benefits**:
- Only renders visible cells + overscan
- Handles 1000+ cells smoothly
- Automatic scroll handling
- Dynamic height support

### Code Editor Choice

**Textarea instead of Monaco/CodeMirror**:

**Pros**:
- Zero bundle size impact
- Native browser performance
- Simple to implement
- Fast initial render

**Cons**:
- No syntax highlighting
- No autocomplete
- Basic editing features

**Justification**: For an MVP/assignment, simplicity wins. Can upgrade later.

### Memoization Strategy

Using React's built-in optimization:
- Components are functional (fast)
- Zustand provides automatic shallow equality
- No premature optimization with `useMemo`/`useCallback`

## 5. API Integration

### REST API (`jupyterApi.ts`)

Handles notebook CRUD operations:
- `createNotebook()` - Creates new notebook
- `getNotebook()` - Fetches notebook content
- `updateNotebook()` - Saves notebook changes
- `createKernel()` - Initializes Python kernel
- `deleteKernel()` - Cleans up kernel

**Token Management**:
- Token set once at startup
- Stored in localStorage
- Added to all requests via interceptor

### WebSocket API (`kernelWebSocket.ts`)

Handles code execution:
- Connects to kernel WebSocket
- Sends execute_request messages
- Handles multiple message types
- Provides callback-based output

## 6. Future Enhancements

### Drag-and-Drop (Partially Implemented)

The application has **@dnd-kit** installed but drag-and-drop is not yet fully implemented in the UI. To complete:

1. Wrap cells in `<SortableContext>`
2. Use `useSortable` hook in CodeCell
3. Handle `onDragEnd` to reorder cells
4. Update notebook via API

### Other Potential Features

- **Markdown Cells**: Support for documentation
- **Rich Output**: Images, plots, HTML rendering
- **Code Syntax Highlighting**: Monaco Editor integration
- **Cell Collaboration**: Multiple users editing
- **Notebook Import/Export**: .ipynb file support
- **Keyboard Shortcuts**: Vim/Emacs modes
- **Cell Execution Queue**: Execute all cells

## 7. Testing Strategy

### Unit Tests
- Zustand store actions
- API service functions
- WebSocket message parsing

### Integration Tests
- Component interactions
- API calls with mock backend
- WebSocket communication

### E2E Tests
- Full notebook workflow
- Cell execution
- Error handling

## 8. Security Considerations

1. **Token Storage**: localStorage (consider HTTP-only cookies)
2. **WebSocket Origin**: Validate connection source
3. **Code Execution**: Sandboxed in Jupyter kernel
4. **Input Sanitization**: Escape user input in outputs

## Conclusion

This architecture balances simplicity with extensibility. The use of Zustand provides efficient state management, TanStack Virtual ensures performance with large notebooks, and the component structure allows for easy maintenance and feature additions.

The design prioritizes:
- **Developer Experience**: Easy to understand and modify
- **User Experience**: Fast, responsive interface
- **Scalability**: Can handle many notebooks and cells
- **Maintainability**: Clear separation of concerns
