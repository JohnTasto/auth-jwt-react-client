const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { getIfUtils } = require('webpack-config-utils')
const { resolve } = require('path')

const VENDOR_LIBS = [
  'react', 'react-redux', 'react-dom',
  'redux', 'redux-form', 'redux-thunk',
  'lodash',
]

module.exports = (env) => {
  const { ifNotProd } = getIfUtils(env)
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
          use: 'babel-loader',
          test: /\.jsx?$/,
          exclude: /node_modules/,
        },
        {
          use: ['style-loader', 'css-loader'],
          test: /\.css$/,
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
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'],
      }),
      new HtmlWebpackPlugin({
        template: 'index.html',
      }),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
    devServer: {
      historyApiFallback: true,
      contentBase: './',
    },
  }
  if (env.debug) {
    console.log(config)  // eslint-disable-line no-console
    debugger             // eslint-disable-line no-debugger
  }
  return config
}
