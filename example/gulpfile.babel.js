import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import path from 'path';
import del from 'del';
import nodemon from 'gulp-nodemon';

const plugins = gulpLoadPlugins();

const paths = {
  js: ['./**/*.js', '!dist/**', '!node_modules/**', '!coverage/**'],
  nonJs: ['./package.json', './.gitignore', './.env'],
  ejs: ['./**/*.ejs', './**/*.css', '!node_modules/**'],
  css: ['./**/*.css', '!node_modules/**'],
  tests: './server/tests/*.js'
};

// Clean up dist and coverage directory
gulp.task('clean', done => {
  del.sync(['dist/**', 'dist/.*', '!dist']);
  done();
});

// Copy non-js files to dist
gulp.task('copy', done => {
  gulp
      .src(paths.nonJs, {allowEmpty: true})
      .pipe(plugins.newer('dist'))
      .pipe(gulp.dest('dist'))
      .on('end', done)
      .on('error', e => done(e));
});

// Compile ES6 to ES5 and copy to dist
gulp.task('babel', done => {
  gulp
      .src([...paths.js, '!gulpfile.babel.js'], {base: '.'})
      .pipe(plugins.newer('dist'))
      .pipe(plugins.babel())
      .pipe(gulp.dest('dist'))
      .on('end', done)
      .on('error', e => done(e));
});

// Start server with restart on file changes
gulp.task('watch', done => {
  nodemon({
    script: path.join('dist', 'index.js'),
    ext: 'js',
    ignore: ['node_modules/**/*.js', 'dist/**/*.js'],
    tasks: ['default'],
  }).on(`restart`, () => {
  });
  done();
});

// default task: clean dist, compile js
gulp.task('default', gulp.series('clean', 'copy', 'babel'));

// gulp serve for development
gulp.task('serve', gulp.series('default', 'watch'));
