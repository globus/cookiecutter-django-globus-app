require('@babel/polyfill');

const exec = require('child_process').exec;
const path = require('path');
const webpack = require('webpack');

const afterCompilePlugin = {
  apply: (compiler) => {
    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
      exec('python manage.py collectstatic --no-input', (err, stdout, stderr) => {
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);
      });
    });
  },
};

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let plugins = [
  new HtmlWebpackPlugin({
    inject: false,
    filename: path.resolve(__dirname, 'templates/globus-portal-framework/v2/components/transfer/home.html'),
    template: path.resolve(__dirname, 'templates/globus-portal-framework/v2/components/transfer/index.html'),
  }),
  new MiniCssExtractPlugin(),
  new webpack.ProgressPlugin(),
];

if (process.env.NODE_ENV == 'local') {
  plugins.push(afterCompilePlugin);
}

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    globus: ['@babel/polyfill', './staticfiles/js/transfer/src/index.js'],
  },

  output: {
    chunkFilename: '[id].chunk.js',
    filename: '[name].js',
    path: path.resolve(__dirname, 'staticfiles/js/transfer/build'),
    publicPath: '/static/js/transfer/build/',
  },

  plugins: plugins,

  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        include: [path.resolve(__dirname, 'staticfiles/js/transfer')],
        loader: 'babel-loader',

        options: {
          plugins: ['syntax-dynamic-import'],
          presets: [['@babel/preset-env', { modules: false }, '@babel/preset-react']],
        },
      },
      {
        test: /.(css|sass|scss)$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader' },
          { loader: 'resolve-url-loader' },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
};
