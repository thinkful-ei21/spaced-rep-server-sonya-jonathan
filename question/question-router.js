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
      const currIndex = user.head;

      // if user gives correct answer, increase score and multipy mValue by 2
      if (currQuestion.answer === userAnswer.toUpperCase()) {
        feedback = true;
        currQuestion.numCorrect++;
        currQuestion.numAttempts++;
        currQuestion.mValue *= 2;
      } else {
        // if user gives incorrect answer increase attempts and reset mValue to 1
        feedback = false;
        currQuestion.numAttempts++;
        currQuestion.mValue = 1;
      }
      // set the head to currentQuestions's next value
      user.head = currQuestion.next;

      let insertAfterQuestion = currQuestion;
      let currQ = currQuestion;

      // loop through questions to find the question object at the index that
      // matches the mValue of the current question
      // set insertAfterQuestion to equal the question at the mValue index
      for (let i = 0; i < currQuestion.mValue; i++) {
        let index = currQ.next;
        if (currQuestion.mValue > user.questions.length) {
          currQuestion.mValue = user.questions.length - 1;
          index = user.questions.length - 1;
        }
        insertAfterQuestion = user.questions[index];
        currQ = user.questions[currQ.next];
      }

      // if the insertion point is at the end, make the currQuestion point to null
      if (insertAfterQuestion.next === null) {
        currQuestion.next = null;
        // otherwise set the currentQuestion to point to the node after the insertion point
      } else {
        currQuestion.next = insertAfterQuestion.next;
      }
      // set the insertion point to point to the original index of the currentQuestion
      insertAfterQuestion.next = currIndex;

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
