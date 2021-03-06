# Introduction
The idea behind this repository is showing some examples about how to use Okta's OpenID Connect (OIDC) feature to secure your applications. All the examples are written using JavaScript and Express as framework.

I recommend that you also check the Python example implementation made by onee of Okta's developers. You can check it [here](https://github.com/jpf/okta-oidc-beta).

## 1. Getting Started
- 1.1 Adding a new application to Okta Organization & configuring OpenID Connect.

- 1.2 Redirecting unauthenticated users to Okta.

- 1.3 Validating the ID Token (JWT).

- 1.4 Obtaining user groups (permissions) from Okta.

### 1.1 Adding a new application to Okta Organization & configuring OpenID Connect.
  - Log in to your Okta account as an administrator.

  - On applications tab, click on "Add Application".
  
  ![add application](https://cloud.githubusercontent.com/assets/10089668/17463384/81a9de1c-5c9a-11e6-817d-3a5755f4104f.png)

  - On the next screen, click the "Create New App" button.
  
  ![create app](https://cloud.githubusercontent.com/assets/10089668/17463385/81ac9832-5c9a-11e6-8ef3-78d20f1d9b94.png)
 
  - On platform, choose "Single Page App (SPA)" and make sure that Sign on method is set to "OpenID Connect".
  ![app platform](https://cloud.githubusercontent.com/assets/10089668/17463386/81ad236a-5c9a-11e6-8253-a4af52ea60e1.png)
  
  - Click on "Create".
  
  - Configure your application name and logo.
  
  ![configure app](https://cloud.githubusercontent.com/assets/10089668/17463387/81b0a3b4-5c9a-11e6-9880-20535ac4a224.png)

  - Configure Redirect URIs for your application. This is a whitelist of endpoints that Okta may trust and send the ID Token after a successful authentication.
  
  <img here>
  
  - Click on "Finish"
  
  - **important**: using the "People" or "Groups" tab, assign people to your newly created application. Users won't be able to authenticate to your application unless they are assigned to it.
  
  - **important**: take note of your app's "Client ID" in the "General" tab. You will need it later.
  
  


### 1.2 Redirecting unauthenticated users to Okta's authentication endpoint.
After creating your application on Okta, you are going to need to redirect all unauthenticated requests to Okta's authorize endpoint (`https://{your_organization}.okta.com/oauth2/v1/authorize?{params}`). This endpoint takes your application's **Client ID** and **Redirect URI**, among other required parameters. Keep in mind that Okta only redirects the user back to URIs configured as "Redirect URIs" on the previous step.

To see the full list of request parameters for this endpoint check Okta's documentation [here](http://developer.okta.com/docs/api/resources/oauth2.html#authentication-request).

Creating a middleware for redirecting unauthenticated users in Express.

E.g: `/express-app/middlewares/checkUserAuth.js`

```javascript
const express = require('express');
const querystring = require('querystring');
const config = require('../config/app-config');

module.exports = (req, res, next) => {
  // If the user already is authenticated, call the next route handler
  if(req.session.user) {
    next();
  // Otherwise, redirect to Okta for authentication
  } else {
    const params = querystring.stringify({
      // Add one of the URIs registered on step 1.1 here.
      redirect_uri: config.OKTA_REDIRECT_URI,
      // Client ID obtained upon creating a new applicaton in Okta
      client_id: config.OKTA_CLIENT_ID,
      response_type: 'id_token',
      // This value changes how Okta sends parameters back to redirect_uri upon successfully authenticating a user.
      // Check documentation for available values.
      response_mode: 'form_post',
      // This value determines what attributes should be contained in the response JSON Web Token (JWT). OpenID is required, email and groups are optional, but really useful if you want the user's e-mail and permissions.
      // Note that you also need to configure what groups Okta should send back to your app. (step 1.4)
      scope: 'openid email groups',
      // Required value according to documentation.
      // This value can be used to represent your application's state upon the receipt of the response
      state: 'example state'
    });
    const authEndpoint = `${config.OKTA_BASE_URL}/oauth2/v1/authorize?${params}`;
    res.redirect(authEndpoint);
  }
};
```

Wiring the created middleware to your application's routes.

E.g: `/express-app/routes/index.js`

```javascript
const router = require('express').Router();
// Require checkUserAuth middleware module
const checkUserAuth = require('../middlewares/checkUserAuth');

// Home page route
const home = require('./home');
// Oauth callback route
const oauthCallback = require('./oauthCallback');

// Register checkUserAuth middleware to home route
router.get('/', checkUserAuth, home);

// Since users won't be authenticated at this point, we do not check user authentication at this route
router.use('/oauth/callback', oauthCallback);
```

### 1.3 Validating the ID Token (JWT).
After a successful authentication Okta will generate an ID Token (which in our case is a JSON Web Token or JWT), containing authentication information such as user id, email (optional, depends on scope attribute from step 1.2), expiration date, groups (optional, depends on scope attribute from step 1.2) and other data. This token is posted back to whatever URL was informed as `redirect_uri` in step 1.2.

ID Token example:
```
eyJhbGciOiJSUzI1NiIsImtpZCI6Im1MaTFVZFhDa205MEtscTlaSnk1cDZyQVp4NV9YMkdRZ
WUyRV9MajNlVXMifQ.eyJzdWIiOiIwMGExYjMzY2RlNGZINWlqNjBrNyIsImVtYWlsIjoibXl
1c2VyQG15Y29tcGFueS5jb20iLCJ2ZXIiOjEsImlzcyI6Imh0dHBzOi8vbXljb21wYW55Lm9r
dGFwcmV2aWV3LmNvbSIsImF1ZCI6ImtkOGE3N0hMRG1hc1NUIiwiaWF0IjoxNDU5NDUwMjg0L
CJleHAiOjE0NTk0NTM4ODQsImp0aSI6ImpHYmJuVENid1dxc0dfT0s1M1RSIiwiYW1yIjpbIn
B3ZCJdLCJpZHAiOiIwMG8xZWlnOHlBQkNERUZHSElKS0wiLCJ1cGRhdGVkX2F0IjowLCJlbWF
pbF92ZXJpZmllZCI6dHJ1ZSwiYXV0aF90aW1lIjoxNDU5NDUwMjg0LCJncm91cHMiOlsiRXZl
cnlvbmUiLCJjdXN0b20tdXNlci1ncm91cCIsImFub3RoZXItdXNlci1ncm91cCJdfQ==.Zp8a
6o0nLEw_pEJEAgNgcT9CCvjizqBmGmvO-fjzEOmo1lqoUiBkRCZxTKW43vhInQ8pxa3Ms7G95
GwT_TjDZZuexPPsGRewMNZXJCiUm6bD7NEMzRqrWzsPhP6p-vcbPm4NCyXqu63CpLGODSeFtJ
An-khTOTcmQBKqNqZveoD0IgJWP_my4_PDjsFMRFHbeiccRfBHHdgAoTGvu1jWul7Bz25QCzh
6PMdXPpWJgbPZ1DUoXef2m_a71IGsjn_RLKB0u5UKmvlKPvAxf3U48w257pRF7Gx-g6za_E9A
gY703cd1MJjDFRL4DQPPo6yhLWWs7UCyG2o9SORJc4Qoig
```

A JWT is a method for representing claims securely between two parties. It is basically a base64 encoded string divided in 3 parts by dots (**header**, **payload** and **signature**) each containing different information. The above decoded token contains:

**Header**
```javascript
{
  // Digital signature algorithm used.
  "alg": "RS256",
  // Public key identifier.
  // Used to find the corresponding public key on JWKs uri, take note of this.
  "kid": "mLi1UdXCkm90Klq9ZJy5p6rAZx5_X2GQee2E_Lj3eUs"
}
```

**Payload**
```javascript
{
  "sub": "00a1b33cde4fH5ij60k7",
  "email": "myuser@mycompany.com",
  "ver": 1,
  "iss": "https://mycompany.oktapreview.com",
  "aud": "kd8a77HLDmasST",
  "iat": 1459450284,
  "exp": 1459453884,
  "jti": "jGbbnTCbwWqsG_OK53TR",
  "amr": [
    "pwd"
  ],
  "idp": "00o1eig8yABCDEFGHIJKL",
  "updated_at": 0,
  "email_verified": true,
  "auth_time": 1459450284,
  "groups": [
    "Everyone",
    "custom-user-group",
    "another-user-group"
  ]
}
```

After receiving the ID Token from Okta, you should decode and validate it. **Validating** the token is a very important step in order to guarantee that it has not been altered by a malicious user. 
You should use a library to decode and validate JWTs, you can find a list of libs [here](https://jwt.io/).

The process of validating a token works in the following manner:

 1. Verify that the iss (issuer) claim in the ID Token exactly matches the issuer identifier for your Okta org. (e.g: check if "iss" is okta.com or oktapreview.com).
 2. Verify that the aud (audience) claim contains the client_id of your app.
 3. Obtain public key associated with this kid.
 4. Use the public key to validate the id token.
 5. Optionally (**recommended**) verify that the expiry time (from the exp claim) has not already passed.
 6. Optionally (**recommended**) send a nonce claim in the authorize endpoint and check its value to make sure its the same as the one that was sent in the Authentication Request. This check can be useful for replay attacks.
 8. Optionally (**recommended**) check the auth_time claim value and request re-authentication using the prompt=login parameter if it determines too much time has elapsed since the last end-user authentication.
 
To obtain the public key:

1. Go to https://{yourcompny}.oktapreview.com/.well-known/openid-configuration
2. Find the URI value in the `jwks_uri` attribute
3. Go to https://{yourcompny}.oktapreview.com/oauth2/v1/keys and find the public key related with the key id you want to validate.

E.g:
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const config = require('../config/app-config');

const app = express();

app.post('/oauth/callback', (req, res) => {
  const token = req.body.id_token;
  // decode the token without validating it (to extract the key id from the header)
  const dirtyToken = jwt.decode(token, { complete: true});
  
  // Instead of accesing https://{yourcompny}.oktapreview.com/.well-known/openid-configuration
  // and then https://{yourcompny}.oktapreview.com/oauth2/v1/keys. I did the whole process manually (using the browser) 
  // and added the public key to my configuration file.
  const pemEncodedKey = jwkToPem(config.OKTA_PUBLIC_KEYS);
  
  // I'm using node-jsonwebtoken (https://github.com/auth0/node-jsonwebtoken) to validate the token
  // It requires the public key to be PEM encoded in order to verify it.
  // that's why we used jwkToPem function previously
  const verifiedToken = jwt.verify(token, pemEncodedKey, { algorithms: ['RS256']});

  req.session.user = verifiedToken.email;
  res.redirect('/');
});

module.exports = router;

```
More details in `/express-app/routes/oauthCallback.js`.

## 2. Browser based app authentication example:
source code example in https://github.com/lucaslago/okta-openid-samples/express-app
