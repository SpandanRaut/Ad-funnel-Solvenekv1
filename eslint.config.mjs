import vue from "eslint-plugin-vue";
import ts from "typescript-eslint";
export default [
  ...ts.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: ts.parser } },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/max-attributes-per-line": "off",
      "vue/html-self-closing": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-indent": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/first-attribute-linebreak": "off",
    },
  },
  {
    ignores: [
      ".nuxt/**",
      ".output/**",
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      ".qa/**",
      ".npm-logs/**",
    ],
  },
];
