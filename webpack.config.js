const webpackDefaults = require('systematic').webpack_get_defaults(__dirname)

webpackDefaults.devtool = 'eval'

module.exports = webpackDefaults
