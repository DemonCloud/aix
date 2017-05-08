'use strict'

// config
const cfg = global.cfg = require('./gulp/config.js');

const gulp = require('gulp');
const taskhtml = require('./gulp/task.html');
const taskcss = require('./gulp/task.css');
const taskjs = require('./gulp/task.js');
const taskr = require('./gulp/task.r');

gulp.task('build:html',taskhtml);
gulp.task('build:css',taskcss);
gulp.task('build:js',taskjs);
gulp.task('package:r',taskr);

// run task
gulp.task('default',
['build:html','build:css','build:js'],
function(){
	gulp.start(['package:r']);
});

