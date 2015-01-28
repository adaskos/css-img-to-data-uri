/*jslint node: true*/
/*
 * grunt-css-img-2-data-uri
 * https://github.com/ajnasz/css-img-2-data-uri
 *
 * Copyright (c) 2013 Lajos Koszti
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
    'use strict';

    var opts = {missingFiles: true, pathAsComment: true, refresh: true, reportDuplicates: false};

    // Project configuration.
    grunt.initConfig({
        jslint: {
            files: [
                'Gruntfile.js',
                'tasks/*.js'
            ]
        },
        css_img_2_data_uri: {
            a: {
                files: [{
                    src: 'test/css/a.css',
                    dest: 'tmp/a.css'
                }], options: opts
            }, b: {
                files: [{
                    expand: true,
                    src: 'test/css/b*.css',
                    dest: 'tmp/'
                }], options: opts
            }
            , cd: {
                files: [{
                    expand: true,
                    src: 'test/css/{c,d}.css',
                    dest: 'tmp'
                }], options: opts
            }
            , mf: {
                files: [{
                    expand:true, 
                    cwd: 'test/css', 
                    src: 'miss*.css', 
                    dest: 'tmp'
                }], options: opts
            }
            , ef: {
                files: [{
                    expand:true, 
                    src: ['test/css/e.css','test/css/f.css'],
                    dest: 'tmp',
                }], options: opts
            }, dict: {
                files : {
                    'tmp/aa.css': 'test/css/a.css', //dest:src
                    'tmp/b.css': 'test/css/b.css'
                }, options: opts
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        execute: {
            testLib: ['test/test-lib.js']
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-execute');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'css_img_2_data_uri', 'execute', 'clean']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jslint',  'test']);
    };
