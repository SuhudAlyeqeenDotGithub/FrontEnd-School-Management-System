"use client";
import { useState } from "react";
import { InputComponent } from "@/component/smallComponents";
import Link from "next/link";

const signUpPage = () => {
  const [inputData, setInputData] = useState({
    organisationName: "",
    organisationEmail: "",
    password: "",
    confirmPassword: ""
  });
  const { organisationName, organisationEmail, password, confirmPassword } = inputData;

  const inputStyle =
    "border border-foregroundColor-20 rounded p-2 outline-none focus:border-2 focus:border-foregroundColor-40";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-1/3 gap-5">
        <h1>Al-Yeqeen School Management App</h1>
        <div className="flex flex-col gap-5 border border-foregroundColor-20 p-8 rounded-lg shadow justify-center items-center w-3/4">
          <h2>Sign Up</h2>
          <h3>Please provide your organisation details</h3>
          <form className="flex flex-col gap-4 w-full items-center">
            <InputComponent
              placeholder="Organisation Name *"
              name="organisationName"
              value={organisationName}
              required={true}
              onChange={handleInputChange}
            />
            <InputComponent
              placeholder="Organisation Email - (admin) *"
              name="organisationEmail"
              value={organisationEmail}
              required={true}
              onChange={handleInputChange}
            />
            <InputComponent
              type="password"
              placeholder="Password *"
              name="password"
              value={password}
              required={true}
              onChange={handleInputChange}
            />
            <InputComponent
              type="password"
              placeholder="Confirm Password *"
              name="confirmPassword"
              value={confirmPassword}
              required={true}
              onChange={handleInputChange}
            />
            <button type="submit" className="w-full">
              Sign Up
            </button>
          </form>

          <Link href="/signin" className="hover:text-foregroundColor-70 hover:underline">
            Have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default signUpPage;
