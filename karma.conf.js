/* global module */
module.exports = (config) => {
    'use strict';
    config.set({
        autoWatch: true,
        babelPreprocessor: {
            options: {
                sourceMap: 'inline'
            },
            sourceFileName: function(file) {
                return file.originalPath;
            }
        },
        basePath: __dirname,
        browsers: ['PhantomJS'],
        coverageReporter: {
            instrumenters: {
                isparta: require('isparta')
            },
            instrumenter: {
                'app/**/*.js': 'isparta'
            },
            reporters: [
                {
                    type: 'text-summary',
                },
                {
                    type: 'html',
                    dir: 'coverage/',
                }
            ]
        },
        frameworks: ['jspm', 'jasmine'],
        logLevel: config.LOG_INFO,
        jspm: {
            config: 'config.js',
            loadFiles: [
                '/spec/**/*.spec.js'
            ],
            packages: "jspm_packages/",
            serveFiles: [
                '/app/**/*.js'
            ],
            stripExtension: false,
            useBundles: false
        },
        preprocessors: {
            'app/**/*.js': ['babel', 'sourcemap', 'coverage']
        },
        //plugins: ['karma-jspm', 'karma-phantomjs-launcher'],
        reporters: ['coverage', 'progress'],
        singleRun: true,
    });
};