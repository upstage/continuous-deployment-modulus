# continuous-deployment-modulus [![NPM version](https://badge.fury.io/js/continuous-deployment-modulus.png)](http://badge.fury.io/js/continuous-deployment-modulus)  

Express middleware for enabling continuous deployment from github on modulus.io

## Getting Started

```shell
npm install continuous-deployment-modulus --save
```

Add to your express application before routing...

```js
var cd = require('continuous-deployment-modulus');
app.configure(function() {
  app.use(cd(app));
});
```

Set up your environment variables in your modulus project...

TODO:

## Environment Variables
###MODULUS_PROJECT
 - The name of your modulus project that will get deployed

###MODULUS_USER
 - The username you use when logging into modulus. If you use a github login, then this is your github username

###MODULUS_PWD
 - The password you use when logging into modulus. If you use a github login, then this is your github password

###USE_GITHUB
 - If you use a github login, set this to `true`

###GITHUB_TOKEN
 - This is the personal github token you need to create to give the middleware access to pull from your repo. TODO - add instructions on setting this up.
