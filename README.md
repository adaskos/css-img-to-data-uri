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

#### options.forceEnquote
Type: `Char`

Set to any character to replace quoted uri values with specific quotes, e.g ', " or empty string to strip quotes from value. Default behavior is to keep the existing quotes if any.

#### options.pathAsComment
Type: `Boolean`

Set to true to keep the replace uri path in a comment, for reference.

If set to true and a missing entry if thrown while reading the local image, the error will be consumed and not thrown. The uri will remain intact.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
