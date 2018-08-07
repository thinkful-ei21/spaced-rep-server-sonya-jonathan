'use strict';

const express = require('express');
const passport = require('passport');

const User = require('../user/user-model');

const router = express.Router();

router.use(
  passport.authenticate('jwt', { session: false, failWithError: true })
);

router.get('/', (req, res, next) => {
  const id = req.user.id;
  User.findById(id)
    .then(user => user.questions)
    .then(data => res.json(data))
    .catch(err => next(err));
});

router.get('/one', (req, res, next) => {
  const id = req.user.id;
  User.findById(id)
    .then(user => user.questions[0])
    .then(data => res.json(data.question))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const id = req.user.id;
  const { userAnswer } = req.body;
  let feedback = '';
  let question;

  User.findById(id)
    .then(user => {
      question = user.questions[0];
      if (question.answer === userAnswer) {
        question.numCorrect++;
        question.numAttempts++;
        user.questions.push(question);
        user.questions = user.questions.slice(1);
        // console.log('right', user.questions);
        feedback = true;
      } else {
        question.numAttempts++;
        user.questions.splice(2, 0, question);
        user.questions = user.questions.slice(1);
        // console.log('wrong', user.questions);
        feedback = false;
      }
      return user.save();
    })
    .then(() => {
      const { answer, numCorrect, numAttempts } = question;
      return res.json({ feedback, answer, numCorrect, numAttempts });
    })
    .catch(err => next(err));
});

// router.delete('/', (req, res) => {
//   Question.deleteOne()
//     .then(data => res.json(data))
//     .catch(err => console.log(err));
// });

module.exports = router;
