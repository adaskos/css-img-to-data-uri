var css_img_2_data_uri = require('../lib/css_img_2_data_uri');
var assert = require('assert');
var fs = require('fs');

var util = require('util');

var test = (function () {
	var tests = [];

	function register(name, item) {
		tests.push({
			name: name,
			test: item
		});
	}

	function run() {
		var item = tests.shift();

		process.stdout.write(item.name);

		item.test(function () {
			process.stdout.write(' ..done\n');

			if (tests.length) {
				run();
			}
		});
	}

	return {
		register: register,
		run: run
	};
}());

test.register('test multiline css processing', function (done) {
	css_img_2_data_uri(__dirname + '/css/a.css', {}, function (err, txt, duplicates) {
		assert.ifError(err);
		fs.readFile(__dirname + '/expect/a.css', function (err, data) {
			if (err) {
				throw err;
			};

			assert.deepEqual(data.toString('utf8'), txt);
			done();
		});
	});
});

test.register('test oneliner css processing', function (done) {
	css_img_2_data_uri(__dirname + '/css/b.css', {}, function (err, txt, duplicates) {
		assert.ifError(err);
		fs.readFile(__dirname + '/expect/b.css', function (err, data) {
			if (err) {
				throw err;
			};

			assert.deepEqual(data.toString('utf8'), txt);
			done();
		});
	});
});

test.register('test finding duplicates', function (done) {
	css_img_2_data_uri(__dirname + '/css/c.css', {}, function (err, txt, duplicates) {
		assert.ifError(err);
		assert.deepEqual(typeof duplicates, 'object');
		assert.deepEqual(duplicates.length, 1);
		assert.deepEqual(duplicates[0], 7);
		done();
	});
});


test.register('test file missing allowed', function (done) {
	css_img_2_data_uri(__dirname + '/css/missingfile.css', {missingFiles: true}, function (err, txt, duplicates) {
		fs.readFile(__dirname + '/expect/missingfile.css', function (err, data) {
			assert.ifError(err);
			assert.deepEqual(data.toString('utf8'), txt);
			done();
		});
	});
});


test.register('test file missing not allowed (default)', function (done) {
	css_img_2_data_uri(__dirname + '/css/missingfile.css', null, function(err) {
		if (!err) throw 'Missing expected error';
		if (!/ENOENT/.test(err)) throw err;
		done();
	});
});
test.register('test file missing not allowed (explicit)', function (done) {
	css_img_2_data_uri(__dirname + '/css/missingfile.css', {missingFiles: false}, function(err) {
		if (!err) throw 'Missing expected error';
		if (!/ENOENT/.test(err)) throw err;
		done();
	});
});

test.run();
