function App() {
  const platform = window.electronAPI?.platform ?? 'unknown';

  return (
    <main className="p-8 text-center">
      <h1 className="mb-2 text-4xl">Cotidiano</h1>
      <p className="mt-2 text-neutral-400">Your Electron + React app is running.</p>
      <p className="mt-2 text-neutral-400">
        Platform: <span className="font-semibold text-emerald-300">{platform}</span>
      </p>
    </main>
  );
}

export default App;
