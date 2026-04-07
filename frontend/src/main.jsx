// StrictMode giup phat hien mot so van de trong qua trinh phat trien.
import { StrictMode } from 'react';

// createRoot la API cua React de render ung dung vao DOM.
import { createRoot } from 'react-dom/client';

// Nap file CSS tong.
import './index.css';

// Nap component goc cua ung dung.
import App from './App.jsx';

// Render App vao the div #root trong index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
