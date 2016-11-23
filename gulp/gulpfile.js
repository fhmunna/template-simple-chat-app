const gulp = require('gulp');
const runSequence = require('run-sequence');
const debug = require('gulp-debug');
const changed = require('gulp-changed');
const htmlhint = require('gulp-htmlhint');
const jshint = require('gulp-jshint');
const eslint = require('gulp-eslint');
const del = require('del');
const touch = require('gulp-touch');
const browserSync = require('browser-sync').create();

const SRC='../simple-chat-app';

// Final distribution directory after everything is built
const DIST = 'dist';

var lintrcFile = '.eslintrc-error';

gulp.task('default', function(done) {
  lintrcFile = '.eslintrc-warn'
  runSequence(
   'build',
   ['browserSync', 'watch'],
   done);
});

gulp.task('pages:validate-html', function() {
  return gulp.src(SRC+'/*.html')
  .pipe(changed(DIST))
  .pipe(htmlhint('.htmlhintrc'))
  .pipe(htmlhint.failReporter())
});

// Validate JavaScript contained in HTML files.
gulp.task('pages:validate-js', function() {
  return gulp.src(SRC+'/*.html')
  .pipe(changed(DIST))
  .pipe(jshint.extract('auto'))
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'))
  .pipe(jshint.reporter('fail'))
});

gulp.task('pages:dist', function() {
  return gulp.src(SRC+'/*.html')
  .pipe(gulp.dest(DIST));
});

gulp.task('pages', function(done) {
  runSequence(
    'pages:validate-html',
    'pages:validate-js',
    'pages:dist',
    done
  );
});

gulp.task('images', function(done) {
  return gulp.src(SRC+'/images/**/*')
  .pipe(gulp.dest(DIST+'/images'));
});

gulp.task('css', function(done) {
  return gulp.src(SRC+'/css/*.css')
  .pipe(gulp.dest(DIST+'/css'));
});

gulp.task('lib', function(done) {
  return gulp.src(SRC+'/lib/**/*')
  .pipe(gulp.dest(DIST+'/lib'));
});

gulp.task('js', function() {
  const dest = DIST+'/js';
  return gulp.src(SRC+'/js/**/*.js')
  .pipe(debug({ title: "before" }))
  .pipe(changed(dest))
  .pipe(eslint(lintrcFile))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
  .pipe(gulp.dest(dest));
});

gulp.task('watch', function(){
  gulp.watch(SRC+'/*.html', ['pages', browserSync.reload]);
  gulp.watch(SRC+'/images/**/*', ['images', browserSync.reload]);
  gulp.watch(SRC+'/css/**/*', ['css', browserSync.reload]);
  gulp.watch(SRC+'/lib/**/*', ['lib', browserSync.reload]);
  gulp.watch(SRC+'/js/**/*', ['js', browserSync.reload]);
})

gulp.task('browserSync', function() {
  // return;
  browserSync.init({
    port: 6401,
    server: {
      baseDir: DIST
      // directory: true
    },
    online: true,
    open: false,
    codeSync: true
  });
})

gulp.task('clean', function() {
  return del(DIST);
});

gulp.task('build', function(done) {
  runSequence(
    'clean',
    ['pages', 'images', 'css', 'lib', 'js']
    , done
  );
});
