"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv, LoaderButton, CustomHeading } from "@/lib/customComponents/general/compLibrary";
import Link from "next/link";
import { orgSignUp } from "@/redux/features/accounts/accountThunks";
import { useAppDispatch } from "@/redux/hooks";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { validateEmail, validatePassword, validatePhoneNumber } from "@/lib/shortFunctions/shortFunctions";

const signUpPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, isSuccess, isError, errorMessage } = useAppSelector((state) => state.accountData);
  const [inputData, setInputData] = useState({
    organisationVerificationCode: localStorage.getItem("organisationVerificationCode") || "",
    organisationName: localStorage.getItem("organisationName") || "",
    organisationInitial: "",
    organisationEmail: localStorage.getItem("organisationEmail") || "",
    organisationPhone: "",
    organisationPassword: "",
    organisationConfirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const {
    organisationVerificationCode,
    organisationName,
    organisationInitial,
    organisationEmail,
    organisationPhone,
    organisationPassword,
    organisationConfirmPassword
  } = inputData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const validationPassed = () => {
    if (
      !organisationName.trim() ||
      !organisationInitial.trim() ||
      !organisationEmail.trim() ||
      !organisationPhone.trim() ||
      !organisationPassword ||
      !organisationConfirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (organisationInitial.length !== 3) {
      setError("Organisation initial must be 3 characters long.");
      return;
    }

    if (organisationName.length < 3) {
      setError("Organisation name must be at least 3 characters long.");
      return;
    }

    if (!validateEmail(organisationEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(organisationPassword)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and at least one special character [!@#$%^&~*]."
      );
      return;
    }

    if (!validatePhoneNumber(organisationPhone)) {
      setError("Please enter a valid phone number.");
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
    console.log("started function", performance.now().toFixed(3));
    e.preventDefault();
    if (validationPassed()) {
      try {
        const response = await dispatch(orgSignUp(inputData)).unwrap();
        if (response) {
          localStorage.removeItem("organisationEmail");
          localStorage.removeItem("organisationName");
          localStorage.removeItem("organisationVerificationCode");
          router.push("/main");
        }
      } catch (error: any) {
        setError(error.response?.data.message || error.message || error || "An error occurred during signup");
      }
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-backgroundColor-3">
      <div className="flex flex-col items-center justify-center w-2/3 gap-2">
        <CustomHeading>Al-Yeqeen School Management App</CustomHeading>
        <div className="flex flex-col gap-2 border border-border px-8 py-4 bg-backgroundColor rounded-lg shadow justify-center items-center w-3/4">
          <CustomHeading variation="head2">Sign Up</CustomHeading>
          <CustomHeading variation="head4light">Please provide your organisation details</CustomHeading>
          {error && (
            <ErrorDiv
              onClose={(close) => {
                if (close) {
                  setError("");
                }
              }}
            >
              {error}
            </ErrorDiv>
          )}
          <form className="flex flex-col gap-4 mt-5 w-full items-center" onSubmit={handleSubmit}>
            <InputComponent
              title="Verification Code *"
              placeholder="Verification Code you received earlier *"
              name="organisationVerificationCode"
              value={organisationVerificationCode}
              required={true}
              onChange={handleInputChange}
            />
            <div className="flex gap-3 w-full">
              <div className="w-[65%]">
                <InputComponent
                  autocomplete="on"
                  title="Organisation Name *"
                  placeholder="Organisation Name *"
                  name="organisationName"
                  value={organisationName}
                  required={true}
                  onChange={handleInputChange}
                />
              </div>

              <div className="w-[35%]">
                <InputComponent
                  autocomplete="on"
                  title="Organisation Initial"
                  placeholder="ORG or 3 letter short name"
                  name="organisationInitial"
                  value={organisationInitial}
                  required={true}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <InputComponent
                autocomplete="on"
                type="email"
                title="Organisation Email - (admin) *"
                placeholder="Organisation Email - (admin) *"
                name="organisationEmail"
                value={organisationEmail}
                required={true}
                onChange={handleInputChange}
              />
              <InputComponent
                autocomplete="on"
                title="Organisation Phone - (+447840272035) *"
                placeholder="Organisation Phone - (+447840272035) *"
                name="organisationPhone"
                value={organisationPhone}
                required={true}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex gap-3 w-full">
              <InputComponent
                type={showPassword ? "text" : "password"}
                title="Password *"
                placeholder="Password *"
                name="organisationPassword"
                value={organisationPassword}
                required={true}
                onChange={handleInputChange}
              />
              <InputComponent
                type={showPassword ? "text" : "password"}
                title="Confirm Password *"
                placeholder="Confirm Password *"
                name="organisationConfirmPassword"
                value={organisationConfirmPassword}
                required={true}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex gap-5 w-full items-center">
              <input type="checkbox" onChange={() => setShowPassword(!showPassword)} className="w-4 h-4" />
              <span className="text-foregroundColor-70 text-sm hover:text-foregroundColor-90 hover:underline cursor-pointer">
                {showPassword ? "Hide Passwords" : "Show Passwords"}
              </span>
            </div>
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
              isLoading={isLoading}
            />
          </form>
          <Link href="/signin" className="hover:text-foregroundColor-70 hover:underline hover:cursor-pointer">
            Have an account? Sign In
          </Link>{" "}
          <Link href="/verifyNewAccount" className="hover:text-foregroundColor-70 hover:underline hover:cursor-pointer">
            Get verification code to verify your email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default signUpPage;
