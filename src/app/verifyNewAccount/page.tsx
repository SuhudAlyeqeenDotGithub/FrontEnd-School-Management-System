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

const signInPage = () => {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  //   function to verify code
  const verifyCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (validateCode()) {
      setIsLoading(true);
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
          router.push("/signup");
        }
      } catch (error: any) {
        setError(
          error.response?.data.message ||
            error.message ||
            "Error verify code. Please ensure the code is correct or not expired."
        );
      }
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-backgroundColor-3">
      <div className="flex flex-col items-center justify-center w-2/3 gap-5">
        <CustomHeading>Al-Yeqeen School Management App</CustomHeading>
        <div className="flex flex-col gap-5 border border-border p-8 bg-backgroundColor rounded-lg shadow justify-center items-center w-3/4">
          <CustomHeading variation="head2">Verify Email</CustomHeading>
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
            <div className="flex flex-col gap-4  w-full items-center">
              <div className="flex flex-col gap-4 w-full items-center">
                <CustomHeading variation="head4light">Please provide your organisation details</CustomHeading>
                <InputComponent
                  title="Organisation Name *"
                  placeholder="Organisation Name *"
                  name="organisationName"
                  value={organisationName}
                  required={true}
                  onChange={handleInputChange}
                />

                <InputComponent
                  title="Organisation Email *"
                  placeholder="Organisation Email *"
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
                  isLoading={isLoading}
                  onClick={getVerificationCode}
                />
              </div>
            </div>
          )}

          {openCodeEntryDialog && (
            <div className="flex flex-col gap-4 mt-5 w-full items-center">
              <CustomHeading variation="head4light">
                Please enter the verification code sent to your email
              </CustomHeading>
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
                isLoading={isLoading}
                onClick={verifyCode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default signInPage;
