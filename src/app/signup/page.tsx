"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv, LoaderButton } from "@/lib/component/compLibrary";
import Link from "next/link";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { orgSignUp } from "@/redux/features/accounts/accountThunks";
import { useAppDispatch } from "@/redux/hooks";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

const signUpPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, isSuccess, isError, errorMessage } = useAppSelector((state) => state.orgAccountData);
  const [inputData, setInputData] = useState({
    organisationName: "",
    organisationEmail: "",
    organisationPhone: "",
    organisationPassword: "",
    organisationConfirmPassword: ""
  });
  const [error, setError] = useState("");
  const { organisationName, organisationEmail, organisationPhone, organisationPassword, organisationConfirmPassword } =
    inputData;

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
      !organisationPassword ||
      !organisationConfirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (organisationName.length < 3) {
      setError("Organisation name must be at least 3 characters long.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organisationEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Use libphonenumber-js to validate phone number
    const phoneNumber = parsePhoneNumberFromString(organisationPhone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      setError("Please enter a valid phone number.");
      return;
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&~*+-]).{8,}$/;
    if (!passwordStrengthRegex.test(organisationPassword)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and at least one special character [!@#$%^&~*]."
      );
      return;
    }

    if (organisationPassword !== organisationConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validationPassed()) {
      try {
        const response = await dispatch(orgSignUp(inputData)).unwrap();
        if (response) {
          router.push("/main");
        }
      } catch (error: any) {
        setError(error.response?.data.message || error.message || error || "An error occurred during signup");
      }
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-1/2 gap-5">
        <h1>Al-Yeqeen School Management App</h1>
        <div className="flex flex-col gap-5 border border-foregroundColor-20 p-8 rounded-lg shadow justify-center items-center w-3/4">
          <h2>Sign Up</h2>
          <h3>Please provide your organisation details</h3>
          {error && <ErrorDiv>{error}</ErrorDiv>}
          <form className="flex flex-col gap-4 mt-5 w-full items-center" onSubmit={handleSubmit}>
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
              name="organisationPassword"
              value={organisationPassword}
              required={true}
              onChange={handleInputChange}
            />
            <InputComponent
              type="password"
              placeholder="Confirm Password *"
              name="organisationConfirmPassword"
              value={organisationConfirmPassword}
              required={true}
              onChange={handleInputChange}
            />

            <LoaderButton
              type="submit"
              buttonText="Sign Up"
              loadingButtonText="Signing Up..."
              disabled={
                !organisationName ||
                !organisationEmail ||
                !organisationPhone ||
                !organisationPassword ||
                !organisationConfirmPassword
              }
              buttonStyle="w-full"
              isLoading={isLoading}
            />
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
