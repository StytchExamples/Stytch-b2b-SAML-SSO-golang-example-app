import React from "react";

import "./App.css";
import { Layout } from "./components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StytchB2BProvider } from "@stytch/react/b2b";

import { Dashboard, Authenticate, SignInPage, SAMLSignInPage } from "./pages";
import { StytchB2BUIClient } from "@stytch/vanilla-js/b2b";

function App() {
  const publicToken = process.env.REACT_APP_STYTCH_PUBLIC_TOKEN as string;
  const stytch = new StytchB2BUIClient(publicToken);

  return (
    <StytchB2BProvider stytch={stytch}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<SignInPage />} />
            <Route path="/:slug" element={<SAMLSignInPage />} />
            <Route path="/authenticate" element={<Authenticate />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Layout>
      </Router>
    </StytchB2BProvider>
  );
}

export default App;