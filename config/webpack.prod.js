const path = require("path");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.js");

module.exports = merge(baseConfig, {
  mode: "production", //production  development
  optimization: {
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
  plugins: [],
});
