const gulp       = require('gulp');
const babel      = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const clean      = require('gulp-clean');
const rename     = require('gulp-rename');
const cleanCSS   = require('gulp-clean-css');
const eslint     = require('gulp-eslint');
const jsdoc      = require('gulp-jsdoc3');
const postcss    = require('gulp-postcss');
const cssnext    = require('postcss-cssnext');

const jsSrc = 'src/dropdown.js';
const cssSrc = 'src/dropdown.css';

const presets = ['latest'];
const minPresets = presets.concat(['babili']);
function compileJs(minified) {
	let pipe = gulp.src(jsSrc)
		.pipe(sourcemaps.init())
		.pipe(babel({
			plugins    : ['transform-es2015-modules-umd'],
			presets    : minified ? minPresets : presets,
		}))
		.pipe(sourcemaps.write('.'));

	if(minified) {
		pipe.pipe(rename({suffix: '.min'}));
	}

	return pipe.pipe(gulp.dest('dist'));
}

function lint() {
	return gulp.src(jsSrc)
		.pipe(eslint())
		.pipe(eslint.format());
}

gulp.task('clean', () => gulp.src(['dist', 'doc'], {read: false}).pipe(clean()));

gulp.task('lint', lint);

gulp.task('lint-fail', () => lint().pipe(eslint.failAfterError()));

gulp.task('doc', () => gulp.src(['README.md', './src/dropdown.js'])
	.pipe(jsdoc({
		templates: {
			cleverLinks    : true,
			monospaceLinks : false
		},
		opts: {
			destination : './doc',
			pedantic    : true,
		}
	})));

gulp.task('js', compileJs.bind(null, false));

gulp.task('min', compileJs.bind(null, true));

gulp.task('style', () => gulp.src(cssSrc)
	.pipe(sourcemaps.init())
	.pipe(postcss([
		cssnext({
			browsers: [
				'Explorer >= 9', 
				'Last 2 versions', 
				'Firefox ESR'
			],
		}),
	]))
	.pipe(cleanCSS({compatibility: 'ie9'}))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('dist')));

gulp.task('watch', ['lint', 'js', 'style'], () => {
	gulp.watch(jsSrc, ['lint', 'js']);
	gulp.watch(cssSrc, ['style']);
});

gulp.task('dist', ['clean', 'lint-fail', 'js', 'min', 'style', 'doc']);
gulp.task('default', ['clean', 'lint-fail', 'js', 'style', 'doc']);
