const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const sync = require('browser-sync').create()
const imgminJpg = require('imagemin-jpeg-recompress');
const imgminPng = require('imagemin-pngquant');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const mqpacker = require("css-mqpacker");
const sorter = require('css-declaration-sorter');

const paths = {
  'url': '',
  'dest': {
    'css': './css/',
    'img': './img/',
    'js': './js/',
  },
  'src': {
    'css': './assets/scss/**/*.scss',
    'cssPlugins': './assets/scss/plugins/*.css',
    'img': './assets/img/*.*',
    'js': './assets/js/*.js',
    'jsPlugins': './assets/js/plugins/*.js',
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
  const plugin = [
    autoprefixer(),
    sorter({
      order: 'smacss'
    }),
    mqpacker(),
    cssnano({
      autoprefixer: false
    })
  ]
  gulp.src([paths.src.cssPlugins, paths.src.css])
    .pipe($.plumber())
    .pipe($.sass({
      outputStyle: 'expanded',
    }).on('error', $.sass.logError))
    .pipe($.concat('style.css'))
    .pipe($.postcss(plugin))
    .pipe($.rename({
      suffix: '.min',
    }))
    .pipe(gulp.dest(paths.dest.css));
  done();
})

//img
gulp.task('img', done => {
  console.log('---------- img task ----------')
  gulp.src(paths.src.img)
    .pipe($.changed(paths.dest.img))
    .pipe($.imagemin([
      imgminPng(),
      imgminJpg({
        quality: '65-80',
        speed: 1
      }),
      $.imagemin.svgo()
    ], {
      verbose: true
    }))
    .pipe($.imagemin())
    .pipe(gulp.dest(paths.dest.img))
  done();
})

//js
gulp.task('js', done => {
  console.log('---------- js task ----------')
  gulp.src([paths.src.jsPlugins, paths.src.js])
    .pipe($.plumber())
    .pipe($.concat('app.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(paths.dest.js))
  done();
})


// watch
gulp.task('watch', done => {
  console.log('---------- watch task ----------')
  const reload = done => {
    sync.reload()
    done()
  }
  gulp.watch('./**/*', reload)
  gulp.watch([paths.src.cssPlugins, paths.src.css], gulp.series('sass'))
  gulp.watch(paths.src.img, gulp.series('img'))
  gulp.watch([paths.src.jsPlugins, paths.src.js], gulp.series('js'))
  done()
})

gulp.task('default', gulp.series('server', 'watch'))
