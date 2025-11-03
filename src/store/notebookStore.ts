import { create } from 'zustand';

// Types
export interface CellOutput {
  type: 'stream' | 'execute_result' | 'error' | 'display_data';
  text?: string;
  data?: any;
  name?: string;
}

export interface Cell {
  id: string;
  code: string;
  output: CellOutput[];
  isExecuting: boolean;
  executionCount: number | null;
}

export interface Notebook {
  id: string;
  name: string;
  path: string;
  cells: Cell[];
  kernelId?: string;
}

interface NotebookState {
  // State
  notebooks: Notebook[];
  activeNotebookId: string | null;
  isLoading: boolean;
  error: string | null;

  // Notebook actions
  addNotebook: (notebook: Notebook) => void;
  removeNotebook: (notebookId: string) => void;
  setActiveNotebook: (notebookId: string) => void;
  updateNotebook: (notebookId: string, updates: Partial<Notebook>) => void;

  // Cell actions
  addCell: (notebookId: string, cell: Cell) => void;
  removeCell: (notebookId: string, cellId: string) => void;
  updateCell: (notebookId: string, cellId: string, updates: Partial<Cell>) => void;
  reorderCells: (notebookId: string, cellIds: string[]) => void;

  // Utility actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useNotebookStore = create<NotebookState>((set) => ({
  // Initial state
  notebooks: [],
  activeNotebookId: null,
  isLoading: false,
  error: null,

  // Notebook actions
  addNotebook: (notebook) =>
    set((state) => ({
      notebooks: [...state.notebooks, notebook],
      activeNotebookId: notebook.id,
    })),

  removeNotebook: (notebookId) =>
    set((state) => ({
      notebooks: state.notebooks.filter((nb) => nb.id !== notebookId),
      activeNotebookId:
        state.activeNotebookId === notebookId
          ? state.notebooks[0]?.id || null
          : state.activeNotebookId,
    })),

  setActiveNotebook: (notebookId) =>
    set({ activeNotebookId: notebookId }),

  updateNotebook: (notebookId, updates) =>
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === notebookId ? { ...nb, ...updates } : nb
      ),
    })),

  // Cell actions
  addCell: (notebookId, cell) =>
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === notebookId
          ? { ...nb, cells: [...nb.cells, cell] }
          : nb
      ),
    })),

  removeCell: (notebookId, cellId) =>
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === notebookId
          ? { ...nb, cells: nb.cells.filter((cell) => cell.id !== cellId) }
          : nb
      ),
    })),

  updateCell: (notebookId, cellId, updates) =>
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              cells: nb.cells.map((cell) =>
                cell.id === cellId ? { ...cell, ...updates } : cell
              ),
            }
          : nb
      ),
    })),

  reorderCells: (notebookId, cellIds) =>
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              cells: cellIds
                .map((id) => nb.cells.find((cell) => cell.id === id))
                .filter((cell): cell is Cell => cell !== undefined),
            }
          : nb
      ),
    })),

  // Utility actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
