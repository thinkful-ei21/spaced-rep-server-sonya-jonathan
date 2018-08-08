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
      console.log(user.head);
      //console.log(currQuestion);
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
      // console.log(user.head);

      let insertAfterQuestion = currQuestion;

      let curr = currQuestion;
      
      for (let i = 0; i < currQuestion.mValue; i++) {
        // console.log('curr',curr, 'currQ',currQuestion);
        let index = currQuestion.next; // index = 1
        curr = user.questions[curr.next];
        // currQuestion = user.questions[currQuestion.next]
        // console.log('currentQuestion: ',currQuestion)
        
        console.log(index);
        if (currQuestion.mValue > user.questions.length) {
          currQuestion.mValue = user.questions.length;
          index = user.questions.length-1;
        }
        // insertAfterQuestion = user.questions[index];
        
        // condition that prevents m being bigger the arr.length - make item last item
      }
      console.log(insertAfterQuestion)
      if (insertAfterQuestion.next === null) {
        // set the curr question node to the last one, next=null
        // set insertion question to point to curr question. next before its set to null
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
      console.log(answer, numCorrect, numAttempts);
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
