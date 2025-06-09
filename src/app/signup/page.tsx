"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv } from "@/component/smallComponents";
import Link from "next/link";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const signUpPage = () => {
  const [inputData, setInputData] = useState({
    organisationName: "",
    organisationEmail: "",
    organisationPhone: "",
    password: "",
    confirmPassword: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const { organisationName, organisationEmail, organisationPhone, password, confirmPassword } = inputData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const validationPassed = () => {
    if (
      !organisationName.trim() ||
      !organisationEmail.trim() ||
      !organisationPhone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (organisationName.length < 3) {
      setErrorMessage("Organisation name must be at least 3 characters long.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organisationEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Use libphonenumber-js to validate phone number
    const phoneNumber = parsePhoneNumberFromString(organisationPhone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
      setErrorMessage(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setErrorMessage("");
    return true;
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validationPassed()) {
      alert("Sign Up Successful!"); // Replace with actual sign-up logic
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-1/2 gap-5">
        <h1>Al-Yeqeen School Management App</h1>
        <div className="flex flex-col gap-5 border border-foregroundColor-20 p-8 rounded-lg shadow justify-center items-center w-3/4">
          <h2>Sign Up</h2>
          <h3>Please provide your organisation details</h3>
          {errorMessage && <ErrorDiv>{errorMessage}</ErrorDiv>}
          <form className="flex flex-col gap-4 w-full items-center" onSubmit={handleSubmit}>
            <InputComponent
              placeholder="Organisation Name *"
              name="organisationName"
              value={organisationName}
              required={true}
              onChange={handleInputChange}
            />
            <InputComponent
              type="email"
              placeholder="Organisation Email - (admin) *"
              name="organisationEmail"
              value={organisationEmail}
              required={true}
              onChange={handleInputChange}
            />
            <InputComponent
              placeholder="Organisation Phone - (+447840272035) *"
              name="organisationPhone"
              value={organisationPhone}
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
            <button
              type="submit"
              disabled={!organisationName || !organisationEmail || !organisationPhone || !password || !confirmPassword}
              className="w-full"
            >
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
