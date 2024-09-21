import React, { useState } from "react";
import {
 B2BProducts,
 AuthFlowType,
 StytchB2BUIConfig,
} from "@stytch/vanilla-js";
import { StytchB2B } from "@stytch/react/b2b";


enum SignInTypeEnum {
 MagicLink = "MagicLink",
 SAML = "SAML",
}

export const SignInPage: React.FC = () => {
 const [signInType, setSignInType] = useState<SignInTypeEnum>(
   SignInTypeEnum.MagicLink
 );
 const [companySlug, setCompanySlug] = useState("");
 const [email, setEmail] = useState("");


 const discoveryConfig: StytchB2BUIConfig = {
   authFlowType: AuthFlowType.Discovery,
   products: [B2BProducts.emailMagicLinks, B2BProducts.sso],
   sessionOptions: { sessionDurationMinutes: 240 },
   emailMagicLinksOptions: {
     loginRedirectURL: "http://localhost:3002/authenticate",
     signupRedirectURL: "http://localhost:3002/authenticate",
   },
   ssoOptions: {
     loginRedirectURL: "http://localhost:3002/authenticate",
     signupRedirectURL: "http://localhost:3002/authenticate",
   },
 };

 const toggleFormType = (type: SignInTypeEnum) => {
   setSignInType(type);
 };

 const extractCompanySlug = (email: string) => {
   const domainMatch = email.match(/@([^.]+)\./);
   if (domainMatch) {
     setCompanySlug(domainMatch[1]);
   } else {
     setCompanySlug("");
   }
 };

 return (
   <div className="flex flex-col w-full items-center justify-center bg-gray-100">
     {signInType === SignInTypeEnum.MagicLink ? (
       <div className="mb-4 w-[400px]">
         <h2 className="text-2xl text-center text-[#19303d] font-bold mb-6">Continue with a Magic Link</h2>


         <StytchB2B config={discoveryConfig} />
       </div>
     ) : (
       <div className="flex flex-col items-center w-[400px] max-w-md">
         <h2 className="text-2xl text-[#19303d] font-bold mb-10 md-30">Sign in with SAML</h2>


         <label htmlFor="email" className="text-sm text-[#19303d] font-medium mb-2 self-start">
           Provide your work email
         </label>


         <input
           type="email"
           required={true}
           placeholder="Work email"
           value={email}
           onChange={(e) => {
             setEmail(e.target.value);
             extractCompanySlug(e.target.value);
           }}
           className={`h-[50px] w-full px-4 py-2 mb-5 border rounded-md shadow-sm focus:outline-none transition duration-300 ease-in-out`}
         />


         <button
           type="submit"
           onClick={() => {
            window.location.href = `http://localhost:3000/${companySlug}`;
           }}
           disabled={!companySlug}
           className={`flex font-bold justify-center w-full py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
             companySlug
               ? "bg-[#19303d] text-white cursor-pointer"
               : "bg-[#0fe5c0] text-[#ffffff]"
           }`}
         >
           Sign in with SAML
         </button>
       </div>
     )}


     <div className="flex items-center justify-center my-4 w-[400px]">
       <hr className="flex-grow border-t border-gray-300" />
       <span className="mx-4 text-gray-500">OR</span>
       <hr className="flex-grow border-t border-gray-300" />
     </div>


     <div className="flex justify-center w-[400px]">
       <button
         type="submit"
         onClick={() =>
           toggleFormType(
             signInType === SignInTypeEnum.MagicLink
               ? SignInTypeEnum.SAML
               : SignInTypeEnum.MagicLink
           )
         }
         className={`flex font-bold justify-center w-full bg-[#19303d] text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
       >
         Sign in with{" "}
         {signInType === SignInTypeEnum.MagicLink ? "SAML SSO" : "Magic Link"}
       </button>
     </div>
   </div>
 );
};
