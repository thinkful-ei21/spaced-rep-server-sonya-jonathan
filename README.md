# Thinkful Backend Template

A template for developing and deploying Node.js apps.

## Getting started

### Setting up a project

* Move into your projects directory: `cd ~/YOUR_PROJECTS_DIRECTORY`
* Clone this repository: `git clone https://github.com/Thinkful-Ed/backend-template YOUR_PROJECT_NAME`
* Move into the project directory: `cd YOUR_PROJECT_NAME`
* Install the dependencies: `npm install`
* Create a new repo on GitHub: https://github.com/new
    * Make sure the "Initialize this repository with a README" option is left unchecked
* Update the remote to point to your GitHub repository: `git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME`

### Working on the project

* Move into the project directory: `cd ~/YOUR_PROJECTS_DIRECTORY/YOUR_PROJECT_NAME`
* Run the development task: `npm start`
    * Starts a server running at http://localhost:8080
    * Automatically restarts when any of your files change

## Databases

By default, the template is configured to connect to a MongoDB database using Mongoose.  It can be changed to connect to a PostgreSQL database using Knex by replacing any imports of `db-mongoose.js` with imports of `db-knex.js`, and uncommenting the Postgres `DATABASE_URL` lines in `config.js`.

## Deployment

Requires the [Heroku CLI client](https://devcenter.heroku.com/articles/heroku-command-line).

### Setting up the project on Heroku

* Move into the project directory: `cd ~/YOUR_PROJECTS_DIRECTORY/YOUR_PROJECT_NAME`
* Create the Heroku app: `heroku create PROJECT_NAME`

* If your backend connects to a database, you need to configure the database URL:
    * For a MongoDB database: `heroku config:set DATABASE_URL=mongodb://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME`
    * For a PostgreSQL database: `heroku config:set DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME`

* If you are creating a full-stack app, you need to configure the client origin: `heroku config:set CLIENT_ORIGIN=https://www.YOUR_DEPLOYED_CLIENT.com`

### Deploying to Heroku

* Push your code to Heroku: `git push heroku master`



# Cartas Contra Español Server

## Table of Contents
- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Server Structure](#app-structure)
- [Data Models](#data-models)
  - [User Schema](#user-schema)
  - [Account Schema](#account-schema)
  - [Income Schema](#income-schema)
- [API Endpoints](#api-endpoints)
  - [Users](#users)
  - [Authentication](#authentication)
  - [Accounts](#accounts)
  - [Income](#income)
  - [Image Upload](#image-upload)

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
Acceptable Losses employs Mongoose document schema to construct its data models: users, accounts (such as a bill and its payment history), and income. User documents dictates the existence of other documents as a user ID is required for their creation.

### User Schema
```
username: {
  type: String,
  required: true,
  unique: true
},
password: { type: String, required: true },
firstName: { type: String, default: '' },
lastName: { type: String, default: '' },
profilePic: {
  public_id: { type: String, default: '' },
  secure_url: { type: String, default: '' }
}
```
While `username` is stored as a string, its route handlers will ensure that it is a proper email format.

### Account Schema
```
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
name: { type: String, required: true },
url: { type: String, default: null },
frequency: { type: String, required: true },
reminder: { type: String, default: null },
nextDue: {
  isPaid: { type: Boolean, default: false },
  dueDate: { type: String, default: '' },
  datePaid: { type: String, default: null },
  amount: { type: Number, default: 0 }
},
bills: [
  {
    isPaid: { type: Boolean, default: false },
    dueDate: { type: String, default: '' },
    datePaid: { type: String, default: null },
    amount: { type: Number, default: 0 }
  }
],
fireCronJob: { type: Boolean, default: true }
```
Front end uses `nextDue` as reference of when and how much a bill is due. The `bills` array is representation of bill history.

### Income Schema
```
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
source: { type: String, required: true },
amount: { type: Number, required: true, default: 0 }
```
Income is used for comparison against expenses, and should be entered at the monthly amount.




## API Endpoints
All requests and responses are in JSON format.

Action | Path |
--- | --- |
Users | https://agile-beach-60418.herokuapp.com/api/users |
Authentication | https://agile-beach-60418.herokuapp.com/api/auth |
Questions | https://agile-beach-60418.herokuapp.com/api/questions |

### Users
`POST` request to endpoint `/` is for creating user documents. It accepts the following request body,
```
{
  username,
  password,
  firstName, // optional
  lastName // optional
}
```
`username` will be rejected if it is not unique. Once a user document is successfully created, this will be the server's response.
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

`GET` request to `/one` while using the user's ID will return one question document belonging to a user's question list.

```
{
  question
}
```

`PUT` request to `/:id` will modify propertys of an account document of the same ID. It accepts the following request body,
```
{
  name,
  url, // optional
  frequency,
  dueDate, // optional
  reminder,
  amount // optional
}
```

`POST` to `/` will create an account document. Analogous to a vendor account, this document contains a name, next due date, amount, and billing history. It accepts the following request body,
```
{
  name,
  url, // optional
  frequency,
  dueDate,
  reminder,
  amount
}
```

`PUT` request to `/bills/:id` will update the bill history. This path is used specifically by the client-side to mark a bill as paid. Doing so will take an account's `nextDue`, increase it by a value based on its `frequency` (a month for example), mark it as paid on the current date, and push it into the `bills` array, thus adding to its history. Request body is optional,
```
{
  amount // optional
}
```
If no amount is sent, default value of `0` will be entered so the user can modify it later.

`DELETE` request to `/:id` will delete an account document with the same ID. The server will respond with status 204 whether or not the account exists.

### Income
`POST` request to `/` will create an income document. This is for comparison against monthly expenses, thus `amount` value should be per monthly basis. Income name is stored as `source`. It accepts the following request body,
```
{
  source,
  amount
}
```

`PUT` request to `/:id` will update an existing income document, with `:id` being the the income's ID. It accepts the following request body,
```
{
  source,
  amount
}
```

`GET` request to `/` and `/:id` will return an array of all or one income data belonging to a user, respectively, with `:id` being the income's ID.

`DELETE` request to `/:id` will delete an income document with the same ID. The server will respond with status 204 whether or not the income exists.

### Image Upload
`POST` request to `/upload` will create a profile picture by uploading a picture file (chosen by the user) directly into the app's Cloudinary account. Client-side will provide the request file via `FormData`, thus no additional content is needed in the request body. Once successful, `profilePic` property of the user document will be updated with a `public_id` and `secure_url`, which is used as reference to load a photo from Cloudinary.
```
{
  id,
  username,
  firstName,
  lastName,
  profilePic: {
    public_id,
    secure_url
  }
}
```
If a user already has an existing profile picture, sending request to this route with another file will replace the previous photo from Cloudinary's server with a new one.

`DELETE` request to `/delete` will remove a user's profile picture from Cloudinary's server and set the `public_id` and `secure_url` properties within the user's `profilePic` object into an empty string.
