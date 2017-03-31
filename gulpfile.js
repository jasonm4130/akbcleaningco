var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');
var pug = require('gulp-pug');
var cache = require('gulp-cache');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Better Error Handeling
 */
var gulp_src = gulp.src;
gulp.src = function() {
    return gulp_src.apply(gulp, arguments)
        .pipe(plumber(function(error) {
            // Output an error message
            gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
            // emit the end event, to properly end the task
            this.emit('end');
        }));
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function(done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn(jekyll, ['build'], {
        stdio: 'inherit'
    }).on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function() {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        },
        notify: false
    });
});

/**
 * Compile files from _sass into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function() {
    return gulp.src('assets/css/*.sass')
        .pipe(sass({
            includePaths: ['css'],
            onError: browserSync.notify,
            outputStyle: 'compressed'
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
            cascade: true
        }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gulp.dest('assets/css'));
});

/**
 * Custom Gulp Task
 */
gulp.task('pug', function() {
    return gulp.src('_pugfiles/**/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('_includes'));
});

gulp.task('img-refresh', function(){
    gulp.src('assets/images/**.*')
    .pipe(gulp.dest('_site/assets/images'))
    browserSync.reload();
})

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function() {
    gulp.watch('assets/css/**/*.sass', ['sass']);
    gulp.watch(['_pugfiles/**/*.pug'], ['pug']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*'], ['jekyll-rebuild']);
    gulp.watch('assets/js/**/*.js', ['jekyll-rebuild']);
    gulp.watch(['assets/images/**/*'], ['img-refresh']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', function(done) {
    runSequence(['pug', 'sass'], ['browser-sync', 'watch']);
});

gulp.task('build', function(done){
  runSequence(['pug', 'sass'], ['jekyll-build']);
});