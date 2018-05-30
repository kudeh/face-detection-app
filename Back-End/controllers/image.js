const Clarifai = require('clarifai');
const apiKey = require('../apiKey.js');

const app = new Clarifai.App(apiKey);

const handleApiCall = (req, res) => {

  app.models
  .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
  .then(data => {
    res.json(data);
  })
  .catch(err => res.status(400).json('unable to fetch the api'));

}

const handleImage = (req, res, db) => {

  let { id } = req.body;

  db('users').where('id' , '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {
  handleImage: handleImage,
  handleApiCall: handleApiCall
};
