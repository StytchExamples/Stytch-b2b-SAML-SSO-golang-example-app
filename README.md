# SAML SSO in a Golang + React B2B SaaS example app, using Stytch
## Overview
This application demonstrates how B2B SaaS applications can implement SAML SSO in weeks, days, or even hours, using Stytch.

This React + Golang SaaS application leverages Stytch to support both magic link authentication and SAML SSO for hypothetical organizations:
- For tenants or organizations that haven’t configured SAML on the app, we use Stytch’s React SDK to enable magic link authentication.
* For tenants or organizations that intend to or have configured SAML both on our app and their IdP (Okta, in this case), we use Stytch’s Admin Portal SSO and Golang SDK to enable the entire SAML SSO experience.

Specifically, we use Stytch’s React SDK to manage frontend interactions, including signing up and in via magic links, session management using session tokens/JWTs, and rendering the Admin Portal UI. On the backend, we use Stytch’s Golang SDK to manage SAML resources, specifically retrieving and authenticating SAML tokens.
## Prerequisites
If you want to run the example app on your machine, make sure you have the following:
- [Golang 1.22.5](https://go.dev/doc/install) or higher installed on your machine.
- [Node.js](http://Node.js) v20.10.0 or higher installed on your machine.
- A Stytch developer account. You can [sign up for a free account here](https://stytch.com/dashboard/start-now). However, you have to set up a Stytch B2B SaaS authentication project to access SAML.
- An Okta workforce identity cloud account. You can register for a [free thirty-day trial](https://www.okta.com/free-trial/).
## Getting started
### Clone the repository
To set up the example app on your machine, open a terminal or shell instance and run the following command to clone the GitHub repository:
```
git clone https://github.com/StytchExamples/Stytch-b2b-SAML-SSO-golang-example-app/
```
### Install the necessary dependencies
Next, go to the root of the Client and Server directories and run the following commands to install the necessary dependencies for each directory:
```
// Navigate to the client directory and install all dependencies
cd client
npm install

// Navigate to the server directory and install all dependencies
cd server
go get
```
### Setting up Stytch
[Sign up for a Stytch developer account](https://stytch.com/dashboard/start-now) and create a B2B Authentication Project. You have to follow the steps defined in the companion article to set up your Stytch dashboard correctly. You can find it here!
### Set environment variables
In the root of the client and server directories, create a .env file and populate the fields with the B2B Project’s credentials issued to you by Stytch.

You have to follow the key/value format that’s specified below:
```
//.env in client root (Path: "Stytch-b2b-SAML-SSO-golang-example-app/client/.env"
REACT_APP_STYTCH_PUBLIC_TOKEN = "Provide your Stytch B2B project Public token"

//.env in server root: "Stytch-b2b-SAML-SSO-golang-example-app/server/.env"
STYTCH_PROJECT_ID = "Provide Your Stytch Project ID"
STYTCH_SECRET_KEY = "Provide Your Stytch Project Secret"
PORT = ":3002"
```
### Running the example app locally
After successfully setting up Stytch and installing the necessary dependencies, you can run the example app on your machine using the following commands:
```
// Run the client (Path: "Stytch-b2b-SAML-SSO-golang-example-app/client")
npm run start

// Run the server (Path: "Stytch-b2b-SAML-SSO-golang-example-app/server")
go run main.go
```
Once the example app is running locally on your machine, the React client will be available at http://localhost:3000/, and the Golang server will run on port 3002, ready to receive and respond to HTTP requests.
## Need help?
### Join our community Slack 💬 
Participate in discussions, ask questions, and suggest new features in our [Slack community](https://stytch.slack.com/join/shared_invite/zt-nil4wo92-jApJ9Cl32cJbEd9esKkvyg#/shared-invite/email)!

### Talk to a Solutions Engineer❓ 
You can [schedule a chat](https://stytch.com/contact) with a member of our Solutions Engineering team, check our [Stytch Forum](https://forum.stytch.com/) or email us at support@stytch.com.