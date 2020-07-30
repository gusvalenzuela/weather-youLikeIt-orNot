// const webpack = require('webpack');
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
// const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const StyleLintPlugin = require("stylelint-webpack-plugin")
const path = require("path")

var config = {
	mode: "production", // "development" || "none"
	context: __dirname,
	entry: {
		index: "./src/js/index.js",
		// style: "./src/css/style.css",
		// placeSearch: "./src/js/place-search.js",
		// dashboard: "./src/js/style.js",
	},
	output: {
		path: __dirname + "/public",
		publicPath: "/",
	},
	plugins: [
		new StyleLintPlugin({
			configFile: ".stylelintrc", // if your config is in a non-standard place
			files: "src/**/*.css", // location of your CSS files
			fix: true, // if you want to auto-fix some of the basic rules
		}),
		new CleanWebpackPlugin({
			verbose: true,
		}),
	],
	module: {
		rules: [
			{
				test: /\.(js)$/,
				exclude: [/node_modules/],
				use: ["babel-loader", "eslint-loader"],
			},
			{
				test: /\.css$/i,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							// Run `postcss-loader` on each CSS `@import`, do not forget that `sass-loader` compile non CSS `@import`'s into a single file
							// If you need run `sass-loader` and `postcss-loader` on each CSS `@import` please set it to `2`
							importLoaders: 1,
						},
					},
				],
			},
			{
				test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "images",
						},
					},
				],
				include: path.join(__dirname, "/src/images"),
			},
		],
	},
}

module.exports = (env, argv) => {
	console.log(env)
	if (argv.mode === "development") {
		config.devtool = "inlinesource-map"
	}

	if (argv.mode === "production") {
		//...
	}

	return config
}
