import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier'; // Importation correcte
import globals from 'globals';

export default [
  js.configs.recommended,
  // 1. Appliquer la configuration Prettier ici (pour désactiver les règles conflictuelles)
  prettierConfig, // Déplacé ici, en tant qu'élément de configuration de niveau supérieur
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // L'erreur était ici : 'prettierConfig' ne doit PAS être dans languageOptions.
      // prettierConfig,  <-- LIGNE SUPPRIMÉE ET DÉPLACÉE CI-DESSUS
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
    },
    rules: {
      // Règles Prettier
      'prettier/prettier': 'error',
      // ... (le reste de vos règles)
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      // General rules
      'no-console': 'off', // We're building a logger, console is expected
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-destructuring': ['error', { object: true, array: false }],
      // Error handling
      'no-throw-literal': 'error',
      // Import/export
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      // Apply TypeScript recommended rules
      ...typescript.configs.recommended.rules,
      ...typescript.configs['recommended-requiring-type-checking'].rules,
    },
  },

  // ... (le reste de votre configuration reste inchangé)

  // Config files
  {
    files: ['rollup.config.js', 'eslint.config.js', 'vitest.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  // Example files with mixed environments
  {
    files: ['src/example.ts'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        ...globals.node, 
        ...globals.es2022,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  // Development and internal files
  {
    files: ['src/factory.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  // Ignore patterns
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '**/*.test.ts', '**/*.spec.ts'],
  },
];