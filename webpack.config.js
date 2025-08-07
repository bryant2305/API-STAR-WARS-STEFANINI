/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin'); // también faltaba este require

module.exports = {
  entry: './src/lambda.ts',
  target: 'node',
  mode: 'production',
  externals: [nodeExternals()], // ← 2. AÑADIR ESTA LÍNEA
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        // La clave está aquí: excluimos explícitamente los archivos de prueba
        exclude: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, '.serverless'),
          path.resolve(__dirname, '.webpack'),
          /\.(spec|e2e-spec)\.ts$/,
        ],
        options: {
          // Acelera la compilación
          transpileOnly: true,
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lambda.js',
    libraryTarget: 'commonjs2',
  },
};
