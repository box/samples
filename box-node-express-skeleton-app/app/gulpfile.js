'use strict';
const gulp = require('gulp'),
	eslint = require('gulp-eslint');

gulp.task('lint', () => {
	return gulp.src(['**/*.js', '!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('default', [
	'lint'
]);
