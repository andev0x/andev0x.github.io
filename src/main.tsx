import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { HintProvider } from './components/HintProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HintProvider>
      <App />
    </HintProvider>
  </StrictMode>
);
