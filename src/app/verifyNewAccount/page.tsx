"use client";
import { useState } from "react";
import {
  InputComponent,
  ErrorDiv,
  LoaderButton,
  SuccessDiv,
  CustomHeading
} from "@/lib/customComponents/general/compLibrary";
import axios from "axios";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { BASE_API_URL, validateEmail } from "@/lib/shortFunctions/shortFunctions";
import { verify } from "crypto";

const signInPage = () => {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [localData, setLocalData] = useState({ organisationName: "", organisationEmail: "" });
  const [openCodeEntryDialog, setOpenCodeEntryDialog] = useState(false);
  const [openEmailEntryDialog, setOpenEmailEntryDialog] = useState(true);
  const [verificationCode, setVerificationCode] = useState("");

  const { organisationName, organisationEmail } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value.trim() }));
  };

  const validateCode = () => {
    if (!verificationCode) {
      setError("Please enter the recieved code.");
      return;
    }

    setError("");
    return true;
  };

  const validateEmailAndName = () => {
    if (organisationName.length < 3) {
      setError("Organisation name must be at least 3 characters long.");
      return;
    }
    if (!organisationEmail) {
      setError("Please fill in the organisation name and email.");
      return;
    }

    if (!validateEmail(organisationEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    return true;
  };

  //   function to get verification code
  const getVerificationCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (validateEmailAndName()) {
      setSendingEmail(true);
      setSuccess("");
      setError("");
      try {
        const response = await axios.post(`${BASE_API_URL}/alyeqeenschoolapp/api/orgaccount/verifyaccount`, localData, {
          withCredentials: true
        });
        if (response) {
          setSuccess(response.data.message);
          setOpenEmailEntryDialog(false);
          setOpenCodeEntryDialog(true);
        }
      } catch (error: any) {
        setError(
          error.response?.data.message ||
            error.message ||
            "Error sending verification code. Please ensure the email exists and you have access to it."
        );
      }
      setSendingEmail(false);
    }
  };

  //   function to verify code
  const verifyCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (validateCode()) {
      setVerifyingCode(true);
      setSuccess("");
      setError("");
      try {
        const response = await axios.post(
          `${BASE_API_URL}/alyeqeenschoolapp/api/orgaccount/verifysignupcode`,
          { code: verificationCode, email: organisationEmail },
          {
            withCredentials: true
          }
        );
        if (response) {
          setSuccess(response.data.message);
          localStorage.setItem("organisationEmail", organisationEmail);
          localStorage.setItem("organisationName", organisationName);
          localStorage.setItem("organisationVerificationCode", verificationCode);
          router.push("/signup");
        }
      } catch (error: any) {
        setError(
          error.response?.data.message ||
            error.message ||
            "Error verify code. Please ensure the code is correct or not expired."
        );
      }
      setVerifyingCode(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-backgroundColor-3">
      <div className=" flex flex-col items-center">
        <div className="h-9 w-21">
          <img src="/suhudlogo.png" className="h-full w-full" alt="Suhud Logo" />
        </div>
        <p className="text-[16px] text-[#0097a7]  font-medium">School Management System</p>
      </div>
      <div className="flex flex-col gap-2 border border-borderColor px-6 py-4 bg-backgroundColor rounded-lg shadow justify-center items-center w-[45%] mt-3 overflow-auto">
        <div className="flex flex-col w-full items-center justify-center">
          <CustomHeading variation="head2">Verify Email</CustomHeading>
          <CustomHeading variation="head6light">
            Receive a verification to sign up - Please provide your organisation details
          </CustomHeading>
        </div>{" "}
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
        {success && <SuccessDiv>{success}</SuccessDiv>}
        {openEmailEntryDialog && (
          <div className="flex flex-col gap-3 mt-5 w-full items-center">
            <div className="flex flex-col gap-4 w-full items-center">
              <InputComponent
                title="Organisation Name *"
                autocomplete="on"
                placeholder="Organisation Name *"
                name="organisationName"
                value={organisationName}
                required={true}
                onChange={handleInputChange}
              />

              <InputComponent
                title="Organisation Email *"
                placeholder="Organisation Email *"
                autocomplete="on"
                name="organisationEmail"
                value={organisationEmail}
                required={true}
                onChange={handleInputChange}
              />

              <LoaderButton
                type="submit"
                buttonText="Get Verification Code"
                loadingButtonText="Sending Email..."
                disabled={!organisationName || !organisationEmail}
                isLoading={sendingEmail}
                onClick={getVerificationCode}
              />
            </div>
          </div>
        )}
        {openCodeEntryDialog && (
          <div className="flex flex-col gap-4 mt-5 w-full items-center">
            <CustomHeading variation="head5light">Please enter the verification code sent to your email</CustomHeading>
            <InputComponent
              title="Enter Verification Code *"
              placeholder="Verification Code *"
              name="verificationCode"
              value={verificationCode}
              required={true}
              onChange={(e) => setVerificationCode(e.target.value.trim())}
            />

            <LoaderButton
              type="submit"
              buttonText="Verify Code"
              loadingButtonText="Verifying Code..."
              disabled={!verificationCode}
              isLoading={verifyingCode}
              onClick={verifyCode}
            />

            <p
              onClick={() => setOpenEmailEntryDialog(true)}
              className="text-foregroundColor text-[15px] hover:text-foregroundColor-2 hover:underline hover:cursor-pointer font-medium animate-bounce mt-2"
            >
              Have not code ? Get verification code to verify your email
            </p>
          </div>
        )}
        <div className="flex flex-col gap-1 items-center mt-2">
          <Link
            href="/signin"
            className="text-foregroundColor text-[15px] hover:text-foregroundColor-2 hover:underline hover:cursor-pointer"
          >
            Have an account? Sign In
          </Link>{" "}
          <Link
            href="/signup"
            className="text-foregroundColor text-[15px] hover:text-foregroundColor-2 hover:underline hover:cursor-pointer font-medium animate-bounce mt-2"
          >
            Verified Email Already? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default signInPage;
