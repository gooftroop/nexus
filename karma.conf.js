/* global module */
module.exports = (config) => {
    'use strict';
    config.set({
        autoWatch: true,
        singleRun: true,
        frameworks: ['jspm', 'jasmine'],
        jspm: {
            config: 'config.js',
            loadFiles: [
                'spec/**/*.spec.js'
            ],
            serveFiles: [
                'app/**/*.js'
            ],
            useBundles: true,
            stripExtension: false
        },
        browsers: ['PhantomJS'],
        reporters: ['progress'],
        files: [
            'node_modules/karma-babel-preprocessor/node_modules/babel-core/browser-polyfill.js'
        ],
        preprocessors: {
            'app/**/*.js': ['babel', 'sourcemap', 'coverage']
        },
        babelPreprocessor: {
            options: {
                sourceMap: 'inline',
                blacklist: ['useStrict']
            },
            sourceFileName: function(file) {
                return file.originalPath;
            }
        },
        reporters: ['coverage', 'progress'],
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
        }
    });
};