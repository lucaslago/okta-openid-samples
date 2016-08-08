# Introduction
Here you can find demonstrations on how to use Okta's OpenID Connect (ODOIC) feature to secure your web applications. The examples are written using JavaScript and Express.

I Strongly recommend that you also check the example Python implementation made by one of Okta's developers. You can check it [here](https://github.com/jpf/okta-oidc-beta).

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

Express example:
```javascript
  import express from 'express';
  import querystring from 'querystring';
  import {OKTA_CONFIG} from './config';

  const app = express();

  app.use((req, res, next) => {
    if(!req.session.user) {
      const params = querystring.stringify({
        redirect_uri: OKTA_CONFIG.OKTA_REDIRECT_URI,
        client_id: OKTA_CONFIG.OKTA_CLIENT_ID,
        response_type: 'id_token',
        response_mode: 'form_post',
        scope: 'openid email groups',
        state: 'my-app-state'
      });
      const authEndpoint = `${OKTA_CONFIG.OKTA_BASE_URL}/oauth2/v1/authorize?${params}`;
      res.redirect(authEndpoint);
    } else {
      next();
    }
  });
```
### 1.3 Validating the ID Token (JWT).
WIP
### 1.4 Obtaining user groups (permissions) from Okta.
WIP

## 2. Example 1: Browser based app authentication
WIP

## 2. Example2: Machine-to-machine authentication
WIP
