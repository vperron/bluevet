const webpackDefaults = require('systematic').webpack_get_defaults(__dirname)

webpackDefaults.resolve.alias = {
  moment: 'cassets/scripts/moment',
  'jwt-simple': 'cassets/scripts/moment',
}

webpackDefaults.devtool = 'eval'

module.exports = webpackDefaults
