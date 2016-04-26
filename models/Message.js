'use strict';

class Message {
  constructor(r, name) {
    this.r = r.table(name);
    this._name = name;
    this._indexes = ['createdAt']
  }

  find(id, done) {
    this.r.get(id)
      .run()
      .then(function(message) {
        return done(null, message)
      })
      .error(function(err) {
        return done(err)
      })
  }

  create(msg, done) {
    var message = Object.assign(msg, {createdAt: new Date()});
    this.r.insert(message, {returnChanges: true})
      .run()
      .then(function(result) {
        return done(null, result.changes[0].new_val)
      })
      .error(function(err) {
        return done(err)
      })
  }

  remove(id, done) {
    this.r.get(id)
      .delete({returnChanges: true})
      .run()
      .then(function(result) {
        return done(null, result)
      })
      .error(function(err) {
        return done(err)
      })
  }
}

module.exports = Message;