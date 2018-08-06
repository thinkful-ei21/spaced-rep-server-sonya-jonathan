'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');

const seedQuestions = require('./seed-questions.json');
const Question = require('../question/question-model');

console.log(`Connecting to mongodb at ${DATABASE_URL}`);
mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return new Promise(Question.insertMany(seedQuestions));
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });
