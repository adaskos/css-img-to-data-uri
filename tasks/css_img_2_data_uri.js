/*jslint node: true*/
/*
 * grunt-css-2-data-uri
 * https://github.com/ajnasz/css-2-data-uri
 *
 * Copyright (c) 2013 Lajos Koszti
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
    'use strict';
    var chalk = require('chalk')
        , os = require('os')
        , fs = require('fs')
        , async = require('async')
        , build = require('../lib/css_img_2_data_uri')
        , desc = 'Replaces image urls in css files with data uri';

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks
    grunt.registerMultiTask('css_img_2_data_uri', desc, function () {
        var options = this.options({reportDuplicates: true})
            , files = this.files 
            , done = this.async()

        async.forEachLimit(files, os.cpus().length, function (file, next) {
            var src = file.src[0];

            if (typeof src !== 'string') {
                src = file.orig.src[0];
            }
            fs.stat(src, function (err, stats) {
                if (err) {
                    grunt.warn(err + ' in file ' + src);
                    return next();
                }
                grunt.log.writeln('Processing ' + chalk.cyan(src) );
                build(src, options, function (err, css, duplicates) {
                    if (err) {
                        grunt.warn(err + ' in file ' + src);
                        return next();
                    }
                    if (duplicates && duplicates.length) {
                        if (options.throwOnDuplicate) {
                            throw new Error('possibly duplicated images in lines: '
                                            + duplicates.join(', '));
                        } else if (options.reportDuplicates) {
                            grunt.log.error('possibly duplicated images in lines: '
                                            + duplicates.join(', '));
                        }
                    }
                    grunt.file.write(file.dest, css);
                    // Print a success message.
                    grunt.log.debug(chalk.green('✔ ') + src + ' created.');
                    process.nextTick(next);
                });
            });
        }, function (err) {
            if (err) {
                grunt.warn(err);
            }

            grunt.log.writeln(chalk.cyan(files.length + ' file(s) processed.'));
            done();
        });
    });
};
