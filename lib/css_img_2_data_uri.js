var fs = require('fs'),
path = require('path'),
grunt = require('grunt'),
mime = require('mime'),
urlRegex = "url\\(([0-9a-zA-Z./_\\-'\\\"]+)\\)",
desc;

/**
 * Gets the path of the image from a line of css
 * @method getImagePath
 * @param {String} line The CSS line
 * @return {String|null} If no match found will return nuil, otherwise the
 * image path.
 */
function getImagePath(line, filePath) {
	var regEx = new RegExp(urlRegex, 'g'),
		output = [],
		m;

m = regEx.exec(line);
while (m) {
	output.push({
		match: m[1],
		path: path.dirname(filePath) + '/' + withoutQuotes(m[1])
	});
	m = regEx.exec(line);
}

return output.length ? output : null;
	}

	/**
	 * Calculates md5 for an image
	 * @method getMD5ForImage
	 * @param {String} path Path of the file
	 * @param {Function} callback Callback function which will be called with the
	 * file content encoded to base64
	 * @async
	 */
function getMD5ForImage(path, options, cb) {
	cb = cb || function() {}; /*empty fn*/
	fs.readFile(path, function (err, data) {		
		var toBase64;
		if (err && options && options.missingFiles && /ENOENT/.test(err)) {
			grunt.log.writeln('\nSkipped missing file: ' + path)
			return cb();
		}

		if (data) toBase64 = data.toString('base64');
		cb(err, toBase64);
	});
}

function quotes(str) {
	return (str &&
		str.length > 1 &&
		(str[0] == "'" || str[0] == "\"") &&
		str[str.length - 1] == str[0])
	? str[0] : '';
}

function withoutQuotes(str) {
	if (quotes(str)) {
		return str.substring(1, str.length - 1);
	}
	return str;
}

/**
 * Replaces the image url with data uri
 * @method replaceLine
 * @param {String} line The line where the url string could be found
 * @param {String} base64 The base64 encoded image
 */
function replaceLine(line,m,  commentRegEx, base64, mimeType, lineOptions) {
	var lineOptions = lineOptions || {};
	return line.replace(commentRegEx, '').replace(m, "url(" + (lineOptions.quotes || '') + "data:" 
		+ mimeType + ";base64," + base64 + (lineOptions.quotes || '') + ")" + (lineOptions.comment || ''));
}

function checkFile(file, options, cb) {	
	cb = cb || function() {}; /*empty fn*/
	fs.stat(file, function (err, stats) {
		if (err) return cb(err);
		if (!stats.isFile()) return cb(file + ' is not a file');
		cb();
	});
}

function processLine(line, filePath, options, cb) {
	cb = cb || function() {}; /*empty fn*/
	if (line.indexOf('url(') == -1 || line.indexOf(";base64") != -1) 
		return cb(null, line);


	var imagePath = getImagePath(line, filePath),
	count = 0;

	if (!imagePath || !imagePath.length)
		return cb(null, line);

	imagePath.forEach(function (p) {
		getMD5ForImage(p.path, options, function (err, base64) {
			if (err) return cb(err);
				
			p.base64 = base64;
			if (base64) p.mime = mime.lookup(p.path);
			count += 1;

			if (count === imagePath.length) {
				imagePath.forEach(function (p) {
					if (p.base64)
					line = replaceLine(line
								, new RegExp('url\\([\'"]?' + p.match + '[\'"]?\\)')
								, new RegExp(' /\\*' + withoutQuotes(p.match) + '\\*/') /*to replace any previous kept uri path*/
								, p.base64, p.mime, {
								/*Maintain the original quote. If none check foreceEnquote and single ones*/
								quotes: (typeof options.forceEnquote !== 'undefined') ? options.forceEnquote : quotes(p.match),  
								comment: (options.pathAsComment) ? ' /*' + withoutQuotes(p.match) + '*/' : ""
							});
				});
				cb(null, line, imagePath.map(function (p) { return p.path; }));
			}
		});
	}); 
}

function convertPathsToDataUri(data, filePath, options, cb) {	
	var lines = data.toString('utf-8').split('\n'),
	cb = cb || function() {}, /*empty fn*/
	outputLines = [],
	processedLines = 0,
	imagePaths = {},
	duplicates = [],
	err;

	function finishLineProcess() {
		processedLines += 1;

		if (processedLines === lines.length) {
			cb(err, outputLines.join('\n'), duplicates);
		}
	}

	lines.forEach(function (line, index) {
		processLine(line, filePath, options, function (err, line, imagePath) {
			if (err) return cb(err);
			if (imagePath && imagePath.length) {
				imagePath.forEach(function (i) {
					if (imagePaths[i] === true) {
						duplicates.push(index);
					}
					imagePaths[i] = true;
				});
			}
			outputLines[index] = line;
			finishLineProcess();
		});
	});
}

function build(file, options, cb) {	
	var options = options || {};
	cb = cb || function() {}; /*empty fn*/
	if (!file) 
		cb('No file defined');
	var filePath = path.resolve(file);
	if (!filePath) 
		cb('No file defined');

	checkFile(filePath, options, function () {
		fs.readFile(filePath, function (err, data) {
			if (err) return cb(err,data);
				
			convertPathsToDataUri(data, filePath, options, function(err,data, duplicates) {
				//grunt.log.writeln('File "' + file + '" processed.');
				cb(err,data, duplicates);
			});
		});
	});
}

module.exports = build;