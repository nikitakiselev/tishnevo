let gulp = require('gulp');
let less = require('gulp-less');
let LessAutoprefix = require('less-plugin-autoprefix');
let autoprefix = new LessAutoprefix({ browsers: ['last 5 versions'] });
let sourcemaps = require('gulp-sourcemaps');
let watchLess = require('gulp-watch-less');
let watch = require('gulp-watch');
let rigger = require('gulp-rigger');
let livereload = require('gulp-livereload');
let webserver = require('gulp-webserver');
let notify = require("gulp-notify");
let imagemin = require('gulp-imagemin');
let changed = require('gulp-changed');
let spritesmith = require('gulp.spritesmith');
let babel = require('gulp-babel');
let header = require('gulp-header');
let util = require('gulp-util');
let cleanCSS = require('gulp-clean-css');
let minifyJs = require('gulp-babel-minify');

let banner = `
/* * * * * * * * * * * * * * * 
* Created by Nikita Kiselev  *
* <mail@nikitakiselev.ru>    *
* https://nikitakiselev.ru   *
* * * * * * * * * * * * * * */
`;

let config = {
    production: !!util.env.production,
    scripts: {
        minify: {}
    }
};

gulp.task('serve', () => {
    gulp.src('dist')
        .pipe(webserver({
            livereload: true
        }));
});

gulp.task('watch', ['build', 'serve'], () => {
    watch(['./src/less/**/*.less'], function() {
        gulp.run('less');
    });

    watch(['./src/templates/**/*.html'], () => {
        gulp.run('html');
    });

    watch(['./src/images/**/*'], () => {
        gulp.run('image');
    });

    watch(['./src/icons/**/*'], () => {
        gulp.run('sprites');
    });

    watch(['./src/js/**/*.js'], () => {
        gulp.run('scripts');
    });

    watch(['./src/fonts/**/*'], () => {
        gulp.run('copy');
    });

    watch(['./src/vendor/**/*'], () => {
        gulp.run('copy');
    });
});

gulp.task('less', () => {
    return gulp.src('./src/less/app.less')
        .pipe(config.production ? util.noop() : sourcemaps.init())
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(config.production ? cleanCSS({compatibility: 'ie8'}) : util.noop())
        .pipe(header(banner))
        .pipe(config.production ? util.noop() : sourcemaps.write('./maps'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(notify("Less compiled!"))
        .pipe(livereload());
});

gulp.task('html', function() {
    gulp.src('./src/templates/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('./dist'))
        .pipe(notify("Html compiled!"))
        .pipe(livereload());
});

gulp.task('image', () => {
    gulp.src('./src/images/**/*')
        .pipe(changed('dist/images'))
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
        .pipe(notify("Images minified!"))
        .pipe(livereload())
});

gulp.task('sprites', function () {
    var spriteData = gulp.src('./src/icons/*.*').pipe(spritesmith({
        imgName: './src/images/sprite.png',
        imgPath: '/images/sprite.png',
        cssName: './src/less/Components/Sprites.less',
        cssTemplate: 'less.template.handlebars'
    }));

    return spriteData
        .pipe(gulp.dest('./'))
        .pipe(notify("Sprites generated!"))
        .pipe(livereload());
});

gulp.task('scripts', () => {
    gulp.src('./src/js/app.js')
        .pipe(config.production ? util.noop() : sourcemaps.init())
        .pipe(config.production ? minifyJs(config.scripts.minify) : util.noop())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(header(banner))
        .pipe(config.production ? util.noop() : sourcemaps.write('./maps'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('copy', () => {
    gulp.src('./src/fonts/**/*')
        .pipe(changed('./dist/fonts'))
        .pipe(gulp.dest('./dist/fonts'));

    gulp.src('./src/vendor/**/*')
        .pipe(changed('./dist/vendor'))
        .pipe(gulp.dest('./dist/vendor'));
});

gulp.task('build', function () {
    gulp.start(['html', 'sprites', 'image', 'less', 'scripts', 'copy']);
});

gulp.task('default', function () {
    gulp.start(['build']);
});