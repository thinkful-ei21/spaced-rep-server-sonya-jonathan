'use strict';

const express = require('express');
const passport = require('passport');

const Question = require('../question/question-model');

const router = express.Router();

// router.use(
//   passport.authenticate('jwt', { session: false, failWithError: true })
// );

router.get('/', (req, res) => {
  Question.findOne()
    .then(data => res.json(data))
    .catch(err => console.log(err));
});

// router.delete('/', (req, res) => {
//   Question.deleteOne()
//     .then(data => res.json(data))
//     .catch(err => console.log(err));
// });

module.exports = router;
