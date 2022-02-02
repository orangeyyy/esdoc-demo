module.exports = {
  source: './src',
  destination: './docs',
  includes: ['\\.[t|j]s$'],
  plugins: [{
    name: 'esdoc-standard-plugin',
    option: [{
      brand: {
        title: 'esdoc test'
      }
    }]
  }, {
    name: 'esdoc-publish-html-plugin',
  }, {
    name: 'esdoc-inject-style-plugin',
    option: {
      styles: ['./esdoc.css']
    }
  }, {
    name: 'esdoc-typescript-plugin',
    option: {
      enable: true
    }
  }, {
    name: 'esdoc-importpath-plugin',
    option: {
       stripPackageName: false,
       replaces: [{ from: '^src/.*', to: '' }],
    }
  }, {
    name: 'esdoc-ecmascript-proposal-plugin',
    option: {
      classProperties: true,
      objectRestSpread: true,
      doExpressions: true,
      functionBind: true,
      functionSent: true,
      asyncGenerators: true,
      decorators: true,
      exportExtensions: true,
      dynamicImport: true
    }
  }, {
    name: './esdocPlugin.js',
    option: {
      logo: 'https://d33wubrfki0l68.cloudfront.net/c088b7acfcf11100903c44fe44f2f2d7e0f30531/47727/img/docusaurus.svg',
      title: 'esdoc-demo',
      alias: {
        Home: '首页',
        Reference: 'API',
        Source: '文档覆盖'
      }
    }
  }]
}