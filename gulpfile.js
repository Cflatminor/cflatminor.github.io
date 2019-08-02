const { gulp, src, dest, parallel, series, watch } = require('gulp');

async function def () {
    await console.log('gulp ready for work!');
}

exports.default = def;