# Cartas Contra Español Server

## Table of Contents
- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Server Structure](#app-structure)
- [Data Models](#data-models)
  - [User Schema](#user-schema)
  - [Question Schema](#question-schema)
- [API Endpoints](#api-endpoints)
  - [Users](#users)
  - [Authentication](#authentication)
  - [Questions](#questions)

## Introduction
This is the server documentation for [Cartas Contra Español](https://acceptable-losses-client.herokuapp.com), a spaced repetition learning app used to learn the spanish language.

## Tech Stack
Acceptable Losses server is powered by the following,
* Node
* Express
* MongoDB
* Mongoose
* Morgan
* Passport
* BCryptJS
* JSONWebToken
* dotEnv
* Mocha
* Chai

## App Structure
Cartas Contra Español follows Node's convention of processing codes from top to bottom and left to right. The most-used routes will be placed at top, followed by lesser-used routes, and finally error handlers.

Route hierarchy is as follows,
```
Users
Authentication
Questions
Error Handlers
```

Application data is persisted via MongoDB. Document mapping is handled by Mongoose. RESTful API architecture is also used for data creation and retrieval.

## Data Models
Cartas Contra Español employs Mongoose document schema to construct its data models: users and queations. User documents dictates the existence of other documents as a user ID is required for their creation.

### User Schema
```
firstName: String,
lastName: String,
username: { type: String, required: true, unique: true },
password: { type: String, required: true },
questions: [
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    next: Number,
    mValue: Number,
    numCorrect: { type: Number, required: true },
    numAttempts: { type: Number, required: true }
  }
],
streak: { type: Number, default: 0 },
head: { type: Number, default: 0 }
```

### Question Schema
```
  question: { type: String, required: true },
  answer: { type: String, required: true }
```

## API Endpoints
All requests and responses are in JSON format.

Action | Path |
--- | --- |
Users | https://agile-beach-60418.herokuapp.com/api/users |
Authentication | https://agile-beach-60418.herokuapp.com/api/auth |
Questions | https://agile-beach-60418.herokuapp.com/api/questions |

### Users
`POST` request to endpoint `/` is for creating User documents. It accepts the following request body,
```
{
  username,
  password,
  firstName, // optional
  lastName // optional
}
```
`username` will be rejected if it is not unique. Once a User document is successfully created, this will be the server's response.
```
{
  id,
  username,
  firstName,
  lastName,
  streak,
  head
}
```

### Authentication
`POST` to `/login` endpoint for creation of JWT. It accepts the following request body,
```
{
  username,
  password
}
```
This endpoint takes in the username and verifies the password. When validated, the server will respond with a token,
```
{
  authToken
}
```

`POST` to `/refresh` will send back another token with a newer expiriation. No request body is necessary as an existing and valid JWT must be provided to access this endpoint.

### Questions

`GET` request to `/one` while using the User's ID will return one question document belonging to a User's question list.

```
{
  question
}
```
`POST` to `/` will verify is the User's answer is correct and return feedback accordingly. It uses the User's ID and accepts the following request body:
```
{
  userAnswer
}
```
`PUT` request to `/` will rest the user data to its original state provinding the User a "reset". It uses the User ID to access that specific User's question list
