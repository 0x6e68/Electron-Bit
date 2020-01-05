var path = require('path');
module.exports = {
  chainWebpack: config => {
    config.entry('app')
      .clear()
      .add('./src/renderer/main.ts');
  },
  pluginOptions: {
    electronBuilder: {
      chainWebpackRendererProcess: config => {
        config.resolve.alias.set('@', path.resolve(__dirname, 'src/renderer'));
      }
    }
  }
};
