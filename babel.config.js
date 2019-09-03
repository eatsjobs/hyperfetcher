module.exports = function generateBabelConfig(api) {
    api.cache(true);
    return {
        presets: ['@babel/preset-env'],
        plugins: [
            '@babel/plugin-transform-runtime',
            '@babel/plugin-syntax-dynamic-import',
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }]
        ]
    };
};