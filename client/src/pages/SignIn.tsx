import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../components/common/Spinner";
import { useStytchB2BClient, useStytchMemberSession } from "@stytch/react/b2b";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils";
import { toast } from "react-toastify";

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});

type FormValues = {
  email: string;
};

enum SignInTypeEnum {
  MagicLink = "MagicLink",
  SAML = "SAML",
}

export const SignInPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [email, setEmail] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const { session } = useStytchMemberSession();
  const [signInType, setSignInType] = useState<SignInTypeEnum>(
    SignInTypeEnum.MagicLink
  );
  const stytch = useStytchB2BClient();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(SignInSchema),
  });

  const {
    register: registerSaml,
    handleSubmit: handleSubmitSAMLForm,
    formState: { errors: SAMLErrors, isValid: SAMLFormIsValid },
    reset: resetSAML,
  } = useForm<FormValues>({
    resolver: zodResolver(SignInSchema),
  });

  const handleMagicLinkSignIn = async (
    email: string,
    organization_id: string
  ) => {
    setEmail(email);
    setOrganizationId(organization_id);

    try {
      await stytch.magicLinks.email.loginOrSignup({
        email_address: email,
        organization_id: organization_id,
        login_redirect_url: "http://localhost:3000/authenticate",
      });
      setLoading(false);
      setMagicLinkSent(true);
      //eslint-disable-next-line
    } catch (error: any) {
      toast.error(error.response.data.message, {
        position: "top-right",
        autoClose: 3000, // Close after 3 seconds
      });
      setLoading(false);
    }
  };

  const checkSession = useCallback(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleSAMLSignIn = async (connection_id: string) => {
    setLoading(true);
    try {
      stytch.sso.start({
        connection_id: `${connection_id}`,
        login_redirect_url: "http://localhost:3000/authenticate",
        signup_redirect_url: "http://localhost:3000/authenticate",
      });
      //eslint-disable-next-line
    } catch (error: any) {
      setLoading(false);
      toast.error(
        error.message ||
          "An error occurred while trying to sign in, please try again",
        {
          position: "top-right",
          autoClose: 3000, // Close after 3 seconds
        }
      );
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (input) => {
    const email = input.email;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(`/signin`, {
        email: input.email,
        sign_in_method: signInType,
      });
      setLoading(false);

      if (signInType === SignInTypeEnum.MagicLink) {
        handleMagicLinkSignIn(email, data.data.organization_id);
      } else {
        handleSAMLSignIn(data.data.connection_id);
      }
      //eslint-disable-next-line
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response.data.message, {
        position: "top-right",
        autoClose: 3000, // Close after 3 seconds
      });
    }
  };

  const toggleFormType = (type: SignInTypeEnum) => {
    setSignInType(type);
    reset();
    resetSAML();
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-5 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Sign in with{" "}
          {signInType === SignInTypeEnum.MagicLink ? "magic link" : "SAML SSO"}
        </h1>
        {signInType === SignInTypeEnum.MagicLink ? (
          magicLinkSent ? (
            <div className="mb-2">
              <p className="text-center block font-[700] text-lg font-medium text-gray-500">
                A sign in link has been sent to your email!
              </p>

              <p
                onClick={() => handleMagicLinkSignIn(email, organizationId)}
                className="flex justify-center hover:underline cursor-pointer text-center block font-[700] text-md font-medium text-blue-500 mt-[5px]"
              >
                {loading ? <Spinner /> : "Resend link"}
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                <label
                  htmlFor="email"
                  className="block font-[700] text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm  
                  ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}

                {!magicLinkSent && (
                  <button
                    type="submit"
                    className={`${
                      isValid && "bg-[#19303d]"
                    } bg-[#13e5c0] mt-5 flex font-bold justify-center w-full  text-white py-2 px-4 rounded-md shadow-sm hover:bg-[#19303d] focus:outline-none focus:ring-2  focus:ring-offset-2`}
                  >
                    {loading ? <Spinner /> : "Sign In"}
                  </button>
                )}
              </form>
            </div>
          )
        ) : (
          <div className="mb-4">
            <form onSubmit={handleSubmitSAMLForm(onSubmit)}>
              <label
                htmlFor="email"
                className="block font-[700] text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="text"
                {...registerSaml("email")}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm  
                  ${SAMLErrors.email ? "border-red-500" : ""}`}
              />
              {SAMLErrors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {SAMLErrors.email.message}
                </p>
              )}

              <button
                type="submit"
                className={`${
                  SAMLFormIsValid && "bg-[#19303d]"
                } bg-[#13e5c0] mt-5 flex font-bold justify-center w-full  text-white py-2 px-4 rounded-md shadow-sm hover:bg-[#19303d] focus:outline-none focus:ring-2  focus:ring-offset-2`}
              >
                {loading ? <Spinner /> : "Sign In"}
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            onClick={() =>
              toggleFormType(
                signInType === SignInTypeEnum.MagicLink
                  ? SignInTypeEnum.SAML
                  : SignInTypeEnum.MagicLink
              )
            }
            className={`flex font-bold justify-center w-full bg-[#19303d] text-white py-2 px-4 rounded-md shadow-sm  focus:outline-none focus:ring-2  focus:ring-offset-2`}
          >
            Sign in with{" "}
            {signInType === SignInTypeEnum.MagicLink
              ? "SAML SSO"
              : "Magic Link"}
          </button>
        </div>
      </div>
    </div>
  );
};
