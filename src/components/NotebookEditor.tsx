import React, { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNotebookStore } from '../store/notebookStore';
import { CodeCell } from './CodeCell';
import { KernelWebSocket } from '../services/kernelWebSocket';
import { getKernelWebSocketUrl, updateNotebook, getNotebook } from '../services/jupyterApi';
import type { CellOutput } from '../store/notebookStore';
import './NotebookEditor.css';

export const NotebookEditor: React.FC = () => {
  const {
    notebooks,
    activeNotebookId,
    addCell,
    updateCell,
    removeCell,
    setError,
  } = useNotebookStore();

  const [kernelWs, setKernelWs] = useState<KernelWebSocket | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const activeNotebook = notebooks.find((nb) => nb.id === activeNotebookId);

  // Virtualization setup
  const virtualizer = useVirtualizer({
    count: activeNotebook?.cells.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  // Initialize WebSocket for active notebook
  useEffect(() => {
    if (activeNotebook?.kernelId) {
      const wsUrl = getKernelWebSocketUrl(activeNotebook.kernelId);
      const ws = new KernelWebSocket(activeNotebook.kernelId, wsUrl);

      ws.connect()
        .then(() => {
          console.log('Kernel WebSocket connected');
          setKernelWs(ws);
        })
        .catch((error) => {
          console.error('Failed to connect to kernel:', error);
          setError('Failed to connect to kernel WebSocket');
        });

      return () => {
        ws.disconnect();
      };
    }
  }, [activeNotebook?.kernelId, setError]);

  const handleAddCell = () => {
    if (!activeNotebook) return;

    const newCell = {
      id: `cell-${Date.now()}`,
      code: '',
      output: [],
      isExecuting: false,
      executionCount: null,
    };

    addCell(activeNotebook.id, newCell);
  };

  const handleCodeChange = (cellId: string, code: string) => {
    if (!activeNotebook) return;
    updateCell(activeNotebook.id, cellId, { code });
  };

  const handleExecuteCell = async (cellId: string) => {
    if (!activeNotebook || !kernelWs) {
      setError('Kernel not connected');
      return;
    }

    const cell = activeNotebook.cells.find((c) => c.id === cellId);
    if (!cell) return;

    // Mark cell as executing
    updateCell(activeNotebook.id, cellId, {
      isExecuting: true,
      output: [],
    });

    try {
      // Update notebook with new cell content
      const notebookData = await getNotebook(activeNotebook.path);
      const updatedContent = {
        ...notebookData.content,
        cells: activeNotebook.cells.map((c) => ({
          cell_type: 'code',
          execution_count: c.executionCount,
          metadata: {},
          outputs: [],
          source: c.code.split('\n'),
        })),
      };

      await updateNotebook(activeNotebook.path, updatedContent);

      // Setup output callback for this cell
      const outputs: CellOutput[] = [];
      kernelWs.onOutput((output) => {
        outputs.push(output);
        updateCell(activeNotebook.id, cellId, { output: [...outputs] });
      });

      // Execute code
      kernelWs.executeCode(cell.code);

      // Update execution count
      const executionCount = (cell.executionCount || 0) + 1;
      updateCell(activeNotebook.id, cellId, {
        executionCount,
        isExecuting: false,
      });
    } catch (error) {
      console.error('Error executing cell:', error);
      updateCell(activeNotebook.id, cellId, {
        isExecuting: false,
        output: [
          {
            type: 'error',
            text: 'Failed to execute cell. Check if JupyterHub is running.',
          },
        ],
      });
    }
  };

  const handleDeleteCell = (cellId: string) => {
    if (!activeNotebook) return;
    removeCell(activeNotebook.id, cellId);
  };

  if (!activeNotebook) {
    return (
      <div className="notebook-editor">
        <div className="empty-notebook">
          <h2>No Notebook Selected</h2>
          <p>Create or select a notebook to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-editor">
      <div className="notebook-header">
        <h1>{activeNotebook.name}</h1>
        <button className="add-cell-button" onClick={handleAddCell}>
          + Add Cell
        </button>
      </div>

      <div ref={parentRef} className="cells-container">
        {activeNotebook.cells.length === 0 ? (
          <div className="no-cells">
            <p>No cells yet</p>
            <button onClick={handleAddCell}>Add your first cell</button>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const cell = activeNotebook.cells[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <CodeCell
                    cell={cell}
                    onCodeChange={(code) => handleCodeChange(cell.id, code)}
                    onExecute={() => handleExecuteCell(cell.id)}
                    onDelete={() => handleDeleteCell(cell.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
