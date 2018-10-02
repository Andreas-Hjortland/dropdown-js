/* eslint-env node */
const gulp       = require('gulp');
const babel      = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const rename     = require('gulp-rename');
const cleanCSS   = require('gulp-clean-css');
const eslint     = require('gulp-eslint');
const jsdoc      = require('gulp-jsdoc3');
const postcss    = require('gulp-postcss');
const cssnext    = require('postcss-cssnext');
const del        = require('del');

const jsSrc = 'src/dropdown.js';
const cssSrc = 'src/dropdown.css';
const browsers = [
    'IE >= 9',
    'Firefox ESR',
    '> 0.5%',
];

const presets = [[ '@babel/env', { targets: browsers } ] ];
const minPresets = presets.concat(['minify']);
function compileJs(minified) {
    let pipe = gulp.src(jsSrc)
        .pipe(sourcemaps.init())
        .pipe(babel({
            plugins    : ['@babel/plugin-transform-modules-umd'],
            presets    : minified ? minPresets : presets,
        }))
        .pipe(sourcemaps.write('.'));

    if(minified) {
        pipe = pipe.pipe(rename({suffix: '.min'}));
    }

    return pipe.pipe(gulp.dest('dist'));
}

function lint() {
    return gulp.src(jsSrc)
        .pipe(eslint())
        .pipe(eslint.format());
}

gulp.task('clean', () => del(['dist', 'docs']));

gulp.task('lint', lint);

gulp.task('lint-fail', () => lint().pipe(eslint.failAfterError()));

gulp.task('doc', () => gulp.src(['README.md', './src/dropdown.js'])
    .pipe(jsdoc({
        templates: {
            cleverLinks    : true,
            monospaceLinks : false
        },
        opts: {
            destination : './docs',
            pedantic    : true,
        }
    })));

gulp.task('js', compileJs.bind(null, false));

gulp.task('min', compileJs.bind(null, true));

gulp.task('style', () => gulp.src(cssSrc)
    .pipe(sourcemaps.init())
    .pipe(postcss([
        cssnext({ browsers }),
    ]))
    .pipe(cleanCSS({ compatibility: 'ie9' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist')));

gulp.task('watch', ['lint', 'js', 'style'], () => {
    gulp.watch(jsSrc, ['lint', 'js']);
    gulp.watch(cssSrc, ['style']);
});

gulp.task('dist', ['lint-fail', 'js', 'min', 'style', 'doc']);
gulp.task('default', ['lint-fail', 'js', 'style', 'doc']);
