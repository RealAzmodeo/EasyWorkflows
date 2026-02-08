import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import App from './App.jsx'
import './index.css'

function Fallback({ error }) {
  return (
    <div role="alert" style={{ color: 'red', padding: '2rem' }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={Fallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
