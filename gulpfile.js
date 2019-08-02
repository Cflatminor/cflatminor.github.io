/**
 * @gulpfile for github.io
 * @version 1.1 (02. 08. 2019)
 */

'use strict';

require('dotenv').config();

const { gulp, src, dest, parallel, series, watch } = require ('gulp');
const babelify = require ('babelify');
const browserify = require ("browserify");
const del = require ('del');
const uglify = require ("gulp-uglify");
const sass = require ('gulp-sass');
const concat = require ('gulp-concat');
const source = require ("vinyl-source-stream");
const autoprefixer = require ("gulp-autoprefixer");
const browserSync = require ('browser-sync').create();

async function scssCompile () {
    await src('app/scss/index.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(autoprefixer())
        .pipe(dest('dist/css/'))
}

async function jsCompile () {
    await browserify({
            entries: ['app/js/index.js']
        })
        .transform(babelify.configure({
            presets : ['@babel/env']
        }))
        .bundle()
        .pipe(source('main.js'))
        .pipe(dest('dist/js'))
}

async function clean () {
    await del('dist');
}

async function uglifyJs () { // TODO on prod env
    await src('dist/js/main.js') //TODO paths config
        .pipe(uglify())
        .pipe(concat('mainJsProxy.js'))
        .pipe(dest('dist/js'))
}

function syncBrowsers () {
    browserSync.init({
        server: {
            baseDir: "app"
        },
        notify: false,
        port: process.env.PORT || 8080,
        open: false
    });
}

function watchFiles () {
    syncBrowsers();

    watch('index.html').on('change', browserSync.reload);

    watch('app/scss/**/*.scss').on('change', scssCompile);
    watch('dist/css/**/*.css').on('change', browserSync.reload);

    watch('app/js/**/*.js').on('change', jsCompile);
    watch('dist/js/**/*.js').on('change', browserSync.reload);
}

process.env.APP_ENV === 'prod' ?
    exports.default = clean :
    exports.default = series(clean, parallel(jsCompile, scssCompile), watchFiles);
