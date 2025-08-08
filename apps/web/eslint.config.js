import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: ['dist'],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: '2022',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2022,
            },
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
        settings: {
            react: {
                version: '18.2',
            },
        },
    },
    {
        // disable type-aware linting on JS files
        files: ['**/*.js'],
        extends: [tseslint.configs.disableTypeChecked],
    },
);
