import { zodResolver } from "@hookform/resolvers/zod";
import { useStytchMemberSession } from "@stytch/react/b2b";
import React, { useCallback, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import Spinner from "../components/common/Spinner";
import { axiosInstance, excludedProviders } from "../utils";

const schema = z.object({
  company_name: z.string().min(3, "Company name is required"),
  first_name: z.string().min(5, "First name is required"),
  last_name: z.string().min(5, "last name is required"),
  email: z
    .string()
    .email("Email is required")
    .refine((email) => {
      const domain = email.split("@")[1];
      return !excludedProviders.includes(domain);
    }, "Provide a valid work email"),
});

interface formInterface {
  company_name: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
}

export const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useStytchMemberSession();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
  } = useForm<formInterface>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: "",
      email: "",
      name: "",
    },
  });

  const onSubmit: SubmitHandler<formInterface> = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.post("/signup", data);
      setLoading(false);
      navigate("/");
      //eslint-disable-next-line
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response.data.message || "Something went wrong", {
        position: "top-right",
        autoClose: 3000,
      });
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

  return (
    <div className="flex w-full items-center justify-center  bg-gray-100">
      <div className="max-w-md w-[350px] bg-white p-5 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create account</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-5">
            <div className="mb-4">
              <label
                htmlFor="First name"
                className="block text-sm font-medium text-gray-700"
              >
                First name
              </label>
              <input
                id="name"
                type="text"
                placeholder="First name"
                {...register("first_name")}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:border-[#19303d] sm:text-sm  
                ${errors.name ? "border-red-500" : ""}`}
              />
              {touchedFields.first_name && errors.first_name && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="Last name"
                className="block text-sm font-medium text-gray-700"
              >
                Last name
              </label>
              <input
                id="name"
                type="text"
                placeholder="last name"
                {...register("last_name")}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:border-[#19303d] sm:text-sm  
                ${errors.name ? "border-red-500" : ""}`}
              />
              {touchedFields.last_name && errors.last_name && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="Email"
              className="block text-sm font-medium text-gray-700"
            >
              Work email
            </label>
            <input
              id="email"
              type="text"
              placeholder="Work email"
              {...register("email")}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:border-[#19303d] sm:text-sm  
                ${errors.email ? "border-red-500" : ""}`}
            />
            {touchedFields.email && errors.email && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="company_name"
              className="block text-sm font-medium text-gray-700"
            >
              Company name
            </label>
            <input
              id="company_name"
              type="text"
              placeholder="Company name"
              {...register("company_name")}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:border-[#19303d] sm:text-sm  
                ${errors.company_name ? "border-red-500" : ""}`}
            />
            {touchedFields.company_name && errors.company_name && (
              <p className="mt-1 text-red-500 text-sm">
                {errors.company_name.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={`flex justify-center w-full ${
              isValid ? "bg-[#19303d]" : "bg-[#13e5c0]"
            } text-white py-2 px-4 rounded-md shadow-sm hover:bg-[#19303d] focus:outline-none focus:ring-2  focus:ring-offset-2`}
          >
            {loading ? <Spinner /> : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};
