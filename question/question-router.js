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
    .then(user => user.questions[user.head])
    .then(data => {
      const { question, numCorrect, numAttempts } = data;
      return res.json({ question, numCorrect, numAttempts });
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  const id = req.user.id;
  const { userAnswer } = req.body;
  let feedback = '';

  User.findById(id)
    .then(user => {
      const currQuestion = user.questions[user.head];
      const head = user.head;

      if (currQuestion.answer === userAnswer) {
        feedback = true;
        currQuestion.numCorrect++;
        currQuestion.numAttempts++;
        currQuestion.mValue *= 2;
      } else {
        feedback = false;
        currQuestion.numAttempts++;
        currQuestion.mValue = 1;
      }
      user.head = currQuestion.next;

      let insertAfterQuestion = currQuestion;
      let currQ = currQuestion;

      for (let i = 0; i < currQuestion.mValue; i++) {
        let index = currQ.next;
        if (currQuestion.mValue > user.questions.length) {
          currQuestion.mValue = user.questions.length - 1;
          index = user.questions.length - 1;
        }
        insertAfterQuestion = user.questions[index];
        currQ = user.questions[currQ.next];
      }

      if (insertAfterQuestion.next === null) {
        currQuestion.next = null;
      } else {
        currQuestion.next = insertAfterQuestion.next;
      }
      insertAfterQuestion.next = head;

      user.save();

      return currQuestion;
    })
    .then(currQuestion => {
      const { answer, numCorrect, numAttempts } = currQuestion;
      return res.json({ feedback, answer, numCorrect, numAttempts });
    })
    .catch(err => next(err));
});

module.exports = router;
