import React from "react";
import {
  B2BProducts,
  AuthFlowType,
  StytchB2BUIConfig,
} from "@stytch/vanilla-js";
import { StytchB2B } from "@stytch/react/b2b";

export const SAMLSignInPage: React.FC = () => {
  const config: StytchB2BUIConfig = {
    authFlowType: AuthFlowType.Organization,
    products: [B2BProducts.sso],
    sessionOptions: { sessionDurationMinutes: 240 },
    emailMagicLinksOptions: {
      loginRedirectURL: "http://localhost:3000/authenticate",
      signupRedirectURL: "http://localhost:300/authenticate",
    },
    ssoOptions: {
      loginRedirectURL: "http://localhost:3000/authenticate",
      signupRedirectURL: "http://localhost:3000/authenticate",
    },
  };

  return (
    <div className="flex flex-col w-full items-center justify-center bg-gray-100">
      <div className="mb-4">
        <StytchB2B config={config} />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          onClick={() => (window.location.href = "http://localhost:3000")}
          className={`flex font-bold justify-center w-full bg-[#19303d] text-white py-2 px-4 rounded-md shadow-sm  focus:outline-none focus:ring-2  focus:ring-offset-2`}
        >
          Go back
        </button>
      </div>
    </div>
  );
};