'use strict';
const gulp = require('gulp'),
	nodemon = require('gulp-nodemon'),
	eslint = require('gulp-eslint');

gulp.task('lint', () => {
	return gulp.src(['**/*.js', '!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('develop', ['lint'], () => {
	nodemon({
		script: 'bin/www',
		ext: 'js ejs coffee',
		stdout: true
	});
});

gulp.task('default', [
	'lint'
]);
