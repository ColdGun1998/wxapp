const webpack = require('webpack')

const config = require('../webpack.config.js')

pack(config)

function pack (config) {
    return new Promise((resolve, reject) => {
        config.mode = 'development'
        config.devtool ='eval-cheap-module-source-map'
        webpack(config, (err, stats) => {
            if (err) reject(err.stack || err)
            else if (stats.hasErrors()) {
                let err = ''

                stats.toString({
                    chunks: false,
                    colors: true
                })
                    .split(/\r?\n/)
                    .forEach(line => {
                        err += `    ${line}\n`
                    })

                reject(err)
            } else {
                resolve(stats.toString({
                    chunks: false,
                    colors: true
                }))
            }
        })
    })
}
