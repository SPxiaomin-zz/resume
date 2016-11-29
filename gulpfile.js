var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var sourcemaps = require('gulp-sourcemaps')

var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');

var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');


var paths = {
  less: './public/stylesheets/build/*.less',
  jshint: './public/javascript/build/*.js'
};


gulp.task('less', function() {
  var lessDest = './public/stylesheets/src';

  var stream = gulp.src(paths.less)
    .pipe(plumber({
      errorHandler: notify.onError('Message:\n\t<%= error.message %>\nDetails:\n\tlineNumber: <%= error.lineNumber %>')
    }))
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(gulp.dest(lessDest))
    .pipe(cssnano())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest(lessDest));

  return stream;
});

gulp.task('js', function() {
  var jsDest = './public/javascript/src';

  var stream = gulp.src('paths.js')
    .pipe(plumber({
      errorHandler: notify.onError('Message:\n\t<%= error.message %>\nDetails:\n\tlineNumber: <%= error.lineNumber %>')
    }))
    .pipe(jshint())
    .pipe(notify(function(file) {
      if ( file.jshint.success ) {
        return false;
      }

      var errors = file.jshint.results.map(function(data) {
        if ( data.error ) {
          return 'line ' + data.error.line + ', col ' + data.error.character + ': ' + data.error.reason;
        }
      }).join('\n');

      return file.relative + ' (' + file.jshint.results.length + ' errors)\n' + errors;
    }))
    .pipe(uglify({
      mangle: false
    }))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(jsDest));

  return stream;
});


function watcherCallback(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', task running...');
}

gulp.task('default', ['less', 'js'], function() {
  var watcherLess = gulp.watch(paths.less, ['less']);
  watcherLess.on('change', watcherCallback);

  var watcherJs = gulp.watch(paths.js, ['js']);
  watcherJs.on('change', watcherCallback);
});
