const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const zlib = require("zlib");
const crypto = require("node:crypto");

module.exports = async () => ({
  mode: "production", // Use 'production' for optimized build
  entry: "./src/index.tsx", // Entry point for your app

  output: {
    path: path.resolve(__dirname, "dist"), // Output directory
    filename: "[name].[contenthash].js", // Output filename for the bundle
    publicPath: "/", // Ensure the app runs correctly with client-side routing
  },

  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
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
        use: "ts-loader", // Use ts-loader to transpile TypeScript files
      },
      {
        test: /\.css$/, // Process CSS files
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"], // Resolve TypeScript and JavaScript files
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", // HTML template
      filename: "index.html", // Output HTML filename
    }),
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress",
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    }),
    new BundleAnalyzerPlugin(),
  ],

  optimization: {
    moduleIds: "deterministic",
    runtimeChunk: "single", // Optional: Split runtime code into a separate chunk
    splitChunks: splitChunks(),
  },
});

function splitChunks() {
  const FRAMEWORK_BUNDLES = [`react`, `react-dom`, `scheduler`, `prop-types`];

  // This regex ignores nested copies of framework libraries so they're bundled with their issuer
  const FRAMEWORK_BUNDLES_REGEX = new RegExp(`${FRAMEWORK_BUNDLES.join(`|`)}`);

  return {
    chunks: `all`,
    cacheGroups: {
      default: false,
      defaultVendors: false,
      framework: {
        chunks: `all`,
        name: `react`,
        test: (module) => {
          if (module.nameForCondition().includes("react-chartjs-2")) {
            return false;
          }
          return FRAMEWORK_BUNDLES_REGEX.test(module.nameForCondition());
        },
        priority: 40,
        // Don't let webpack eliminate this chunk (prevents this chunk from becoming a part of the commons chunk)
        enforce: true,
      },
      lib: {
        test(module) {
          return (
            module.size() > 160000 &&
            /node_modules[/\\]/.test(module.identifier())
          );
        },
        name(module) {
          const hash = crypto.createHash(`sha1`);
          if (!module.libIdent) {
            throw new Error(
              `Encountered unknown module type: ${module.type}. Please open an issue.`
            );
          }

          return hash.digest(`hex`).substring(0, 8);
        },
        priority: 30,
        minChunks: 1,
        reuseExistingChunk: true,
      },
    },
    // We load our pages async through async-requires, maxInitialRequests doesn't have an effect on chunks derived from page components.
    // By default webpack has set maxAsyncRequests to 6, in some cases this isn't enough an actually makes the bundle size blow up.
    // We've set maxAsyncRequests to Infinity to negate this. This could potentionally exceed the 25 initial requests that we set before
    // sadly I do not have a better solution.
    maxAsyncRequests: Infinity,
    maxInitialRequests: 25,
    minSize: 20000,
  };
}
