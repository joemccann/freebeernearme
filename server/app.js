
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.use('/', express.bodyDecoder());
    app.use('/', express.methodOverride());
    app.use(express.staticProvider(__dirname + '/codebase'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


// Only listen on $ node app.js

if (!module.parent) {
  app.listen(7575);
  console.log("Express server listening on port %d", app.address().port)
}
