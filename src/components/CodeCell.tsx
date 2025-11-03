import React, { useRef } from 'react';
import type { Cell as CellType } from '../store/notebookStore';
import './CodeCell.css';

interface CodeCellProps {
  cell: CellType;
  onCodeChange: (code: string) => void;
  onExecute: () => void;
  onDelete: () => void;
}

export const CodeCell: React.FC<CodeCellProps> = ({
  cell,
  onCodeChange,
  onExecute,
  onDelete,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Shift+Enter to execute
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      onExecute();
    }
  };

  return (
    <div className="code-cell">
      <div className="cell-toolbar">
        <span className="execution-count">
          {cell.executionCount !== null ? `[${cell.executionCount}]` : '[ ]'}
        </span>
        <div className="cell-actions">
          <button
            className="run-button"
            onClick={onExecute}
            disabled={cell.isExecuting}
            title="Run cell (Shift+Enter)"
          >
            {cell.isExecuting ? '⏸' : '▶'}
          </button>
          <button className="delete-button" onClick={onDelete} title="Delete cell">
            🗑️
          </button>
        </div>
      </div>

      <div className="cell-content">
        <textarea
          ref={textareaRef}
          className="code-editor"
          value={cell.code}
          onChange={(e) => onCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="# Enter Python code here..."
          spellCheck={false}
        />

        {cell.output.length > 0 && (
          <div className="cell-output">
            {cell.output.map((output, index) => (
              <div key={index} className={`output-item output-${output.type}`}>
                {output.type === 'stream' && <pre>{output.text}</pre>}
                {output.type === 'execute_result' && (
                  <pre>{JSON.stringify(output.data, null, 2)}</pre>
                )}
                {output.type === 'error' && <pre className="error-output">{output.text}</pre>}
                {output.type === 'display_data' && (
                  <div>
                    {output.data?.['text/plain'] && <pre>{output.data['text/plain']}</pre>}
                    {output.data?.['text/html'] && (
                      <div dangerouslySetInnerHTML={{ __html: output.data['text/html'] }} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {cell.isExecuting && (
          <div className="cell-executing">
            <div className="spinner"></div>
            <span>Executing...</span>
          </div>
        )}
      </div>
    </div>
  );
};
