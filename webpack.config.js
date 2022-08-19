const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
//把css从JS中单独提取做压缩
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//把文件复制到打包后的指定位置
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack"); //hrm热更新用到

function normalizeName(name) {
  return (
    name
      ?.replace(/node_modules/g, "nodemodules")
      ?.replace(/[\-_.|]+/g, " ")
      ?.replace(/\b(vendors|nodemodules|js|modules|es)\b/g, "")
      ?.trim()
      ?.replace(/ +/g, "-") || name
  );
}

module.exports = (env) => {
  // env.prod
  // env.dev
  return {
    mode: env.dev?"development":"production", //production  development
    entry: {
      main: "./src/main.tsx", //key就是文件输出的命名
    },
    devtool: env.dev?"eval-source-map":"nosources-source-map",
    devServer: {
      historyApiFallback: true, //history模式下在开发环境能正常访问网页
      hot: true,
      port: 9000,
      static: "./dist",
    },
    output: {
      filename: '[name].[chunkhash].bundle.js', //key+哈希组成的名字
      // filename:'[name][hash].js',
      chunkFilename:'[name].js', //key+哈希组成的名字
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "src"),
        components: path.resolve(__dirname, "src/components"),
      },
      extensions: [".js", ".jsx", ".json", ".tsx"], //表示这几个的后缀名可省略，webpack打包的时候看到这种省略后缀名的文件会先从这个集合中匹配
    },
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
        name:'vendors',//这里一定要加个自定义的名字，他会配合output的设置追加个哈希和后缀，不加名字的话，会显示一个好长的第三方包用下划线连起来的名字
        //同步异步都提取到一个包
        chunks: "all",
      },
    },
    module: {
      rules: [
        {
          test: /\.(tsx|ts)?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(less|css)$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: false, //默认是es6的模块方式，浏览器上没响应，要声明为false
              },
            },
            // MiniCssExtractPlugin和style-loader只能存在一个，两个都有会出document is not defined的错误，style-loader是提取样式插入到styleMiniCssExtractPlugin是提取样式到新的一个文件用link的方式引入，不支持热更新，需要手动刷新
            // {
            //   loader: "style-loader",
            // },
            {
              loader: "css-loader",
              options: {
                sourceMap: false,
                modules: true,
              },
            },
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  strictMath: true,
                },
              },
            },
          ],
        },
        // {
        //   test: /\.(png|svg|jpg|jpeg|gif)$/i,
        //   generator: {
        //      //指定文件输出的地址是哪个
        //      outputPath: "./img",
        //      type: "asset",
        //   },
        //   exclude: /node_modules/,
        //   // use: [
        //   //   {
        //   //     loader: "file-loader",
        //   //     options: {
        //   //       //指定文件输出的地址是哪个
        //   //       outputPath: "./img",
        //   //       type: "asset",
        //   //     },
        //   //   },
        //   // ],
        // },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource", //等同于file-loader
          generator: {
            filename: 'none',//不打包图片资源，使用CopyPlugin插件直接拷贝
            publicPath:'/'
          }
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "llc-stage",
        template: "./public/index.html",
        // favicon: 'public/favicon.ico'
      }),
      // //拷贝指定文件夹原样打包到指定目录
      new CopyPlugin({
        patterns: [{ from: "./src/assets/imgs", to: "./src/assets/imgs" }],
      }),
      // //本插件会将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。
      new MiniCssExtractPlugin({
        filename: '[name].css', //key+哈希组成的名字
      }),
      // 实现刷新浏览器必写的热更新插件
      new webpack.HotModuleReplacementPlugin(),
    ],
  };
};
