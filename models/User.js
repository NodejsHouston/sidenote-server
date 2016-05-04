'use strict';

class User {
  constructor(r, name) {
    this.r = r.table(name);
    this._name = name;
    this._indexes = ['createdAt']
  }

  find(id, done) {
    this.r.get(id)
      .run()
      .then(function(user) {
        return done(null, user)
      })
      .error(function(err) {
        return done(err)
      })
  }

  create(user, done) {
    var fullUser = Object.assign(user, {createdAt: new Date()});
    this.r.insert(fullUser, {returnChanges: true})
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

module.exports = User;