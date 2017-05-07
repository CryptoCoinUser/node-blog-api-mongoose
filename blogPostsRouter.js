const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const bodyParser = require('body-parser');
//const jsonParser = bodyParser.json();
router.use(bodyParser.json());
const {BlogPosts} = require('./models');

/********** GET ****************/

// when the root of this router is called with GET, return all current BlogPosts items
router.get('/', (req, res) => {
    // const filters = {};
    // const queryableFields = ['cuisine', 'borough'];
    // queryableFields.forEach(field => {
    //     if (req.query[field]) {
    //         filters[field] = req.query[field];
    //     }
    // });
    BlogPosts
        //.find(filters)
        .find()
        .limit(99)
        .exec()
        .then(posts => res.json(
            posts.map(post => post.apiRepr())
        ))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'GET Internal server error'})
        });
});


// can also request by ID
router.get('/:id', (req, res) => {
  BlogPosts
    // this is a convenience method Mongoose provides for searching by the object _id property
    .findById(req.params.id)
    .exec()
    .then(posts =>res.json(posts.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'GET Internal server error OR no blog post witht that ID'})
    });
});



/********* POST **************/
/*
expects request body to contain a JSON object like this:
{
    "title": "some title",
    "content": "a bunch of amazing words",
    "author": {
        "firstName": "Sarah",
        "lastName": "Clarke"
    }
}
validates that the request body includes title, content, and author, and returns a 400 status and a helpful error message if one of these is missing.
it should return the new post (using the same key/value pairs as the posts returned by GET /posts).

*/

router.post('/', (req, res) => {
  console.log("POST " + req.body);
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPosts
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author})
    .then(
      posts => {
        console.log(posts);
        res.status(201).json(posts.apiRepr())
      })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'POST Internal server error'});
    });
});


/**************** PUT *************
endpoint that allows you to update the title, content, and author fields.
expects request body to contain a JSON object like this (note that this would only update the title — if you wanted to update content or author, you'd have to send those over too):
  {
      "id": "ajf9292kjf0",
      "title": "New title"
  }
the id property in the request body must be there.
if the id in the URL path (/posts/:id) and the one in the request body don't match, it should return a 400 status code with a helpful error message.
it should return the updated object, with a 201 status code.
*********************************/

router.put('/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  console.log(req);
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values in document
  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPosts
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(post => res.status(201).end())
    .catch(err => res.status(500).json({message: 'PUT Internal server error'}));
});



// when DELETE request comes in with an id in path,
// try to delete that item from BlogPosts.
router.delete('/:id', (req, res) => {
  BlogPosts
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({message: 'DELETE Internal server error'}));
});



module.exports = router;






































