module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        Buffer: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        test: 'readonly',
      },
    },
    rules: {
      'no-eval': 'error',
      'no-unused-vars': 'warn',
    },
  },
];
