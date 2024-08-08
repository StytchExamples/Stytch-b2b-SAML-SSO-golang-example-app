import { useState } from "react";
import { toast } from "react-toastify";
import { useStytchB2BClient } from "@stytch/react/b2b";

interface UseMagicLinkSignInResult {
  magicLinkSent: boolean;
  sendingLink: boolean;
  handleMagicLinkSignIn: (
    email: string,
    organizationId: string
  ) => Promise<void>;
}

export const useMagicLinkSignIn = (): UseMagicLinkSignInResult => {
  const [sendingLink, setSendingLink] = useState<boolean>(false);
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);

  const stytch = useStytchB2BClient();

  const handleMagicLinkSignIn = async (
    email: string,
    organization_id: string
  ) => {
    setSendingLink(true);

    try {
      await stytch.magicLinks.email.loginOrSignup({
        email_address: email,
        organization_id: organization_id,
        login_redirect_url: "http://localhost:3000/authenticate",
      });
      setSendingLink(false);
      setMagicLinkSent(true);
      //eslint-disable-next-line
    } catch (error: any) {
      toast.error(error?.message, {
        position: "top-right",
        autoClose: 3000, // Close after 3 seconds
      });
      setSendingLink(false);
    }
  };

  return {
    magicLinkSent,
    sendingLink,
    handleMagicLinkSignIn,
  };
};