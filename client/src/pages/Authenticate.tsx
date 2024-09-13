import React, { useEffect, useState } from "react";
import {
  AuthFlowType,
  B2BProducts,
  StytchB2BUIConfig,
  StytchEventType,
} from "@stytch/vanilla-js/dist/b2b";
import { StytchB2B } from "@stytch/react/b2b";
import { axiosInstance } from "../utils";
import { useLocation } from "react-router-dom";
import { LuLoader2 } from "react-icons/lu";
import Cookies from "js-cookie";

export const Authenticate = () => {
  const config: StytchB2BUIConfig = {
    products: [B2BProducts.emailMagicLinks],
    sessionOptions: { sessionDurationMinutes: 60 },
    authFlowType: AuthFlowType.Discovery,
  };

  const [tokenType, setTokenType] = useState("");

  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const tokenType: any = searchParams.get("stytch_token_type");

    setTokenType(tokenType);

    if (tokenType === "sso") {
      axiosInstance
        .get(`/authenticate?token=${token}`)
        .then((data) => {
          Cookies.set("stytch_session_jwt", data.data.data.SessionJWT, {
            secure: true,
            sameSite: "Strict",
          });
          Cookies.set("stytch_session", data.data.data.SessionToken, {
            secure: true,
            sameSite: "Strict",
          });

          window.location.href = "http://localhost:3000/dashboard";
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.log({ error });
        });
    }
  }, [location.search]);

  const styles = {
    container: {
      backgroundColor: "#FFFFFF",
      borderColor: "#ADBCC5",
      borderRadius: "8px",
      width: "400px",
    },
    colors: {
      primary: "#19303D",
      secondary: "#5C727D",
      success: "#0C5A56",
      error: "#8B1214",
    },
    buttons: {
      primary: {
        backgroundColor: "#19303D",
        textColor: "#FFFFFF",
        borderColor: "#19303D",
        borderRadius: "4px",
      },
      secondary: {
        backgroundColor: "#FFFFFF",
        textColor: "#19303D",
        borderColor: "#19303D",
        borderRadius: "4px",
      },
    },
    inputs: {
      backgroundColor: "#FFFFFF00",
      borderColor: "#19303D",
      borderRadius: "4px",
      placeholderColor: "#8296A1",
      textColor: "#19303D",
    },
    fontFamily: "Arial",
    hideHeaderText: false,
    logo: {
      logoImageUrl: "",
    },
  };

  return (
    <div className="flex justify-center w-full items-center">
      {tokenType === "discovery" && (
        <StytchB2B
          styles={styles}
          config={config}
          callbacks={{
            onEvent: async ({
              type,
              data,
            }: {
              type: StytchEventType;
              data: any;
            }) => {
              if (
                type ===
                  StytchEventType.B2BDiscoveryIntermediateSessionExchange ||
                type === StytchEventType.B2BDiscoveryOrganizationsCreate ||
                type === StytchEventType.B2BMagicLinkDiscoveryAuthenticate ||
                type === StytchEventType.B2BSSOAuthenticate
              ) {
                if (data && data.member) {
                  window.location.href = "http://localhost:3000/dashboard";
                }
              }
            },
          }}
        />
      )}

      {tokenType === "sso" && (
        <>
          <LuLoader2 size={50} />
        </>
      )}
    </div>
  );
};