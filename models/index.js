var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');


const DB_NAME = 'rethinkdb_sidenote';
var r = require('rethinkdbdash')({
  db: DB_NAME
});

var _models = {};

// Array of model file names
var modelFiles = fs.readdirSync(__dirname)
  .map((file) => path.basename(file, '.js'))
  .filter((fileName) => fileName != 'index');

// Create a placeholder for our eventual models
modelFiles.forEach((fileName) => _models[fileName] = {});

function createDatabase(callback) {
  r.dbList().contains(DB_NAME).do(function(containsDb) {
      return r.branch(
        containsDb,
        {created: 0},
        r.dbCreate(DB_NAME)
      );
    })
    .run()
    .then(function(result) {
      //console.log('Finished creating database: ' + DB_NAME);
      return callback()
    })
    .error(function(err) {
      console.log('Error creating database: ' + DB_NAME);
      return callback(err)
    })
}

function createTable(tableName, callback) {
  r.tableList().contains(tableName).do(function(containsTable) {
      return r.branch(
        containsTable,
        {created: 0},
        r.tableCreate(tableName)
      );
    })
    .run()
    .then(function(result) {
      //console.log('Finished creating table: ' + tableName);
      return callback()
    })
    .error(function(err) {
      console.log('Error creating table: ' + tableName);
      return callback(err)
    })
}

function createModelIndexes(model, callback) {
  var indexes = model._indexes;
  //console.log('Creating ' + model._name + ' model indexes:  ' + indexes );
  indexes.forEach(function(index) {
    model.r.indexList().contains(index)
      .do(function(hasIndex) {
        return r.branch(
          hasIndex,
          {created: 0},
          model.r.indexCreate(index)
        );
      })
      .run()
      .then(function(result) {
      })
      .error(function(err) {
        console.log('Error creating index: ' + index + ' for the ' + model._name + ' model');
        throw err
      })
  });
  return callback();

}

function waitForModelIndexes(model, callback) {
  model.r
    .indexWait()
    .run()
    .then(function() {
      //console.log(model._name + ' indexes are ready');
      return callback()
    })
    .error(function(err) {
      return callback(err)
    })
}

exports.model = function(modelName) {
  if (!_.isObject(_models[modelName])) {
    throw new Error(modelName + " is not a valid model!")
  }
  if (_.isEmpty(_models[modelName])) {
    throw new Error(modelName + " has not been initialized, try to assign the model within a function")
  }
  return _models[modelName];
};


exports.register = function(server, options, next) {
  console.log('Initializing RethinkDB');

  async.auto({
    createDatabase: createDatabase,
    createTables : ['createDatabase', function(results, callback) {
      async.eachSeries(modelFiles, createTable, callback)
    }],
    loadModels: ['createDatabase', 'createTables', function(results, callback) {
      var modelModules = modelFiles.map((fileName) => new (require('./' + fileName))(r, fileName));
      return callback(null, modelModules)
    }],
    createModelIndexes: ['loadModels', function(results, callback) {
      var models = results.loadModels;
      async.eachSeries(models, createModelIndexes, callback);
    }],
    waitForIndexes: ['loadModels', 'createModelIndexes', function(results, callback) {
      var models = results.loadModels;
      async.each(models, waitForModelIndexes, callback)
    }]
  }, function(err, results) {
    if (err) {
      throw err
    }

    console.log('RethinkDB Ready!');
    console.log('Database: ' + DB_NAME);
    console.log('Models: ' + modelFiles);
    results.loadModels.forEach((model) => _models[model._name] = model);
    next();
  });

};

exports.register.attributes = {
  name: 'models'
};