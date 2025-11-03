import { useState, useEffect } from 'react';
import { NotebookList } from './components/NotebookList';
import { NotebookEditor } from './components/NotebookEditor';
import { TokenSetup } from './components/TokenSetup';
import { setJupyterToken } from './services/jupyterApi';
import { useNotebookStore } from './store/notebookStore';
import './App.css';

function App() {
  const [isTokenSet, setIsTokenSet] = useState(false);
  const { error, clearError } = useNotebookStore();

  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('jupyter_token');
    if (savedToken) {
      setJupyterToken(savedToken);
      setIsTokenSet(true);
    }
  }, []);

  const handleTokenSet = () => {
    setIsTokenSet(true);
  };

  if (!isTokenSet) {
    return <TokenSetup onTokenSet={handleTokenSet} />;
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}></button>
        </div>
      )}

      <div className="app-content">
        <NotebookList />
        <NotebookEditor />
      </div>
    </div>
  );
}

export default App;
