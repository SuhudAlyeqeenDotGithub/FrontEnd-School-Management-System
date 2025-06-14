"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv, LoaderButton } from "@/component/smallComponents";
import axios from "axios";

import { useRouter } from "next/navigation";
import Link from "next/link";

const signInPage = () => {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validationPassed = () => {
    if (!code.trim()) {
      setError("Please enter the recieved code.");
      return;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (validationPassed()) {
      setSuccess("");
      setError("");
      try {
        const email = localStorage.getItem("accountEmail");
        const response = await axios.post(
          "http://localhost:5000/alyeqeenschoolapp/api/orgaccount/resetpassword/verifycode",
          { code, email },
          {
            withCredentials: true
          }
        );
        if (response) {
          setSuccess(response.data.message);
          router.push("/resetPassword/newpassword");
        }
      } catch (error: any) {
        setError(error.response?.data.message || error.message || "Error sending verification code");
      }
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-5 border border-foregroundColor-20 p-8 rounded-lg shadow justify-center items-center w-3/4">
      <h2>Reset Password - Enter Code</h2>
      <h3>Please provide the code you received through email</h3>
      {error && <ErrorDiv>{error}</ErrorDiv>}
      <form className="flex flex-col gap-2 mt-5 w-full items-center" onSubmit={handleSubmit}>
        <InputComponent
          type="code"
          placeholder="Enter Received Code *"
          name="code"
          value={code}
          required={true}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        />

        <LoaderButton
          type="submit"
          buttonText="Send code"
          loadingButtonText="Checking code..."
          disabled={!code}
          buttonStyle="w-full mt-5"
          isLoading={isLoading}
        />
      </form>
      <Link href="/resetPassword" className="hover:text-foregroundColor-70 hover:underline">
        Resend Code
      </Link>
    </div>
  );
};

export default signInPage;
