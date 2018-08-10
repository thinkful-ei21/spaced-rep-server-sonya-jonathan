'use strict';

const express = require('express');
const passport = require('passport');

const User = require('../user/user-model');
const Questions = require('../question/question-model');

const router = express.Router();

router.use(
  passport.authenticate('jwt', { session: false, failWithError: true })
);

router.get('/one', (req, res, next) => {
  const id = req.user.id;
  User.findById(id)
    .then(user => {
      const { question, numCorrect, numAttempts } = user.questions[user.head];
      const streak = user.streak;
      return res.json({ question, numCorrect, numAttempts, streak });
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
        currQuestion.mValue *= 2;
        currQuestion.numCorrect++;
        currQuestion.numAttempts++;
        user.streak++;
      } else {
        // if user gives incorrect answer increase attempts
        // and reset mValue to 1 and streak to 0
        feedback = false;
        currQuestion.mValue = 1;
        currQuestion.numAttempts++;
        user.streak = 0;
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
      let userWithQuestion = { user, currQuestion };
      return userWithQuestion;
    })
    .then(response => {
      const { answer, numCorrect, numAttempts } = response.currQuestion;
      const streak = response.user.streak;
      return res.json({ feedback, answer, numCorrect, numAttempts, streak });
    })
    .catch(err => next(err));
});

router.put('/', (req, res, next) => {
  const id = req.user.id;
  const updatedArr = [];
  Questions.find()
    .then(questions => {
      questions.forEach((question, index) => {
        let q = {
          question: question.question,
          answer: question.answer,
          next: index === questions.length - 1 ? null : index + 1,
          mValue: 1,
          numCorrect: 0,
          numAttempts: 0
        };
        updatedArr.push(q);
      });
    })
    .then(() => {
      return User.findByIdAndUpdate(
        id,
        {
          $set: { head: 0, questions: updatedArr, streak: 0 }
        },
        { new: true }
      );
    })
    .then(() => {
      User.findById(id).then(user => {
        const currQuestion = user.questions[user.head];
        const { question, numAttempts, numCorrect } = currQuestion;
        let streak = user.streak;
        return res.json({ question, numAttempts, numCorrect, streak });
      });
    })
    .catch(err => next(err));
});

module.exports = router;
