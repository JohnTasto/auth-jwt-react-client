/* eslint-disable import/no-extraneous-dependencies */

const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const { getIfUtils } = require('webpack-config-utils')
const { resolve } = require('path')

const VENDOR_LIBS = [
  'react', 'react-redux', 'react-dom',
  'redux', 'redux-form', 'redux-thunk',
  'lodash',
]

module.exports = env => {
  const { ifProd, ifNotProd } = getIfUtils(env)
  const config = {
    context: resolve('src'),
    entry: {
      bundle: './index.jsx',
      vendor: VENDOR_LIBS,
    },
    output: {
      path: resolve('dist'),
      filename: '[name].[chunkhash].js',
      pathinfo: ifNotProd(),
    },
    devtool: env.prod ? 'source-map' : 'eval',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            use: 'css-loader',
            fallback: 'style-loader',
          }),
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/,
          use: [
            {
              loader: 'url-loader',
              options: { limit: 8192 },
            },
            'image-webpack-loader',
          ],
        },
        {
          test: /\.ico$/,
          use: [{
            loader: 'file-loader',
            options: { name: '[name].[ext]' },
          }],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: ifProd('"production"', '"development"'),
          API_ROOT: process.env.API_ROOT || '"http://localhost:9090"',
        },
      }),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'],
      }),
      new ExtractTextPlugin('styles.[name].[chunkhash].css'),
      new HtmlWebpackPlugin({
        template: 'index.html',
      }),
      new ProgressBarPlugin(),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
    devServer: {
      historyApiFallback: true,
      contentBase: './',
      // quiet: true,
    },
  }
  if (env.debug) {
    console.log(config)  // eslint-disable-line no-console
    debugger             // eslint-disable-line no-debugger
  }
  return config
}
