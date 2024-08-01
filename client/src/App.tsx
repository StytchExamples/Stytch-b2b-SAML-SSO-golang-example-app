import React from "react";

import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS styles
import { Layout } from "./components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StytchB2BProvider } from "@stytch/react/b2b";

import { Dashboard, Authenticate, SignInPage, SignupPage } from "./pages";
import { StytchB2BUIClient } from "@stytch/vanilla-js/b2b";
import { Provider } from "react-redux";
import store from "./store/store";

function App() {
  const publicToken = process.env.REACT_APP_STYTCH_PUBLIC_TOKEN as string;
  const stytch = new StytchB2BUIClient(publicToken);

  return (
    <Provider store={store}>
      <StytchB2BProvider stytch={stytch}>
        <Router>
          <Layout>
            <ToastContainer />
            <Routes>
              <Route path="/" element={<SignInPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/authenticate" element={<Authenticate />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </StytchB2BProvider>
    </Provider>
  );
}

export default App;
