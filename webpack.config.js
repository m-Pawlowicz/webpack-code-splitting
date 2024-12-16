const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production', // Use 'production' for optimized build
  entry: './src/index.tsx', // Entry point for your app

  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: '[name].js', // Output filename for the bundle
    publicPath: '/', // Ensure the app runs correctly with client-side routing
  },

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3000,
    hot: true, // Enable hot reloading
    open: true, // Automatically open the browser
    historyApiFallback: true, // Handle client-side routing with a single index.html
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/, // Process both .ts and .tsx files
        exclude: /node_modules/,
        use: 'ts-loader', // Use ts-loader to transpile TypeScript files
      },
      {
        test: /\.css$/, // Process CSS files
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'], // Resolve TypeScript and JavaScript files
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML template
      filename: 'index.html', // Output HTML filename
    }),
  ],

  optimization: {
    runtimeChunk: 'single', // Optional: Split runtime code into a separate chunk
  },
};
