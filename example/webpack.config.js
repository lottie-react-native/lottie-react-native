const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);

const {presets} = require(`${appDirectory}/babel.config.js`);
const {resolver} = require('./metro.config.js');

const compileNodeModules = ['lottie-react-native', 'react-native-dropdown-picker', 'react-native'].map(
	moduleName => path.resolve(appDirectory, `node_modules/${moduleName}`),
);

const babelLoaderConfiguration = {
	test: /\.js$|tsx?$/,
	include: [
		path.resolve(__dirname, 'index.web.js'),
		path.resolve(__dirname, 'App.tsx'),
		path.resolve(__dirname, 'src'),
		...compileNodeModules,
	],
	use: {
		loader: 'babel-loader',
		options: {
			cacheDirectory: true,
			presets,
			plugins: ['react-native-web'],
		},
	},
};

module.exports = {
	mode: 'development',
	entry: {
		app: './index.web.js',
	},
	stats: {warnings: false},
	output: {
		path: path.resolve(appDirectory, 'dist'),
		publicPath: '/',
		filename: 'output.bundle.js',
	},
	resolve: {
		mainFields: ['react-native', 'main'],
		extensions: [
			'.web.tsx',
			'.web.ts',
			'.tsx',
			'.ts',
			'.web.js',
			'.js',
			'.lottie',
			'.json',
		],
		alias: {
			...resolver.extraNodeModules,
			'react-native': 'react-native-web',
		},
		symlinks: false,
		modules: ['node_modules', 'src'],
	},
	module: {
		rules: [
			babelLoaderConfiguration,
			{
				test: /\.lottie$/,
				type: 'asset/resource',
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
		],
	},
	watch: true,
	watchOptions: {
		followSymlinks: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'public', 'index.html'),
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			// See: https://github.com/necolas/react-native-web/issues/349
			__DEV__: JSON.stringify(true),
		}),
	],
};
