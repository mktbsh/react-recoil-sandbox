import React from 'react';
import './App.css';
import { searchHistoryActions, searchHistorySelectors } from './store/SearchHistoryState';

function App() {
  const [word, setWord] = React.useState('');
  const history = searchHistorySelectors.useSearchHistory();
  const { useAddSearchHistory, useRedoSearchHistory, useUndoSearchHistory } = searchHistoryActions;
  const addSearchHistory = useAddSearchHistory();
  const undoSearchHistory = useUndoSearchHistory();
  const redoSearchHistory = useRedoSearchHistory();

  const handleClick = () => {
    addSearchHistory(word);
    setWord('');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value);
    e.target.value = '';
  }

  return (
    <div className="App">
      <div className="App-header">
        <button onClick={() => { undoSearchHistory() }}>Undo</button>
        <button onClick={() => { redoSearchHistory() }}>Redo</button>
        <div className="App-box">
        <input type="text" onChange={handleChange} />
        <button onClick={handleClick}>Add</button>
        </div>
      </div>
      <div className="App-list">
      {history.map(item => (
        <div key={item.timestamp}>{item.word}</div>
      ))}
      </div>
    </div>
  );
}

export default App;
