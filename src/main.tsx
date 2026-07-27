import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import './core/i18n';
import App from './App.tsx'

// Prevent number inputs from changing their value on mouse wheel scroll
document.addEventListener('wheel', function () {
  if (
    document.activeElement &&
    document.activeElement.tagName === 'INPUT' &&
    (document.activeElement as HTMLInputElement).type === 'number'
  ) {
    (document.activeElement as HTMLElement).blur();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
