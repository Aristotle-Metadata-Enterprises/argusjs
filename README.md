# Developer Documentation for Aristotle Argus Apps
This guide will help you develop an **Aristotle Argus App** using the Aristotle API, argus.js library, and aristotle-manifest.json. By integrating these components into your app, you can create an application that is registerable in the **Aristotle App Store** and usable within the **Aristotle Registry**.

## Table of Contents

1. [Introduction](#1-introduction)
2. [ArgusJS API Documentation](#2-argusjs-api-documentation)
3. [Creating a New App](#3-creating-a-new-app)
4. [Local Testing Environment](#4-local-testing-environment)
5. [Example Application](#5-example-application)

## 1. Introduction

As a developer, you can leverage the Aristotle API to create custom applications. By adding two key files to your application—*aristotle-manifest.json* and *argus.js*—you can transform it into an Aristotle Argus App. These apps can be registered in the Aristotle App Store using a link that points to the live hosted version of your app.

### Key Files

1. aristotle-manifest.json: This file contains metadata about the app, such as its name, description, permissions, and scope.
2. argus.js: A JavaScript library that manages authentication and allows interaction with the Aristotle API using various HTTP methods.

Once these files are integrated, the app can be registered within the Aristotle App Store and run within the Aristotle registry.

## 2. ArgusJS API Documentation

The argus.js library provides methods for interacting with the Aristotle API and managing authentication tokens. It supports automatic token refresh and offers several HTTP methods to simplify API interactions.

### Key Features

* Automatic Token Management: argus.js handles JWT token refreshing, so developers don't need to manage authentication manually.
* Support for Various HTTP Methods: ArgusJS offers GET, POST, PUT, PATCH, DELETE, and GraphQL requests.
* Local Development Environment: apps can be tested locally using a valid API token and Metadata Registry endpoint.

### Available Methods:

* get(url): Sends a GET request to the provided URL.
* post(url, data): Sends a POST request with a JSON body.
* put(url, data): Sends a PUT request with a JSON body.
* patch(url, data): Sends a PATCH request with a JSON body.
* delete(url): Sends a DELETE request to the provided URL.
* graphQL(query): Sends a GraphQL query to the Aristotle API.
* mdrUrl(): Returns the URL of the Metadata Registry.

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
```json
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
    "width": "full",
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

`scope` is a space-delimited list of permissions for your app, and controls which API endpoints are accessible by ArgusJS. The options are:
> `graphql:read`, `metadata:read`, `metadata:write`, `search:read`, `organisation:read`, `ra:read`, `ra:write`, `wg:read`, `wg:write`, `collection:read`, `collection:write`, `link:read`, `link:write`, `issues:read`, `issues:write`, `review:read`, `review:write`, `activate:read`, `activate:write`

`width` denotes the frame size of your app in Aristotle, and is either `full` or `standard`

The manifest should be served as a static json file from the `/aristotle-manifest.json` endpoint of your app.

### Step 2: Add `argus.js` to Your Project

Include the `argus.js` file in your app’s directory. This library will handle authentication and allow your app to communicate with the Aristotle API.

* Place argus.js in your project directory (e.g., /my-app/argus.js).
* Include it in your HTML:

```html
<script src="/path-to-your-app/argus.js"></script>
```

Alternatively, for a bundled npm project install the module:

`npm install git+https://github.com/Aristotle-Metadata-Enterprises/argusjs.git`

Then import it:

```javascript
import { initArgusJS } from "argusjs"
```


### Step 3: Initialize ArgusJS

To begin using the Aristotle API, initialize ArgusJS by calling initArgusJS(). This function establishes authentication and returns an instance of the ArgusJS object.

```javascript
document.addEventListener("DOMContentLoaded", async function() {
    const argusJS = await initArgusJS();
    // Now ready to make API requests
});

```
### Step 4: Develop the App

Develop your app either as a static or dynamic webpage. The page served at the root of your webpage will be embedded in the Aristotle Argus environment.

Once your app is ready, register it in the Aristotle App Store by providing a link to the live app. After registration, it can be hosted within the Aristotle Registry for users to access. Further information can be found here:

https://help.aristotlemetadata.com/special-features/registering-an-app-using-the-app-store

## 4. Local Testing Environment

This package includes a local testing environment, which can be used to develop Argus apps on metadata registries without registering through a stewardship organisation.

To start the environment, use the command:

`npm run dev`

This hosts a testing server at `http://localhost:8080/`. From the website you can enter an app url, metadata registry url, and API token. The app url can be local or external, and an example is provided below. This article details how to generate an API token for a metadata registry:

https://help.aristotlemetadata.com/finding-and-viewing-metadata/generating-an-api-token

With the form filled out, click "Open Environment" to open the app in the Aristotle Argus environment.

## 5. Example Application

An example application is included with the following project structure:
```
example/
-  index.html
-  argus.js
-  aristotle-manifest.json
```

It can be hosted with the command:

`npm run example`

The app is hosted at `http://localhost:8081/`, and uses `argus.js` to fetch a number of metadata items from a provided registry. It can be run using the testing environment by providing its app url, as well as a registry url and API token.
