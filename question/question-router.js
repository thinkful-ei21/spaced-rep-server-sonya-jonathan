'use strict';

const express = require('express');
const passport = require('passport');

const Question = require('../question/question-model');

const router = express.Router();

router.use(
  passport.authenticate('jwt', { session: false, failWithError: true })
);

router.get('/', (req, res) => {
  console.log('BOO');
});

module.exports = router;
