// defineConfig giup editor goi y va kiem tra cau hinh Vite tot hon.
import { defineConfig } from 'vite';

// Plugin React de Vite hieu JSX va ho tro HMR.
import react from '@vitejs/plugin-react';

// Cau hinh Vite cho du an frontend.
export default defineConfig({
  // Kich hoat plugin React.
  plugins: [react()],
});
