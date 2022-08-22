const path = require("path");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.js");
const PurgeCSSPlugin = require("purgecss-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin  = require('compression-webpack-plugin')
const globAll = require("glob-all");

module.exports = merge(baseConfig, {
  mode: "production", //production  development
  optimization: {
    minimizer: [
      // 压缩css
      new CssMinimizerPlugin(),
      // 压缩js
      new TerserPlugin({
        parallel: true, // 开启多线程压缩
        terserOptions: {
          compress: true,
        },
      }),
    ],
    //设置为true以后webpack会启动摇树算法过滤掉未引用的文件，false的话则有自己的规则定义哪些文件可以包含到项目
    usedExports: true,
    //共享模块不设置这个会导致所有引用共享模块的地方都只是引用了地址不是单独的空间，利用缓存最小化更新，避免hash每次变化导致的文件重新生成会让浏览器重新请求
    runtimeChunk: true,
    /**
     * "sideEffects": [
     *    "./src/common/util.js"
     *  ],
     *  不想被摇树掉的文件可以这么写
     */
    // sideEffects: true,//生产环境配置到package.json中，
    //通过providedExports收集其他模块到底导出了哪些内容，就可以在export * from ...的基础上导出具体的模块，方便 tree shaking。
    providedExports: true,
    //持久化缓存
    moduleIds: "deterministic",
    //提取公共代码，防止代码被重复打包，拆分过大的js文件，合并零散的js文件
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /node_modules/, // 只匹配node_modules里面的模块
          name: "vendors", //这里一定要加个自定义的名字，他会配合output的设置追加个哈希和后缀，不加名字的话，会显示一个好长的第三方包用下划线连起来的名字
          minChunks: 1, // 只要使用一次就提取出来
          chunks: "initial", // 只提取初始化就能获取到的模块，不管异步的
          minSize: 0, // 提取代码体积大于0就提取出来
          priority: 1, // 提取优先级为1
        },
      },
      // name(_,_,cacheGroupKey){
      //   return cacheGroupKey
      // },
      //   //同步异步都提取到一个包
      //   chunks: "all",
    },
  },
  plugins: [
    // 去除没用到的css插件
    new PurgeCSSPlugin({
      paths: globAll.sync([
        `${path.join(__dirname, "../src")}/**/*.tsx`,
        `${path.join(__dirname, "../public")}/index.html`,
      ]),
      safelist: {
        standard: [/^ant-/], // 过滤以ant-开头的类名，哪怕没用到也不删除，如果是抖音库就过滤semi
        deep: [/css__module__/],//因为这个插件会导致css模块化的样式被排除再外，所以这里要做个过滤
      },
    }),
    // 打包生成gzip插件
    new CompressionPlugin({
      test: /\.(js|css)$/, // 只生成css,js压缩文件
      filename: "[path][base].gz", // 文件命名
      algorithm: "gzip", // 压缩格式，默认是gzip
      threshold: 10240, // 只有大小大于该值的资源会被处理。默认值是 10k
      minRatio: 0.8, // 压缩率,默认值是 0.8
    }),
  ],
});
