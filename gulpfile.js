var gulp = require('gulp');
// webpack
var webpack = require('webpack-stream');
// html导入
const htmlImport = require('gulp-html-import');
// html文件名称处理
const rename = require('gulp-rename');
// sass处理
const gulpSass = require('gulp-sass')
//http开发服务
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
//http服务 代理内部服务
var httpServer = require('./httpServer')
var buffer = require('vinyl-buffer');
var csso = require('gulp-csso');
//图片压缩
var imagemin = require('gulp-imagemin');
//合并
var merge = require('merge-stream');
//精灵图
var spritesmith = require('gulp.spritesmith');

// 打包js文件
function webpackTask() {
    return gulp.src('./src/views/**/*.js')
        .pipe(webpack({
            config: require('./webpack.config.js')
        }))
        .pipe(gulp.dest('dist/js'))
        .pipe(reload({ stream: true }));
}

//处理html文件
function htmlTask() {
    return gulp.src(['./src/views/**/*.html', '!./src/components/*.html'])
        .pipe(htmlImport('./src/components/'))
        // //文件放到对应的目录
        .pipe(rename(
            {
                dirname: ''
            }
        ))
        .pipe(gulp.dest('dist'))
        .pipe(reload({ stream: true }));
}

function sassTask() {
    // body omitted
    return gulp.src("src/css/*.scss")
        .pipe(gulpSass())
        .pipe(gulp.dest("dist/css"))
        .pipe(reload({ stream: true }));
}

function imageTask(){
    //body omitted
    return gulp.src("src/img/*.*")
        .pipe(gulp.dest("dist/img"))
        .pipe(reload({ stream: true }));
}

function watchFileServer() {
    //编译sass
    gulp.watch(["src/css/*.scss","src/css/**/*.scss"], sassTask);
    //监听js重新编译webpack 并刷新浏览器
    gulp.watch("src/views/**/*.js").on('change', function (path, stats) {
        webpackTask();
    });
    //html改变刷新浏览器
    gulp.watch("src/views/**/*.html").on('change', function (path, stats) {
        htmlTask();
    });
}

// 静态服务器 + 监听 scss/html 文件 
const serveTask = gulp.series(sassTask, webpackTask, htmlTask, function () {
    browserSync.init({
        server: "./dist",
        //监听html文件修改
        // files: ["*.html"]
    });
    watchFileServer();
    //gulp.watch("dist/*.html").on('change', browserSync.stream);
});



/**
 * 精灵图生成
 * 
 * @dest sprite目录
 */
function spriteTask() {
    var spriteData = gulp.src('src/img/sprite/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css'
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
        // DEV: We must buffer our stream into a Buffer for `imagemin`
        .pipe(buffer())
        //压缩图片
        .pipe(imagemin( ))
        .pipe(gulp.dest('dist/sprite'));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        .pipe(gulp.dest('dist/sprite'));

    return merge(imgStream, cssStream);
}



/**
 * 代理接口服务 + 开发服务
 * @todo 启动express的代理服务 代理api并提供文件访问
 * @todo 启动browserSync开发同步服务 代理express的服务
 * @todo 监听文件变更刷新
 * 
 */
const expressTask = gulp.series(sassTask, webpackTask, htmlTask, function () {
    httpServer.start();
    console.log('express serve run:127.0.0.1:8099');
    browserSync.init({
        proxy: "127.0.0.1:8099",
        //监听html文件修改
        // files: ["*.html"]
    });
    watchFileServer();

    //gulp.watch("dist/*.html").on('change', browserSync.stream);
});

//开启服务
exports.webpack = webpackTask
exports.html = htmlTask
exports.sass = sassTask
exports.serve = serveTask
exports.express = expressTask
exports.sprite = spriteTask
exports.image = imageTask

exports.default = gulp.parallel(htmlTask, webpackTask);
