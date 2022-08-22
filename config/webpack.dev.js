const path = require("path");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.js");
//react热更新插件
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = merge(baseConfig, {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    historyApiFallback: true, //history模式下在开发环境能正常访问网页
    hot: true,
    port: 9000,
    static: {
      directory: path.join(__dirname, "../public"),
    },
  },
  plugins: [
    // 开启react模块热替换插件
    new ReactRefreshWebpackPlugin(),
  ],
});
