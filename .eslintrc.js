const { join } = require('path');
module.exports = {
  root: true,
  ignorePatterns: ['**/*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: [
      '?(packages)/**/tsconfig\\.?(app|lib|spec).json',
      '?(packages)/**/tsconfig\\.json',
    ],
  },
  extends: [
    'plugin:sonarjs/recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  plugins: ['@nrwl/nx', 'import', 'sonarjs', 'prettier', 'file-progress'],
  settings: {
    'import/internal-regex': '^@wisewolf-oss/|@generated/',
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: 'tsconfig.base.json',
      },
    },
    progress: {
      hide: true,
      successMessage: 'Linting completed successfully',
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        '@nrwl/nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
              {
                sourceTag: '*',
                onlyDependOnLibsWithTags: ['*'],
              },
            ],
          },
        ],
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        'no-var': 'off',
        'spaced-comment': 'off',
        'vars-on-top': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@nrwl/nx/typescript'],
      rules: {
        'import/default': 'error',
        'import/no-extraneous-dependencies': [
          'warn',
          {
            devDependencies: [
              '**/test/*.ts',
              '**/test/*.tsx',
              '**/*.spec.ts',
              '**/*.spec.tsx',
              '**/*.cs.ts',
              '**/support/*.ts',
              '**/e2e/*.ts',
              'libs/nx-*/**',
              '**/cypress.config.ts',
              '**/vite.config.ts',
            ],
            optionalDependencies: false,
            peerDependencies: false,
            packageDir: __dirname,
          },
        ],
        'import/no-unresolved': ['error'],
        'import/prefer-default-export': 'off',
        'no-underscore-dangle': ['error'],
        'prettier/prettier': [
          'warn',
          {
            endOfLine: 'lf',
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'lodash.isequal',
                message:
                  'Lodash modularised (and lodash < 4.17.11) have CVE vulnerabilities. Please use tree-shakeable imports like lodash/xxx instead',
              },
              {
                name: 'lodash.uniqueId',
                message:
                  'Lodash modularised (and lodash < 4.17.11) have CVE vulnerabilities. Please use tree-shakeable imports like lodash/xxx instead',
              },
              {
                name: 'lodash.mergewith',
                message:
                  'Lodash modularised (and lodash < 4.17.11) have CVE vulnerabilities. Please use tree-shakeable imports like lodash/xxx instead',
              },
              {
                name: 'lodash.pick',
                message:
                  'Lodash modularised (and lodash < 4.17.11) have CVE vulnerabilities. Please use tree-shakeable imports like lodash/xxx instead',
              },
            ],
            patterns: ['lodash.*'],
          },
        ],
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nrwl/nx/javascript'],
      rules: {},
    },
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx'],
      env: {
        jest: true,
      },
      rules: {},
    },
    {
      files: '*.json',
      parser: 'jsonc-eslint-parser',
      rules: {},
    },
  ],
};
