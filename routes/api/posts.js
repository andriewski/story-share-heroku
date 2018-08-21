const express = require('express');
const router = express.Router();
const mongoose  = require('mongoose');
const Story = require('../../models/Story');

router.post('/', (req, res) => {
    const newStory = new Story({
        text: req.body.text,
        name: req.body.name,
        picture: req.body.picture,
        avatar: req.body.avatar,
        userID: req.body.userID,
    });

    newStory.save().then(post => res.json(post));
});

/*router.get('/', (req, res) => {
  const {perPage, offset} = req.query;
   Story.find()
        .sort({ date: -1 })
        .skip(+offset)
        .limit(+perPage)
        .then(stories => res.json(stories))
        .catch(err => res.status(404).json({ nostories: `There're no stories`, err}))
});*/

router.get('/', (req, res) => {
  const {perPage, offset} = req.query;
  Story.find()
       .sort({ date: -1 })
       .skip(+offset)
       .limit(+perPage)
       .then(stories => {
        res.json(stories)
       })
       .catch(err => res.status(404).json({ nostories: `There're no stories`, err}))
});

router.get('/length', (req, res) => {
  Story.find()
       .then(stories => {
          res.json(stories.length)
       })
       .catch(err => res.status(404).json({ nostories: `There're no stories`, err}))
});

/*router.get('/', (req, res) => {
  const {perPage, offset} = req.query;
  console.log(perPage);
  console.log(offset);
   Story.find().sort({ date: -1 }).skip(+offset).limit(+perPage)
        .then(stories => res.json(stories))
        .catch(err => res.status(404).json({ nostories: `There're no stories`, err}))
});*/

router.get('/single', (req, res) => {

  Story.findById(req.query.id)
    .then(post => res.json({post : post}))
    .catch(err => res.status(404).json({ nostories: `There's no story`, err}))
});

router.post('/likes', (req, res) => {
  Story.findById(req.body.postID)
    .then(post => {
      post.likes.indexOf(req.body.userID) === -1
          ? post.likes.push(req.body.userID)
          : post.likes.splice(post.likes.indexOf(req.body.userID), 1);

      post.save().then(post => res.json(post.likes));
    })
    .catch(err => res.status(404).json({nostories: `There's no story`, err}));
});

router.post('/comment', (req, res) => {
  Story.findById(req.body.postID)
    .then(post => {
      post.comments.unshift(
          {
            name : req.body.name,
            text : req.body.text,
            date : Date.now(),
          }
        );
      post.save().then(post => res.json('success!'));
    })
    .catch(err => res.status(404).json({nostories: `There's no comments`, err}));
});

module.exports = router;


/*const express = require('express');
const router = express.Router();
const mongoose  = require('mongoose');
const Story = require('../../models/Story');

router.post('/', (req, res) => {
    const newStory = new Story({
        text: req.body.text,
        name: req.body.name,
        picture: req.body.picture,
        avatar: req.body.avatar,
        userID: req.body.userID,
    });

    newStory.save().then(post => res.json(post));
});

router.get('/', (req, res) => {
   Story.find().sort({ date: -1 })
        .then(stories => res.json(stories))
        .catch(err => res.status(404).json({ nostories: `There're no stories`, err}))
});

router.get('/single', (req, res) => {

  Story.findById(req.query.id)
    .then(post => res.json({post : post}))
    .catch(err => res.status(404).json({ nostories: `There's no story`, err}))
});

router.post('/likes', (req, res) => {
  Story.findById(req.body.postID)
    .then(post => {
      post.likes.indexOf(req.body.userID) === -1
          ? post.likes.push(req.body.userID)
          : post.likes.splice(post.likes.indexOf(req.body.userID), 1);

      post.save().then(post => res.json(post.likes));
    })
    .catch(err => res.status(404).json({nostories: `There's no story`, err}));
});

router.post('/comment', (req, res) => {
  Story.findById(req.body.postID)
    .then(post => {
      post.comments.unshift(
          {
            name : req.body.name,
            text : req.body.text,
            date : Date.now(),
          }
        );
      post.save().then(post => res.json('success!'));
    })
    .catch(err => res.status(404).json({nostories: `There's no comments`, err}));
});

module.exports = router;*/