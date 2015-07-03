var gulp = require('gulp');
var ts = require('gulp-typescript');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var coveralls = require('gulp-coveralls');
var cover  = require('gulp-coverage');
var debug = require('gulp-debug');
var filter = require('gulp-filter');

gulp.task("copy_samples", function() {
  return gulp.src("samples_html/**/*")
  .pipe(gulp.dest("build/samples"));
});

gulp.task('default', ["copy_samples"], function () {
  return gulp.src(['src/**/*.ts', "!src/tests/*"])
    .pipe(ts({
    noImplicitAny: true,
    target: "ES5",
    module: "amd"
  }))
  .pipe(gulp.dest('build'))
  .pipe(uglify())
  .pipe(filter("iris.js"))
  .pipe(rename({ extname: '.min.js' }))
  .pipe(gulp.dest('build'));
});

gulp.task('test', function () {
  return gulp.src('src/**/*.ts')
    .pipe(ts({
    noImplicitAny: true,
    target: "ES5",
    module: "commonjs"
  }))
  .pipe(gulp.dest('./build_tests', { overwrite: true }))
  .pipe(cover.instrument({
            pattern: ['build_tests/*'],
            debugDirectory: 'debug/info'
        }))
  .pipe(mocha())
  .pipe(cover.gather())
  .pipe(cover.format({
       reporter: 'lcov'
  }))
  .pipe(coveralls())
  .pipe(cover.format({
       reporter: 'html'
  }))
  .pipe(gulp.dest('./testoutput'));
});