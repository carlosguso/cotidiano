import './App.css';

function App() {
  const platform = window.electronAPI?.platform ?? 'unknown';

  return (
    <main className="app">
      <h1>Cotidiano</h1>
      <p>Your Electron + React app is running.</p>
      <p className="platform">
        Platform: <span>{platform}</span>
      </p>
    </main>
  );
}

export default App;
