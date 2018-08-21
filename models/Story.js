const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StorySchema = new Schema({
  avatar: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  picture: {
    type: String,
  },
  text: {
    type: String,
    required: true
  },
  userID: {
    type: String,
  },
  likes: [],
  comments: [],
});

module.exports = Story = mongoose.model('post', StorySchema);