const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require("dotenv").config({ path: path.resolve(__dirname, envFile) });

const isProduction = process.env.NODE_ENV === 'production';

// Remote URLs - configurable via environment
const REACT_REMOTE_URL = process.env.REACT_APP_REACT_REMOTE_URL || 'http://localhost:3001';
const VUE_REMOTE_URL = process.env.REACT_APP_VUE_REMOTE_URL || 'http://localhost:3002';
const PUBLIC_PATH = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/` : (isProduction ? '/MFE-App/' : 'http://localhost:3000/');
const BASENAME = process.env.PUBLIC_URL || (isProduction ? '/MFE-App' : '');

module.exports = {
  mode: isProduction ? 'production' : 'development',
  output: {
    publicPath: PUBLIC_PATH,
    path: path.resolve(__dirname, "dist"),
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  require("tailwindcss"),
                  require("autoprefixer"),
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      remotes: {
        reactRemote: `reactRemote@${REACT_REMOTE_URL}/remoteEntry.js`,
        // Vue remote is loaded via dynamic import in VueWrapper (ESM compatibility)
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "^19.0.0",
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^19.0.0",
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: "^6.0.0",
        },
        vue: {
          singleton: true,
          requiredVersion: "^3.4.0",
        },
        "vue-router": {
          singleton: true,
          requiredVersion: "^4.2.0",
        },
      },
    }),
    new HtmlWebPackPlugin({
      template: "./public/index.html",
    }),
    new webpack.DefinePlugin({
      "process.env.REACT_APP_GOOGLE_CLIENT_ID": JSON.stringify(
        process.env.REACT_APP_GOOGLE_CLIENT_ID || ""
      ),
      "process.env.REACT_APP_USE_BFF": JSON.stringify(
        process.env.REACT_APP_USE_BFF || "false"
      ),
      "process.env.REACT_APP_BFF_URL": JSON.stringify(
        process.env.REACT_APP_BFF_URL || "http://localhost:3003"
      ),
      "process.env.REACT_APP_VUE_REMOTE_URL": JSON.stringify(VUE_REMOTE_URL),
      "process.env.REACT_APP_BASENAME": JSON.stringify(BASENAME),
    }),
    // Copy 404.html for GitHub Pages SPA support
    ...(isProduction ? [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public/404.html'),
            to: '404.html',
            noErrorOnMissing: true,
          },
        ],
      }),
    ] : []),
  ],
};
