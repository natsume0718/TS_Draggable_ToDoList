const path = require('path');

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: '[name]-[hash].js',
    path: path.resolve(__dirname, 'dist')

  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
    ]
  },
  resolve: {
    modules: [path.join(__dirname, 'node_modules')],
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
}
