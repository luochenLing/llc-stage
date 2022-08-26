const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
//把css从JS中单独提取做压缩
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//把文件复制到打包后的指定位置
const CopyPlugin = require("copy-webpack-plugin");
const isDev = process.env.NODE_ENV == "dev";

module.exports = {
  entry: {
    main: path.resolve(__dirname, "../src/main.tsx"), //key就是文件输出的命名
  },
  output: {
    filename: "[name].[chunkhash:8].bundle.js", //key+哈希组成的名字
    chunkFilename: "[name].[chunkhash:8].js", //key+哈希组成的名字，针对的是懒加载文件，例如react.lazy导入的文件
    path: path.resolve(__dirname, "../dist"),
    clean: true,
    assetModuleFilename: "../src/assets/imgs/[name][ext]", //绝对路径会报错，就是不要path.resolve(__dirname, ".."),这么写
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "../src"),
      "@components": path.resolve(__dirname, "../src/components"),
    },
    extensions: [".js", ".jsx", ".json", ".tsx"], //表示这几个的后缀名可省略，webpack打包的时候看到这种省略后缀名的文件会先从这个集合中匹配
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: "thread-loader",
          },
          {
            loader: "babel-loader",
            options: {
              presets: [isDev && "@babel/preset-env"].filter(Boolean),
            },
          }
        ],
      },
      {
        test: /\.(tsx|ts)?$/,
        use: ["ts-loader"],//thread-loader不能和ts-loader一起用，会不兼容而报错
        exclude: /node_modules/,
      },
      {
        test: /\.(less|css)$/i,
        exclude: /node_modules/,
        use: [
          // MiniCssExtractPlugin和style-loader只能存在一个，两个都有会出document is not defined的错误，style-loader是提取样式插入到styleMiniCssExtractPlugin是提取样式到新的一个文件用link的方式引入，不支持热更新，需要手动刷新
          isDev
            ? {
                loader: "style-loader",
              }
            : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  esModule: false, //默认是es6的模块方式，浏览器上没响应，要声明为false
                },
              },
          {
            loader: "css-loader",
            options: {
              sourceMap: false,
              // modules: true,
              modules: {
                localIdentName: "css__module__[name]__[local][chunkhash:8]", //加个css__module__前缀，防止purgecss-webpack-plugin打包的时候给排除了
              },
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
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
      {
        //这里没找到处理img 里面src的方法，只能处理css里面的图片，所以用到了CopyPlugin做覆盖处理，但是需要assetModuleFilename的配置，将asset静态资源指定打包的输出地址
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, //小于10K就压缩成base64,减少网络请求
          },
        },
        // generator: {
        //   filename: "src/assets/imgs/[name][ext]",
        //   // publicPath: "./",
        // },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/, // 匹配媒体文件
        type: "asset", // type选择asset
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb转base64位
          },
        },
      },
    ],
  },
  plugins: [
    //本插件会将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。
    !isDev &&
      new MiniCssExtractPlugin({
        filename: "[name].css", //key+哈希组成的名字
      }),
    new HtmlWebpackPlugin({
      title: "llc-stage",
      template: path.resolve(__dirname, "../public/index.html"),
      // favicon: 'public/favicon.ico'
    }),
    //拷贝指定文件夹原样打包到指定目录
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../src/assets/imgs"),
          to: path.resolve(__dirname, "../dist/src/assets/imgs"),
        },
      ],
    }),
  ].filter(Boolean),

  // 开启webpack持久化存储缓存
  cache: {
    type: "filesystem", // 使用文件缓存
  },
};
