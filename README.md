# grunt-css-2-data-uri

Replace image urls to data uri. Also warns if a data uri would be duplicated, so developer can move them under one CSS rule to save size.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-css-img-2-data-uri --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-css-img-2-data-uri');
```

## The "css_img_2_data_uri" task

### Overview
In your project's Gruntfile, add a section named `css_img_2_data_uri` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
	throwOnDuplicate: true,
    css_img_2_data_uri: {
        options: {
            files: [
                {
                    src: 'path/to/source.css',
                    dest: 'path/to/output.css'
                },
                {
                    src: 'path/to/another/source.css',
                    dest: 'path/to/another/output.css'
                }
            ]
        }
    }
})
```

### Options

#### options.files
Type: `Array`

List of css files which needs to be processed.

#### options.throwOnDuplicate
Type: `Boolean`

If set to true, it throws an error when the same image found twice, so the grunt build would stop.

#### options.missingFiles
Type: `Boolean`

If set to true and a missing entry is thrown while reading the local image, the error will be consumed and not thrown. The uri will remain intact.

#### options.forceEnquote
Type: `Char`

Set to any character to replace quoted uri values with specific quotes, e.g ', " or empty string to strip quotes from value. Default behavior is to keep the existing quotes if any.

#### options.pathAsComment
Type: `Boolean`

If set to true the replaced uri path is kept in a comment, for reference or refreshing. Note: if refresh option is used you still need to use pathAsComment to maintain the value.

#### options.refressh
Type: `Boolean`

If set to true and the url is followed by a file path, its content will be re-encoded. Used in case the file has changed. Combine with pathAsComment to be able to refresh again and again. Useful if css has embedded images using Visual Studio's Web Essentials. The comment must follow the url, after a single space. Comments not pointing to a valid file will be ignored and left intact. If a comment matches the url it's not duplicated.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
