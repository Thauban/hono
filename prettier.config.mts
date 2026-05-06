import { type Config } from 'prettier';

const config: Config = {
    // https://prettier.io/blog/2025/06/23/3.6.0#javascript
    // OXC = A fast JavaScript and TypeScript parser in Rust https://oxc.rs
    plugins: ['@prettier/plugin-oxc'],

    // https://github.com/prettier/prettier/issues/4102
    // https://github.com/prettier/prettier/pull/7466
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    overrides: [
        {
            files: ['*.ts', '*.mts', '*.js', '*.mjs', '*.cjs'],
            options: {
                tabWidth: 4,
            },
        },
        {
            files: ['*.yml', '*.yaml'],
            options: {
                singleQuote: false,
            },
        },
        {
            files: ['*.jsonc'],
            options: {
                trailingComma: 'none',
            },
        },
    ],
};

export default config;
