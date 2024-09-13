# Developer Documentation for Aristotle Argus Apps
This guide will help you develop an **Aristotle Argus App** using the Aristotle API, argus.js library, and aristotle-manifest.json. By integrating these components into your app, you can create an application that is registerable in the **Aristotle App Store** and usable within the **Aristotle Registry**.

## Table of Contents

1. Introduction
2. ArgusJS API Documentation
3. Creating a New App
4. Example Applications
   1. Vanilla JavaScript Example
   2. Vue.js Example
   
## 1. Introduction

As a developer, you can leverage the Aristotle API to create custom applications. By adding two key files to your application—*aristotle-manifest.json* and *argus.js*—you can transform it into an Aristotle Argus App. These apps can be registered in the Aristotle App Store using a link that points to the live hosted version of your app.

### key files

1. aristotle-manifest.json: This file contains metadata about the app, such as its name, description, permissions, and scope.
2. argus.js: A JavaScript library that manages authentication and allows interaction with the Aristotle API using various HTTP methods.

Once these files are integrated, the app can be registered within the Aristotle App Store and run within the Aristotle registry.

## 2. ArgusJS API Documentation

The argus.js library provides methods for interacting with the Aristotle API and managing authentication tokens. It supports automatic token refresh and offers several HTTP methods to simplify API interactions.

### Key Feature

* Automatic Token Management: argus.js handles JWT token refreshing, so developers don't need to manage authentication manually.
* Support for Various HTTP Methods: ArgusJS offers GET, POST, PUT, PATCH, DELETE, and GraphQL requests.

### Available Methods:

* get(url): Sends a GET request to the provided URL.
* post(url, data): Sends a POST request with a JSON body.
* put(url, data): Sends a PUT request with a JSON body.
* patch(url, data): Sends a PATCH request with a JSON body.
* delete(url): Sends a DELETE request to the provided URL.
* graphQL(query): Sends a GraphQL query to the Aristotle API.

### Example
```javascript
document.addEventListener("DOMContentLoaded", async function() {
    const argusJS = await initArgusJS();
    
    // Perform a GET request
    const response = await argusJS.get('/api/v4/metadata/distribution');
    const data = await response.json();
    console.log(data);
});
```

## 3. Creating a New App
To develop an Aristotle Argus App, follow these steps:

### Step 1: Create the `aristotle-manifest.json` File
This file defines your app’s metadata and permissions. It will be used to register your app in the **Aristotle App Store**.
Example of `aristotle-manifest.json`:
```
{
    "name": "Visualisation App SO1",
    "description": "This is a visualisation app.",
    "manifest_version": "v1.0",
    "image": "my-image-link.jpg",
    "publisher": "Aristotle Metadata",
    "publisher_email": "contact@aristotlemetadata.com",
    "contributor": "some devs from Aristotle",
    "code_source": "https://github/somewhere",
    "scope": "metadata:read metadata:write graphql:read",
    "scope_rational": "need to have these permissions",
    "help_link": "https://labs.aristotlemetadata.com",
    "width": "full", // can be "full" or "standard"
    "custom_fields": [
        {
            "name": "ondc:classification-demo",
            "choices": "OFFICIAL, PROTECTED, SECRET",
            "order": 1,
            "type": "enum",
            "system_name": "ondcoool01"
        }
    ]
}
```
### Step 2: Add `argus.js` to Your Project

Include the `argus.js` file in your app’s directory. This library will handle authentication and allow your app to communicate with the Aristotle API.

* Place argus.js in your project directory (e.g., /my-app/argus.js).
* Include it in your HTML:

```html
<script src="/path-to-your-app/argus.js"></script>
```
Alternatively, if using a JavaScript framework, import it:
```
import { initArgusJS } from './argus.js';
```
### Step 3: Initialize ArgusJS

To begin using the Aristotle API, initialize ArgusJS by calling initArgusJS(). This function establishes authentication and returns an instance of the ArgusJS object.

```
document.addEventListener("DOMContentLoaded", async function() {
    const argusJS = await initArgusJS();
    // Now ready to make API requests
});

```
### Step 4: Develop the App

### Step 5: Register the App
Once your app is ready, register it in the Aristotle App Store by providing a link to the live app. After registration, it can be hosted within the Aristotle Registry for users to access.

here is the link to App Store help doc.

## 4. Example Applications

### Example 1: Vanilla JavaScript App

A typical app structure might look like this:

```
/my-app
  - index.html
  - argus.js
  - aristotle-manifest.json
  - icon.png
```
In the index.html:

```
<head>
  <script src="/my-app/argus.js"></script>
</head>
<body>
    <script>
        document.addEventListener("DOMContentLoaded", async function() {
            const argusJS = await initArgusJS();
            const response = await argusJS.get('/api/v4/metadata/distribution');
            const data = await response.json();
            console.log(data);
        });
    </script>
</body>

```
### Example 2: Vue.js App
In a Vue.js app, import argus.js and initialize it in the mounted lifecycle hook:

```
import { initArgusJS } from './argus.js';

export default {
  data() {
    return {
      argusJS: null
    };
  },
  async mounted() {
    this.argusJS = await initArgusJS();
    const response = await this.argusJS.graphQL(`{
    console.log(response);
  }
};

```
## 5. Conclusion
By following this guide, developers can build Aristotle Argus Apps that easily integrate with the Aristotle platform. Using the `aristotle-manifest.json` and `argus.js` files, you can set up authentication, manage permissions, and start interacting with the Aristotle API right away.
