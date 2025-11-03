import React, { useState } from 'react';
import { useNotebookStore } from '../store/notebookStore';
import { createNotebook, createKernel } from '../services/jupyterApi';
import './NotebookList.css';

export const NotebookList: React.FC = () => {
  const { notebooks, activeNotebookId, addNotebook, setActiveNotebook, setError } =
    useNotebookStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) {
      setError('Notebook name cannot be empty');
      return;
    }

    setIsCreating(true);
    try {
      // Create notebook via Jupyter API
      const notebookData = await createNotebook(newNotebookName);
      
      // Create a kernel for this notebook
      const kernel = await createKernel();

      // Add to store
      addNotebook({
        id: notebookData.path,
        name: notebookData.name,
        path: notebookData.path,
        cells: [],
        kernelId: kernel.id,
      });

      setNewNotebookName('');
    } catch (error) {
      console.error('Failed to create notebook:', error);
      setError('Failed to create notebook. Please check if JupyterHub is running.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="notebook-list">
      <div className="notebook-list-header">
        <h2>Notebooks</h2>
      </div>

      <div className="create-notebook">
        <input
          type="text"
          placeholder="New notebook name..."
          value={newNotebookName}
          onChange={(e) => setNewNotebookName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateNotebook()}
          disabled={isCreating}
        />
        <button onClick={handleCreateNotebook} disabled={isCreating || !newNotebookName.trim()}>
          {isCreating ? 'Creating...' : '+ New'}
        </button>
      </div>

      <div className="notebook-items">
        {notebooks.length === 0 ? (
          <div className="empty-state">
            <p>No notebooks yet</p>
            <p className="hint">Create your first notebook above</p>
          </div>
        ) : (
          notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className={`notebook-item ${notebook.id === activeNotebookId ? 'active' : ''}`}
              onClick={() => setActiveNotebook(notebook.id)}
            >
              <span className="notebook-icon">📓</span>
              <span className="notebook-name">{notebook.name}</span>
              <span className="cell-count">{notebook.cells.length} cells</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
