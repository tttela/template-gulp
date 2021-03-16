const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const sync = require('browser-sync').create()
const imgminJpg = require('imagemin-jpeg-recompress');
const imgminPng = require('imagemin-pngquant');
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
function server(done) {
  console.log('---------- server task ----------')
  sync.init({
    server: {
      baseDir: "./"
    }
  })
  done();
}


//sass
function sass() {
  console.log('---------- sass task ----------')
  const plugin = [
    autoprefixer(),
    sorter({
      order: 'smacss'
    }),
    mqpacker()
  ]
  return gulp
    .src([paths.src.cssPlugins, paths.src.css])
    .pipe($.plumber())
    .pipe($.sass({
      outputStyle: 'expanded',
    }).on('error', $.sass.logError))
    .pipe($.concat('style.css'))
    .pipe($.postcss(plugin))
    .pipe(gulp.dest(paths.dest.css));
}

//img
function img() {
  console.log('---------- img task ----------')
  return gulp
    .src(paths.src.img)
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
}

//js
function js() {
  console.log('---------- js task ----------')
  return gulp
    .src([paths.src.jsPlugins, paths.src.js])
    .pipe($.plumber())
    .pipe($.concat('app.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(paths.dest.js))
}


// watch
function watch() {
  console.log('---------- watch task ----------')
  const reload = done => {
    sync.reload()
    done()
  }
  gulp.watch('./**/*').on('change', gulp.series(reload))
  gulp.watch([paths.src.cssPlugins, paths.src.css]).on('change', gulp.series(sass))
  gulp.watch(paths.src.img).on('change', gulp.series(img))
  gulp.watch([paths.src.jsPlugins, paths.src.js]).on('change', gulp.series(js))
}

gulp.task('default', gulp.series(gulp.parallel(sass, img, js), gulp.series(server, watch)));
