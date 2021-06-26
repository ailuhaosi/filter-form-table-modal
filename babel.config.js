module.exports = {
  "presets": [
    "@vue/cli-plugin-babel/preset"
  ],
  "plugins": [
    /* [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ], */
    "@babel/plugin-transform-arrow-functions",
    // 双问号
    "@babel/plugin-proposal-nullish-coalescing-operator",
    // 可选链插件
    "@babel/plugin-proposal-optional-chaining"
  ]
}