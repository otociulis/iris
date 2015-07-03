var gulp = require('gulp');
var ts = require('gulp-typescript');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function () {
  return gulp.src('src/*.ts')
    .pipe(ts({
    noImplicitAny: true,
    target: "ES5",
    module: "amd"
  }))
  .pipe(gulp.dest('build'))
  .pipe(uglify())
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
    .pipe(gulp.dest('build_tests'))
  // gulp-mocha needs filepaths so you can't have any plugins before it 
    .pipe(mocha({ reporter: 'nyan' }));
});