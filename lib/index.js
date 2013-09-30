/*
 * Continuous Deployment - Modulus
 * https://github.com/upstage/continuous-deployment-modulus
 *
 * Copyright (c) 2013 Upstage
 * Licensed under the MIT license.
 */


var exec = require('child_process').exec;
var path = require('path');
var url = require('url');
var fs = require('fs');

// get options from environment variables
var modulusProject = process.env.MODULUS_PROJECT;
var username = process.env.MODULUS_USER;
var password = process.env.MODULUS_PWD;
var useGithub = process.env.USE_GITHUB || false;
var githubToken = process.env.GITHUB_TOKEN;

var execOptions = {};

var captureOutput = function(child, output) {
  child.pipe(output);
};

var runCmd = function(cmd, cb) {
  console.log(cmd);
  var cp = exec(cmd, execOptions, function(err, stdout, stderr) {
    console.log(cmd + ' finished.');
    if(err) {
      console.log(err);
      cb(err);
    } else {
      cb();
    }
  });

  captureOutput(cp.stdout, process.stdout);
  captureOutput(cp.stderr, process.stderr);
};

var rmdir = function(p, cb) {
  runCmd('rm -rf ' + p + '/', function(err) {
    if(err) {
      console.log('FAILED...');
      console.log(err);
      cb(err);
    } else {
      cb();
    }
  });
};

var pad = function(num) {
  return num < 10 ? '0' + num : num;
};

var getFormattedDateTime = function(datetime) {
  return '' + datetime.getFullYear()
            + pad(datetime.getMonth())
            + pad(datetime.getDate())
            + pad(datetime.getHours())
            + pad(datetime.getMinutes())
            + pad(datetime.getSeconds())
            + datetime.getMilliseconds();
};

var middleware = function() {
  return function (req, res, next) {
    console.log('deployment request incoming...');

    var payload = JSON.parse(req.body.payload);
    console.log('deployment request from: ');
    console.log('\t' + payload.repository.url);

    var repoUrl = url.parse(payload.repository.url);
    repoUrl.auth = githubToken + ':x-oauth-basic'

    var tmpPath = 'tmp_' + getFormattedDateTime(new Date());
    var modulusPath = path.join(__dirname, 'node_modules', 'modulus', 'bin', 'modulus');
    var githCloneCmd = 'git clone ' + url.format(repoUrl) + '.git ' + tmpPath;
    var loginCmd = modulusPath + '/bin/modulus login' 
                  + (useGithub === true ? ' --github' : '')
                  + ' --username ' + username
                  + ' --password ' + password;

    var deployCmd = modulusPath + '/bin/modulus deploy ./' + tmpPath
                  + ' -p ' + modulusProject;

    runCmd(githCloneCmd, function(err) {
      if(err) next(err);
      runCmd(loginCmd, function(err) {
        if(err) next(err);
        runCmd(deployCmd, function(err) {
          if(err) next(err);
          rmdir(tmpPath, function(err) {
            if(err) next(err);
            res.send('OK');
          });
        });
      });
    });
  };
};

module.exports = middleware;