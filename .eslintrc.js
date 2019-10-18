module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    //强制使用单引号
    "quotes": 0,
    //强制不使用分号结尾
    "semi": 0,
    'space-before-function-paren': 0,
    "indent": 0,
    "no-tabs": 0,
    "no-unneeded-ternary": 0,
    "no-unused-expressions": 0,
    "no-multi-spaces": 0,
    "no-undef": 0,
    "no-unused-vars": 0,
    "no-trailing-spaces": 0,
    "no-mixed-spaces-and-tabs": 0,
    "one-var": 0,
    "eqeqeq": 0,
  }
}
