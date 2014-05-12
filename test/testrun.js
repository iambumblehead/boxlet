var scroungejs = require('scroungejs'),
    startutils = require('./startutil');

startutils.createFileIfNotExist({
  pathSrc : './test/indexSrc.html',
  pathFin : './test/index.html'
}, function (err, res) {
  if (err) return console.log(err);

  var scroungeTestOpts,
      scroungeMinOpts,
      scroungeUnminOpts;

  scroungeTestOpts = {
    inputPath : [
      './test/testbuildSrc',
      './node_modules',
      './boxlet.js',
      './boxlet.css'
    ],
    outputPath : './test/testbuildFin', 
    isRecursive : true,
    isSourcePathUnique : true,
    isCompressed : false,
    isConcatenated : false,
    basepage : './test/index.html'
  };

  scroungeMinOpts = Object.create(scroungeTestOpts);
  scroungeMinOpts.basepage = '';
  scroungeMinOpts.trees = ["boxlet.full.js"];
  scroungeMinOpts.outputPath = './boxlet.min.js';
  scroungeMinOpts.isCompressed = true;
  scroungeMinOpts.isConcatenated = true;
  scroungeMinOpts.isLines = false;

  scroungeUnminOpts = Object.create(scroungeTestOpts);
  scroungeUnminOpts.basepage = '';
  scroungeUnminOpts.trees = ["boxlet.full.js"];
  scroungeUnminOpts.outputPath = './boxlet.unmin.js';
  scroungeUnminOpts.isCompressed = false;
  scroungeUnminOpts.isConcatenated = true;

  scroungejs.build(scroungeTestOpts, function (err, res) {
    if (err) return console.log(err);

    // build a minified version
    scroungejs.build(scroungeMinOpts, function (err, res) {
      if (err) return console.log(err);

      // build a minified version
      scroungejs.build(scroungeUnminOpts, function (err, res) {
        if (err) return console.log(err);
        console.log('done');
      });
    });
  });

});
