const path = require('path'),
      UglifyJSPlugin = reuiqre('uglifyjs-webpack-plugin'),
      BannerWebpackPlugin = require('banner-webpack-plugin'),
      banner = require('fs').readFileSync('./src/banner.js', {encoding: 'utf8'}) + '\n';

module.exports = {
    entry: {NamuFix: './src/index.js'},
    output: {
        filename: '[name].user.js',
        path: __dirname
    },
    modules: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.(svg)/,
                loader: 'url-loader'
            }
        ]
    },
    plugins: [
        new UglifyJSPlugin(),
        new BannerWebpackPlugin({
            chunks: {
                NamuFix: {
                    beforeContent: banner
                }
            }
        })
    ]
}