const gulp = require('gulp');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');

gulp.task('css', () => gulp.src([
  './node_modules/highlight.js/styles/github.css',
  './node_modules/github-markdown-css/github-markdown.css',
])
  .pipe(concat('style.css'))
  .pipe(minifyCSS())
  .pipe(gulp.dest('dist')));

gulp.task('js', () => gulp.src([
  './node_modules/ace-builds/src-min/ace.js',
  './node_modules/ace-builds/src-min/ext-language_tools.js',
  './node_modules/ace-builds/src-min/mode-asciidoc.js',
  './node_modules/ace-builds/src-min/mode-markdown.js',
  './node_modules/ace-builds/src-min/theme-tomorrow.js',
])
  .pipe(concat('script.js'))
  .pipe(gulp.dest('dist')));

gulp.task('default', ['css', 'js']);
