import gulp from 'gulp';
import gulpTs from 'gulp-typescript';
import gulpLoadPlugins from 'gulp-load-plugins';
import path from 'path';
import del from 'del';
import nodemon from 'gulp-nodemon';

const plugins = gulpLoadPlugins();
const tsProject = gulpTs.createProject('./tsconfig.json');

const paths = {
    ts: [
        '*.ts',
        'src/**/*.ts',
        '!coverage/**',
        '!node_modules/**'
    ]
};

// Clean up dist and coverage directory
gulp.task('clean', done => {
    del.sync([
        'dist/**',
        'dist/.*',
        '!dist'
    ]);
    done();
});

// Compile ES6 to ES5 and copy to dist
gulp.task('typescript', done => {
    gulp.src([...paths.ts, '!gulpfile.babel.js'], {base: './src'})
        .pipe(plugins.newer('dist'))
        .pipe(tsProject())
        .pipe(gulp.dest('dist'))
        .on('end', done)
        .on('error', e => done(e));
});

// Start server with restart on file changes
gulp.task('watch', done => {
    nodemon({
        script: path.join('dist', 'index.js'),
        ext: 'js',
        ignore: [
            'node_modules/**/*.js',
            'dist/**/*.js',
            'dist/**/*.ts'
        ],
        tasks: ['default'],
    });
    done();
});

// Default task: clean dist, compile js
gulp.task('default', gulp.series('clean', 'typescript'));

// Gulp serve for development
gulp.task('serve', gulp.series('default', 'watch'));
