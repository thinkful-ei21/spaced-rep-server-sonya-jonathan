'use strict';

const express = require('express');
const passport = require('passport');

const router = express.Router();

router.use(passport.authenticate('jwt', {session: false, failWithError: true}));

router.get('/', (req, res) => {
  console.log('protected data');
  res.json({data: 'protected data'});
});

module.exports = router;