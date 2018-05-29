const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')
const cred = require('./databaseCreds')

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : cred.user,
    password : cred.password,
    database : 'smart-brain'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send(database.users);
})

app.post('/signin', (req, res) => {

  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash)

      if(isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            console.log(user);
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      }else {
        res.status(400).json('wrong credentials');
      }

    })
    .catch(err => res.status(400).json('wrong credentials'))

})

app.post('/register', (req, res) => {

  const { email, name, password } = req.body;

  const hash = bcrypt.hashSync(password);
  console.log(req.body);
  console.log(email, name, password, hash);

  db.transaction(trx => {
    console.log('here')
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
        .returning('*')
        .insert({
          name: name,
          email: loginEmail[0],
          joined: new Date()
        })
        .then(user => {
          res.json(user[0])
        })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
    .catch(err => {
        res.status(400).json('unable to register')
      })

})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('users').where({
    id: id
  }).then(user => {
    if (user.length){
      res.status(404).json("no such user");
    }else {
      res.json(user[0])
    }
  })
  .catch(err => res.status(400).json('error getting user'))



})


app.put('/image', (req, res) => {

  let { id } = req.body;

  db('users').where('id' , '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'))

})


app.listen(3000, () => {
  console.log('app is running on port 3000');
})
