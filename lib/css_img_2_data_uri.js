var fs = require('fs'),
	path = require('path'),
	grunt = require('grunt'),
	mime = require('mime'),
	dataUriWithCommentRegex  = /(url\(([^\)]+)\))( \/\*([^\*]+)\*\/)?/g;

/**
 * Gets the path of the image from a line of css
 * @method getImagePath
 * @param {String} line The CSS line
 * @return {String|null} If no match found will return null, otherwise the
 * image path.
 */
function getImagePath(line, options) {
	var output = [],
		m;

	var uri, uriMatch, uriMatch2, wholeMatch, fromComment;
	while (m = dataUriWithCommentRegex.exec(line)) {	
		wholeMatch = m[1]; /*default replace just the url part*/
		uriMatch2 = uriMatch =  m[2] || '';		
		fromComment = false;

		/*if already a datauri ignore it - don't even return it*/
		if (uriMatch && uriMatch.indexOf(";base64") != -1) {
			/*check if a comment follows and get this as a uri candidate 
			  only whn refresh option is enabled (i.e. use comment for uri and redo)
			 */
			if (options.refresh == true) {
				uriMatch = m[4] || ''; /*if it ends up not being a file it'll be ignored on load error*/
				wholeMatch = m[0]; /*the whole match including comment*/
				fromComment = true;
			} else {
				uriMatch = null; /*don't even return it*/
			}
		}

		//Under consideration: if the comment matches the uri - don't duplicate 
		if (withoutQuotes(m[2]) == m[4])
			wholeMatch = m[0];

		if (!!uriMatch) {
			output.push({
				wholeMatch: wholeMatch
				, uriMatch: uriMatch
				, fromComment: fromComment /*used to avoid raising errors as it wasn't in the url*/
				/*Maintain the original quotes. If none, check foreceEnquote and add single ones*/
				/*Based on the url value and not the comment*/
				, quotes: (typeof options.forceEnquote !== 'undefined') ? options.forceEnquote : quotes(uriMatch2)
				, comment: (options.pathAsComment) ? ' /*' + withoutQuotes(uriMatch) + '*/' : ""
			});
		}
	}
	return output;
}

/**
 * Calculates md5 for an image
 * @method getMD5ForImage
 * @param {String} path Path of the file
 * @param {Function} callback Callback function which will be called with the
 * file content encoded to base64
 * @async
 */
function getMD5ForImage(path, suspendErrors, options, cb) {
	cb = cb || function() {}; /*empty fn*/
	fs.readFile(path, function (err, data) {		
		var toBase64;
		if (err) {
			if (suspendErrors) 
				err = null;
			else if (options && options.missingFiles && /ENOENT/.test(err)) {
				grunt.log.writeln('\nSkipped missing file: ' + path)
				return cb();
			}
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
function replaceLine(line, match) {
	var q = (match.quotes || '');
	var replaceWith = "url(" + q + "data:" + match.mime + ";base64," + match.base64 + q + ")" + (match.comment || '');
	var toReplace = match.wholeMatch;
	return line.replace(toReplace, replaceWith);
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
	if (line.indexOf('url(') == -1 && !options.refresh) 
		return cb(null, line);


	var imagePath = getImagePath(line, options),
	count = 0;

	if (!imagePath || !imagePath.length)
		return cb(null, line);

	imagePath.forEach(function (p) {
		p.path = path.dirname(filePath) + '/' + withoutQuotes(p.uriMatch);
		getMD5ForImage(p.path, p.fromComment, options, function (err, base64) {
			count++;
			if (err) return cb(err);
			p.base64 = base64;
			if (p.base64) p.mime = mime.lookup(p.path);

			if (count == imagePath.length) {
				imagePath.forEach(function (p) {
					if (p.base64) {
						line = replaceLine(line, p);
					}
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
					if (imagePaths[i]) {
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
				/*grunt.log.writeln('File "' + file + '" processed.');*/
				cb(err,data, duplicates);
			});
		});
	});
}

module.exports = build;