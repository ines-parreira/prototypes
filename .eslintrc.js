module.exports = {
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            extends: ['.eslintrc.typescript.js'],
        },
        {
            files: ['*.js', '*.jsx'],
            extends: ['.eslintrc.javascript.js'],
        },
    ],
}
