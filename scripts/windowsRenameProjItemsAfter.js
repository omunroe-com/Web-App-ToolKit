#!/usr/bin/env node

var path = require('path'),
    url = require('url'),
    fs = require('fs'),
    rename = require('./rename'),
    logger = require('./logger'),
    winjsDownloader = require('./winjsDownloader'),
    Q;

module.exports = function (context) {
  var projectRoot = context.opts.projectRoot;

  // if the windows folder does not exist, cancell the script
  var windowsPath = path.join(projectRoot, "platforms","windows");
  if (!fs.existsSync(windowsPath) || context.opts.plugin.platform !== 'windows') {
    return;
  }

  Q = context.requireCordovaModule('q');
  var task = Q.defer();

  // move contents of the assets folder to the windows platform dir
  var sourcePath = path.join(windowsPath, 'CordovaApp.projitems.xml');
  var destPath = path.join(windowsPath, 'CordovaApp.projitems');
  logger.log('Renaming the CordovaApp.projitems.xml file to CordovaApp.projitems.');

  var renameTask = Q.defer();
  rename(sourcePath, destPath, function (err) {
    if (err) {
      console.error(err);
      return renameTask.reject();
    }

    console.log("Finished renaming the CordovaApp.projitems.");
    return renameTask.resolve();
  });

  var downloadTask = Q.defer();
  winjsDownloader.downloadWinJSFiles(context, function() {
    return downloadTask.resolve();
  });

  Q.allSettled([renameTask.promise, downloadTask.promise]).then(function () {
    return task.resolve();
  });

  return task.promise;
};
