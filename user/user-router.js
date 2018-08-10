'use strict';

const express = require('express');

const User = require('../user/user-model');
const Questions = require('../question/question-model');

const router = express.Router();

router.post('/', (req, res, next) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  // string datatype validation
  const stringFields = ['username', 'password'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  //Trim username and password of white spaces
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  // field size validation
  const sizedFields = { username: { min: 1 }, password: { min: 10, max: 72 } };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  //POST acion
  const { username, password, firstName, lastName } = req.body;
  return User.find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        firstName,
        lastName,
        username,
        password: hash
      });
    })
    .then(user => {
      const id = user.id;
      return User.findById(id).then(user => {
        return Questions.find().then(questions => {
          user.questions = questions.map((question, index) => {
            return {
              question: question.question,
              answer: question.answer,
              next: index === questions.length - 1 ? null : index + 1,
              mValue: 1,
              numCorrect: 0,
              numAttempts: 0
            };
          });
          return user.save();
        });
      });
    })

    .then(user => res.status(201).json(user))
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      console.log(err);
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

//TESING ONLY
// router.get('/', (req, res) => {

//   return User.find()
//     .then(users => res.json(users))
//     .catch(err => res.status(500).json({ message: 'Internal server error' }));
// });

module.exports = router;
