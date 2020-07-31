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
	},
	output: {
		path: __dirname + "/client/dist",
		publicPath: "/dist",
	},
	plugins: [
		new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
		new StyleLintPlugin({
			configFile: ".stylelintrc", // if your config is in a non-standard place
			files: "src/**/*.css", // location of your CSS files
			fix: true, // if you want to auto-fix some of the basic rules
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
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "images",
							publicPath: "/dist/images",
						},
					},
				],
				include: path.join(__dirname, "/src"),
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
