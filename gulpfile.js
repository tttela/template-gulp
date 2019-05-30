const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const sync = require('browser-sync').create()
const cleanCSS = require('gulp-clean-css');
const cmq = require('gulp-combine-media-queries');

const paths = {
  'url': 'http://seijouriha.lo',
  'dest': {
    'css': './css/',
  },
  'src': {
    'css': './assets/scss/**/*.scss',
  }

}
//server
gulp.task('server', done => {
  console.log('---------- server task ----------')
  sync.init({
    proxy: paths.url + "/"
  })
  done();
})

//sass
gulp.task('sass', done => {
  console.log('---------- sass task ----------')
  gulp.src(paths.src.css)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'expanded',
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
    }))
    .pipe(cmq())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(paths.dest.css))
    .pipe(cleanCSS())
    .pipe($.rename({
      suffix: '.min',
    }))
    .pipe(gulp.dest(paths.dest.css));
  done();
})

gulp.task('watch', () => {
  console.log('---------- watch task ----------')
  const reload = done => {
    sync.reload()
    done()
  }
  gulp.watch('./**/*', reload)
  gulp.watch(paths.src.css, gulp.series('sass'))
})

gulp.task('default', gulp.series('server', 'watch'))
