const fs = require('fs');
const path = require('path');
console.log(__filename)

fs.copyFileSync(path.resolve(__filename, "..", "..", "dist", "fftUtil.js"),
    path.resolve(__filename, "..", "..", "..", "src", "static", "workers", "fftUtil.js"));

fs.copyFileSync(path.resolve(__filename, "..", "..", "dist", "fftUtil.js"),
    path.resolve(__filename, "..", "..", "..", "src", "Utils", "fftUtil.js"));

