import { initFramework } from '@airport/web-terminal'
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

initFramework().then()

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);