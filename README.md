# How to implement passwordless authentication in Node.js using Passport.js and email magic links
## Overview
This example app is a B2B file management SaaS that allows users to create accounts and sign in without passwords.


These users only need to provide their email address to receive a time-sensitive magic link, which grants them access to their accounts. After clicking the link sent to their email, our app will communicate with Stytch to validate the embedded magic link token, ensuring the user is legitimate before granting access.


![Authentication flow diagram](https://github.com/StytchExamples/stytch-b2b-file-management-app/blob/main/client/public/App_Architecture.png)


On the client, we use Stytch’s B2B React SDK to implement our entire email magic link authentication flow. Then, we use Passport.js and Stytch’s Node.js SDK to handle token authentication and protect our server-side routes.


The key features of our example app include:
- A SignUp and SignIn flow, powered by Stytch’s prebuilt UI components.
- A CompleteRegistration page for collecting additional user information.
- Protected routes that only be accessed by authenticated.
- A custom Passport.js strategy for server-side session management.


## Prerequisites
To run the example app on your machine, make sure you have the following set up:
- [Node.js v20.10.0](http://Node.js) or later.
- A Stytch developer account. Feel free to [sign up for a free dev account](https://stytch.com/dashboard/start-now) if you don’t have one already, but you must set up a B2B SaaS project within this account.


## Getting started
### Clone the repository
To clone the repo for our example app, run the following command in your terminal:
```
git clone https://github.com/StytchExamples/stytch-b2b-file-management-app.git
```
### Install the necessary dependencies
Run the following commands in the root of the client and server directory to install the necessary dependencies for our app:
```
// In the client directory
cd client
npm install


// In the server directory
cd server
npm install
```
### Setting up Stytch
[Sign up for a Stytch developer account](https://stytch.com/dashboard/start-now) and create a B2B Authentication Project. You have to follow the steps defined in the companion article to set up your Stytch dashboard correctly. You can find it here!
### Set environment variables
Go to the root of the client and server directories, create a .env file and populate the specified fields with the B2B Project’s credentials issued to you by Stytch.


You have to follow the key/value format that’s specified below:
```
//.env in client root (Path: "stytch-b2b-file-management-app/client/.env"
VITE_STYTCH_PROJECT_ID = "Provide the project ID for your Stytch B2B project"
VITE_STYTCH_PUBLIC_TOKEN = "Provide the public token value from your Stytch B2B project"
STYTCH_SECRET = "Provide the secret value from your Stytch B2B project"
VITE_PUBLIC_API_URL = "http://localhost:4000"




//.env in server root: (Path: "stytch-b2b-file-management-app/server/.env"
STYTCH_PROJECT_ID = "Provide the project ID for your Stytch B2B project"
STYTCH_SECRET = "Provide the secret value from your Stytch B2B project"
PORT = 4000 
APP_URL = "http://localhost:3000"
```
### Running the example app locally
To run the example app locally, run the following commands in the root of the client and server directories:
```
// Run the client (Path: "stytch-b2b-file-management-app/client")
npm run dev


// Run the server (Path: "stytch-b2b-file-management-app/server")
npm run start
```
At this point, your React client should be running at http://localhost:3000, and your Express backend should be available at http://localhost:4000.


## Need help?
### Join our Slack community 💬
Participate in discussions, ask questions, and suggest new features in our [Slack community](https://stytch.slack.com/join/shared_invite/zt-nil4wo92-jApJ9Cl32cJbEd9esKkvyg#/shared-invite/email)!


### Talk to a Solutions Engineer❓
You can [schedule a chat](https://stytch.com/contact) with a member of our Solutions Engineering team, check our [Stytch Forum](https://forum.stytch.com/), or email us at support@stytch.com.