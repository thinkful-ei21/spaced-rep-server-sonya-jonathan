'use strict';

const passport = require('passport');

const jwtPassport = passport.authenticate('jwt', {
  session: false,
  failWithError: true
});

module.exports = {
  jwtPassport
};
