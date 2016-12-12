'use strict'
const gulp = require('gulp')
const gutil = require('gulp-util')
const del = require('del')
const sass = require('gulp-sass')
const path = require('path')
const exec = require('gulp-exec')

const paths = {
    sass: ['src/scss/**/*.scss'],
    sassInclude: [
        'node_modules'
    ]
}

function handleError(err) {
    console.log(err.toString())
    this.emit('end')
}

gulp.task('sass', function() {
    return gulp.src(paths.sass)
        .pipe(sass({ includePaths: paths.sassInclude }).on('error', sass.logError))
        .pipe(gulp.dest('build/css'))
})

gulp.task('watch', () => {
    gulp.watch('src/scss/**/*.scss', ['sass']);
})

gulp.task('default', ['sass', 'watch'])
