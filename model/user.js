import mongoose from 'mongoose';

import bcrypt from 'bcrypt';

const crypto = require('crypto'); 
const events = require('./event');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({

    email: { type: String, unique: true },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    profileImg:{data:Buffer,contentType:String},

    facebook: String,
    google: String,
    tokens: Array,

    profile: {
      name: String,
      username: String,
      gender: String,
      location: String,
      website: String,
      picture: String,
      organisedEvents: [{ type: Schema.Types.ObjectId, ref: 'events' }],
      attendingEvents: [{ type: Schema.Types.ObjectId, ref: 'events' }]
    }
},{timestamp:true});



/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
