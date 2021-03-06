const path = require('path')
const webpack = require('webpack')
const cssnext = require('postcss-cssnext')
const postcssFocus = require('postcss-focus')
const postcssReporter = require('postcss-reporter')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cwd = process.cwd()

const configureWebpack = opts => ({
  entry: opts.entry,

  plugins: opts.plugins,

  output: Object.assign({
    path: path.resolve(cwd, 'build'),
  }, opts.output),

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: opts.babelQuery,
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      loader: opts.cssLoaders,
    }, {
      test: /\.css$/,
      include: /node_modules/,
      loaders: [ 'style-loader', 'css-loader' ],
    }, {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      loader: 'file-loader',
    }, {
      test: /\.(jpg|png|gif)$/,
      loaders: [
        'file-loader',
        'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}',
      ],
    }, {
      test: /\.html$/,
      loader: 'html-loader',
    }, {
      test: /\.json$/,
      loader: 'json-loader',
    }, {
      test: /\.(mp4|webm)$/,
      loader: 'url-loader?limit=10000',
    }],
  },

  resolve: {
    modules: ['app', 'node_modules'],
    extensions: ['.js', '.jsx', '.react.js'],
    packageMains: ['jsnext:main', 'main' ],
    alias: {
      containers: path.join(cwd, 'app', 'containers'),
      components: path.join(cwd, 'app', 'components'),
      styles: path.join(cwd, 'app', 'containers', 'App', 'style.css'),
    },
  },

  postcss: _ => [
    postcssFocus(),
    cssnext({ browsers: ['last 2 versions', 'IE > 10'] }),
    postcssReporter({ clearMessages: true }),
  ],
  devtool: opts.devtool,
  target: 'web',
  stats: false,
  progress: true,
})

const devBuild = _ => configureWebpack({
  entry: [
    'webpack-hot-middleware/client',
    path.join(cwd, 'app/index.js'),
  ],

  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },

  babelQuery: {
    presets: ['react-hmre'],
  },

  cssLoaders: 'style-loader!css-loader?localIdentName=[local]__[path][name]__[hash:base64:5]&modules&importLoaders=1&sourceMap!postcss-loader',

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new WriteFilePlugin({ log: false }),
    new ExtractTextPlugin('[name].[contenthash].css'),
    new HtmlWebpackPlugin({
      template: 'app/index.html',
      inject: true,
    }),
    new webpack.DefinePlugin({ __DEV__: true })
  ],

  devtool: 'inline-source-map',
})

const prodBuild = _ => configureWebpack({
  entry: [ path.join(cwd, 'app/index.js') ],

  output: {
    publicPath: 'build/',
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].chunk.js'
  },

  cssLoaders: ExtractTextPlugin.extract(
    'style-loader',
    'css-loader?modules&importLoaders=1!postcss-loader'
  ),

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      children: true,
      minChunks: 2,
      async: true,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }),
    new HtmlWebpackPlugin({
      template: 'app/index.html',
      title: 'Evan Turner | Developer',
      filename: '../index.html',
      appMountId: 'app',
      inject: true
    }),
    new ExtractTextPlugin('[name].[contenthash].css'),
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
  ],
})

module.exports = process.env.NODE_ENV === 'development' ? devBuild() : prodBuild()