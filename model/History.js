const mongoose = require('mongoose');

const History = mongoose.model('History', {
    name: String,
    stack: String,
    history: String,
    github: String,
    authorid: String,
});

module.exports = History;