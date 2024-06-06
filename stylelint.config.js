module.exports = {
  extends: [
    'stylelint-config-sass-guidelines',
  ],
  ignoreFiles: [
    'node_modules',
    'tmp',
    '**/*.md',
    '**/*.html',
  ],
  plugins: [
    'stylelint-scss',
  ],
  rules: {
    indentation: 2,
    'selector-max-id': 1,
    'max-nesting-depth': 5,
  },
  overrides: [
    {
      files: ['*.sass', '**/*.sass'],
      customSyntax: 'postcss-sass',
      rules: {
        'color-named': null,
        'selector-no-qualifying-type': null,
        'selector-max-compound-selectors': 5,
      },
    },
  ],
};
