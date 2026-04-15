module.exports = [
  {
    files: ['*/.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        setImmediate: 'readonly',
      }
    },
    rules: {
      'no-unused-vars': ["warn", { "argsIgnorePattern": "^_" }],
      'no-undef': 'error',
      'no-console': 'off',
      'no-unreachable': 'error',
      'no-constant-condition': 'warn',
      'no-async-promise-executor': 'error',
      'require-await': 'warn',
      'eqeqeq': ['error', 'smart'],
      'curly': 'error',
      'no-eval': 'error',
      'no-useless-catch': 'warn',
      'no-shadow': 'warn',
      'no-use-before-define': 'error',
      'no-redeclare': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'consistent-return': 'warn',
    },
  },
  // ─────────────────────────────────────
  // Override per i file di test Jest
  // ─────────────────────────────────────
  {
    files: ['src/tests/*/.js', 'jest.setup.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
    },
  },
];