const path = require('path');

module.exports = {
    entry: './src/inline-svg-lazy-loader.js',
    output: {
        filename: 'inline-svg-lazy-loader.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'inlineSvgLazyLoader',
            type: 'umd',
        },
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: path.resolve(__dirname, 'node_modules/'),
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', { targets: 'defaults' }]
                            ]
                        }
                    },
                ],
            },
        ],
    },
};
