// Bo rule JavaScript co ban cua ESLint.
import js from '@eslint/js';

// Globals cua moi truong trinh duyet nhu window, document.
import globals from 'globals';

// Rule danh rieng cho React Hooks.
import reactHooks from 'eslint-plugin-react-hooks';

// Rule phu hop voi Vite + React Fast Refresh.
import reactRefresh from 'eslint-plugin-react-refresh';

// API cau hinh hien dai cua ESLint.
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Bo qua thu muc build.
  globalIgnores(['dist']),
  {
    // Ap dung cho file JS va JSX.
    files: ['**/*.{js,jsx}'],

    // Ke thua cac bo rule co san.
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    // Cau hinh parser va bien global.
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },

    // Rule rieng cua du an.
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);
